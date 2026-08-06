import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Role,
  UserStatus,
} from "@/generated/prisma/enums";

const session = await auth();

const isActive =
  session?.user.status === UserStatus.ACTIVE;

const isModerator =
  isActive &&
  session?.user.role === Role.MODERATOR;

export default async function SiteHeader() {

    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
            <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <Link
                href="/ads"
                className="text-xl font-bold tracking-tight"
                >
                Bliq
                </Link>

                <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
                    <Button asChild size="sm">
                    <Link href="/ads/new">Post an Ad</Link>
                    </Button>

                    <form
                    action={async () => {
                        "use server";
                        await signOut({
                        redirectTo: "/ads",
                        });
                    }}
                    >
                    <Button type="submit" variant="outline" size="sm">
                        Sign out
                    </Button>
                    </form>
                </nav>
            </div>
        </header>
    )

}