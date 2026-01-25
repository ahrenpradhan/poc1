"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@repo/ui/primitives/button";
import { useSidebar } from "@repo/ui/primitives/sidebar";
import { HelpCircle, PanelLeft, SunMoon, LogOut } from "lucide-react";
import { LoginModal } from "@/components/login-modal";
import { SignUpModal } from "@/components/signup-modal";
import { useStore } from "@/store/useStore";

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { status } = useSession();
  const { user } = useStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
  };

  return (
    <>
      <nav>
        <div className="flex h-14 items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            {status === "authenticated" && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-md"
                onClick={toggleSidebar}
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-1 font-medium">Cortex</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              onClick={toggleTheme}
            >
              <SunMoon className="h-5 w-5" />
            </Button>
            {status === "authenticated" ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.email || ""}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setLoginOpen(true)}
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSignUpOpen(true)}
                >
                  Sign up for free
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="rounded-full">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <SignUpModal open={signUpOpen} onOpenChange={setSignUpOpen} />
    </>
  );
}
