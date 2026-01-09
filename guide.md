# contact-hub (Vercel) — 공통 문의 페이지 + 전송 후 원래 사이트로 복귀

목표
- 여러 사이트에서 공통 “문의” 버튼을 제공한다.
- 버튼 클릭 → `contact.yourdomain.com/new` 로 이동하여 간단 메모 입력 → 메일로 수신.
- 전송 성공 시 1~2초 후 `return_url`로 자동 복귀(버튼도 제공).
- Vercel에 별도 프로젝트 1개로 운영한다.
- 메일 수신은 한 곳(TO_EMAIL)으로 통합한다.

---

## 1) 스택/배포
- Next.js (App Router)
- Vercel 배포
- 메일 발송: Resend

도메인
- `contact.yourdomain.com` (Vercel 프로젝트 Domains에 연결)

---

## 2) 환경변수 (Vercel Project Settings → Environment Variables)
필수
- `RESEND_API_KEY` : Resend API Key
- `TO_EMAIL` : 문의 수신 메일 (예: you@example.com)
- `FROM_EMAIL` : 발신 주소 (예: noreply@yourdomain.com)  ※ Resend에서 도메인 인증 필요
- `ALLOWED_RETURN_HOSTS` : 허용 호스트 allowlist (콤마 구분)
  - 예: `siteA.com,siteB.com,www.siteA.com`

선택(권장)
- `RATE_LIMIT_PER_MIN` : 분당 허용 전송 수 (기본 3)
- `RATE_LIMIT_WINDOW_SEC` : 윈도우(초) (기본 60)
- `HONEYPOT_FIELD` : 허니팟 필드명 (기본 "company")

---

## 3) 라우팅/페이지
- `GET /new`
  - 문의 폼 페이지
  - Query params:
    - `site` (string) : 사이트 식별자 (예: siteA)
    - `return_url` (string, url-encoded) : 복귀할 원래 페이지 URL
- `POST /api/contact`
  - 폼 전송 처리 + 검증 + 메일 발송
- `GET /done`
  - 전송 완료 페이지
  - Query params:
    - `return_url` : 검증된 경우 자동 복귀
    - `status` : ok | blocked | error

---

## 4) 각 사이트에서 버튼 링크 만들기
각 사이트의 “문의” 버튼은 아래 규칙으로 이동시키면 된다.

형식
- `https://contact.yourdomain.com/new?site=<SITE_CODE>&return_url=<ENCODED_CURRENT_URL>`

예시(개념)
- SITE_CODE = `siteA`
- CURRENT_URL = `window.location.href`

최종 예
- `https://contact.yourdomain.com/new?site=siteA&return_url=https%3A%2F%2FsiteA.com%2Fposts%2F123`

주의
- return_url은 반드시 encodeURIComponent 적용

---

## 5) 보안: return_url 오픈 리다이렉트 방지 (필수)
원칙
- return_url의 hostname이 `ALLOWED_RETURN_HOSTS`에 포함될 때만 복귀 허용.
- 불일치 시 자동 복귀는 금지하고, 완료 페이지에서 “홈” 링크만 제공.

검증 로직(요구사항)
- `new URL(return_url)`로 파싱
- `url.protocol`은 http/https만 허용
- `url.hostname`이 allowlist에 포함되는지 확인
- 통과 시에만 `/done?status=ok&return_url=...` 로 넘긴다.

---

## 6) 스팸 방지(가벼운 기본 세트)
(1) Rate limit (IP 기준)
- 분당 N회(기본 3회) 초과 시 429

(2) Honeypot
- 폼에 사람은 안 보이는 input 하나를 둔다(예: name="company")
- 값이 채워져 오면 bot으로 간주하고 조용히 성공처럼 처리하거나(권장) 차단

(3) 내용 검증
- memo 10~500자
- 금칙어/URL 과다 포함 시 추가 제한 가능(선택)

---

## 7) 메일 포맷(권장)
Subject
- `[문의][{site}] 새 메모`

본문(Text)
- Site: {site}
- Page: {return_url}
- Memo:
  {memo}

- Contact(optional): {contact}
- Time(KST): {timestamp}
- IP: {ip}
- UA: {userAgent}

---

## 8) 구현 파일 구조 (예시)
app/
  new/page.tsx
  done/page.tsx
  api/contact/route.ts
lib/
  validateReturnUrl.ts
  rateLimit.ts
  mail.ts

---

## 9) API 스펙
### POST /api/contact
Request JSON
{
  "site": "siteA",
  "return_url": "https://siteA.com/posts/123",
  "memo": "문의 내용 ...",
  "contact": "email or phone (optional)",
  "company": ""  // honeypot (hidden)
}

Response JSON
- 200 OK
  { "ok": true, "redirect": "/done?status=ok&return_url=..." }
- 400 Bad Request (검증 실패)
  { "ok": false, "error": "VALIDATION_ERROR" }
- 429 Too Many Requests
  { "ok": false, "error": "RATE_LIMIT" }
- 500
  { "ok": false, "error": "SERVER_ERROR" }

클라이언트는 응답의 `redirect`로 location 이동.

---

## 10) Resend 발송 (요구)
- `FROM_EMAIL`은 Resend에서 인증된 도메인 주소여야 함.
- 수신은 `TO_EMAIL` 단일 주소.

---

## 11) /new 페이지 UX 요구사항
- 입력 필드:
  - memo (textarea, required, 10~500)
  - contact (optional)
  - company (honeypot, hidden)
- “전송” 클릭 시:
  - 로딩 상태 표시
  - 성공하면 `/done`으로 이동
- 쿼리로 들어온 `site`, `return_url`은 hidden 상태로 유지

---

## 12) /done 페이지 UX 요구사항
- status=ok:
  - “전송 완료” 표시
  - return_url이 유효하면 1~2초 후 자동 이동
  - “바로 돌아가기” 버튼 제공
- status=blocked:
  - “복귀 주소가 유효하지 않아 자동 이동하지 않습니다.”
  - “contact 홈으로” 버튼 제공
- status=error:
  - “전송 실패” + 다시 시도 링크(`/new?...`)

---

## 13) 코딩 체크리스트
- [ ] return_url allowlist 검증 구현
- [ ] IP 기반 rate limit 구현(간단 메모리/kv)
- [ ] honeypot 필드 추가
- [ ] Resend로 메일 발송
- [ ] 성공 후 /done 리다이렉트
- [ ] Vercel env vars 세팅
- [ ] contact 서브도메인 연결

---

## 14) Vercel 도메인 연결 요약
- Vercel Project → Domains → `contact.yourdomain.com` 추가
- DNS에 Vercel이 안내하는 레코드 추가(CNAME/A)
- SSL 자동 적용 확인

---

끝.
원하면 다음 단계로:
- “allowlist에 사이트 추가하는 운영 방법”
- “로그/통계(어느 사이트에서 문의가 많이 오는지)”
- “Turnstile(Cloudflare) 캡차 추가”
까지 확장 가능
