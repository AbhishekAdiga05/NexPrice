"use client";

import { useState } from "react";
import { addProduct } from "@/app/actions";
import AuthModal from "./AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddProductForm({ user }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("url", url);

    const result = await addProduct(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Product tracked successfully!");
      setUrl("");
    }

    setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full">
        <label className="flex text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground mb-3 items-center justify-between">
          <span>Target URL</span>
          <span className="text-[10px] text-white/30 tracking-[0.2em] opacity-80">HTTP/S</span>
        </label>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste product URL (Amazon, Walmart, etc.)"
            className="flex-1 font-mono text-sm h-14 bg-white/80 border-border shadow-sm focus-visible:ring-accent"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            disabled={loading}
            className="h-14 px-8 min-w-[160px] w-full sm:w-auto cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ADDING...
              </>
            ) : (
              "TRACK PRICE"
            )}
          </Button>
        </div>
      </form>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
