import type { Ref } from "react"
import { Button } from "@workspace/ui/components/button"
import type { Feedback } from "../types/wordle"
import { isWord, WORD_LENGTH } from "../lib/wordle"
import { LetterTile } from "./letter-tile"

export function GuessInput({
  inputRef,
  word,
  feedback,
  error,
  editing,
  onWord,
  onCycle,
  onSubmit,
  onCancel,
}: {
  inputRef: Ref<HTMLInputElement>
  word: string
  feedback: readonly Feedback[]
  error: string | null
  editing: boolean
  onWord: (word: string) => void
  onCycle: (position: number) => void
  onSubmit: () => void
  onCancel: () => void
}) {
  const ready = isWord(word.toLowerCase())
  return (
    <form
      onKeyDown={(event) => {
        if (
          event.ctrlKey ||
          event.altKey ||
          event.metaKey ||
          event.shiftKey ||
          event.nativeEvent.isComposing ||
          !/^[1-5]$/.test(event.key)
        )
          return
        // Keep shortcut digits out of the word input, even before it is ready.
        event.preventDefault()
        if (ready && !event.repeat) onCycle(Number(event.key) - 1)
      }}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="space-y-3"
    >
      <label htmlFor="guess-word" className="mb-2 block text-sm font-medium">
        {editing ? "Edit your guess" : "Add your Wordle guess"}
      </label>
      <input
        ref={inputRef}
        id="guess-word"
        value={word}
        onChange={(event) => onWord(event.target.value)}
        placeholder="e.g. CRANE"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-invalid={!!error}
        aria-describedby={error ? "guess-error guess-hint" : "guess-hint"}
        className="h-11 w-full rounded border border-input bg-card px-3 text-base tracking-[0.14em] outline-none placeholder:text-sm placeholder:tracking-normal focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
      />
      <p
        id="guess-hint"
        className="mt-2 text-xs leading-relaxed text-muted-foreground"
      >
        Tap tiles or press 1–5 while in this form to cycle: absent → present →
        correct. Enter submits your guess. Known tags carry over automatically;
        check every tile against Wordle before saving.
      </p>
      {error && (
        <p
          id="guess-error"
          role="alert"
          className="mt-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <div className="my-4 grid grid-cols-5 gap-1 sm:gap-2">
        {Array.from({ length: WORD_LENGTH }, (_, position) => (
          <div key={position} className="grid min-w-0 gap-1 text-center">
            <LetterTile
              letter={word[position] ?? ""}
              position={position}
              feedback={feedback[position]}
              disabled={!ready}
              onCycle={() => onCycle(position)}
            />
            <kbd className="text-xs text-muted-foreground" aria-hidden="true">
              {position + 1}
            </kbd>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="min-h-11 rounded px-5">
          {editing ? "Save changes" : "Add guess"}
        </Button>
        {editing && (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
      <p className="sr-only">
        Draft feedback is only applied when you{" "}
        {editing ? "save" : "add the guess"}.
      </p>
    </form>
  )
}
