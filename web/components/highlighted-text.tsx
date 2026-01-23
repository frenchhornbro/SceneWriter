"use client"

import { useState } from "react";
import type { SceneHighlight } from "@shared/highlight";
import { segmentTextWithHighlights, getSegmentStyle } from "@/lib/highlightUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface HighlightedTextProps {
  sceneText: string;
  highlights: SceneHighlight[];
  onHighlightClick?: (highlight: SceneHighlight) => void;
  onHighlightEdit?: (highlight: SceneHighlight) => void;
  onHighlightDelete?: (highlightId: number) => void;
}

export function HighlightedText({
  sceneText,
  highlights,
  onHighlightClick,
  onHighlightEdit,
  onHighlightDelete,
}: HighlightedTextProps) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const segments = segmentTextWithHighlights(sceneText, highlights);

  return (
    <div className="whitespace-pre-wrap leading-relaxed">
      {segments.map((segment, index) => {
        if (segment.highlights.length === 0) {
          // Regular text with no highlights
          return <span key={index}>{segment.text}</span>;
        }

        // Highlighted text
        const style = getSegmentStyle(segment.highlights);
        const popoverId = `segment-${index}`;

        return (
          <Popover
            key={index}
            open={openPopoverId === popoverId}
            onOpenChange={(open) => setOpenPopoverId(open ? popoverId : null)}
          >
            <PopoverTrigger asChild>
              <span
                style={style}
                className="transition-opacity hover:opacity-80"
                onClick={() => {
                  if (segment.highlights.length === 1 && onHighlightClick) {
                    onHighlightClick(segment.highlights[0]);
                  }
                }}
              >
                {segment.text}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-surface border-border" side="top">
              <div className="space-y-3">
                {segment.highlights.map((highlight, hIndex) => (
                  <div
                    key={highlight.id}
                    className="border-b border-border pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: highlight.color }}
                      />
                      <div className="flex gap-1">
                        {onHighlightEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              onHighlightEdit(highlight);
                              setOpenPopoverId(null);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {onHighlightDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:text-red-400"
                            onClick={() => {
                              onHighlightDelete(highlight.id);
                              setOpenPopoverId(null);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {highlight.note && (
                      <p className="text-sm text-foreground mb-1">{highlight.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      "{highlight.exactText.slice(0, 50)}
                      {highlight.exactText.length > 50 ? "..." : ""}"
                    </p>
                    {!highlight.isValid && (
                      <p className="text-xs text-yellow-400 mt-1">
                        ⚠ This highlight may be invalid due to recent text edits
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
