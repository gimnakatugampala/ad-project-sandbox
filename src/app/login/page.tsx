import type { SVGProps } from "react";

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
    typeof params.callbackUrl === "string" ? params.callbackUrl : "";

  const callbackUrl =
    requestedCallback.startsWith("/") && !requestedCallback.startsWith("//")
      ? requestedCallback
      : "/my-ads";

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to post and manage your advertisements.
          </p>
        </div>

        <form
          action={async () => {
            "use server";

            await signIn("google", {
              redirectTo: callbackUrl,
            });
          }}
          className="mt-8"
        >
          <Button type="submit" variant="outline" className="w-full gap-2">
            <GoogleIcon className="h-4 w-4 shrink-0" />
            Continue with Google
          </Button>
        </form>
      </div>
    </main>
  );
}

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.29 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.26a7.2 7.2 0 0 1 0-4.52V6.63H1.26a12 12 0 0 0 0 10.74l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.29 0 3.24 2.7 1.26 6.63l4.01 3.11C6.22 6.88 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}