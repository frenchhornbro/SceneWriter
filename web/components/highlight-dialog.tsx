"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type SceneHighlight } from "@shared/highlight";

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#86efac' },
  { name: 'Blue', value: '#93c5fd' },
  { name: 'Purple', value: '#d8b4fe' },
  { name: 'Pink', value: '#f9a8d4' },
  { name: 'Orange', value: '#fdba74' },
  { name: 'Red', value: '#fca5a5' },
]

interface HighlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (color: string, note: string) => void;
  onCancel?: () => void;
  selectedText?: string;
  existingHighlight?: SceneHighlight | null;
  mode: "create" | "edit";
}

export function HighlightDialog({
  open,
  onOpenChange,
  onSave,
  onCancel,
  selectedText,
  existingHighlight,
  mode,
}: HighlightDialogProps) {
  const [selectedColor, setSelectedColor] = useState<string>(HIGHLIGHT_COLORS[0].value);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (mode === "edit" && existingHighlight) {
      setSelectedColor(existingHighlight.color);
      setNote(existingHighlight.note || "");
    } else {
      setSelectedColor(HIGHLIGHT_COLORS[0].value);
      setNote("");
    }
  }, [mode, existingHighlight, open]);

  const handleSave = () => {
    onSave(selectedColor, note);
    setNote("");
    setSelectedColor(HIGHLIGHT_COLORS[0].value);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const displayText = mode === "create"
    ? selectedText
    : existingHighlight?.exactText;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        handleCancel();
      }
    }}>
      <DialogContent className="bg-surface border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Highlight" : "Edit Highlight"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Choose a color and add an optional note for this highlight."
              : "Update the color or note for this highlight."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected text preview */}
          <div className="space-y-2">
            <Label>Selected Text</Label>
            <div className="p-3 bg-background border border-border rounded-md text-sm max-h-32 overflow-y-auto">
              "{displayText?.slice(0, 200)}
              {displayText && displayText.length > 200 ? "..." : ""}"
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-10 h-10 rounded-md border-2 transition-all ${
                    selectedColor === color.value
                      ? "border-primary scale-110"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Note textarea */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this highlight..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-background border-border min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-border hover:bg-secondary-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
          >
            {mode === "create" ? "Create" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
