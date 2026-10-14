import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

const PAGE_SIZE = 24

export function CandidateList({
  candidates,
  hasGuesses,
}: {
  candidates: readonly string[]
  hasGuesses: boolean
}) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [copied, setCopied] = useState<string | null>(null)
  const [notice, setNotice] = useState("")
  async function copy(word: string) {
    try {
      await navigator.clipboard.writeText(word.toUpperCase())
      setCopied(word)
      setNotice(`${word.toUpperCase()} copied to clipboard.`)
    } catch {
      setCopied(null)
      setNotice(
        "Could not access the clipboard. Select the word and copy it manually."
      )
    }
  }
  return (
    <section
      aria-labelledby="answers-heading"
      className="min-w-0 rounded-md border border-border bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="answer-panel-heading -mx-4 -mt-4 mb-5 flex min-h-15 items-center justify-between gap-3 rounded-t-md border-b border-border bg-slate-50 px-4 sm:-mx-6 sm:-mt-6 sm:px-6">
        <h2 id="answers-heading" className="text-base font-semibold">
          Possible answers
        </h2>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="answer-count rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-muted-foreground"
        >
          <strong className="font-medium tabular-nums">
            {candidates.length.toLocaleString()}
          </strong>
          <span className="sr-only"> candidates remaining</span>
        </p>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        {candidates.length === 1
          ? "One match in the local word list."
          : !hasGuesses
            ? "Add a guess to narrow this list."
            : "Matches all submitted feedback."}
      </p>
      {candidates.length === 0 ? (
        <div className="py-6">
          <h3 className="text-sm font-medium">No matching words</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Check your feedback, especially repeated letters. Your clues may
            conflict, or the answer may be missing from the word list.
          </p>
        </div>
      ) : (
        <>
          <ol className="grid grid-cols-2 gap-x-4">
            {candidates.slice(0, limit).map((word) => (
              <li
                key={word}
                className={`answer-row flex min-w-0 items-center justify-between border-b border-border ${candidates.length === 1 ? "col-span-2 font-semibold text-[#306a51]" : ""}`}
              >
                <span className="font-mono text-sm tracking-wide">
                  {word.toUpperCase()}
                </span>
                <Button
                  variant="ghost"
                  className="min-h-11 min-w-11 rounded-sm text-muted-foreground"
                  aria-label={`Copy ${word.toUpperCase()}`}
                  onClick={() => copy(word)}
                >
                  {copied === word ? <Check /> : <Copy className="size-3.5" />}
                </Button>
              </li>
            ))}
          </ol>
          {candidates.length > limit && (
            <Button
              variant="outline"
              className="mt-4 min-h-11 w-full rounded text-sm"
              onClick={() => setLimit((value) => value + PAGE_SIZE)}
            >
              Show more · {candidates.length - limit} remaining
            </Button>
          )}
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Historical answers first, then other accepted words. Each group is
            ordered by common unique letters, not an optimal-guess calculation.
          </p>
        </>
      )}
      <p
        role="status"
        className={`text-xs text-muted-foreground ${notice ? "mt-3" : "sr-only"}`}
      >
        {notice}
      </p>
    </section>
  )
}
