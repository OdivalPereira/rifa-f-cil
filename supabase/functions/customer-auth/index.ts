import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for PIN (SHA-256 with salt)
async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a simple JWT-like token
function generateToken(phone: string): string {
  const payload = {
    phone,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    iat: Date.now(),
  };
  return btoa(JSON.stringify(payload));
}

// Verify token
function verifyToken(token: string): { valid: boolean; phone?: string } {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return { valid: false };
    }
    return { valid: true, phone: payload.phone };
  } catch {
    return { valid: false };
  }
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
      const result = verifyToken(token);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

      const token = generateToken(cleanPhone);
      return new Response(
        JSON.stringify({ success: true, token, phone: cleanPhone }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'login') {
      // Find account
      const { data: account, error: findError } = await supabase
        .from('customer_accounts')
        .select('id, phone, pin_hash')
        .eq('phone', cleanPhone)
        .single();

      if (findError || !account) {
        return new Response(
          JSON.stringify({ error: 'Conta não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify PIN
      const pinHash = await hashPin(pin, cleanPhone);
      if (pinHash !== account.pin_hash) {
        return new Response(
          JSON.stringify({ error: 'PIN incorreto' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = generateToken(cleanPhone);
      return new Response(
        JSON.stringify({ success: true, token, phone: cleanPhone }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Ação inválida. Use: register, login ou verify' }),
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
