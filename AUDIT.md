# Clean-code audit

Date: 2026-10-14

## Scope and priorities

Reviewed application components, React state and event handlers, the Wordle engine and tests, both dictionary roles and their integrity checks, shared UI components and utilities, CSS, entry points, workspace dependencies, TypeScript/Vite/Vitest/ESLint/Prettier/Turbo configuration, and project documentation.

The working tree already contained the Cluedle implementation and previous fixes. This audit builds on those changes; the Git diff against HEAD also includes that earlier work.

No critical issue was found. The existing responsibility-based structure is appropriate for this application. Dictionary loading, candidate filtering, feedback evaluation, and ranking already have clear boundaries and no circular application imports. No new architectural layer or dependency was introduced.

| Priority | Finding | Resolution |
| --- | --- | --- |
| Medium | Sparse guess arrays bypassed validation because `Array.every` skips missing entries. | Validate every slot with `Array.from` before filtering, including when the candidate set is empty. |
| Medium | Runtime guess validation accepted only a statically typed `Guess`, limiting safe use at an input boundary. | Accept `unknown` and narrow it with a type guard; reject malformed properties and feedback without unsafe assertions. |
| Low | Pure engine functions advertised mutable inputs, and guess data could be mutated accidentally. | Mark guess properties, feedback, and engine input collections read-only. Verify filtering/ranking against frozen inputs. |
| Low | Feedback cycling lived inside the page component; letter checks and error text were duplicated. | Move cycling into the existing Wordle module and reuse its letter validation and error message. |
| Low | Nested JSX callbacks obscured history updates and resets. | Use named page handlers, retaining the existing state and interaction model. |
| Low | Focus management queried a global DOM ID. | Use a typed React input ref for submit/edit focus. |
| Low | Word length and pagination size were unexplained repeated values. | Introduce `WORD_LENGTH` and a component-local `PAGE_SIZE`; keep five letters and 24 results per page. |
| Low | An unused theme provider retained 229 lines of starter code and unused behavior. | Remove it after confirming there are no imports. The application remains light-themed. |
| Low | The UI workspace declared unused `zod`, `@turbo/gen`, and `@tailwindcss/vite` dependencies. | Remove the declarations and regenerate the lockfile offline. The web workspace retains its Vite Tailwind plugin. Transitive dependencies remain where required. |
| Low | The Node config project lacked strict checking and omitted Vitest configuration. | Enable strict checking and include `vitest.config.ts`. No lint rules or compiler protections were weakened. |
| Low | Bootstrap used a non-null assertion; test fixtures used unnecessary type assertions. | Guard the root element explicitly; use typed fixtures and `satisfies`. |
| Low | An unused CSS custom property and an awkward focus expression remained. | Remove `--amber` and name the dialog's next focus target. |

## Behavior and engine review

- Feedback evaluation continues to allocate green matches first, then yellow matches from the remaining letter counts. Duplicate grays therefore limit occurrences rather than banning letters that also matched.
- Filtering requires an exact feedback match for every submitted guess. Yellow positions, missing letters, duplicates, conflicting constraints, and empty results retain their existing semantics.
- Suggestions still use all 12,953 accepted guesses. No word exceptions, dictionary edits, or answer-list prioritization were added.
- Ranking still scores unique-letter frequency, sorts ties alphabetically, and retains all candidates. It does not measure word familiarity.
- Candidate memoization remains because filtering and ranking the dictionary is substantive work. Pagination and copy state still reset when submitted clues change.
- The layout, text, colors, dialogs, copy controls, editable history, draft behavior, and form-scoped 1–5 shortcuts retain their existing implementation behavior. Input focus now uses a ref rather than a DOM lookup.
- Shared shadcn styles, button variants, utility exports, and related dependencies were retained to preserve the established UI conventions. CSS imports are genuine dependencies, even when not imported by TypeScript.

## Files changed by this audit

| Files | Changes |
| --- | --- |
| `apps/web/src/lib/wordle.ts` | Shared validation/cycling, word length, runtime type guard, read-only inputs. |
| `apps/web/src/lib/filter.ts` | Sparse-history validation and read-only inputs. |
| `apps/web/src/lib/ranking.ts`, `apps/web/src/lib/candidates.ts` | Read-only input contracts; algorithms unchanged. |
| `apps/web/src/lib/wordle.test.ts` | Eight additional tests and safer fixtures; preserve all 38 previous cases. |
| `apps/web/src/types/wordle.ts` | Immutable guess contract. |
| `apps/web/src/App.tsx` | Named handlers, shared engine helpers, input ref, documented list-reset key. |
| `apps/web/src/components/guess-input.tsx` | Input ref and shared word validation/length. |
| `apps/web/src/components/candidate-list.tsx` | Named page size and read-only candidate prop. |
| `apps/web/src/components/app-dialog.tsx` | Clearer focus-target expression. |
| `apps/web/src/components/theme-provider.tsx` | Deleted unused component. |
| `apps/web/src/main.tsx` | Explicit root-element guard. |
| `apps/web/src/styles.css` | Remove unused CSS variable. |
| `apps/web/tsconfig.node.json` | Strict checks for Vite and Vitest configuration. |
| `packages/ui/package.json`, `package-lock.json` | Remove unused direct dependency declarations and synchronize lockfile. |
| `README.md`, `AUDIT.md` | Update usage/verification documentation and record audit findings. |

## Validation

- Baseline: all 38 existing Vitest tests passed before editing.
- After refactoring: `npm test` passed all 46 tests. The PSYCH test uses CRANE `[yellow, gray, gray, gray, gray]`, STOIC `[yellow, gray, gray, gray, yellow]`, and MUCUS `[gray, gray, yellow, gray, yellow]` through the actual suggestion pipeline.
- Added coverage: malformed answer strings, complete feedback cycling without mutation, independent draft feedback, sparse histories with populated/empty dictionaries, invalid dictionary entries, frozen engine inputs, newline validation, and unknown/malformed guess objects.
- `npm run lint`: passed both workspaces.
- `npm run typecheck`: passed both workspaces, including strict Vite/Vitest configuration checks.
- `npm run build`: passed TypeScript and the Vite production build.
- Formatting follows the existing Prettier configuration. Sandbox write restrictions required elevated reruns for formatting the test file and writing TypeScript/Turbo caches; those reruns passed.

## Remaining concerns and verification limits

- The dictionary is a historical snapshot, not synchronized with current NYT answers. Accepted guesses include obscure words, and ranking does not prioritize historical solutions. These are existing product choices and were deliberately preserved.
- The repository has no committed browser interaction test suite. Browser/viewport checks documented in the README predate this audit and were not rerun here. Unit tests and compiler/build checks do not independently prove every visual or keyboard interaction.
- No coverage percentage or dependency security audit is claimed. Dependency review concerned actual usage and module boundaries.
