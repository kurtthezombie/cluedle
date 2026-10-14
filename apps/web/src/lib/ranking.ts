/** Each candidate contributes once per unique letter; repeated letters earn no extra points. */
export function rankCandidates(candidates: readonly string[]): string[] {
  const frequencies = new Map<string, number>()
  for (const word of candidates) {
    for (const letter of new Set(word))
      frequencies.set(letter, (frequencies.get(letter) ?? 0) + 1)
  }
  const score = (word: string) =>
    [...new Set(word)].reduce(
      (sum, letter) => sum + (frequencies.get(letter) ?? 0),
      0
    )
  return candidates
    .map((word) => ({ word, score: score(word) }))
    .sort(
      (a, b) =>
        b.score - a.score || (a.word < b.word ? -1 : a.word > b.word ? 1 : 0)
    )
    .map(({ word }) => word)
}
