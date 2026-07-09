import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

// const handler = NextAuth({

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {

        console.log("EMAIL:", credentials.email);

        await connectDB();

        console.log("CONNECTED");

        const user = await User.findOne({ email: credentials.email });

        console.log("USER:", user);

        if (!user) {
          throw new Error("No user found");
        }


        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log("PASSWORD VALID:", isValid);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role, // 🔥 inject role here
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;       // 🔥 attach id
        token.role = user.role;   // 🔥 attach role
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;       // 🔥 expose id
        session.user.role = token.role;   // 🔥 expose role
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",       // 🔥 custom login page
    error: "/sign-in",        // 🔥 redirect errors here
  },

  secret: process.env.NEXTAUTH_SECRET,
};


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };