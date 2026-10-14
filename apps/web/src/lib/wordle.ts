import type { Feedback, Guess } from "../types/wordle"

export const WORD_LENGTH = 5
export const LETTERS_ONLY_ERROR =
  "Use letters A–Z only; spaces, numbers, and symbols are not allowed."

const NEXT_FEEDBACK: Record<Feedback, Feedback> = {
  absent: "present",
  present: "correct",
  correct: "absent",
}

export const emptyFeedback = (): Feedback[] =>
  Array<Feedback>(WORD_LENGTH).fill("absent")

/** Reuse positional clues only when duplicate counts cannot change their meaning. */
export function reuseFeedback(
  word: string,
  guesses: readonly Guess[],
  previousWord = "",
  previousFeedback: readonly Feedback[] = []
): Feedback[] {
  const next = word.toLowerCase()
  const previous = previousWord.toLowerCase()
  const count = (value: string, letter: string) =>
    [...value].filter((item) => item === letter).length

  return emptyFeedback().map((fallback, position) => {
    const letter = next[position]
    if (!letter) return fallback
    // Changing the number of copies can change yellow/gray allocation.
    if (
      previous[position] === letter &&
      previousFeedback[position] &&
      (previousFeedback[position] === "correct" ||
        count(previous, letter) === count(next, letter))
    )
      return previousFeedback[position]

    const clues = new Set<Feedback>()
    for (const guess of guesses) {
      const matches = [...guess.word].filter(
        (value, index) => value === letter && guess.feedback[index] !== "absent"
      ).length
      if (guess.word.includes(letter) && matches === 0) clues.add("absent")
      if (guess.word[position] !== letter) continue
      if (guess.feedback[position] === "correct") clues.add("correct")
      if (
        guess.feedback[position] === "present" &&
        count(next, letter) <= matches
      )
        clues.add("present")
    }
    // Conflicting history is left for the user to resolve.
    return clues.size === 1 ? [...clues][0] : fallback
  })
}

export function cycleFeedback(
  feedback: readonly Feedback[],
  position: number
): Feedback[] {
  return feedback.map((state, index) =>
    index === position ? NEXT_FEEDBACK[state] : state
  )
}

export function isWord(word: unknown): word is string {
  return (
    typeof word === "string" &&
    word.length === WORD_LENGTH &&
    !/[^a-z]/.test(word)
  )
}

export function hasOnlyLetters(input: string): boolean {
  return input.length > 0 && !/[^a-zA-Z]/.test(input)
}

function isFeedback(value: unknown): value is Feedback {
  return value === "absent" || value === "present" || value === "correct"
}

export function assertWord(word: string): void {
  if (!isWord(word))
    throw new Error("Expected five lowercase alphabetical letters.")
}

export function isValidGuess(guess: unknown): guess is Guess {
  return (
    typeof guess === "object" &&
    guess !== null &&
    "id" in guess &&
    typeof guess.id === "string" &&
    guess.id.length > 0 &&
    "word" in guess &&
    isWord(guess.word) &&
    "feedback" in guess &&
    Array.isArray(guess.feedback) &&
    guess.feedback.length === WORD_LENGTH &&
    Array.from(guess.feedback).every(isFeedback)
  )
}

/** Exact matches consume letters first; remaining matches are allocated left to right. */
export function evaluateGuess(guess: string, answer: string): Feedback[] {
  assertWord(guess)
  assertWord(answer)
  const result = emptyFeedback()
  const remaining = new Map<string, number>()
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) result[i] = "correct"
    else remaining.set(answer[i], (remaining.get(answer[i]) ?? 0) + 1)
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue
    const count = remaining.get(guess[i]) ?? 0
    if (count > 0) {
      result[i] = "present"
      remaining.set(guess[i], count - 1)
    }
  }
  return result
}

export function validateWord(
  input: string,
  allowed: ReadonlySet<string>,
  guesses: readonly Guess[],
  editingId?: string
): string | null {
  if (!input) return "Enter a five-letter word first."
  if (!hasOnlyLetters(input)) return LETTERS_ONLY_ERROR
  if (input.length !== WORD_LENGTH)
    return "Your guess must contain exactly five letters."
  const word = input.toLowerCase()
  if (!allowed.has(word))
    return "This word is not in the local allowed-guesses dictionary. Try another word."
  if (guesses.some((guess) => guess.id !== editingId && guess.word === word))
    return "You already added this word. Edit its feedback in your guess history."
  return null
}
