"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { BREAKPOINTS } from "./constants";

interface SidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < BREAKPOINTS.md;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Check on mount
    checkMobile();

    // Listen for resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{ isOpen, isMobile, toggleSidebar, setIsOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarState() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarProvider");
  }
  return context;
}
