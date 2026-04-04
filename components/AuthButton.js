"use client";

import { useState } from "react";
import { signOut } from "@/app/actions";
import AuthModal from "./AuthModal";
import { Button } from "@/components/ui/button";
import { Power, LogOut } from "lucide-react";

export default function AuthButton({ user }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (user) {
    return (
      <form action={signOut}>
        <Button variant="ghost" size="sm" type="submit" className="gap-2 group text-muted-foreground hover:text-accent font-mono text-xs">
          <LogOut className="w-4 h-4" />
          SIGN OUT
        </Button>
      </form>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowAuthModal(true)}
        variant="default"
        size="sm"
        className="bg-muted text-foreground border border-border/50 shadow-sm gap-2 group text-xs font-semibold hover:bg-background"
      >
        <Power className="size-3 text-accent group-hover:scale-110 transition-transform" />
        SIGN IN
      </Button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
