import { requireModerator } from "@/lib/authorization";

export default async function ModeratorPage(){
    const moderator = await requireModerator();


    return(
        <main>
        <h1>Moderator Dashboard</h1>
        <p>Moderator: {moderator.email}</p>
        </main>
    )

}