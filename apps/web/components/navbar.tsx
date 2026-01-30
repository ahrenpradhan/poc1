"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@repo/ui/primitives/button";
import { HelpCircle, PanelLeft, SunMoon, LogOut, Menu } from "lucide-react";
import { LoginModal } from "@/components/login-modal";
import { SignUpModal } from "@/components/signup-modal";
import { useStore } from "@/store/useStore";
import { useSidebarState } from "@/lib/sidebar-context";

export function Navbar() {
  const { toggleSidebar, isMobile } = useSidebarState();
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
      <nav className="border-b md:border-b-0">
        <div className="flex h-14 items-center px-3 sm:px-4 justify-between">
          {/* Left section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {status === "authenticated" && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-md"
                onClick={toggleSidebar}
              >
                {isMobile ? (
                  <Menu className="h-5 w-5" />
                ) : (
                  <PanelLeft className="h-5 w-5" />
                )}
              </Button>
            )}
            <div className="flex items-center gap-1 font-medium">Cortex</div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1 sm:gap-2">
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
                {/* Hide email on mobile */}
                <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[150px] lg:max-w-none">
                  {user?.email || ""}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs sm:text-sm"
                  onClick={() => setLoginOpen(true)}
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  className="rounded-full text-xs sm:text-sm"
                  onClick={() => setSignUpOpen(true)}
                >
                  <span className="hidden sm:inline">Sign up for free</span>
                  <span className="sm:hidden">Sign up</span>
                </Button>
              </>
            )}
            {/* Hide help on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex rounded-full"
            >
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
