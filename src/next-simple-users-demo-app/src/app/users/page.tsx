import Link from 'next/link';
import { users } from '@/data/users';

export default function UsersPage() {
  return (
    <main>
      <h1>Users List</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}