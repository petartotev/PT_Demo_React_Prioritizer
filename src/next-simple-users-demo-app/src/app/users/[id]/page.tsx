import { users } from '@/data/users';

type Props = {
  params: {
    id: string;
  };
};

export default function UserDetailPage({ params}: Props) {
  const user = users.find(u => u.id === params.id);

  if (!user) return <p>User not found</p>;

  return (
    <main>
      <h1>{user.name}</h1>
      <p>Position: {user.position}</p>
    </main>
  );
}