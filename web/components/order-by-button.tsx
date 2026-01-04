"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUp, ArrowDown, ChevronDown } from "lucide-react"
import {
  SortField,
  SortDirection,
  ViewType,
  getAvailableSortFields,
} from "@/lib/order"

interface OrderByButtonProps {
  viewType: ViewType
  currentField: SortField
  currentDirection: SortDirection
  onFieldChange: (field: SortField) => void
  onDirectionToggle: () => void
}

export function OrderByButton({
  viewType,
  currentField,
  currentDirection,
  onFieldChange,
  onDirectionToggle,
}: OrderByButtonProps) {
  const availableFields = getAvailableSortFields(viewType)
  const currentLabel = availableFields.find((f) => f.value === currentField)?.label ?? "Sort"

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={onDirectionToggle}
        className="rounded-r-none border-r-0 border-border hover:bg-secondary-muted hover:text-secondary hover:border-secondary bg-transparent px-2"
      >
        {currentDirection === "asc" ? (
          <ArrowDown className="w-4 h-4" />
        ) : (
          <ArrowUp className="w-4 h-4" />
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-l-none border-border hover:bg-secondary-muted hover:text-secondary hover:border-secondary bg-transparent"
          >
            {currentLabel}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-surface border-border">
          {availableFields.map((field) => (
            <DropdownMenuItem
              key={field.value}
              onClick={() => onFieldChange(field.value)}
              className={currentField === field.value ? "bg-surface-light" : ""}
            >
              {field.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
