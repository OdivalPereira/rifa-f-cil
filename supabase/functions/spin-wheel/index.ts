console.log("Hello from Spin Wheel Function!")

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, phone, raffle_id } = await req.json()

    if (!email && !phone) {
      throw new Error('Email or phone required')
    }

    // 1. Check AND Decrement balance Atomically (or verify balance first then update if > 0)
    // Actually, simple UPDATE ... SET spins = spins - 1 WHERE spins > 0 returning * works best.

    let balanceQuery = supabase.from('spin_balance')
      .update({ spins_available: undefined }) // dummy to trigger update builder

    // We cannot construct raw SQL easily with JS client for decrement unless we use RPC or carefully structured query?
    // Supabase JS client doesn't support `spins_available = spins_available - 1` easily in .update().
    // We can use an RPC call or accept the small race condition window or use a more robust pattern.
    // However, we CAN check balance first, then perform optimistic update or use RPC.

    // Let's create an RPC for spinning? That would be safer.
    // But since I am inside an Edge Function (server side), I can run SQL if I had pg connection.
    // With Supabase Client, I'm limited.

    // Better approach: Fetch the row. If > 0, calculate outcome, then Update with condition `spins_available > 0`.
    // If update returns 0 rows modified, then someone stole the spin.

    let query = supabase.from('spin_balance').select('*')
    if (email) query = query.eq('email', email)
    else if (phone) query = query.eq('phone', phone)

    const { data: balance, error: balanceError } = await query.single()

    if (balanceError || !balance || balance.spins_available <= 0) {
      return new Response(
        JSON.stringify({ error: 'No spins available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Attempt to decrement atomically with check
    // We need to match ID and current value (optimistic locking) or just > 0.
    const { data: updatedBalance, error: updateError } = await supabase.from('spin_balance')
      .update({ spins_available: balance.spins_available - 1, updated_at: new Date().toISOString() })
      .eq('id', balance.id)
      .gt('spins_available', 0) // Ensure it's still > 0
      .select()
      .single()

    if (updateError || !updatedBalance) {
         // Race condition hit: no rows updated or error
         return new Response(
            JSON.stringify({ error: 'Failed to consume spin. Try again.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
         )
    }

    // 2. Calculate Prize (Same logic)
    const random = Math.random() * 100

    let prize = null
    let cumulative = 0

    const prizes = [
      { type: 'multiplier', value: 10, probability: 0.01 },
      { type: 'multiplier', value: 5, probability: 0.05 },
      { type: 'multiplier', value: 2, probability: 0.1 },
      { type: 'retry', value: 'retry', probability: 5.0 },
      { type: 'numbers', value: 6, probability: 1.97 },
      { type: 'numbers', value: 5, probability: 3.95 },
      { type: 'numbers', value: 4, probability: 9.87 },
      { type: 'numbers', value: 3, probability: 17.78 },
      { type: 'numbers', value: 2, probability: 27.66 },
      { type: 'numbers', value: 1, probability: 33.58 },
    ]

    for (const p of prizes) {
      cumulative += p.probability
      if (random <= cumulative) {
        prize = p
        break
      }
    }
    if (!prize) prize = prizes[prizes.length - 1]

    // 3. Apply Prize
    let additionalInfo = {}

    if (prize.type === 'numbers' || prize.type === 'multiplier') {
        let ticketsToGrant = 0
        if (prize.type === 'numbers') ticketsToGrant = typeof prize.value === 'number' ? prize.value : 0
        if (prize.type === 'multiplier') ticketsToGrant = (typeof prize.value === 'number' ? prize.value : 0) * 5

        let targetRaffleId = raffle_id

        // Find latest active raffle if missing or ensure provided one is active
        if (targetRaffleId) {
             const { data: raffle } = await supabase.from('raffles').select('status').eq('id', targetRaffleId).single()
             if (!raffle || raffle.status !== 'active') {
                 targetRaffleId = null // Invalid raffle
             }
        }

        if (!targetRaffleId) {
            const { data: raffle, error: raffleError } = await supabase
                .from('raffles')
                .select('id')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (!raffleError && raffle) {
                targetRaffleId = raffle.id
            }
        }

        if (ticketsToGrant > 0 && targetRaffleId) {
           // Create a 0.00 purchase
           const { data: purchase, error: purchaseError } = await supabase.from('purchases').insert({
               raffle_id: targetRaffleId,
               buyer_name: 'Spin Wheel Winner',
               buyer_email: email || '',
               buyer_phone: phone || '',
               quantity: ticketsToGrant,
               total_amount: 0,
               payment_status: 'approved',
               approved_at: new Date().toISOString()
           }).select().single()

           if (!purchaseError && purchase) {
               // Generate random numbers
               const numbersToInsert = []
               for(let i=0; i<ticketsToGrant; i++) {
                   numbersToInsert.push({
                       raffle_id: targetRaffleId,
                       purchase_id: purchase.id,
                       number: Math.floor(Math.random() * 1000000)
                   })
               }

               const { error: numbersError } = await supabase.from('raffle_numbers').insert(numbersToInsert).select()
               if (numbersError) {
                   console.error("Error inserting numbers", numbersError)
               }
               additionalInfo = { purchase_id: purchase.id, tickets: ticketsToGrant, raffle_id: targetRaffleId }
           }
        }
    }

    // 5. Log History
    await supabase.from('spin_history').insert({
        email: email,
        phone: phone,
        prize_type: prize.type,
        prize_value: prize,
        created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ prize, ...additionalInfo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
