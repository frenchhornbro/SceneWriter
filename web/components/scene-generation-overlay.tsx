import { Loader2 } from "lucide-react";
import { Card } from "./ui/card";

export default function SceneGenerationOverlay() {
  return (
    (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="p-8 bg-surface border-border text-center space-y-4 max-w-md">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Generating Scene</h2>
            <p className="text-muted-foreground">
              AI is crafting your scene with the selected plot points and characters...
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        </Card>
      </div>
    )
  )
}