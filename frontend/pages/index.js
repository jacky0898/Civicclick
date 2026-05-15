import Link from 'next/link';

export default function Home() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>Welcome to CivicClick</h1>
      <p style={{ color: '#555', marginBottom: 32, fontSize: 16 }}>
        Report civic issues, volunteer to resolve them, and track contributions.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/register" className="btn btn-primary">Get Started</Link>
        <Link href="/login" className="btn" style={{ background: '#fff', border: '1px solid #1a73e8', color: '#1a73e8' }}>Login</Link>
        <Link href="/leaderboard" className="btn" style={{ background: '#fff', border: '1px solid #ccc', color: '#333' }}>Leaderboard</Link>
      </div>
    </div>
  );
}
