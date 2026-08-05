import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";


export default async function Account(){
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main>
      <h1>My Account</h1>

      <p>Name: {session.user.name}</p>
      <p>Email: {session.user.email}</p>
      <p>User ID: {session.user.id}</p>
      <p>Role: {session.user.role}</p>
      <p>Status: {session.user.status}</p>

      {session ? (

        <>
        
      <form
                action={async () => {
                  "use server";
    
                  await signOut({
                    redirectTo: "/login",
                  });
                }}
              >
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
        
        </>

      ) : null}


    </main>
  );
}
