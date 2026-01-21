import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Security Helpers ---

// Get Signing Key from Environment (fallbacks purely for type safety, env var MUST exist)
function getSigningKey(): string {
  // Use SUPABASE_SERVICE_ROLE_KEY as the secret for HMAC
  // This is available in Edge Functions and is secure.
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

async function signToken(payload: Record<string, unknown>): Promise<string> {
  const secret = getSigningKey();
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const algorithm = { name: "HMAC", hash: "SHA-256" };

  const key = await crypto.subtle.importKey("raw", keyData, algorithm, false, ["sign"]);

  // Create payload string (header + payload)
  // We use a simple structure: base64(json_payload) + "." + base64(signature)
  const payloadStr = btoa(JSON.stringify(payload));
  const dataToSign = encoder.encode(payloadStr);

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign);
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return `${payloadStr}.${signature}`;
}

async function verifyTokenSecure(token: string): Promise<{ valid: boolean; phone?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };

    const [payloadStr, signature] = parts;

    // Verify Signature
    const secret = getSigningKey();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const algorithm = { name: "HMAC", hash: "SHA-256" };
    const key = await crypto.subtle.importKey("raw", keyData, algorithm, false, ["verify"]);

    const dataToVerify = encoder.encode(payloadStr);
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, dataToVerify);

    if (!isValid) return { valid: false };

    // Check Payload
    const payload = JSON.parse(atob(payloadStr));
    if (payload.exp < Date.now()) {
      return { valid: false };
    }

    return { valid: true, phone: payload.phone };
  } catch (e) {
    // console.error("Verification failed:", e);
    return { valid: false };
  }
}

// Simple hash function for PIN (SHA-256 with salt)
async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Verify token action
    if (action === 'verify') {
      const { token } = await req.json();
      const result = await verifyTokenSecure(token); // Use secure verify
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (action === 'get-my-purchases') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const token = authHeader.replace('Bearer ', '');
      const verification = await verifyTokenSecure(token);

      if (!verification.valid || !verification.phone) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Query Purchases (securely using service role)
      const { data, error } = await supabase
        .from('purchases')
        .select(`
            *,
            raffle:raffles(*),
            numbers:raffle_numbers(number)
        `)
        .eq('buyer_phone', verification.phone)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Db error:', error);
        return new Response(JSON.stringify({ error: 'Database error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { phone, pin } = await req.json();

    // Validate inputs
    if (!phone || !pin) {
      return new Response(
        JSON.stringify({ error: 'Telefone e PIN são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return new Response(
        JSON.stringify({ error: 'PIN deve ter 4 dígitos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean phone number (keep only digits)
    const cleanPhone = phone.replace(/\D/g, '');

    if (action === 'register') {
      // Check if account already exists
      const { data: existing } = await supabase
        .from('customer_accounts')
        .select('id')
        .eq('phone', cleanPhone)
        .single();

      if (existing) {
        return new Response(
          JSON.stringify({ error: 'Este telefone já está cadastrado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash PIN with phone as salt
      const pinHash = await hashPin(pin, cleanPhone);

      // Create account
      const { error: insertError } = await supabase
        .from('customer_accounts')
        .insert({ phone: cleanPhone, pin_hash: pinHash });

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Erro ao criar conta' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use Secure Token Generation
      const payload = {
        phone: cleanPhone,
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        iat: Date.now(),
      };
      const token = await signToken(payload);

      return new Response(
        JSON.stringify({ success: true, token, phone: cleanPhone }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'login') {
      // Find account
      const { data: account, error: findError } = await supabase
        .from('customer_accounts')
        .select('id, phone, pin_hash, failed_login_attempts, locked_until')
        .eq('phone', cleanPhone)
        .single();

      if (findError || !account) {
        return new Response(
          JSON.stringify({ error: 'Conta não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if locked
      if (account.locked_until && new Date(account.locked_until) > new Date()) {
        const remaining = Math.ceil((new Date(account.locked_until).getTime() - Date.now()) / 60000);
        return new Response(
          JSON.stringify({ error: `Conta bloqueada temporariamente. Tente novamente em ${remaining} minutos.` }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify PIN
      const pinHash = await hashPin(pin, cleanPhone);

      if (pinHash !== account.pin_hash) {
        // Increment failed attempts
        const attempts = (account.failed_login_attempts || 0) + 1;
        const updates: { failed_login_attempts: number; locked_until?: string } = { failed_login_attempts: attempts };

        // Lock if > 5 attempts
        if (attempts >= 5) {
          const lockTime = new Date();
          lockTime.setMinutes(lockTime.getMinutes() + 15); // Lock for 15 mins
          updates.locked_until = lockTime.toISOString();
        }

        await supabase
          .from('customer_accounts')
          .update(updates)
          .eq('id', account.id);

        return new Response(
          JSON.stringify({ error: 'PIN incorreto' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Success: Reset attempts
      if (account.failed_login_attempts > 0 || account.locked_until) {
        await supabase
          .from('customer_accounts')
          .update({ failed_login_attempts: 0, locked_until: null })
          .eq('id', account.id);
      }

      // Use Secure Token Generation
      const payload = {
        phone: cleanPhone,
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        iat: Date.now(),
      };
      const token = await signToken(payload);

      return new Response(
        JSON.stringify({ success: true, token, phone: cleanPhone }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'reset-pin') {
      // Verify Authorization header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check Admin Role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Admin reset PIN - update pin_hash for phone
      const { data: account, error: findError } = await supabase
        .from('customer_accounts')
        .select('id')
        .eq('phone', cleanPhone)
        .single();

      if (findError || !account) {
        return new Response(
          JSON.stringify({ error: 'Conta não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash new PIN
      const pinHash = await hashPin(pin, cleanPhone);

      // Update PIN AND RESET LOCK
      const { error: updateError } = await supabase
        .from('customer_accounts')
        .update({
          pin_hash: pinHash,
          failed_login_attempts: 0,
          locked_until: null
        })
        .eq('phone', cleanPhone);

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar PIN' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'PIN atualizado com sucesso' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Ação inválida. Use: register, login, verify ou reset-pin' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
