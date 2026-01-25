"use client";

import { useState } from "react";
import { Button } from "@repo/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/primitives/dialog";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const validatePassword = (pwd: string): string[] => {
    const validationErrors: string[] = [];
    if (pwd.length < 8) {
      validationErrors.push("Password must be at least 8 characters");
    }
    if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      validationErrors.push("Password must contain letters and numbers");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      validationErrors.push(
        "Password must contain at least 1 special character",
      );
    }
    return validationErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validatePassword(password);
    if (password !== confirmPassword) {
      validationErrors.push("Passwords do not match");
    }
    setErrors(validationErrors);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border rounded-3xl p-8">
        <DialogHeader className="space-y-4 text-center">
          <DialogTitle className="text-3xl font-normal">
            Create your account
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            You'll get smarter responses and can upload files, images, and more.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="First name"
              className="w-full bg-muted rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Last name"
              className="w-full bg-muted rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-muted-foreground"
            />
          </div>
          <input
            type="email"
            placeholder="Email address"
            className="w-full bg-muted rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-muted-foreground"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-muted rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-muted-foreground"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-muted rounded-2xl px-4 py-3 text-lg outline-none placeholder:text-muted-foreground"
          />
          {errors.length > 0 && (
            <div className="text-sm text-red-500 space-y-1">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
          <Button
            className="w-full rounded-full py-6 text-lg font-medium"
            onClick={handleSubmit}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
