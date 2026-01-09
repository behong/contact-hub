# contact-hub

Shared contact form service for multiple sites. Built with Next.js (App Router) and deployed on Vercel.

## Requirements
- Node.js 18+
- Resend account

## Setup
1) Install dependencies
```
npm install
```

2) Configure environment variables
```
cp .env.example .env.local
```
Edit `.env.local` with real values.

3) Run locally
```
npm run dev
```
Open `http://localhost:3000`.

## Environment variables
Required:
- `RESEND_API_KEY`
- `TO_EMAIL`
- `FROM_EMAIL`
- `ALLOWED_RETURN_HOSTS` (comma-separated allowlist)

Optional:
- `RATE_LIMIT_PER_MIN` (default 3)
- `RATE_LIMIT_WINDOW_SEC` (default 60)
- `HONEYPOT_FIELD` (default company)

## Routes
- `GET /new?site=<SITE_CODE>&return_url=<ENCODED_URL>`
- `POST /api/contact`
- `GET /done?status=ok|blocked|error&return_url=<ENCODED_URL>`

## Button link format
```
https://contact.yourdomain.com/new?site=<SITE_CODE>&return_url=<ENCODED_CURRENT_URL>
```
Use `encodeURIComponent` for `return_url`.

## API
### POST /api/contact
Request JSON:
```
{
  "site": "siteA",
  "return_url": "https://siteA.com/posts/123",
  "memo": "Inquiry ...",
  "contact": "email or phone (optional)",
  "company": "" 
}
```

Responses:
- `200` `{ "ok": true, "redirect": "/done?status=ok&return_url=..." }`
- `400` `{ "ok": false, "error": "VALIDATION_ERROR" }`
- `429` `{ "ok": false, "error": "RATE_LIMIT" }`
- `500` `{ "ok": false, "error": "SERVER_ERROR" }`

## Security
- `return_url` is validated against `ALLOWED_RETURN_HOSTS`.
- Only `http`/`https` protocols are allowed.

## Testing
See `TESTING.md`.
