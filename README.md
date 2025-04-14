Este é um projeto [Next.js](https://nextjs.org) inicializado com [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Começando

Primeiro, configure as variáveis de ambiente:

1. Copie o arquivo de exemplo de ambiente:

```bash
cp .env.example .env
```

2. Abra o arquivo `.env` e atualize os valores:

-   `DATABASE_URL`: URL de conexão com o banco de dados (o padrão usa SQLite)
-   `NEXTAUTH_SECRET`: Chave secreta para autenticação (você pode gerar uma usando `openssl rand -base64 32`)
-   `NEXTAUTH_URL`: URL base da sua aplicação (mantenha como "http://localhost:3000" para desenvolvimento local)

Em seguida, execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

Você pode começar a editar a página modificando `app/page.tsx`. A página atualiza automaticamente conforme você edita o arquivo.

Este projeto utiliza [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) para otimizar e carregar automaticamente a [Geist](https://vercel.com/font), uma nova família de fontes da Vercel.

## Saiba Mais

Para aprender mais sobre Next.js, dê uma olhada nos seguintes recursos:

-   [Documentação do Next.js](https://nextjs.org/docs) - aprenda sobre os recursos e API do Next.js.
-   [Aprenda Next.js](https://nextjs.org/learn) - um tutorial interativo de Next.js.

Você pode conferir [o repositório do Next.js no GitHub](https://github.com/vercel/next.js) - seu feedback e contribuições são bem-vindos!

## Deploy na Vercel

A maneira mais fácil de fazer o deploy do seu aplicativo Next.js é usar a [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) dos criadores do Next.js.

Confira nossa [documentação de deploy do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.
