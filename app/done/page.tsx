import { Suspense } from 'react';

import DonePageClient from './DonePageClient';

export default function DonePage() {
  return (
    <Suspense
      fallback={
        <main className="page">
          <section className="card">
            <p className="note">로딩 중...</p>
          </section>
        </main>
      }
    >
      <DonePageClient />
    </Suspense>
  );
}
