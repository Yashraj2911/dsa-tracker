import { redirect } from "next/navigation";
import Link from "next/link";
import { joinGroup, getGroupByInviteCode } from "@/actions/groups";
import { syncUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from "@/components/brand/app-logo";
import { Users, ArrowRight, CheckCircle } from "lucide-react";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;

  const [user, group] = await Promise.all([
    syncUser(),
    getGroupByInviteCode(inviteCode),
  ]);

  if (!user) redirect("/sign-in");

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <AppLogo variant="icon" />
            </div>
            <CardTitle className="text-base">Invalid Invite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This invite link is invalid or has expired.
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/groups">Back to Groups</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auto-join and redirect
  const result = await joinGroup(inviteCode);

  if (result.alreadyMember) {
    redirect(`/groups/${group.id}`);
  }

  // Show success confirmation briefly before redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base">You&apos;re in!</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Joined successfully
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{group.name}</p>
              <p className="text-xs text-muted-foreground">
                {group._count.members + 1}{" "}
                {group._count.members + 1 === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          <Button asChild size="sm" className="w-full gap-1.5">
            <Link href={`/groups/${group.id}`}>
              View Group
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
