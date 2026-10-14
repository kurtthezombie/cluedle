# Cluedle

**Less guessing, more solving.** Cluedle is a Wordle assistant built with React, TypeScript, Vite, and shadcn/ui. Enter your guesses and their feedback to find words that match your clues.

## How to run

### Requirements

- Node.js 22.12+ and npm.
- A terminal opened in the project's root directory.

### Start the app

Install the dependencies:

```sh
npm ci
```

Start the development server:

```sh
npm run dev
```

Open the local URL printed in the terminal. Keep the terminal running while using the app; press **Ctrl+C** to stop the server.

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution is disabled.

### Preview a production build

```sh
npm run build
npm run preview --workspace web
```

Open the preview URL printed in the terminal.

## How to use Cluedle

### 1. Enter a guess

Type a five-letter word you have played in Wordle into the guess field. Cluedle accepts words from its local dictionary.

### 2. Match the feedback

Click each letter tile to cycle through **gray → yellow → green → gray**, matching the feedback Wordle gave you.

| Color | Meaning |
| --- | --- |
| Gray — Absent | The letter is absent, or this guess contains an extra occurrence of it. |
| Yellow — Present | The letter exists in the answer, but belongs in another position. |
| Green — Correct | The letter is in the correct position. |

For repeated letters, copy each tile's feedback exactly. A gray letter can also appear as yellow or green elsewhere in the same guess.

### 3. Submit your guess

Select **Add guess**, or press **Enter** while focused on the word field. Your guess moves into History, and Possible answers updates to match every submitted clue. Unsubmitted changes do not affect the results.

### 4. Explore possible answers

- Matching words from the historical Wordle answer list appear first, followed by other accepted words.
- Within each group, words are ranked by common unique letters among the remaining candidates.
- Select **Show more** to reveal another 24 results.
- Use a word's copy button to copy it, try it in Wordle, then enter the new guess and feedback in Cluedle.

An accepted guess is not necessarily a daily Wordle answer. The local dictionary is a historical snapshot, so suggestions are not guaranteed to include today's answer.

### 5. Update or clear your guesses

- **Change feedback:** Click a tile in History to update the results immediately.
- **Edit:** Select Edit on a submitted guess, adjust the word or feedback, then select Save changes. Changing the word resets its draft feedback to gray.
- **Cancel:** Discard edits and return to adding a new guess.
- **Delete:** Use the trash button to remove a guess and recalculate the results.
- **Reset all:** Clear the history and current draft after confirming.

History is kept only for the current session and clears when you refresh the page.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| **1–5** | Cycle the corresponding letter's feedback while focused within the guess form. Requires a complete five-letter word; also works while editing. |
| **Enter** in the word field | Add the guess or save changes. |
| **Tab / Shift+Tab** | Move between controls. |
| **Enter / Space** on a tile | Cycle that tile's feedback. |
| **Escape** in a dialog | Close the dialog. |

### If no words match

Check the feedback for every submitted guess, especially repeated letters and yellow positions. Conflicting clues can eliminate all candidates. A word may also be missing from the local dictionary.

## Development checks

Run these commands from the project root:

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

## Word list

Cluedle bundles 12,953 accepted guesses, including 2,315 historical answers. Dictionary lookups happen locally; no external word API is required.

See the [dictionary provenance](apps/web/src/data/README.md) and retained [MIT license](apps/web/src/data/LICENSE.txt) for source details.
