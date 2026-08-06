import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {

  const session = await auth();

  const params = await searchParams;

const requestedCallback =
  typeof params.callbackUrl === "string"
    ? params.callbackUrl
    : "";

const callbackUrl =
  requestedCallback.startsWith("/") &&
  !requestedCallback.startsWith("//")
    ? requestedCallback
    : "/account";

if (session?.user) {
  redirect(callbackUrl);
}

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        action={async () => {
          "use server";

          await signIn("google", {
  redirectTo: callbackUrl,
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