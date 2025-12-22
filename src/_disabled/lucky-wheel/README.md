# Lucky Wheel Feature (DISABLED)

This feature was disabled on 2024-12-22.

## Files

- `PrizeWheel.tsx` - Main wheel component with 54 segments
- `useSpinRewards.ts` - Hook for spin logic and balance management

## Dependencies

### Edge Function
- `supabase/functions/spin-wheel/index.ts` - Backend logic for prizes

### Database Tables
- `spin_balance` - User spin balance tracking
- `spin_history` - Spin history logging

## How to Re-enable

1. Move `PrizeWheel.tsx` to `src/components/spin-wheel/PrizeWheel.tsx`
2. Move `useSpinRewards.ts` to `src/hooks/useSpinRewards.ts`
3. Update imports in `src/pages/MyNumbers.tsx`:

```tsx
import { SpinRewardModal } from '@/components/spin-wheel/PrizeWheel';
import { useSpinRewards } from '@/hooks/useSpinRewards';
```

4. Add state and effects back to MyNumbers.tsx:

```tsx
const [showWheel, setShowWheel] = useState(false);
const [spinsAvailable, setSpinsAvailable] = useState(0);
const { getBalance } = useSpinRewards();

useEffect(() => {
  if (submitted && (email || phone)) {
    getBalance(email || undefined, phone || undefined).then(balance => {
      setSpinsAvailable(balance?.spins_available ?? 0);
    });
  }
}, [submitted, email, phone]);
```

5. Add the button and modal to the JSX

## Prize Distribution

| Prize | Probability |
|-------|-------------|
| +1 número | 33.04% |
| +2 números | 26% |
| +3 números | 16% |
| +4 números | 9% |
| +5 números | 4% |
| +6 números | 1.5% |
| Tente Novamente | 10% |
| 2x Total | 0.35% |
| 5x Total | 0.10% |
| 10x Total | 0.01% |
