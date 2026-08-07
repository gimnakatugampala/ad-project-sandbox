import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Role,
  UserStatus,
} from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge"
import { ArrowUpRightIcon } from "lucide-react"






export default async function SiteHeader() {
    const session = await auth();

    const isActive =
session?.user.status === UserStatus.ACTIVE;

const isModerator =
isActive &&
session?.user.role === Role.MODERATOR;
    
    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
            <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <Link
                href="/ads"
                className="text-xl font-bold tracking-tight"
                >
                Bliq
                </Link>

                {session ? session?.user && (
                <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
                          <Badge variant="secondary">{session.user.name}</Badge>

                          {isModerator && (
                            <div className="flex items-start gap-2">
                            <Button variant="outline">Moderate Ads</Button>
                            <Button size="icon" aria-label="Submit" variant="outline">
                            <Link href="/moderator">
                            <ArrowUpRightIcon />
                            </Link>
                            </Button>
                        </div>
                          )}

                           

                    <Button asChild size="sm">
                    <Link href="/ads/new">Post an Ad</Link>
                    </Button>

                        <form
                        action={async () => {
                            "use server";
                            await signOut({
                            redirectTo: "/login",
                            });
                        }}
                        >
                        <Button type="submit" variant="outline" size="sm">
                            Sign out
                        </Button>
                        </form>
                </nav>

                ) : (
                    <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
                <Button asChild size="sm">
                    <Link href="/login">Create Account / Login</Link>
                    </Button>

                    </nav>
                )}

               
            </div>
        </header>
    )

}