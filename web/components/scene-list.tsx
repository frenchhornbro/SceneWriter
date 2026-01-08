"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { SortableSceneCard } from "./sortable-scene-card"
import { scenePreview } from "@shared/templates/scene"

interface SceneListProps {
  scenes: scenePreview[]
  storyId: string
  isReorderMode: boolean
  onReorder: (activeId: number, overId: number) => void
}

export function SceneList({ scenes, storyId, isReorderMode, onReorder }: SceneListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(active.id as number, over.id as number)
    }
  }

  if (!isReorderMode) {
    return (
      <div className="space-y-3">
        {scenes.map((scene) => (
          <SortableSceneCard
            key={scene.id}
            scene={scene}
            isReorderMode={false}
            storyId={storyId}
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={scenes.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {scenes.map((scene) => (
            <SortableSceneCard
              key={scene.id}
              scene={scene}
              isReorderMode={true}
              storyId={storyId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
