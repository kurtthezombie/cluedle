import { Check, Minus, MoveRight } from "lucide-react"
import type { Feedback } from "../types/wordle"

const states = {
  absent: {
    label: "Absent or extra occurrence",
    short: "Absent",
    icon: Minus,
    style: "bg-[var(--feedback-absent)] text-white",
  },
  present: {
    label: "Present, wrong position",
    short: "Present",
    icon: MoveRight,
    style:
      "bg-[var(--feedback-present)] text-[var(--feedback-present-foreground)]",
  },
  correct: {
    label: "Correct letter and position",
    short: "Correct",
    icon: Check,
    style: "bg-[var(--feedback-correct)] text-white",
  },
}
export function LetterTile({
  letter,
  feedback,
  position,
  onCycle,
  disabled = false,
}: {
  letter: string
  feedback: Feedback
  position: number
  onCycle: () => void
  disabled?: boolean
}) {
  const state = states[feedback]
  const Icon = state.icon
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onCycle}
      aria-label={`Position ${position + 1}, ${letter || "empty"}, ${state.label}. Activate to change feedback.`}
      className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-sm border border-black/5 py-2 transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary disabled:opacity-40 sm:min-h-20 ${state.style}`}
    >
      <span className="text-2xl font-semibold uppercase sm:text-3xl">
        {letter || "·"}
      </span>
      <span className="flex items-center gap-0.5 text-[9px] font-medium sm:text-[10px]">
        <Icon aria-hidden="true" className="size-3" />
        {state.short}
      </span>
    </button>
  )
}
