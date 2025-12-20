# Bolt's Journal

## 2024-05-22 - Optimizing Lookup Performance
**Learning:** Checking existence in an array (`Array.includes`) inside a render loop leads to O(N*M) complexity. For components rendering grids of items (like a raffle number selector), this causes noticeable lag as N (sold numbers) grows.
**Action:** Convert arrays to `Set` (O(1) lookup) outside the render loop using `useMemo` when checking existence against a large list of IDs/numbers.
