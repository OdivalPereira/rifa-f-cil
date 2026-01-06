// Script para inserir rifa diretamente no Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = '';
const SUPABASE_KEY = '';


const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createRaffle() {
    console.log('🚀 Criando rifa no Supabase...\n');

    const { data, error } = await supabase
        .from('raffles')
        .insert({
            title: '🌴 Viagem dos Sonhos - Porto de Galinhas',
            description: '✨ Concorra a uma experiência inesquecível no paraíso brasileiro! Uma viagem romântica de casal para Porto de Galinhas, com hospedagem em resort à beira-mar, café da manhã incluso e passeios pelas famosas piscinas naturais. Além do prêmio principal, temos premiações especiais para quem mais indicar amigos e para os maiores compradores!',
            prize_description: 'Viagem de Casal para Porto de Galinhas 🏝️',
            prize_draw_details: `🌟 PRÊMIO MÁXIMO - VIAGEM DOS SONHOS PARA CASAL 🌟

📍 Destino: Porto de Galinhas - Ipojuca, Pernambuco
📅 Duração: 5 dias e 4 noites

✅ O QUE ESTÁ INCLUSO:
• Passagens aéreas de ida e volta (classe econômica)
• Hospedagem em Resort 4 estrelas à beira-mar
• Café da manhã completo todos os dias
• Passeio de jangada nas Piscinas Naturais
• Transfer aeroporto ↔ hotel
• Day Use em Beach Club

🏨 ACOMODAÇÃO:
Suíte de casal com varanda, ar-condicionado, frigobar, TV e Wi-Fi. Vista privilegiada para o mar ou jardim tropical.

🗓️ PERÍODO FLEXÍVEL:
O ganhador poderá escolher a data da viagem em até 12 meses após o sorteio, sujeito à disponibilidade.

⚠️ OBSERVAÇÕES:
• Válido para 2 pessoas adultas
• Documentação necessária: RG ou passaporte válido
• Valor estimado do prêmio: R$ 8.500,00

🎰 Boa sorte! Sua viagem dos sonhos pode estar a um número de distância!`,

            prize_referral_1st: `🥇 VIAGEM SOLO PARA PORTO DE GALINHAS

O maior indicador de vendas ganha uma viagem individual completa para o mesmo paraíso!

O que está incluso:
• Passagem aérea ida e volta
• 5 dias e 4 noites em pousada charmosa
• Café da manhã incluso
• Passeio de jangada nas piscinas naturais
• Transfer aeroporto ↔ pousada

💡 Indique amigos, compartilhe seu link e concorra a essa experiência incrível!

Valor estimado: R$ 4.500,00`,

            referral_threshold: 8000,

            prize_buyer_1st: `🎬 PROJETOR THUNDEAL TD98 PRO - HOME CINEMA PROFISSIONAL

O maior comprador leva para casa um projetor de última geração!

📺 ESPECIFICAÇÕES TÉCNICAS:
• Resolução nativa: Full HD 1080p
• Suporte: até 4K
• Brilho: 15.000 Lúmens
• Tecnologia: LCD LED
• Tela projetada: 50" a 300"
• Sistema: Android 11 integrado
• Conectividade: Wi-Fi, Bluetooth, HDMI, USB

🎁 ACESSÓRIOS INCLUSOS:
• Controle remoto
• Cabo de força
• Manual em português
• Suporte de teto (bônus!)

Valor estimado: R$ 2.800,00`,

            prize_referral_runners: `📊 CONSULTORIA COMPLETA EM REFORMA TRIBUTÁRIA

Os indicadores do 2º ao 5º lugar recebem uma consultoria personalizada!

🎓 O QUE VOCÊ RECEBE:
• 4h de consultoria personalizada
• Análise do impacto da reforma na sua atividade econômica
• Mapeamento dos novos tributos: IBS, CBS e IS
• Simulação de carga tributária pré e pós-reforma
• Relatório executivo (15-20 páginas)
• 2 sessões de follow-up (1h cada)
• Suporte via WhatsApp por 30 dias

⚡ ÁREAS ATENDIDAS:
Comércio, Serviços, Indústria, Agronegócio, Profissionais Liberais e Microempreendedores.

Valor estimado: R$ 1.500,00 cada`,

            prize_buyer_runners: `💻 CRIAÇÃO DE APLICATIVO OU SITE COMPLETO

Os compradores do 2º ao 5º lugar ganham o desenvolvimento de um app ou site profissional!

🛠️ O QUE VOCÊ PODE ESCOLHER:

🛒 LOJA VIRTUAL: E-commerce completo com até 50 produtos
📄 SITE INSTITUCIONAL: Site profissional com até 8 páginas
📝 BLOG/PORTAL: Plataforma completa de publicação
📱 PWA: Aplicativo instalável no celular

✅ INCLUSO EM TODAS AS OPÇÕES:
• Design personalizado com sua marca
• Treinamento de uso (1h)
• 30 dias de suporte pós-entrega
• Código-fonte entregue

⚠️ NÃO INCLUSO:
• Custos de hospedagem e domínio
• Manutenção após 30 dias

Prazo de entrega: 30 a 45 dias úteis
Valor estimado: R$ 3.000,00 cada`,

            price_per_number: 2.50,
            total_numbers: 20000,
            status: 'active',
            draw_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Erro ao criar rifa:', error.message);
        process.exit(1);
    }

    console.log('✅ Rifa criada com sucesso!');
    console.log('📋 ID:', data.id);
    console.log('📌 Título:', data.title);
    console.log('💰 Preço:', `R$ ${data.price_per_number}`);
    console.log('🎟️ Números:', data.total_numbers);
    console.log('📅 Sorteio:', new Date(data.draw_date).toLocaleDateString('pt-BR'));
    console.log('🟢 Status:', data.status);
}

createRaffle();
