import Image from "next/image";
import { Button } from "@/components/ui/button";
import { auth , signOut } from "@/auth";

export  default async function  Home() {

  const sessions = await auth();

  console.log(sessions?.user)

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">

        {sessions ?  
        <>
        <Button>{sessions.user.email}</Button> 
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
        : null}
    
      </main>
    </div>
  );
}
