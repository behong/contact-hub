'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function isSafeHttpUrl(value: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function DonePageClient() {
  const params = useSearchParams();
  const status = params.get('status') ?? 'ok';
  const returnUrl = params.get('return_url') ?? '';
  const canAutoReturn = status === 'ok' && isSafeHttpUrl(returnUrl);
  const returnHost = (() => {
    if (!returnUrl) return '';
    try {
      return new URL(returnUrl).hostname;
    } catch {
      return '';
    }
  })();
  const retryUrl = returnUrl
    ? `/new?return_url=${encodeURIComponent(returnUrl)}`
    : '/new';

  useEffect(() => {
    if (!canAutoReturn) return;
    const id = setTimeout(() => {
      window.location.href = returnUrl;
    }, 1500);
    return () => clearTimeout(id);
  }, [canAutoReturn, returnUrl]);

  const heading = status === 'ok'
    ? '전송 완료'
    : status === 'blocked'
      ? '복귀 차단'
      : '전송 실패';

  const message = status === 'ok'
    ? '메모가 정상적으로 전달되었습니다.'
    : status === 'blocked'
      ? '복귀 주소가 허용되지 않아 자동 이동하지 않습니다.'
      : '다시 시도해 주세요.';
  const statusLabel = status === 'ok'
    ? '상태: 전송 완료'
    : status === 'blocked'
      ? '상태: 차단'
      : '상태: 오류';
  const messageClass = status === 'ok' ? 'success' : 'error';

  return (
    <main className="page">
      <header className="hero fade-in">
        <p className="kicker">Contact Hub</p>
        <h1 className="title">{heading}</h1>
        <p className="subtitle">{message}</p>
      </header>

      <section className="card fade-in delay-1">
        <div className="meta">
          <span className="pill">{statusLabel}</span>
          {returnHost ? <span className="pill">복귀: {returnHost}</span> : null}
        </div>

        <p className={messageClass}>
          {status === 'ok'
            ? '감사합니다. 메모가 전송되었습니다.'
            : '요청을 완료하지 못했습니다.'}
        </p>

        {status === 'ok' && canAutoReturn ? (
          <p className="note">잠시 후 원래 페이지로 이동합니다...</p>
        ) : null}

        <div className="actions">
          {status === 'ok' && canAutoReturn ? (
            <a className="link-button" href={returnUrl}>바로 돌아가기</a>
          ) : (
            <a className="link-button" href={status === 'error' ? retryUrl : '/new'}>
              {status === 'error' ? '다시 시도' : '문의 홈'}
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
