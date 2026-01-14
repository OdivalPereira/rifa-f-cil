import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { event, raffle_id, raffle_title, deleted_at } = await req.json();

        console.log(`Received event: ${event}`, { raffle_id, raffle_title, deleted_at });

        if (event !== 'raffle_soft_deleted' && event !== 'soft_delete') {
            return new Response(
                JSON.stringify({ error: 'Unknown event type', received: event }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Configurações de e-mail
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        const ADMIN_EMAIL = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'admin@rifafacil.com';
        const APP_URL = Deno.env.get('APP_URL') || 'https://rifafacil.com';

        if (!RESEND_API_KEY) {
            console.warn('RESEND_API_KEY not configured, skipping email notification');
            return new Response(
                JSON.stringify({
                    success: true,
                    warning: 'Email service not configured (RESEND_API_KEY missing)',
                    event_logged: true
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Formatar data de exclusão
        const deletedDate = new Date(deleted_at).toLocaleString('pt-BR', {
            dateStyle: 'long',
            timeStyle: 'short',
            timeZone: 'America/Sao_Paulo',
        });

        // Calcular data de exclusão permanente (30 dias depois)
        const permanentDeletionDate = new Date(deleted_at);
        permanentDeletionDate.setDate(permanentDeletionDate.getDate() + 30);
        const permanentDeletionDateStr = permanentDeletionDate.toLocaleString('pt-BR', {
            dateStyle: 'long',
            timeZone: 'America/Sao_Paulo',
        });

        // Link para recuperação
        const recoveryLink = `${APP_URL}/admin?tab=rifas&restore=${raffle_id}`;

        // Template de e-mail HTML
        const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #fbbf24; font-size: 28px; margin: 0;">🎰 Rifa Fácil</h1>
    </div>
    
    <!-- Alert Card -->
    <div style="background: linear-gradient(135deg, #1e293b, #334155); border-radius: 16px; padding: 30px; border: 1px solid #475569;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <span style="font-size: 32px; margin-right: 12px;">⚠️</span>
        <h2 style="color: #f59e0b; font-size: 22px; margin: 0;">Rifa Movida para Lixeira</h2>
      </div>
      
      <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        Uma rifa foi excluída e movida para a lixeira do sistema.
      </p>
      
      <!-- Raffle Info Box -->
      <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #fbbf24; font-size: 18px; margin: 0 0 15px; font-weight: 600;">
          ${raffle_title}
        </h3>
        <div style="color: #64748b; font-size: 14px;">
          <p style="margin: 8px 0;">
            <strong style="color: #94a3b8;">Data da Exclusão:</strong> ${deletedDate}
          </p>
          <p style="margin: 8px 0;">
            <strong style="color: #94a3b8;">ID:</strong> 
            <code style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${raffle_id}</code>
          </p>
        </div>
      </div>
      
      <!-- Warning -->
      <div style="background: linear-gradient(135deg, #7f1d1d, #991b1b); border-radius: 8px; padding: 15px; margin-bottom: 25px;">
        <p style="color: #fecaca; font-size: 14px; margin: 0; line-height: 1.5;">
          ⏰ <strong>Atenção:</strong> Esta rifa será <strong>permanentemente excluída</strong> em 
          <strong>${permanentDeletionDateStr}</strong> (30 dias após a exclusão).
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="${recoveryLink}" style="
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #1f2937;
          font-weight: 600;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-size: 15px;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
        ">
          🔄 Recuperar Rifa
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        Este é um e-mail automático do sistema Rifa Fácil.<br>
        Você recebeu esta notificação porque é administrador do sistema.
      </p>
    </div>
  </div>
</body>
</html>
    `;

        // Enviar e-mail via Resend
        console.log(`Sending email notification to ${ADMIN_EMAIL}`);

        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Rifa Fácil <noreply@rifafacil.com>',
                to: [ADMIN_EMAIL],
                subject: `⚠️ Rifa Excluída: ${raffle_title}`,
                html: emailHtml,
            }),
        });

        const emailResult = await emailResponse.json();

        if (!emailResponse.ok) {
            console.error('Resend API error:', emailResult);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Failed to send email',
                    details: emailResult
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log('Email sent successfully:', emailResult);

        return new Response(
            JSON.stringify({
                success: true,
                email_sent: true,
                message_id: emailResult.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error in notify-admin-action:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
