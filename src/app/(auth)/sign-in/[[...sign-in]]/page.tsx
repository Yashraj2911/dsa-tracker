import { SignIn } from "@clerk/nextjs";
import { AppLogo } from "@/components/brand/app-logo";
import type { Metadata } from "next";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to ${APP_CONFIG.name} to continue tracking your DSA progress.`,
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <AppLogo variant="stacked" />
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Sign in to track your progress
        </p>
      </div>
      <SignIn />
    </div>
  );
}
