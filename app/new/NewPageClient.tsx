'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';

const MIN_MEMO_LEN = 10;
const MAX_MEMO_LEN = 500;

function mapErrorMessage(code: string) {
  switch (code) {
    case 'VALIDATION_ERROR':
      return '입력값을 확인해 주세요.';
    case 'RATE_LIMIT':
      return '전송이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
    case 'SERVER_ERROR':
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    case 'NETWORK_ERROR':
      return '네트워크 오류가 발생했습니다. 다시 시도해 주세요.';
    default:
      return '전송에 실패했습니다. 다시 시도해 주세요.';
  }
}

export default function NewPageClient() {
  const params = useSearchParams();
  const site = params.get('site') ?? '';
  const returnUrl = params.get('return_url') ?? '';
  const returnHost = (() => {
    if (!returnUrl) return '';
    try {
      return new URL(returnUrl).hostname;
    } catch {
      return '';
    }
  })();

  const [memo, setMemo] = useState('');
  const [contact, setContact] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const memoLen = memo.trim().length;
  const canSubmit = memoLen >= MIN_MEMO_LEN && memoLen <= MAX_MEMO_LEN && !loading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('메모는 10~500자로 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site,
          return_url: returnUrl,
          memo,
          contact,
          company,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.redirect) {
        setError(mapErrorMessage(data?.error || 'SERVER_ERROR'));
        return;
      }

      window.location.href = data.redirect;
    } catch {
      setError(mapErrorMessage('NETWORK_ERROR'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="hero fade-in">
        <p className="kicker">Contact Hub</p>
        <h1 className="title">간단 메모 남기기</h1>
        <p className="subtitle">
          메모는 이메일로 전달되고 잠시 후 원래 페이지로 돌아갑니다.
        </p>
      </header>

      <section className="card fade-in delay-1">
        <div className="meta">
          <span className="pill">사이트: {site || '미지정'}</span>
          {returnHost ? <span className="pill">복귀: {returnHost}</span> : null}
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <input type="hidden" name="site" value={site} readOnly />
          <input type="hidden" name="return_url" value={returnUrl} readOnly />

          <div className="field">
            <label className="label" htmlFor="memo">메모</label>
            <textarea
              className="textarea"
              id="memo"
              name="memo"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              rows={6}
              required
            />
            <div className="helper">
              <span>10~500자</span>
              <span>{memoLen}/{MAX_MEMO_LEN}자</span>
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="contact">연락처 (선택)</label>
            <input
              className="input"
              id="contact"
              name="contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="이메일 또는 전화번호"
            />
          </div>

          <div style={{ position: 'absolute', left: '-9999px', top: 0 }} aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input
              className="input"
              id="company"
              name="company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="actions">
            <button className="button" type="submit" disabled={!canSubmit}>
              {loading ? '전송 중...' : '보내기'}
            </button>
            <p className="note">메모는 담당자 메일로만 전달됩니다.</p>
          </div>

          {error ? <p className="error" role="alert">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
