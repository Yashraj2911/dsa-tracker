"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Copy, Check, Link2 } from "lucide-react";

interface InviteMemberDialogProps {
  groupId: string;
  groupName: string;
  inviteCode: string;
}

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        <Input
          value={value}
          readOnly
          className="font-mono text-sm bg-muted/30 flex-1"
        />
        <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function InviteMemberDialog({
  groupName,
  inviteCode,
}: InviteMemberDialogProps) {
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/groups/join/${inviteCode}`
      : `/groups/join/${inviteCode}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          Invite
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Invite to {groupName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Share the invite code or link with anyone you want to join this
            group.
          </p>

          <CopyField value={inviteCode} label="Invite Code" />
          <CopyField value={inviteLink} label="Invite Link" />

          <div className="rounded-lg bg-muted/40 border border-border/50 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground">
              Anyone with this code or link can join the group. Regenerating the
              code will invalidate the old one.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
