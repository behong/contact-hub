export default function Home() {
  return (
    <main className="page">
      <header className="hero fade-in">
        <p className="kicker">Contact Hub</p>
        <h1 className="title">공용 문의 허브</h1>
        <p className="subtitle">
          하나의 폼으로 여러 사이트의 문의를 모읍니다.
        </p>
      </header>

      <section className="card fade-in delay-1">
        <p className="note">
          <code>/new?site=siteA&amp;return_url=...</code> 로 문의 폼을 여세요.
        </p>
      </section>
    </main>
  );
}
