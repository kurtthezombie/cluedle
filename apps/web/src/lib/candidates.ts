import answers from "../data/answers.json"
import allowedWords from "../data/guesses.json"
import type { Guess } from "../types/wordle"
import { filterCandidates } from "./filter"
import { rankCandidates } from "./ranking"

const historicalAnswers = new Set(answers)

export function getCandidates(guesses: readonly Guess[]): string[] {
  const ranked = rankCandidates(filterCandidates(allowedWords, guesses))
  const preferred: string[] = []
  const other: string[] = []
  for (const word of ranked) {
    if (historicalAnswers.has(word)) preferred.push(word)
    else other.push(word)
  }
  return [...preferred, ...other]
}
