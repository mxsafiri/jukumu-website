import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
  tokenStore: "nextjs-cookie",
  baseUrl: "https://api.stack-auth.com",
  urls: {
    signIn: "/login",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
  },
});

// Debug environment variables
if (typeof window === 'undefined') {
  console.log('Stack Auth Config:', {
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    hasSecretKey: !!process.env.STACK_SECRET_SERVER_KEY,
  });
}
