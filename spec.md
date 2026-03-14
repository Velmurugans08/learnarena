# LearnArena - Temple Run Game Mode

## Current State
LearnArena has a gamified coding education platform with worlds (Python Forest, Java Ocean, C City, AI Island), MCQ challenges, coding problems, battle arena, and leaderboard. App uses React + Motoko backend.

## Requested Changes (Diff)

### Add
- New `/runner` route: Temple Run-style endless side-scrolling runner game
- TempleRunGame page component using HTML5 Canvas and requestAnimationFrame
- 4 levels matching the 4 worlds: Python Forest (green theme), Java Ocean (blue theme), C City (purple theme), AI Island (orange theme)
- Game mechanics: character runs automatically, player taps/clicks or presses spacebar/arrow keys to jump and slide
- Obstacles spawn from the right, player must dodge by jumping (up arrow / space) or sliding (down arrow)
- Every ~10 seconds or on collision, a coding MCQ question pops up as an in-game overlay
- Answer correctly = survive/continue + earn coins; wrong = lose one life (3 lives total)
- Level progression: each level has a distance target (e.g. 500m, 1000m, 1500m, 2000m), reaching it unlocks next level
- Score displayed live; coins collected carry to XP system
- Game over screen with score, level reached, and "Play Again" / "Back to Map" buttons
- Level select screen showing 4 levels with lock/unlock state based on localStorage progress
- Add "Runner Game" button on Dashboard and WorldMap

### Modify
- App.tsx: add `/runner` and `/runner/:level` routes (protected)
- Dashboard.tsx: add a "Runner Game" card/button in the nav section

### Remove
- Nothing removed

## Implementation Plan
1. Create `TempleRunGame.tsx` page with Canvas-based runner using requestAnimationFrame game loop
2. Game entities: Player (jump/slide states), Obstacles (high/low), Coins, background parallax layers
3. Level configs: theme colors, background assets (CSS gradients), obstacle colors, MCQ questions per level
4. MCQ overlay component rendered as React UI over Canvas when triggered
5. Level select screen at `/runner` showing 4 world-themed levels
6. Game HUD: lives (hearts), score/distance, current level name, coin count
7. Integrate with localStorage for level unlock progress and XP
8. Wire up routes in App.tsx and add entry points from Dashboard
