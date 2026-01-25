"use client";

import { Button } from "@repo/ui/primitives/button";
import { ChevronDown, HelpCircle } from "lucide-react";

export function Navbar() {
  return (
    <nav>
      <div className="flex h-14 items-center px-4 justify-between">
        <div className="flex items-center gap-1 font-medium">
          ChatGPT
          <ChevronDown className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full">
            Log in
          </Button>
          <Button size="sm" className="rounded-full">
            Sign up for free
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
