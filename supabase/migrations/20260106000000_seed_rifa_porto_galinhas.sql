-- ==============================================
-- RIFA: VIAGEM DOS SONHOS - PORTO DE GALINHAS
-- ==============================================
-- Data de criação: 2026-01-06
-- Descrição: Rifa com múltiplos prêmios incríveis

INSERT INTO public.raffles (
  title,
  description,
  prize_description,
  prize_draw_details,
  prize_referral_1st,
  referral_threshold,
  prize_buyer_1st,
  prize_referral_runners,
  prize_buyer_runners,
  price_per_number,
  total_numbers,
  status,
  draw_date
) VALUES (
  -- TÍTULO
  '🌴 Viagem dos Sonhos - Porto de Galinhas',
  
  -- DESCRIÇÃO GERAL
  '✨ Concorra a uma experiência inesquecível no paraíso brasileiro! Uma viagem romântica de casal para Porto de Galinhas, com hospedagem em resort à beira-mar, café da manhã incluso e passeios pelas famosas piscinas naturais. Além do prêmio principal, temos premiações especiais para quem mais indicar amigos e para os maiores compradores!',
  
  -- PRÊMIO PRINCIPAL (Título curto)
  'Viagem de Casal para Porto de Galinhas 🏝️',
  
  -- DETALHES DO PRÊMIO PRINCIPAL
  '🌟 PRÊMIO MÁXIMO - VIAGEM DOS SONHOS PARA CASAL 🌟

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
• Não é transferível para terceiros (apenas pode indicar acompanhante)

🎰 Boa sorte! Sua viagem dos sonhos pode estar a um número de distância!',

  -- PRÊMIO TOP INDICADOR (1º Lugar)
  '🥇 VIAGEM SOLO PARA PORTO DE GALINHAS

O maior indicador de vendas ganha uma viagem individual completa para o mesmo paraíso!

O que está incluso:
• Passagem aérea ida e volta
• 5 dias e 4 noites em pousada charmosa
• Café da manhã incluso
• Passeio de jangada nas piscinas naturais
• Transfer aeroporto ↔ pousada

💡 Indique amigos, compartilhe seu link e concorra a essa experiência incrível! Quanto mais indicações confirmadas, maior sua chance de ganhar!

Valor estimado: R$ 4.500,00',

  -- META DE VENDAS (Gatilho para liberar prêmio antecipado)
  8000,
  
  -- PRÊMIO MAIOR COMPRADOR (1º Lugar)
  '🎬 PROJETOR THUNDEAL TD98 PRO - HOME CINEMA PROFISSIONAL

O maior comprador leva para casa um projetor de última geração!

📺 ESPECIFICAÇÕES TÉCNICAS:
• Resolução nativa: Full HD 1080p
• Suporte: até 4K
• Brilho: 15.000 Lúmens
• Tecnologia: LCD LED
• Tela projetada: 50" a 300"
• Sistema: Android 11 integrado
• Conectividade: Wi-Fi, Bluetooth, HDMI, USB
• Alto-falantes: Estéreo embutidos
• Keystone: Correção automática 4D

🎁 ACESSÓRIOS INCLUSOS:
• Controle remoto
• Cabo de força
• Manual em português
• Suporte de teto (bônus!)

💎 Transforme sua sala em uma verdadeira sala de cinema. Perfeito para filmes, séries, jogos e apresentações!

Valor estimado: R$ 2.800,00',

  -- PRÊMIO TOP INDICADORES (2º ao 5º lugar)
  '📊 CONSULTORIA COMPLETA EM REFORMA TRIBUTÁRIA

Os indicadores do 2º ao 5º lugar recebem uma consultoria personalizada sobre a Reforma Tributária Brasileira!

🎓 O QUE VOCÊ RECEBE:

📋 DIAGNÓSTICO COMPLETO (4h de consultoria):
• Análise do impacto da reforma na sua atividade econômica
• Mapeamento dos novos tributos: IBS, CBS e IS
• Simulação de carga tributária pré e pós-reforma
• Identificação de riscos e oportunidades

📑 RELATÓRIO EXECUTIVO:
• Documento de 15-20 páginas personalizado
• Projeções financeiras para 2026-2033
• Recomendações estratégicas de adequação
• Cronograma de implementação das mudanças

👨‍💼 ACOMPANHAMENTO:
• 2 sessões de follow-up (1h cada)
• Suporte via WhatsApp por 30 dias
• Atualizações sobre regulamentações

⚡ ÁREAS ATENDIDAS:
Comércio, Serviços, Indústria, Agronegócio, Profissionais Liberais e Microempreendedores.

Ministrado por contador especialista com mais de 15 anos de experiência e certificações em tributação empresarial.

Valor estimado: R$ 1.500,00 cada',

  -- PRÊMIO TOP COMPRADORES (2º ao 5º lugar)
  '💻 CRIAÇÃO DE APLICATIVO OU SITE COMPLETO

Os compradores do 2º ao 5º lugar ganham o desenvolvimento de um app ou site profissional!

🛠️ O QUE VOCÊ PODE ESCOLHER:

🛒 OPÇÃO 1 - LOJA VIRTUAL:
• E-commerce completo com até 50 produtos
• Integração com Mercado Pago/PagSeguro
• Painel administrativo para gerenciar pedidos
• Design responsivo (mobile + desktop)
• Carrinho de compras e checkout otimizado

📄 OPÇÃO 2 - SITE INSTITUCIONAL:
• Site profissional com até 8 páginas
• Formulário de contato integrado
• Galeria de fotos/portfólio
• Integração com WhatsApp Business
• SEO básico otimizado

📝 OPÇÃO 3 - BLOG/PORTAL:
• Plataforma completa de publicação
• Categorias e tags organizadas
• Sistema de comentários
• Newsletter integrada
• Painel para publicar artigos

📱 OPÇÃO 4 - PWA (Progressive Web App):
• Aplicativo que funciona como app nativo
• Instalável no celular
• Funciona offline
• Notificações push

✅ INCLUSO EM TODAS AS OPÇÕES:
• Design personalizado com sua marca
• Treinamento de uso (1h)
• 30 dias de suporte pós-entrega
• Código-fonte entregue

⚠️ NÃO INCLUSO:
• Custos de hospedagem e domínio
• Manutenção após 30 dias
• Integrações complexas com sistemas ERP

Prazo de entrega: 30 a 45 dias úteis
Valor estimado: R$ 3.000,00 cada',

  -- PREÇO POR NÚMERO (R$)
  2.50,
  
  -- TOTAL DE NÚMEROS
  20000,
  
  -- STATUS INICIAL
  'draft',
  
  -- DATA DO SORTEIO (exemplo: 90 dias após criação)
  (NOW() + INTERVAL '90 days')::timestamptz
);

-- Verificar inserção
SELECT 
  id,
  title,
  status,
  prize_description,
  price_per_number,
  total_numbers,
  draw_date
FROM public.raffles 
WHERE title ILIKE '%Porto de Galinhas%'
ORDER BY created_at DESC
LIMIT 1;
