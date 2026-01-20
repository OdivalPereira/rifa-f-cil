# Bolt's Journal

## 2024-05-22 - Optimizing Lookup Performance
**Learning:** Checking existence in an array (`Array.includes`) inside a render loop leads to O(N*M) complexity. For components rendering grids of items (like a raffle number selector), this causes noticeable lag as N (sold numbers) grows.
**Action:** Convert arrays to `Set` (O(1) lookup) outside the render loop using `useMemo` when checking existence against a large list of IDs/numbers.

## 2024-05-23 - Memoizing Heavy Decorations
**Learning:** Large layout wrappers with heavy CSS animations (like `SlotMachineFrame`) re-render completely when children change. If they contain many DOM elements (lights, particles) generated in render, this adds significant overhead to every state change in the child (e.g. form inputs).
**Action:** Extract heavy, static decorative elements into separate `memo`ized components so they don't re-render when the layout's children update.

## 2024-05-24 - Hybrid Random Selection Strategy
**Learning:** Implementing `shuffle` on a large array (O(N)) for selecting a small number of items `k` is inefficient (O(N) allocation + O(N) shuffle). However, purely using Rejection Sampling (randomly picking indices) degrades to infinite loops as the available pool shrinks (high saturation).
**Action:** Use a Hybrid Strategy: Rejection Sampling (O(k)) for low saturation (<75%), falling back to Scan/Shuffle (O(N)) only when the pool is dense, ensuring both speed and safety.
