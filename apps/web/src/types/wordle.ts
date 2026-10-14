export type Feedback = "correct" | "present" | "absent"

export interface Guess {
  readonly id: string
  readonly word: string
  readonly feedback: readonly Feedback[]
}
