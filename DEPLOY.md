# Guia de Deploy - Rifa Fácil

Este guia explica como configurar o ambiente de produção usando **Supabase** (Banco de Dados e Auth) e **Render** (Hospedagem do Site).

## Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Supabase](https://supabase.com)
- Conta no [Render](https://render.com)
- Node.js e NPM instalados (para rodar comandos do Supabase localmente)

---

## Passo 1: Configuração do Supabase

1. **Criar Projeto:**
   - Acesse o [Dashboard do Supabase](https://supabase.com/dashboard/projects) e clique em "New project".
   - Escolha um nome (ex: `rifa-facil-db`) e uma senha forte para o banco de dados.
   - Escolha a região mais próxima (ex: `South America (São Paulo)`).

2. **Obter Credenciais:**
   - Após criar o projeto, vá em **Project Settings > API**.
   - Copie a **Project URL** e a **Publishable API Key** (pode começar com `sb_publishable_` ou `anon`). Você precisará delas no Passo 2.

3. **Aplicar Migrations (Banco de Dados):**
   - Para criar as tabelas e configurações no seu novo projeto, você pode usar o arquivo consolidado `supabase/full_schema.sql` gerado neste repositório.

   **Como aplicar:**
   1. Abra o arquivo `supabase/full_schema.sql` neste repositório e copie todo o seu conteúdo.
   2. Vá para o [Dashboard do Supabase](https://supabase.com/dashboard/project/_/sql).
   3. Clique em **SQL Editor** no menu lateral.
   4. Cole o conteúdo no editor e clique em **Run**.

---

## Passo 2: Configuração do Render

1. **Conectar Repositório:**
   - Acesse o [Dashboard do Render](https://dashboard.render.com).
   - Clique em **New +** e selecione **Blueprint**.
   - Conecte sua conta do GitHub e selecione o repositório deste projeto (`rifa-facil-app`).

2. **Configurar Variáveis de Ambiente:**
   - O Render detectará automaticamente o arquivo `render.yaml` e mostrará os detalhes do serviço `rifa-facil-app`.
   - Na seção de variáveis de ambiente ("Environment Variables"), preencha os valores com as credenciais do Supabase (Passo 1.2):
     - `VITE_SUPABASE_URL`: Cole a **Project URL**.
     - `VITE_SUPABASE_PUBLISHABLE_KEY`: Cole a **Publishable API Key**.

3. **Deploy:**
   - Clique em **Apply** ou **Create Web Service**.
   - O Render iniciará o processo de build (`pnpm install && pnpm run build`).
   - Aguarde finalizar. Quando concluído, você receberá a URL do seu site (ex: `https://rifa-facil-app.onrender.com`).

---

## Passo 3: Finalização

- Acesse a URL do seu site no Render.
- Teste o login/cadastro e a criação de rifas para garantir que a conexão com o Supabase está funcionando corretamente.
- Se houver problemas de "Página não encontrada" ao atualizar a página, verifique se o arquivo `public/_redirects` foi copiado corretamente (o script de build já deve lidar com isso).

## Solução de Problemas Comuns

### Erro: "Publish directory dist does not exist!" ou Build usando Bun

Se você ver logs indicando `Using Bun version...` ou o erro acima, verifique as configurações do seu serviço no Dashboard do Render:

1. Vá em **Settings** > **Build & Deploy**.
2. Verifique o **Build Command**. Ele DEVE ser:
   ```bash
   pnpm install && pnpm run build
   ```
   *Se estiver como `bun install` ou `npm install`, o build falhará.*
3. Verifique o **Publish Directory**. Ele DEVE ser:
   ```bash
   dist
   ```
