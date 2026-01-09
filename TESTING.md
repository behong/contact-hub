# Testing checklist

## Setup
- Copy `.env.example` to `.env.local` and fill in real values.
- Ensure `ALLOWED_RETURN_HOSTS` includes the host you will use in `return_url`.

## Manual UI
- Open `http://localhost:3000/new?site=siteA&return_url=https%3A%2F%2FsiteA.com%2Fposts%2F123`.
- Submit with memo shorter than 10 chars -> error shown, submit blocked.
- Submit with memo longer than 500 chars -> error shown, submit blocked.
- Submit with valid memo -> redirect to `/done?status=ok...` then auto return.
- Change `return_url` to a non-allowlisted host -> redirect to `/done?status=blocked` and no auto return.

## API
- POST JSON to `/api/contact` with valid body -> 200 + `redirect`.
- POST missing fields -> 400 `VALIDATION_ERROR`.
- Trigger rate limit (e.g., 4 requests within a minute) -> 429 `RATE_LIMIT`.

## Mail
- Confirm Resend dashboard shows the outgoing email.
- Verify subject and body formatting.

## Example curl
```
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"site":"siteA","return_url":"https://siteA.com/posts/123","memo":"Hello, this is a test.","contact":"me@example.com","company":""}'
```
