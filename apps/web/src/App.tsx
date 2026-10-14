import { useCallback, useMemo, useRef, useState } from "react"
import { CircleHelp } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import allowedWords from "./data/guesses.json"
import { getCandidates } from "./lib/candidates"
import {
  emptyFeedback,
  reuseFeedback,
  cycleFeedback,
  hasOnlyLetters,
  isValidGuess,
  LETTERS_ONLY_ERROR,
  validateWord,
} from "./lib/wordle"
import type { Feedback, Guess } from "./types/wordle"
import { AppDialog } from "./components/app-dialog"
import { CandidateList } from "./components/candidate-list"
import { GuessInput } from "./components/guess-input"
import { GuessRow } from "./components/guess-row"
import { Celebration } from "./components/celebration"

const allowed = new Set(allowedWords)

export function App() {
  const wordInputRef = useRef<HTMLInputElement>(null)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [word, setWord] = useState("")
  const [feedback, setFeedback] = useState<Feedback[]>(emptyFeedback)
  const [editingId, setEditingId] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<"help" | "reset" | null>(null)
  const [notice, setNotice] = useState("")
  const [celebration, setCelebration] = useState<{
    id: string
    word: string
  } | null>(null)
  const endCelebration = useCallback(() => setCelebration(null), [])
  const candidates = useMemo(() => getCandidates(guesses), [guesses])

  function clearDraft() {
    setWord("")
    setFeedback(emptyFeedback())
    setEditingId(undefined)
    setError(null)
  }
  function changeWord(value: string) {
    if (value && !hasOnlyLetters(value)) {
      setError(LETTERS_ONLY_ERROR)
      return
    }
    setFeedback(
      reuseFeedback(
        value,
        guesses.filter((guess) => guess.id !== editingId),
        word,
        feedback
      )
    )
    setWord(value.toUpperCase())
    setError(null)
  }
  function submit() {
    const validation = validateWord(word, allowed, guesses, editingId)
    if (validation) {
      setError(validation)
      return
    }
    const guess = {
      id: editingId ?? crypto.randomUUID(),
      word: word.toLowerCase(),
      feedback: [...feedback],
    }
    if (!isValidGuess(guess)) {
      setError("Set feedback for all five letters before saving.")
      return
    }
    if (editingId && !guesses.some((item) => item.id === editingId)) {
      setError(
        "This guess no longer exists. Cancel this edit and add it again."
      )
      return
    }
    setGuesses((previous) =>
      editingId
        ? previous.map((item) => (item.id === editingId ? guess : item))
        : [...previous, guess]
    )
    setNotice(`${word} ${editingId ? "updated" : "added"}.`)
    setCelebration(
      feedback.every((state) => state === "correct")
        ? { id: crypto.randomUUID(), word }
        : null
    )
    clearDraft()
    wordInputRef.current?.focus()
  }
  function edit(guess: Guess) {
    setWord(guess.word.toUpperCase())
    setFeedback([...guess.feedback])
    setEditingId(guess.id)
    setError(null)
    wordInputRef.current?.focus()
  }
  function remove(guess: Guess) {
    endCelebration()
    setGuesses((previous) => previous.filter((item) => item.id !== guess.id))
    if (editingId === guess.id) clearDraft()
    setNotice(`${guess.word.toUpperCase()} removed.`)
  }

  function cycleDraftFeedback(position: number) {
    setFeedback((previous) => cycleFeedback(previous, position))
  }

  function cycleGuessFeedback(id: string, position: number) {
    const updated = guesses.find((guess) => guess.id === id)
    setCelebration(
      updated &&
        cycleFeedback(updated.feedback, position).every(
          (state) => state === "correct"
        )
        ? { id: crypto.randomUUID(), word: updated.word }
        : null
    )
    setGuesses((previous) =>
      previous.map((guess) =>
        guess.id === id
          ? { ...guess, feedback: cycleFeedback(guess.feedback, position) }
          : guess
      )
    )
    if (editingId === id) clearDraft()
  }

  function resetGuesses() {
    endCelebration()
    setGuesses([])
    clearDraft()
    setNotice("All guesses reset.")
    setDialog(null)
  }

  // Remount the list when submitted clues change to reset pagination and copy state.
  const candidateListKey = guesses
    .map((guess) => guess.id + guess.word + guess.feedback.join(""))
    .join("|")

  return (
    <div className="min-h-svh">
      {celebration && (
        <Celebration
          key={celebration.id}
          word={celebration.word}
          onDone={endCelebration}
        />
      )}
      <header className="site-header border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.webp?v=2"
              alt=""
              width={56}
              height={56}
              className="size-14 shrink-0 object-contain"
            />
            <div>
              <a
                href="#main"
                aria-label="Cluedle, skip to workspace"
                className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <h1 className="wordmark text-2xl font-bold tracking-tight">
                  cluedle
                </h1>
              </a>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Less guessing, more solving
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="min-h-11 rounded-md px-3 text-foreground"
            onClick={() => setDialog("help")}
          >
            <CircleHelp />
            How to use
          </Button>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-7 sm:px-8">
        <h2 className="mb-2 text-xl font-semibold">Wordle assistant</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Enter your Wordle guesses and match their feedback to narrow the
          answers.
        </p>
        <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section
            aria-labelledby="workspace-heading"
            className="min-w-0 rounded-md border border-border bg-card p-4 shadow-sm sm:p-6"
          >
            <div className="guess-panel-heading -mx-4 -mt-4 mb-5 flex items-center justify-between gap-2 rounded-t-md border-b border-border bg-muted px-4 py-2 sm:-mx-6 sm:-mt-6 sm:px-6">
              <h2 id="workspace-heading" className="text-base font-semibold">
                Your guesses
              </h2>
              <Button
                variant="ghost"
                disabled={!guesses.length && !word}
                className="min-h-11 px-2 text-xs text-muted-foreground"
                onClick={() => setDialog("reset")}
              >
                Reset all
              </Button>
            </div>
            <GuessInput
              inputRef={wordInputRef}
              word={word}
              feedback={feedback}
              error={error}
              editing={!!editingId}
              onWord={changeWord}
              onCycle={cycleDraftFeedback}
              onSubmit={submit}
              onCancel={clearDraft}
            />
            <div className="mt-8 mb-2 flex items-center justify-between border-t border-border pt-5">
              <h3 className="text-sm font-medium">History</h3>
              <span className="text-xs text-muted-foreground">
                {guesses.length} submitted
              </span>
            </div>
            {!guesses.length ? (
              <p className="rounded border border-dashed border-border bg-muted px-3 py-5 text-center text-sm text-muted-foreground">
                No guesses added yet.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {guesses.map((guess, index) => (
                  <GuessRow
                    key={guess.id}
                    guess={guess}
                    index={index}
                    onEdit={() => edit(guess)}
                    onDelete={() => remove(guess)}
                    onCycle={(position) =>
                      cycleGuessFeedback(guess.id, position)
                    }
                  />
                ))}
              </div>
            )}
            <p className="sr-only">
              Tap any submitted tile to update its feedback instantly.
            </p>
            <p role="status" className="sr-only">
              {notice}
            </p>
          </section>
          <CandidateList
            key={candidateListKey}
            candidates={candidates}
            hasGuesses={guesses.length > 0}
          />
        </div>
        <footer className="mt-10 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          <a
            className="source-link underline underline-offset-2"
            href="https://github.com/joshstephenson/Wordle-Solver"
            target="_blank"
            rel="noreferrer"
          >
            Historical word list
          </a>
          <span>
            {" "}
            · Newer answers may be missing. History clears on refresh.
          </span>
        </footer>
      </main>
      <AppDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialog === "reset" ? "Reset all guesses?" : "How to use Cluedle"}
      >
        {dialog === "reset" ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This removes all submitted guesses and your current draft. The
              full candidate list will return.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                className="min-h-11"
                onClick={() => setDialog(null)}
              >
                Keep guesses
              </Button>
              <Button className="min-h-11" onClick={resetGuesses}>
                Reset all
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <ol className="list-decimal space-y-3 pl-5">
              <li>Enter a five-letter word you played in Wordle.</li>
              <li>
                Tap each tile to cycle <strong>gray → yellow → green</strong>.
                Match the feedback Wordle gave you, then select{" "}
                <strong>Add guess</strong>.
              </li>
              <li>
                Browse words that match every clue. Copy a suggestion, try it in
                Wordle, and bring back the new feedback.
              </li>
            </ol>
            <p>
              Known tags carry over from saved guesses: green in the same
              position, yellow in a confirmed yellow position when duplicate
              counts allow it, and gray for absent letters. New positions still
              need checking. You can change any tag before saving.
            </p>
            <p>
              <strong className="text-foreground">
                Repeated letters matter.
              </strong>{" "}
              Gray can mean an extra occurrence, even if that letter is green or
              yellow elsewhere.
            </p>
            <p>
              While entering or editing a guess, press 1–5 to cycle the matching
              letter's feedback. Press Enter in the word field to submit. Use
              Tab to move between controls and Enter or Space to cycle a focused
              tile. Every state has an icon and text label.
            </p>
            <p>
              Edit or delete a previous guess at any time. Rankings favor common
              unique letters; they do not guarantee the best next guess or
              today's answer.
            </p>
          </div>
        )}
      </AppDialog>
    </div>
  )
}
