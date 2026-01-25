"use client";

import { useState } from "react";
import { Button } from "@repo/ui/primitives/button";
import { useSidebar } from "@repo/ui/primitives/sidebar";
import { ChevronDown, HelpCircle, PanelLeft } from "lucide-react";
import { LoginModal } from "./login-modal";
import { SignUpModal } from "./signup-modal";

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  return (
    <>
      <nav>
        <div className="flex h-14 items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md"
              onClick={toggleSidebar}
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1 font-medium">
              ChatGPT
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
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
