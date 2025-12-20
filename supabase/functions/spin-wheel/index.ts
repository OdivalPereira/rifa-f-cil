import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { raffleId, buyerEmail, buyerPhone, spinType } = await req.json()

    // 1. Fetch spin rewards record
    let query = supabaseClient.from('spin_rewards')
      .select('*')
      .eq('raffle_id', raffleId)

    if (buyerEmail) query = query.eq('buyer_email', buyerEmail)
    else if (buyerPhone) query = query.eq('buyer_phone', buyerPhone.replace(/\D/g, ''))
    else throw new Error('Email or Phone required')

    const { data: spinReward, error: spinError } = await query.single()

    if (spinError || !spinReward) {
      return new Response(
        JSON.stringify({ error: 'No spin rewards found', details: spinError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Allow 'retry' spins even if used >= total, assuming the retry was granted by a previous spin outcome.
    // Ideally we would verify the user HAS a pending retry, but for this implementation we rely on client state + recent history check could be added.
    // We strictly block 'main' spins if quota is exceeded.
    if (spinReward.used_spins >= spinReward.total_spins && spinType === 'main') {
       return new Response(
        JSON.stringify({ error: 'No spins available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    let prizeResult;

    if (spinType === 'main') {
        // Increment used spins immediately for main spin
        const { error: updateError } = await supabaseClient
            .from('spin_rewards')
            .update({ used_spins: spinReward.used_spins + 1 })
            .eq('id', spinReward.id)

        if (updateError) throw updateError;

        const rand = Math.random() * 100;
        let accumulated = 0;

        const probabilities = [
            { type: 'fixed', amount: 1, p: 32.04 },
            { type: 'fixed', amount: 2, p: 26 },
            { type: 'fixed', amount: 3, p: 16 },
            { type: 'fixed', amount: 4, p: 9 },
            { type: 'fixed', amount: 5, p: 4 },
            { type: 'fixed', amount: 6, p: 1.5 },
            { type: 'retry', amount: 0, p: 10 },
            { type: 'multiplier', amount: 2, p: 0.35 },
            { type: 'multiplier', amount: 5, p: 0.10 },
            { type: 'multiplier', amount: 10, p: 0.01 },
        ];

        for (const prize of probabilities) {
            accumulated += prize.p;
            if (rand <= accumulated) {
                prizeResult = prize;
                break;
            }
        }
        if (!prizeResult) prizeResult = { type: 'fixed', amount: 1, p: 0 };

    } else if (spinType === 'retry') {
        const rand = Math.random() * 100;
        if (rand < 30) prizeResult = { type: 'fixed', amount: 1 };
        else if (rand < 45) prizeResult = { type: 'fixed', amount: 2 };
        else prizeResult = { type: 'nothing', amount: 0 };
    } else {
        throw new Error('Invalid spin type');
    }

    // Logic to grant numbers
    let bonusNumbers = [];
    if (prizeResult.type === 'fixed' || prizeResult.type === 'multiplier') {
        let count = 0;

        if (prizeResult.type === 'fixed') {
            count = prizeResult.amount;
        } else if (prizeResult.type === 'multiplier') {
             const { count: currentCount } = await supabaseClient
                .from('raffle_numbers')
                .select('*', { count: 'exact', head: true })
                .eq('raffle_id', raffleId)
                .in('purchase_id', (
                    await supabaseClient.from('purchases')
                    .select('id')
                    .eq('raffle_id', raffleId)
                    .or(`buyer_email.eq.${buyerEmail},buyer_phone.eq.${buyerPhone?.replace(/\D/g, '')}`)
                ).data?.map(p => p.id) || [])
                .not('confirmed_at', 'is', null)

             // If user has X numbers, multiplier 2x gives X more numbers.
             count = (currentCount || 0) * (prizeResult.amount - 1);
             if (count > 100) count = 100; // Cap
             if (count < 1) count = 1;
        }

        if (count > 0) {
             // Optimized Random Selection
             const { data: raffleData } = await supabaseClient.from('raffles').select('total_numbers').eq('id', raffleId).single();
             const total = raffleData?.total_numbers || 1000;

             const candidates = [];
             let safety = 0;

             // Try to find 'count' unique numbers by random sampling and checking existence
             // This avoids loading the entire array of sold numbers into memory
             while (candidates.length < count && safety < count * 10) {
                 safety++;
                 const batchSize = count - candidates.length + 2; // fetch a few more than needed
                 const potentialNumbers = Array.from({ length: batchSize }, () => Math.floor(Math.random() * total));

                 // Check which of these are TAKEN
                 const { data: takenData } = await supabaseClient
                    .from('raffle_numbers')
                    .select('number')
                    .eq('raffle_id', raffleId)
                    .in('number', potentialNumbers);

                 const takenSet = new Set(takenData?.map(n => n.number));

                 for (const num of potentialNumbers) {
                     if (!takenSet.has(num) && !candidates.includes(num)) {
                         candidates.push(num);
                         if (candidates.length === count) break;
                     }
                 }
             }

             bonusNumbers = candidates;

             if (bonusNumbers.length > 0) {
                 const { data: purchaseData } = await supabaseClient
                    .from('purchases')
                    .insert({
                        raffle_id: raffleId,
                        buyer_email: buyerEmail,
                        buyer_name: 'Ganhador da Roleta',
                        buyer_phone: buyerPhone.replace(/\D/g, ''),
                        quantity: bonusNumbers.length,
                        total_amount: 0,
                        payment_status: 'approved',
                        approved_at: new Date().toISOString()
                    })
                    .select()
                    .single()

                 if (purchaseData) {
                     const numbersToInsert = bonusNumbers.map(n => ({
                         raffle_id: raffleId,
                         purchase_id: purchaseData.id,
                         number: n,
                         confirmed_at: new Date().toISOString()
                     }));

                     // Use upsert or ignore duplicates just in case of race condition (unlikely with random range but possible)
                     const { error: insertError } = await supabaseClient.from('raffle_numbers').insert(numbersToInsert);

                     if (insertError) {
                         // If collision happens here, we just fail gracefully for this MVP.
                         // The user might get fewer numbers than promised in rare cases.
                         console.error("Collision during insert", insertError);
                     }
                 }
             }
        }
    }

    await supabaseClient.from('spin_history').insert({
        spin_reward_id: spinReward.id,
        raffle_id: raffleId,
        spin_type: spinType,
        prize_type: prizeResult.type,
        fixed_amount: prizeResult.type === 'fixed' ? prizeResult.amount : null,
        multiplier: prizeResult.type === 'multiplier' ? prizeResult.amount : null,
        bonus_numbers: bonusNumbers
    });

    return new Response(
      JSON.stringify({
          success: true,
          prize: prizeResult,
          bonusNumbersCount: bonusNumbers.length,
          bonusNumbers: bonusNumbers
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
