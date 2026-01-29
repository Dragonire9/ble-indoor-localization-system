import { redirect } from 'next/navigation';

export default function Home() {
  // Always land on the main dashboard when visiting `/`.
  redirect('/dashboard');
}
