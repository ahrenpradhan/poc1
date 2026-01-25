"use client";

import { Button } from "@repo/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/primitives/dialog";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border rounded-3xl p-8">
        <DialogHeader className="space-y-4 text-center">
          <DialogTitle className="text-3xl font-normal">
            Log in or sign up
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            You'll get smarter responses and can upload files, images, and more.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-8">
          <input
            type="email"
            placeholder="Email address"
            className="w-full bg-muted rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-muted-foreground"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-muted rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-muted-foreground"
          />
          <Button className="w-full rounded-full py-6 text-lg font-medium">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
