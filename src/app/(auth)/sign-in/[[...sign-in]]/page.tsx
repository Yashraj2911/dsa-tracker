import { SignIn } from "@clerk/nextjs";
import { Zap } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold">DSA Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to track your progress
          </p>
        </div>
      </div>
      <SignIn />
    </div>
  );
}
