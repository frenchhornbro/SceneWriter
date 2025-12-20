import { Button } from "./ui/button"

interface ErrorProps {
  errorMessage: string
  retryAction?: () => void
  retryLabel?: string
}

export function ErrorPage({ errorMessage, retryAction, retryLabel }: ErrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-500 text-lg">{errorMessage}</p>
      <Button className="bg-primary hover:bg-primary-hover text-white" onClick={retryAction ? retryAction : () => window.location.reload()}
      >
      {retryLabel ? retryLabel : "Reload Page"}
      </Button>
    </div>
  )
}