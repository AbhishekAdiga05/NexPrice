"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Loader2, RefreshCw } from "lucide-react";

export default function ProductActions({ productId, productName }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    setShowDeleteDialog(false);
    const result = await deleteProduct(productId);
    if (result.error) {
      toast.error(result.error);
      setDeleting(false);
    } else {
      toast.success("Product removed");
      router.push("/");
    }
  };

  return (
    <>
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 h-10 text-sm font-medium"
          onClick={() => router.refresh()}
        >
          <RefreshCw className="size-4" />
          Refresh Data
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full justify-start gap-2 h-10 text-sm font-medium"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Remove Product
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Remove product?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium text-foreground">{productName}</span>?
              All price history, alerts, and watchlist entries will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Removing\u2026" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
