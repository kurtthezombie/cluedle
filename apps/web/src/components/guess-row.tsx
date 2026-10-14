import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { Guess } from "../types/wordle"
import { LetterTile } from "./letter-tile"

export function GuessRow({
  guess,
  index,
  onCycle,
  onEdit,
  onDelete,
}: {
  guess: Guess
  index: number
  onCycle: (position: number) => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="py-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Guess {index + 1}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            className="min-h-11 px-3"
            onClick={onEdit}
            aria-label={`Edit ${guess.word.toUpperCase()}`}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            variant="ghost"
            className="min-h-11 min-w-11 text-muted-foreground"
            onClick={onDelete}
            aria-label={`Delete ${guess.word.toUpperCase()}`}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {[...guess.word].map((letter, position) => (
          <LetterTile
            key={position}
            letter={letter}
            position={position}
            feedback={guess.feedback[position]}
            onCycle={() => onCycle(position)}
          />
        ))}
      </div>
    </div>
  )
}
