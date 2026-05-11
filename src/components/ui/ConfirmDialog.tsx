"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/50 transition-opacity duration-150",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
            "supports-backdrop-filter:backdrop-blur-sm"
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-border bg-card p-6 shadow-xl",
            "transition-all duration-150",
            "data-starting-style:opacity-0 data-starting-style:scale-95",
            "data-ending-style:opacity-0 data-ending-style:scale-95"
          )}
        >
          <Dialog.Title className="font-display text-base font-bold text-heading">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1.5 text-sm text-text-secondary">
            {description}
          </Dialog.Description>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close
              render={
                <Button variant="outline" size="sm" />
              }
            >
              {cancelLabel}
            </Dialog.Close>
            <Button
              variant={destructive ? "destructive" : "default"}
              size="sm"
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
