import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const session = await getSessionUser();
  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
