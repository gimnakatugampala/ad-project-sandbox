import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/account");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        action={async () => {
          "use server";

          await signIn("google", {
            redirectTo: "/account",
          });
        }}
      >
        <Button type="submit">
          Sign in with Google
        </Button>
      </form>
    </main>
  );
}