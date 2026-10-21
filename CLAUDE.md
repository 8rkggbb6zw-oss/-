# Everdawn

A cozy 3D farming game (three.js r128), played and edited in CodePen.

- The game lives on the branch `claude/coding-conversation-f08c0n`, not on `main`. Check it out first and keep committing and pushing there.
- Files: `index.html`, `style.css`, `script.js`, `script2.js`, `script3.js`. The game is split over three scripts because CodePen won't save a file over 1 MB. script.js and script2.js are full, so new code goes in script3.js.

## After every change, publish two pages

1. **A by-hand page** ("<Change> by Hand"): each edit as Find / Replace with, with a copy button for each replacement, so the change can be made by hand in CodePen.
2. **A full copy page** ("Everdawn Copy Page"): all five files, each with a Copy button, a box at the top saying what the latest change was, and each file marked "changed" or "no change". Build it from the repo files and check that every copy box matches its file exactly. Republish the same page each time in a conversation so its link stays the same, and give both links.

## Testing in the browser

The test browser can't reach cdnjs, so serve a copy of the game locally with three.js r128 taken from the npm registry (`https://registry.npmjs.org/three/-/three-0.128.0.tgz`, file `package/build/three.min.js`). The title screen has to be clicked through (Play, then a save slot) before the game runs.
