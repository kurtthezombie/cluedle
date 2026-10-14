# Local Wordle dictionaries

Source: https://github.com/joshstephenson/Wordle-Solver
Downloaded 2026-10-13 from the main branch:

- nyt-answers.txt: 2,315 historical candidate answers.
- nyt-guesses.txt: 10,638 additional guesses in the downloaded file (the upstream README reports 10,637).
- LICENSE: MIT, copyright (c) 2025 Josh Stephenson. Original notice retained in LICENSE.txt.

answers.json is the normalized, unique, alphabetically sorted answer list.
guesses.json is the normalized, unique, alphabetically sorted UNION of both source lists: 12,953 words.
Both guess validation and suggested candidates use guesses.json. Matching words from answers.json appear first, followed by other matches. The historical answer list prioritizes suggestions without restricting them.
All entries are lowercase ASCII words of exactly five letters. Unit tests check these invariants and answer inclusion.

These are complete copies of the source lists, not a demonstration subset. They are a historical Wordle-compatible snapshot, not a live or guaranteed-current NYT dictionary. Newer accepted guesses or answers may be absent. No network dictionary requests occur at runtime.
