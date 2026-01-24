# Bolt's Journal

## 2024-05-22 - Optimizing Lookup Performance
**Learning:** Checking existence in an array (`Array.includes`) inside a render loop leads to O(N*M) complexity. For components rendering grids of items (like a raffle number selector), this causes noticeable lag as N (sold numbers) grows.
**Action:** Convert arrays to `Set` (O(1) lookup) outside the render loop using `useMemo` when checking existence against a large list of IDs/numbers.

## 2024-05-23 - Memoizing Heavy Decorations
**Learning:** Large layout wrappers with heavy CSS animations (like `SlotMachineFrame`) re-render completely when children change. If they contain many DOM elements (lights, particles) generated in render, this adds significant overhead to every state change in the child (e.g. form inputs).
**Action:** Extract heavy, static decorative elements into separate `memo`ized components so they don't re-render when the layout's children update.

## 2024-05-24 - Isolating High-Frequency Updates
**Learning:** Components with interval timers (e.g., payment countdowns) trigger full re-renders of their entire subtree every second. For complex components like `PixPayment` (rendering QR codes and animations), this consumes unnecessary CPU.
**Action:** Extract the timer logic into a small, isolated child component so that only the text node updates, leaving the heavy parent component static.
