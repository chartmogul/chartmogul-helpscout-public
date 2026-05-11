# ChartMogul for HelpScout

A HelpScout Dynamic App that displays ChartMogul customer data in the HelpScout sidebar. When a support agent opens a conversation, the app looks up the customer by email and shows their subscription status, MRR/ARR, and active plans.

## How it works

1. Reads the conversation customer's email from HelpScout context
2. Searches ChartMogul contacts by email to get the customer UUID
3. Fetches the customer record and their subscriptions
4. Displays status, country, MRR, ARR, and a subscription list in the sidebar

## Stack

- **Frontend:** React + TypeScript, built with Vite
- **API:** Vercel serverless functions (proxy to ChartMogul API)
- **Deployment:** Vercel

## API functions

| Endpoint | Description |
|---|---|
| `GET /api/chartmogul/customer` | Fetch customer by `uuid` |
| `GET /api/chartmogul/contacts` | Search contacts by `email` |
| `GET /api/chartmogul/subscriptions` | Fetch subscriptions for a customer `uuid` |

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Frontend (build time) | Base URL of the deployed Vercel app, e.g. `https://your-app.vercel.app` |
| `CHARTMOGUL_TOKEN` | Vercel (server side) | ChartMogul API token |

## Local development

```bash
npm install
npm run dev
```

The dev server runs with HTTPS (via `vite-plugin-mkcert`) — required for HelpScout Dynamic Apps.

Create a `.env.local` file:

```
VITE_API_BASE_URL=https://localhost:5173
```

## Deployment

Deploy to Vercel and set `CHARTMOGUL_TOKEN` as an environment variable in the Vercel project settings. The `vercel.json` config handles routing the API functions and serving the frontend.

## HelpScout setup

In HelpScout, create a Dynamic App pointing to your deployed Vercel URL. The app renders in the conversation sidebar for every ticket.
