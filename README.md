# cluedle

**Less guessing, more solving.** A local, responsive Wordle companion built with React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Base UI), and Lucide.

## Run

From this directory, with Node 22.12+ (Node 24 recommended) and npm:

```sh
npm ci
npm run dev
```

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution is disabled.

Open the URL Vite prints. To check the project:

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run preview --workspace web
```

## Use

1. Enter a five-letter word played in Wordle.
2. Tap each tile to cycle gray → yellow → green. While entering or editing a complete guess, press **1–5** to cycle the matching tile and Enter in the word field to submit. Text labels and icons also identify each state. Keyboard users can Tab between tiles and activate them with Space or Enter.
3. Select **Add guess**. Draft feedback does not affect results.
4. Change submitted tiles for immediate updates, or select **Edit** to change a word/feedback and save. Changing draft letters resets its feedback to gray.
5. Delete individual guesses or confirm **Reset all** to start over. Copy candidate words with their copy buttons.

## Structure

- `apps/web/src/App.tsx`: guess history, draft state, derived results, and page layout.
- `apps/web/src/components/`: guess entry, tiles, history rows, candidate list, and dialog.
- `apps/web/src/lib/wordle.ts`: pure two-pass evaluation, validation, and feedback cycling.
- `apps/web/src/lib/filter.ts`: exact feedback simulation across the entire history.
- `apps/web/src/lib/candidates.ts`: filters and ranks the full accepted-guess dictionary for suggestions.
- `apps/web/src/lib/ranking.ts`: unique-letter frequency ranking with alphabetical ties.
- `apps/web/src/lib/wordle.test.ts`: algorithm, validation, ranking, and dictionary tests.
- `apps/web/src/data/`: static dictionaries, provenance, and retained MIT notice.
- `apps/web/src/styles.css`: application theme overrides.
- `packages/ui/`: existing shared shadcn/ui components and Tailwind setup.

## Dictionary and limitations

The full historical lists from [Josh Stephenson's Wordle-Solver](https://github.com/joshstephenson/Wordle-Solver) are bundled under its MIT license: **2,315 answers** and **12,953 allowed guesses**, including every answer. See [dictionary provenance](apps/web/src/data/README.md) and [license](apps/web/src/data/LICENSE.txt).

These lists are not synchronized with today's NYT dictionary. Newer words may be missing; one remaining candidate is a match within this dataset, not a guarantee of today's answer. No dictionary requests occur during normal use.

Suggestions show matching historical answers first, followed by other accepted words. Within each group, ranking counts how many remaining candidates contain each letter and sums those frequencies once per unique letter in each suggestion. This is a transparent heuristic, not entropy optimization or an optimal next-guess guarantee. Suggestions come from all 12,953 accepted guesses that match the feedback, including words outside the historical solution list.

History is kept in React state and clears on refresh. No backend, accounts, external word API, analytics, or persistence. Clipboard access depends on browser permission and a secure context (HTTPS or localhost); failures display a manual-copy hint.

## Implementation choices

- Retained the existing npm workspaces/Turborepo structure and shared shadcn Button.
- Used native modal dialogs for built-in focus containment, Escape handling, and focus restoration.
- Candidates are derived with `useMemo`, never separately mutable state.
- Results render in batches of 24 to keep the initial DOM small; all candidates remain available through **Show more**.
- The light theme is intentional.
- Vitest runs independently of React in a Node environment.

## Verification

- 46 Vitest tests pass, including the PSYCH regression, duplicate-letter cases, conflicting positions, excluded letters, full-list occurrence invariants, filtering, immutable inputs, malformed and sparse histories, feedback cycling, edit/removal recalculation, ranking, validation, and dictionary integrity.
- TypeScript, workspace lint, and production build pass.
- Headless Chrome checks cover draft isolation, validation, multiple guesses, feedback edits, deletion, clipboard success, reset confirmation, keyboard tile activation, dialog focus restoration, and pagination.
- Viewports of 320, 390, 768, and 1440 pixels were checked for overflow and tile targets of at least 44 pixels.

See [the clean-code audit](AUDIT.md) for the latest refactoring, file inventory, validation results, and verification limits. The browser and viewport checks above describe earlier verification; they were not rerun during this audit.
