import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
});

export default function middleware(req: any, event: any) {
  return (authMiddleware as any)(req, event);
}

export const config = {
  matcher: [
    "/",
    "/incidents/:path*",
    "/rules/:path*",
    "/settings/:path*"
  ]
};
