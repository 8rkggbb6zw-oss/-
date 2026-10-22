# Everdawn

A cozy 3D farming game (three.js r128), played and edited in CodePen.

- The game lives on the branch `claude/coding-conversation-f08c0n`, not on `main`. Check it out first and keep committing and pushing there.
- Files: `index.html`, `style.css`, `script.js`, `script2.js`, `script3.js`, `script4.js`, `script5.js`. The game is split because CodePen won't save a file over 1 MB (keep each under about 1,039,000 bytes, the size script.js already saves at). script.js and script2.js are full, so new game code goes at the end of script3.js's part (inside `EVERDAWN_PARTS.push(function (THREE) { ... })`). script4.js holds the title screen and the start-up code. When script3.js fills up, start another part in a new file (and make `startGame` expect one more part).
- script5.js is the Language setting (loaded first): the words of the game in English, Español, Français, Italiano, Deutsch and Português (`WORDS`, one row per English text), swapped in on screen and on canvases as they appear. New on-screen English text needs a `WORDS` row with its five translations, or it stays in English.

## After every change, publish two pages

1. **A by-hand page** ("<Change> by Hand"): each edit as Find / Replace with, with a copy button for each replacement, so the change can be made by hand in CodePen.
2. **A full copy page** ("Everdawn Copy Page"): all seven files, each with a Copy button, a box at the top saying what the latest change was, and each file marked "changed" or "no change". Build it from the repo files and check that every copy box matches its file exactly. Republish the same page each time in a conversation so its link stays the same, and give both links.

## Testing in the browser

The test browser can't reach cdnjs, so serve a copy of the game locally with three.js r128 taken from the npm registry (`https://registry.npmjs.org/three/-/three-0.128.0.tgz`, file `package/build/three.min.js`). The title screen has to be clicked through (Play, then a save slot) before the game runs.
