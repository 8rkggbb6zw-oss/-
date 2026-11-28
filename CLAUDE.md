# Everdawn

A cozy 3D farming game (three.js r128), played and edited in CodePen.

- The game lives on the branch `claude/coding-conversation-f08c0n`, not on `main`. Check it out first and keep committing and pushing there.
- Files: `index.html`, `style.css`, `script.js`, `script2.js`, `script3.js`, `script4.js`, `script5.js`, `script6.js`, `script7.js`, `script8.js`, `script9.js`. The player's character is `Witch.vrm` (a VRoid model, VRM 1.0, made by the user in VRoid Studio), kept in the repo and loaded by script7.js (a fourth game part, continued in script8.js, a fifth) from GitHub with three.js's GLTFLoader; it never goes into CodePen. Clothes made in VRoid live in their own VRM files the same way (AmethystApparition.vrm: its dress, and her body as made for it, are put on her own skeleton when she wears the Amethyst Apparition), and both files only load once the repo is public. The game is split because CodePen won't save a file over 1 MB (keep each under about 1,039,000 bytes, the size script.js already saves at). script.js, script2.js, script3.js, script7.js and script8.js are full, so new game code goes at the end of script9.js's part (inside `EVERDAWN_PARTS.push(function (THREE) { ... })`, which is loaded after script8.js and shares all the parts' variables). script4.js holds the title screen and the start-up code. When script9.js fills up, start another part in a new file (load it in index.html after script9.js, and make `startGame` in script3.js expect one more part).
- script6.js is the controller (PlayStation, Xbox, Switch): its BUTTONS list maps each controller button to the key it presses, and the Controller page in Settings shows them. New controller buttons go in BUTTONS.
- script5.js is the Language setting (loaded first): the words of the game in English, Español, Français, Italiano, Deutsch and Português (`WORDS`, one row per English text), swapped in on screen and on canvases as they appear. New on-screen English text needs a `WORDS` row with its five translations, or it stays in English.

## After every change, publish two pages

1. **A by-hand page** ("<Change> by Hand"): each edit as Find / Replace with, with a copy button for each replacement, so the change can be made by hand in CodePen.
2. **A full copy page** ("Everdawn Copy Page"): all eleven files, each with a Copy button, a box at the top saying what the latest change was, and each file marked "changed" or "no change". Build it from the repo files and check that every copy box matches its file exactly. Republish the same page each time in a conversation so its link stays the same, and give both links.

## Testing in the browser

The test browser can't reach cdnjs, so serve a copy of the game locally with three.js r128 taken from the npm registry (`https://registry.npmjs.org/three/-/three-0.128.0.tgz`, file `package/build/three.min.js`). The title screen has to be clicked through (Play, then a save slot) before the game runs.

## The restarted game (restart/)

The restarted Everdawn lives in `restart/` (`index.html`, `style.css`, `script.js`), pasted into a new pen. **With every single change, in the same reply, always give both pages — never wait to be asked, never send one without the other:**
1. A by-hand page for that change (Find / Replace with, a Copy button on each replacement).
2. The updated full copy page (https://claude.ai/artifact/MRzk9cuf4nizLt6iS6M96y, republished from `glowing-star-by-hand.html`) with all three files, checked to match the repo files exactly. On the page itself, mark each file "changed" or "no change" (a badge on each box and a list at the top).
Keep notes in the code short (e.g. `// Mana`), and keep the user's own renamed notes.
