"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@repo/ui/primitives/button";
import { Eye, EyeOff } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else if (result?.ok) {
        onOpenChange(false);
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 mx-4 sm:mx-auto">
        <DialogHeader className="space-y-2 sm:space-y-4 text-center">
          <DialogTitle className="text-2xl sm:text-3xl font-normal">
            Log in or sign up
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-lg text-muted-foreground">
            You'll get smarter responses and can upload files, images, and more.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4 mt-4 sm:mt-8"
        >
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-muted rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-lg outline-none placeholder:text-muted-foreground"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-muted rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 pr-12 text-base sm:text-lg outline-none placeholder:text-muted-foreground"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-4 sm:py-6 text-base sm:text-lg font-medium"
          >
            {loading ? "Logging in..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
