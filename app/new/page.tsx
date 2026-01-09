import { Suspense } from 'react';

import NewPageClient from './NewPageClient';

export default function NewPage() {
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
      <NewPageClient />
    </Suspense>
  );
}
