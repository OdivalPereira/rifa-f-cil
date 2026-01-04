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
   - Copie a **Project URL** e a **anon public key**. Você precisará delas no Passo 2.

3. **Aplicar Migrations (Banco de Dados):**
   - As tabelas e configurações do banco já estão definidas na pasta `supabase/migrations`.
   - Para aplicar essas configurações no seu novo projeto Supabase, você usará a CLI do Supabase.

   **Opção A: Usando a CLI (Recomendado)**

   1. Faça login na CLI do Supabase:
      ```bash
      npx supabase login
      ```
   2. Vincule seu projeto local ao projeto remoto que você acabou de criar. Você precisará do `Reference ID` do projeto (encontrado em Project Settings > General, ou na URL do dashboard `https://supabase.com/dashboard/project/<REFERENCE_ID>`):
      ```bash
      npx supabase link --project-ref <SEU_REFERENCE_ID>
      ```
      *Quando pedir a senha do banco de dados, insira a senha que você criou no passo 1.1.*

   3. Envie as migrations para o banco remoto:
      ```bash
      npx supabase db push
      ```
      Isso criará todas as tabelas, funções e triggers necessárias automaticamente.

   **Opção B: Manualmente (SQL Editor)**
   - Se preferir não usar a CLI, você pode copiar o conteúdo de cada arquivo `.sql` dentro de `supabase/migrations/` e rodar no **SQL Editor** do dashboard do Supabase.
   - **IMPORTANTE:** Execute os arquivos na ordem cronológica (do mais antigo para o mais recente).

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
     - `VITE_SUPABASE_ANON_KEY`: Cole a **anon public key**.

3. **Deploy:**
   - Clique em **Apply** ou **Create Web Service**.
   - O Render iniciará o processo de build (`pnpm install && pnpm run build`).
   - Aguarde finalizar. Quando concluído, você receberá a URL do seu site (ex: `https://rifa-facil-app.onrender.com`).

---

## Passo 3: Finalização

- Acesse a URL do seu site no Render.
- Teste o login/cadastro e a criação de rifas para garantir que a conexão com o Supabase está funcionando corretamente.
- Se houver problemas de "Página não encontrada" ao atualizar a página, verifique se o arquivo `public/_redirects` foi copiado corretamente (o script de build já deve lidar com isso).
