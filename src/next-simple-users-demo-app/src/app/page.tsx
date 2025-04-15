import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to the User App!</h1>
      <Link href="/users">View Users</Link>
    </main>
  );
}