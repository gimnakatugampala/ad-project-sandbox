import { auth } from "@/auth"
import { redirect } from "next/navigation";


export default async function Account(){
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <main>
      <h1>My Account</h1>

      <p>Name: {session.user.name}</p>
      <p>Email: {session.user.email}</p>
      <p>User ID: {session.user.id}</p>
      <p>Role: {session.user.role}</p>
      <p>Status: {session.user.status}</p>
    </main>
  );
}
