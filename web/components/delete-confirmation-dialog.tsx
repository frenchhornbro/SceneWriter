"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemType: string
  itemName?: string
  requiredUserInput?: string
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  itemType,
  itemName,
  requiredUserInput,
}: DeleteConfirmationDialogProps) {
  const [userInput, setUserInput] = useState("")

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-surface border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to delete this {itemType}
            {itemName ? ` "${itemName}"` : ""}? This action cannot be undone.
          </AlertDialogDescription>
          {requiredUserInput && (
            <input
              type="text"
              className="mt-4 w-full border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
              placeholder={`Type "${requiredUserInput}" to confirm`}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border hover:bg-surface-light">Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={!!requiredUserInput && userInput !== requiredUserInput} onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      <AlertDialogOverlay />
    </AlertDialog>
  )
}
