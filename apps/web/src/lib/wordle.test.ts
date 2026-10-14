import { describe, expect, it } from "vitest"
import answers from "../data/answers.json"
import allowedWords from "../data/guesses.json"
import type { Feedback, Guess } from "../types/wordle"
import {
  emptyFeedback,
  cycleFeedback,
  evaluateGuess,
  isValidGuess,
  validateWord,
} from "./wordle"
import { filterCandidates } from "./filter"
import { rankCandidates } from "./ranking"
import { getCandidates } from "./candidates"

const A = "absent",
  P = "present",
  C = "correct"
function guess(word: string, feedback: readonly Feedback[], id = word): Guess {
  return { id, word, feedback }
}

describe("Wordle feedback", () => {
  it.each([
    ["crane", "crane", [C, C, C, C, C]],
    ["fjord", "clamp", [A, A, A, A, A]],
    ["trace", "react", [P, P, C, C, P]],
    ["earth", "heart", [P, P, P, P, P]],
    ["allee", "apple", [C, P, A, A, C]],
    ["sassy", "essay", [P, P, C, A, C]],
    ["eerie", "serve", [A, C, C, A, C]],
    ["array", "cigar", [A, P, A, C, A]],
    ["civic", "cacao", [C, A, A, A, P]],
    ["speed", "serve", [C, A, P, P, A]],
    ["aaaaa", "banal", [A, C, A, C, A]],
  ] satisfies [string, string, Feedback[]][])(
    "%s against %s",
    (word, answer, expected) => {
      expect(evaluateGuess(word, answer)).toEqual(expected)
    }
  )
  it("never matches more occurrences than the answer has across the full answer list", () => {
    for (const answer of answers) {
      for (const word of ["allee", "eerie", "sassy", "array", "civic"]) {
        const feedback = evaluateGuess(word, answer)
        for (const letter of new Set(word)) {
          const matched = [...word].filter(
            (value, i) => value === letter && feedback[i] !== A
          ).length
          expect(matched).toBe(
            Math.min(
              [...word].filter((x) => x === letter).length,
              [...answer].filter((x) => x === letter).length
            )
          )
        }
      }
    }
  })
  it("rejects malformed words", () => {
    for (const word of ["", "abcd", "abcdef", "12345", "CRANE", "crane\n"])
      expect(() => evaluateGuess(word, "crane")).toThrow()
  })
  it("rejects malformed answers as well as guesses", () => {
    for (const answer of ["", "CRANE", "cran", "crane\n"])
      expect(() => evaluateGuess("crane", answer)).toThrow()
  })
})

describe("feedback editing", () => {
  it("cycles only the selected letter through all three states without mutation", () => {
    const original = Object.freeze(emptyFeedback())
    const present = cycleFeedback(original, 2)
    const correct = cycleFeedback(present, 2)
    expect(present).toEqual([A, A, P, A, A])
    expect(correct).toEqual([A, A, C, A, A])
    expect(cycleFeedback(correct, 2)).toEqual(original)
    expect(original).toEqual([A, A, A, A, A])
    expect(present).toEqual([A, A, P, A, A])
  })
  it("creates independent feedback for each new draft", () => {
    const first = emptyFeedback()
    first[0] = C
    expect(emptyFeedback()).toEqual([A, A, A, A, A])
  })
})

describe("candidate filtering", () => {
  const candidates = ["apple", "ample", "angle", "ankle", "crane"]
  const first = guess("allee", [C, P, A, A, C])
  const second = guess("amply", [C, A, C, C, A])
  it("requires yellow letters but excludes their guessed positions", () => {
    expect(
      filterCandidates(
        ["psych", "crwth", "sylph"],
        [guess("crane", [P, A, A, A, A])]
      )
    ).toEqual(["psych"])
  })
  it("treats gray duplicates as a count limit, not a letter ban", () => {
    expect(
      filterCandidates(
        ["apple", "addle", "allee", "apply"],
        [guess("allee", [C, P, A, A, C])]
      )
    ).toEqual(["apple", "addle"])
  })
  it("requires both occurrences when duplicate letters are yellow", () => {
    expect(
      filterCandidates(["serve", "serum"], [guess("speed", [C, A, P, P, A])])
    ).toEqual(["serve"])
  })
  it("rejects conflicting green and yellow constraints at the same position", () => {
    expect(
      filterCandidates(allowedWords, [
        guess("crane", [C, A, A, A, A]),
        guess("chomp", [P, A, A, A, A]),
      ])
    ).toEqual([])
  })
  it("excludes gray letters wherever they occur in a candidate", () => {
    expect(
      filterCandidates(
        ["psych", "glyph", "slyly", "sylph"],
        [guess("crane", [A, A, A, A, A])]
      )
    ).toEqual(["glyph", "slyly", "sylph"])
  })
  it("returns all words for empty history without mutating inputs", () => {
    expect(filterCandidates(candidates, [])).toEqual(candidates)
    expect(filterCandidates(candidates, [])).not.toBe(candidates)
  })
  it("handles repeated letters and multiple guesses", () => {
    expect(filterCandidates(candidates, [first])).toEqual([
      "apple",
      "ample",
      "angle",
      "ankle",
    ])
    expect(filterCandidates(candidates, [first, second])).toEqual(["apple"])
  })
  it("returns no candidates for conflicting feedback", () => {
    expect(
      filterCandidates(candidates, [first, guess("apple", emptyFeedback())])
    ).toEqual([])
  })
  it("recalculates after editing feedback", () => {
    const edited: Guess = { ...second, feedback: [C, C, C, C, A] }
    expect(filterCandidates(candidates, [first, edited])).toEqual(["ample"])
    expect(second.feedback).toEqual([C, A, C, C, A])
  })
  it("restores candidates when a guess is removed", () => {
    const history = [first, second]
    expect(
      filterCandidates(
        candidates,
        history.filter((item) => item.id !== second.id)
      )
    ).toEqual(["apple", "ample", "angle", "ankle"])
  })
  it("rejects incomplete feedback even when there are no candidates", () => {
    expect(() => filterCandidates([], [guess("crane", [C])])).toThrow()
    expect(isValidGuess(guess("crane", Array(5)))).toBe(false)
    expect(isValidGuess(guess("crane", emptyFeedback(), ""))).toBe(false)
  })
  it("rejects sparse histories even when the candidate set is empty", () => {
    const sparseHistory = new Array<Guess>(1)
    expect(() => filterCandidates(candidates, sparseHistory)).toThrow()
    expect(() => filterCandidates([], sparseHistory)).toThrow()
  })
  it("rejects invalid dictionary entries even without feedback", () => {
    expect(() => filterCandidates(["crane\n"], [])).toThrow()
    expect(() => filterCandidates(["CRANE"], [])).toThrow()
  })
  it("does not mutate frozen words, history, or feedback", () => {
    const words = Object.freeze(["apple", "ample", "crane"])
    const history = Object.freeze([
      Object.freeze(guess("allee", Object.freeze([C, P, A, A, C]))),
    ])
    expect(rankCandidates(filterCandidates(words, history))).toEqual([
      "ample",
      "apple",
    ])
    expect(words).toEqual(["apple", "ample", "crane"])
    expect(history[0].feedback).toEqual([C, P, A, A, C])
  })
  it("always retains the answer that produced the feedback", () => {
    for (const answer of answers.filter((_, i) => i % 50 === 0)) {
      expect(
        filterCandidates(answers, [
          guess("eerie", evaluateGuess("eerie", answer)),
          guess("slate", evaluateGuess("slate", answer)),
        ])
      ).toContain(answer)
    }
  })
})

describe("ranking", () => {
  it("rewards unique common letters, with alphabetical ties", () => {
    expect(rankCandidates(["tears", "aaaaa", "rates", "stare"])).toEqual([
      "rates",
      "stare",
      "tears",
      "aaaaa",
    ])
  })
  it("is independent of input order and does not mutate it", () => {
    const words = ["tears", "rates", "stare"]
    const before = [...words]
    expect(rankCandidates(words)).toEqual(rankCandidates([...words].reverse()))
    expect(words).toEqual(before)
    expect(rankCandidates([])).toEqual([])
    expect(rankCandidates(["apple"])).toEqual(["apple"])
  })
})

describe("suggested candidates", () => {
  it.each([
    { name: "no clues", history: [] },
    { name: "submitted clues", history: [guess("crane", [P, A, A, A, A])] },
  ])(
    "puts historical answers first and preserves each group's ranking: $name",
    ({ history }) => {
      const historicalAnswers = new Set(answers)
      const ranked = rankCandidates(filterCandidates(allowedWords, history))
      const preferred = ranked.filter((word) => historicalAnswers.has(word))
      const other = ranked.filter((word) => !historicalAnswers.has(word))
      expect(preferred.length).toBeGreaterThan(0)
      expect(other.length).toBeGreaterThan(0)
      expect(getCandidates(history)).toEqual([...preferred, ...other])
    }
  )
  it("includes PSYCH for the reported CRANE, STOIC, MUCUS feedback", () => {
    const history = [
      guess("crane", [P, A, A, A, A]),
      guess("stoic", [P, A, A, A, P]),
      guess("mucus", [A, A, P, A, P]),
    ]
    expect(allowedWords).toContain("psych")
    expect(answers).not.toContain("psych")
    const candidates = getCandidates(history)
    expect(candidates).toContain("psych")
    expect(candidates.slice(0, 24)).toContain("psych")
    expect([...candidates].sort()).toEqual(
      filterCandidates(allowedWords, history)
    )
  })
  it("offers every accepted word, including non-solution words, with no clues", () => {
    const candidates = getCandidates([])
    expect([...candidates].sort()).toEqual(allowedWords)
  })
})

describe("validation and dictionary integrity", () => {
  const allowed = new Set(allowedWords)
  it.each([
    ["", "Enter"],
    ["abcd", "exactly"],
    ["abcdef", "exactly"],
    ["abc1e", "A–Z"],
    ["cr ne", "A–Z"],
    ["crane\n", "A–Z"],
    ["caféx", "A–Z"],
    ["zzzzz", "dictionary"],
  ])("rejects invalid input %s", (word, message) => {
    expect(validateWord(word, allowed, [])).toContain(message)
  })
  it("safely validates unknown and malformed guess objects", () => {
    const invalidGuesses: unknown[] = [
      null,
      undefined,
      "crane",
      {},
      { id: 1, word: "crane", feedback: emptyFeedback() },
      { id: "test", word: "crane\n", feedback: emptyFeedback() },
      { id: "test", word: "crane", feedback: [A, A, A, A, "invalid"] },
      { id: "test", word: "crane", feedback: new Array(5) },
      { id: "test", word: "crane", feedback: null },
    ]
    for (const value of invalidGuesses) expect(isValidGuess(value)).toBe(false)
    expect(isValidGuess(guess("crane", emptyFeedback()))).toBe(true)
  })
  it("accepts mixed case, rejects duplicates, and permits editing the same guess", () => {
    const history = [guess("crane", emptyFeedback())]
    expect(validateWord("CrAnE", allowed, [])).toBeNull()
    expect(validateWord("CRANE", allowed, history)).toContain("already")
    expect(validateWord("CRANE", allowed, history, "crane")).toBeNull()
  })
  it("ships complete normalized unique lists and accepts all answers as guesses", () => {
    expect(answers).toHaveLength(2315)
    expect(allowedWords).toHaveLength(12953)
    for (const list of [answers, allowedWords]) {
      expect(new Set(list).size).toBe(list.length)
      expect(list.every((word) => /^[a-z]{5}$/.test(word))).toBe(true)
      expect(list).toEqual([...list].sort())
    }
    expect(answers.every((word) => allowed.has(word))).toBe(true)
  })
})
