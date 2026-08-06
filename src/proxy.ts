export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/my-ads/:path*",
    "/ads/new/:path*",
    "/moderator/:path*",
  ],
};