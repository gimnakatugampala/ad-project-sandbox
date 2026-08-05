import "server-only";

import { auth } from "@/auth";
import { Role, UserStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getCurrentUser(){

    const session = await auth();

    if(!session?.user?.id){
        return null;
    }

    return prisma.user.findUnique({
        where :{
            id: session.user.id
        },
         select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            },
    })

}


export async function requireUser(){

    const user = await getCurrentUser()

    if(!user){
        redirect('/login')
    }

    if (user.status !== UserStatus.ACTIVE) {
     throw new Error("This account is not permitted to perform this action.");
     }

    return user;

}

export async function requireModerator() {
  const user = await requireUser();

  if (user.role !== Role.MODERATOR) {
    throw new Error("Moderator access is required.");
  }

  return user;
}