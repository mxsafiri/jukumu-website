import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";

export default function Handler(props: {params: Promise<{stack: string[]}>}) {
  return <StackHandler fullPage app={stackServerApp} {...props} />;
}

export function generateMetadata() {
  return stackServerApp.urls;
}
