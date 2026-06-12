"use client";

import { useState } from "react";
import { addProduct } from "@/app/actions";
import AuthModal from "./AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddProductForm({ user, compact }) {
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
      toast.success(result.message || "Product is being tracked!");
      setUrl("");
    }

    setLoading(false);
  };

  if (compact) {
    return (
      <>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a product URL to track..."
                className="h-9 text-sm font-mono"
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !url}
              size="sm"
              className="h-9 px-4 shrink-0 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                "Track"
              )}
            </Button>
          </div>
        </form>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full">
        <label className="flex text-xs font-semibold text-gray-500 mb-2 items-center justify-between">
          <span>Target URL</span>
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste any product URL to start tracking..."
            className="flex-1 font-mono text-sm h-12"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-6 min-w-[140px] w-full sm:w-auto cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tracking...
              </>
            ) : (
              "Track Price"
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
