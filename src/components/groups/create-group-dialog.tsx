"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Users } from "lucide-react";
import { createGroup } from "@/actions/groups";

export function CreateGroupDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  function reset() {
    setName("");
    setDescription("");
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    setOpen(v);
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    startTransition(async () => {
      try {
        const group = await createGroup({ name, description: description || undefined });
        toast.success(`Group "${group.name}" created!`);
        setOpen(false);
        reset();
        router.push(`/groups/${group.id}`);
      } catch {
        toast.error("Failed to create group");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Group
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Create a Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Group Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Study Squad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={50}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Description{" "}
              <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <Textarea
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              className="resize-none h-20 text-sm"
            />
          </div>

          <div className="rounded-lg bg-muted/40 border border-border/50 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You&apos;ll automatically become the owner and receive an invite
              code to share with others.
            </p>
          </div>

          <Button
            className="w-full"
            size="sm"
            onClick={handleSubmit}
            disabled={pending || !name.trim()}
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Create Group"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
