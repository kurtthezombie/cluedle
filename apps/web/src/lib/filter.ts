import type { Guess } from "../types/wordle"
import { assertWord, evaluateGuess, isValidGuess } from "./wordle"

export function filterCandidates(
  candidates: readonly string[],
  guesses: readonly Guess[]
): string[] {
  if (!Array.from(guesses).every(isValidGuess))
    throw new Error(
      "Each guess needs a word, an ID, and five valid feedback states."
    )
  return candidates.filter((answer) => {
    assertWord(answer)
    return guesses.every((guess) =>
      evaluateGuess(guess.word, answer).every(
        (state, index) => state === guess.feedback[index]
      )
    )
  })
}
