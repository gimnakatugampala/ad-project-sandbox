import { Role, UserStatus } from "@/generated/prisma/enums";
import { DefaultSession } from "next-auth";

declare module "next-auth"{
 
    interface Session{
        user :{
            id: string;
            role :Role;
            status : UserStatus;
        } & DefaultSession["user"];

    }

    interface User{
        role: Role;
        status: UserStatus;
    }
}