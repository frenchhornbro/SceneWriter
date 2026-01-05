"use client"

import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { adjacentScenes } from "@shared/templates/scene"

interface AdjacentScenesProps {
  adjacentScenes: adjacentScenes
  includePreviousScene: boolean
  setIncludePreviousScene: (value: boolean) => void
  includeNextScene: boolean
  setIncludeNextScene: (value: boolean) => void
}

function truncateToWords(text: string, wordCount: number): string {
  const words = text.split(/\s+/)
  if (words.length <= wordCount) return text
  return words.slice(0, wordCount).join(" ") + "..."
}

export function AdjacentScenesCheckboxes({
  adjacentScenes,
  includePreviousScene,
  setIncludePreviousScene,
  includeNextScene,
  setIncludeNextScene,
}: AdjacentScenesProps) {
  return (
    <div className="space-y-3">
      <Label>Adjacent Scene Context</Label>
      <div className="flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <label className={`flex items-center gap-2 ${adjacentScenes.previousScene ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
              <input
                type="checkbox"
                checked={includePreviousScene}
                onChange={(e) => setIncludePreviousScene(e.target.checked)}
                disabled={!adjacentScenes.previousScene}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">
                Include Previous Scene
                {adjacentScenes.previousScene && (
                  <span className="text-muted-foreground ml-1">
                    ({adjacentScenes.previousScene.title || "Untitled"})
                  </span>
                )}
              </span>
            </label>
          </TooltipTrigger>
          {adjacentScenes.previousScene && (
            <TooltipContent className="max-w-sm">
              <p>{truncateToWords(adjacentScenes.previousScene.sceneText, 50)}</p>
            </TooltipContent>
          )}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <label className={`flex items-center gap-2 ${adjacentScenes.nextScene ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
              <input
                type="checkbox"
                checked={includeNextScene}
                onChange={(e) => setIncludeNextScene(e.target.checked)}
                disabled={!adjacentScenes.nextScene}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">
                Include Next Scene
                {adjacentScenes.nextScene && (
                  <span className="text-muted-foreground ml-1">
                    ({adjacentScenes.nextScene.title || "Untitled"})
                  </span>
                )}
              </span>
            </label>
          </TooltipTrigger>
          {adjacentScenes.nextScene && (
            <TooltipContent className="max-w-sm">
              <p>{truncateToWords(adjacentScenes.nextScene.sceneText, 50)}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  )
}
