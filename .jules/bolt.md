# Bolt's Journal

## 2024-05-22 - Optimizing Lookup Performance
**Learning:** Checking existence in an array (`Array.includes`) inside a render loop leads to O(N*M) complexity. For components rendering grids of items (like a raffle number selector), this causes noticeable lag as N (sold numbers) grows.
**Action:** Convert arrays to `Set` (O(1) lookup) outside the render loop using `useMemo` when checking existence against a large list of IDs/numbers.

## 2024-05-23 - Memoizing Heavy Decorations
**Learning:** Large layout wrappers with heavy CSS animations (like `SlotMachineFrame`) re-render completely when children change. If they contain many DOM elements (lights, particles) generated in render, this adds significant overhead to every state change in the child (e.g. form inputs).
**Action:** Extract heavy, static decorative elements into separate `memo`ized components so they don't re-render when the layout's children update.

## 2024-05-23 - Rejection Sampling Optimization
**Learning:** Generating random numbers for sparse sets (low occupancy) is much faster using Rejection Sampling (pick random -> check if available) than shuffling a full array of available numbers (O(N) allocation).
**Action:** Switch to Rejection Sampling when occupancy is < 75% for massive speedups (e.g. 3000x for 100k items).
