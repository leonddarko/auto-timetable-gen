import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (!token) return false;

        const path = req.nextUrl.pathname;

        // 🔒 Admin routes
        if (path.startsWith("/admin")) {
          return token.role === "admin";
        }

        // 🔒 CPO routes
        if (path.startsWith("/dashboard")) {
          return token.role === "lecturer" ;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};