"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { GripVertical } from "lucide-react"
import { scenePreview } from "@shared/templates/scene"
import Link from "next/link"

interface SortableSceneCardProps {
  scene: scenePreview
  isReorderMode: boolean
  storyId: string
}

export function SortableSceneCard({ scene, isReorderMode, storyId }: SortableSceneCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  const cardContent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isReorderMode && (
          <div className="p-1">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-3 mb-1">
            {scene.scene_order ? (
              <span className="text-xs px-2 py-0.5 rounded bg-primary-muted text-primary font-medium">
                Scene {scene.scene_order}
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-primary-muted text-primary font-medium">
                &bull;
              </span>
            )}
            <h3 className="font-semibold">{scene.title}</h3>
            <span className="text-xs px-2 py-1 rounded bg-secondary-muted text-secondary font-medium">
              Version {scene.version}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{scene.scene_text}</p>
        </div>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        {new Date(scene.edited_at).toLocaleDateString()}
      </div>
    </div>
  )

  if (isReorderMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={isDragging ? "cursor-grabbing" : "cursor-grab"}
      >
        <Card className="p-4 bg-surface border-border hover:border-primary/50 transition-colors">
          {cardContent}
        </Card>
      </div>
    )
  }

  return (
    <Link href={`/stories/${storyId}/scenes/${scene.id}/version/${scene.version}`}>
      <Card className="p-4 bg-surface border-border hover:border-primary/50 transition-colors cursor-pointer">
        {cardContent}
      </Card>
    </Link>
  )
}
