import { requireUser } from "@/lib/authorization";


export default async function MyAdsPage() {
  const user = await requireUser();

  return (
    <main>
      <h1>My Advertisements</h1>
      <p>Signed in as {user.email}</p>
    </main>
  );
}