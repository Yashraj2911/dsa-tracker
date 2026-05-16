import { SignUp } from "@clerk/nextjs";
import { AppLogo } from "@/components/brand/app-logo";
import type { Metadata } from "next";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sign Up",
  description: `Create a ${APP_CONFIG.name} account and start mastering DSA.`,
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <AppLogo variant="stacked" />
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Create your account to get started
        </p>
      </div>
      <SignUp />
    </div>
  );
}
