import { Loader } from "lucide-react";

interface LoadingProps {
  itemDescription?: string
}

export function Loading({
  itemDescription
}: LoadingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="text-foreground text-lg">Loading{itemDescription ? ` ${itemDescription}` : ""}...</div>
      <Loader className="w-8 h-8 animate-spin text-muted-foreground text-primary" />
    </div>
  )
}