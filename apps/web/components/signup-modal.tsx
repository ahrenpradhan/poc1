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

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors = validatePassword(password);
    if (password !== confirmPassword) {
      validationErrors.push("Passwords do not match");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("signup", {
        email,
        password,
        firstName,
        lastName,
        redirect: false,
      });

      if (result?.error) {
        setErrors(["Sign up failed. Please try again."]);
      } else if (result?.ok) {
        onOpenChange(false);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setErrors(["An error occurred"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 mx-4 sm:mx-auto">
        <DialogHeader className="space-y-2 sm:space-y-4 text-center">
          <DialogTitle className="text-2xl sm:text-3xl font-normal">
            Create your account
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-lg text-muted-foreground">
            You'll get smarter responses and can upload files, images, and more.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4 mt-4 sm:mt-8"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-muted rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-lg outline-none placeholder:text-muted-foreground"
              required
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-muted rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-lg outline-none placeholder:text-muted-foreground"
              required
            />
          </div>
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
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-muted rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 pr-12 text-base sm:text-lg outline-none placeholder:text-muted-foreground"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.length > 0 && (
            <div className="text-xs sm:text-sm text-red-500 space-y-1">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-4 sm:py-6 text-base sm:text-lg font-medium"
          >
            {loading ? "Creating account..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
