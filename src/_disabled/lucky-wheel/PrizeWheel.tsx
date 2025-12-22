/**
 * Lucky Wheel Feature - DISABLED
 * 
 * This component was disabled on 2024-12-22.
 * To re-enable, move this file back to src/components/spin-wheel/PrizeWheel.tsx
 * and restore the imports in MyNumbers.tsx
 * 
 * Dependencies:
 * - useSpinRewards hook (src/_disabled/lucky-wheel/useSpinRewards.ts)
 * - spin-wheel edge function (supabase/functions/spin-wheel/index.ts)
 * - spin_balance table (database)
 * - spin_history table (database)
 */

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useSpinRewards } from './useSpinRewards';
import { Loader2, Sparkles, Trophy } from 'lucide-react';
import { toast } from 'sonner';

// Segment definition
interface Segment {
  label: string;
  value: number | string;
  type: 'numbers' | 'multiplier' | 'retry';
  color: string;
  textColor: string;
}

// Visual distribution (54 segments)
const SEGMENTS: Segment[] = [
  // Block 1
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' }, // Emerald 300
  { label: '+3', value: 3, type: 'numbers', color: '#FCD34D', textColor: '#78350F' }, // Amber 300
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' }, // Emerald 500
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+4', value: 4, type: 'numbers', color: '#F59E0B', textColor: '#FFF' },    // Amber 500
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+3', value: 3, type: 'numbers', color: '#FCD34D', textColor: '#78350F' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: 'TENTE', value: 'retry', type: 'retry', color: '#A78BFA', textColor: '#FFF' }, // Purple
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+3', value: 3, type: 'numbers', color: '#FCD34D', textColor: '#78350F' },

  // Block 2
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+4', value: 4, type: 'numbers', color: '#F59E0B', textColor: '#FFF' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '5x', value: 5, type: 'multiplier', color: '#FFD700', textColor: '#000' }, // Gold
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+3', value: 3, type: 'numbers', color: '#FCD34D', textColor: '#78350F' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+4', value: 4, type: 'numbers', color: '#F59E0B', textColor: '#FFF' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: 'TENTE', value: 'retry', type: 'retry', color: '#A78BFA', textColor: '#FFF' },

  // Block 3
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+3', value: 3, type: 'numbers', color: '#FCD34D', textColor: '#78350F' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+5', value: 5, type: 'numbers', color: '#EF4444', textColor: '#FFF' }, // Red
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+3', value: 3, type: 'numbers', color: '#FCD34D', textColor: '#78350F' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+4', value: 4, type: 'numbers', color: '#F59E0B', textColor: '#FFF' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '10x', value: 10, type: 'multiplier', color: '#B9F2FF', textColor: '#000' }, // Diamond
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },

  // Block 4
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+3', value: 3, type: 'numbers', color: '#FCD34D', textColor: '#78350F' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: 'TENTE', value: 'retry', type: 'retry', color: '#A78BFA', textColor: '#FFF' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+6', value: 6, type: 'numbers', color: '#DC2626', textColor: '#FFF' }, // Bright Red
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+3', value: 3, type: 'numbers', color: '#FCD34D', textColor: '#78350F' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+4', value: 4, type: 'numbers', color: '#F59E0B', textColor: '#FFF' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },

  // Block 5 (Final)
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+3', value: 3, type: 'numbers', color: '#FCD34D', textColor: '#78350F' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '2x', value: 2, type: 'multiplier', color: '#FDE047', textColor: '#000' }, // Gold light
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
  { label: '+5', value: 5, type: 'numbers', color: '#EF4444', textColor: '#FFF' },
  { label: '+2', value: 2, type: 'numbers', color: '#10B981', textColor: '#064E3B' },
  { label: '+1', value: 1, type: 'numbers', color: '#6EE7B7', textColor: '#064E3B' },
];

interface PrizeWheelProps {
  email?: string;
  phone?: string;
  onSpinComplete: () => void;
}

export function PrizeWheel({ email, phone, onSpinComplete }: PrizeWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const { spin, isLoading } = useSpinRewards();
  const [winMessage, setWinMessage] = useState('');

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const totalSegments = SEGMENTS.length;
    const arcSize = (2 * Math.PI) / totalSegments;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Segments
    SEGMENTS.forEach((segment, i) => {
      const angle = i * arcSize - Math.PI / 2; // Start from top

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = segment.textColor;
      ctx.font = 'bold 12px Arial';
      ctx.fillText(segment.label, radius - 10, 5);
      ctx.restore();
    });

    // Pointer (Triangle at top)
    ctx.beginPath();
    ctx.moveTo(centerX - 15, 10);
    ctx.lineTo(centerX + 15, 10);
    ctx.lineTo(centerX, 40);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();

  }, []);

  const handleSpin = async () => {
    if (isSpinning || isLoading) return;
    setIsSpinning(true);
    setWinMessage('');

    try {
      // 1. Get result from server
      const result = await spin(email, phone);
      if (!result) {
        setIsSpinning(false);
        return;
      }

      const { prize } = result;
      const matchingIndices = SEGMENTS.map((s, i) =>
        (s.type === prize.type && s.value == prize.value) ? i : -1
      ).filter(i => i !== -1);

      if (matchingIndices.length === 0) {
        console.error("No matching segment for prize", prize);
        setIsSpinning(false);
        return;
      }

      // Pick random matching segment to vary visual result
      const targetIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];

      const arcSize = 360 / SEGMENTS.length;
      const currentRotation = rotation;
      const TargetAngle = (360 - (targetIndex * arcSize));
      let diff = TargetAngle - (currentRotation % 360);
      if (diff < 0) diff += 360;

      const targetRotation = currentRotation + (360 * 5) + diff;
      setRotation(targetRotation);

      // Wait for animation to finish (e.g. 5s)
      setTimeout(() => {
        setIsSpinning(false);

        if (prize.type === 'retry') {
           setWinMessage("Tente Novamente!");
        } else {
           setWinMessage(`Parabéns! Você ganhou ${prize.label}!`);
           confetti({
             particleCount: 100,
             spread: 70,
             origin: { y: 0.6 }
           });
        }

        onSpinComplete();
        toast.success("Prêmio resgatado!");

      }, 5000);

    } catch (e) {
      console.error(e);
      setIsSpinning(false);
      toast.error("Erro ao girar a roleta");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative overflow-hidden" style={{ width: '320px', height: '320px' }}>
         <div
           style={{
             transform: `rotate(${rotation}deg)`,
             transition: isSpinning ? 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
             width: '100%',
             height: '100%'
           }}
         >
             <canvas ref={canvasRef} width={640} height={640} style={{ width: '100%', height: '100%' }} />
         </div>
         {/* Pointer Overlay */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-white drop-shadow-lg z-10" />
      </div>

      <div className="text-center h-8">
         {winMessage && <p className="font-bold text-xl animate-bounce text-gold">{winMessage}</p>}
      </div>

      <Button
        onClick={handleSpin}
        disabled={isSpinning || isLoading}
        className="btn-luck w-full max-w-xs text-lg py-6"
      >
        {isSpinning ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
        GIRAR AGORA
      </Button>
    </div>
  );
}

export function SpinRewardModal({ open, onOpenChange, email, phone }: { open: boolean, onOpenChange: (open: boolean) => void, email?: string, phone?: string }) {
    const handleComplete = () => {
        // Refresh or just stay open?
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card/95 border-gold/20 text-card-foreground">
                <div className="flex flex-col items-center">
                    <Trophy className="w-10 h-10 text-gold mb-2" />
                    <h2 className="text-2xl font-display text-gradient-gold mb-4">Roleta da Sorte</h2>
                    <PrizeWheel email={email} phone={phone} onSpinComplete={handleComplete} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
