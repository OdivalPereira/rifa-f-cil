import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Clover, Star, Sparkles, Trophy, Repeat } from 'lucide-react';

interface PrizeWheelProps {
  onSpinComplete: (prizeIndex: number) => void;
  isSpinning: boolean;
  prizeIndex: number | null; // 0-9 corresponding to segments
}

// Probabilities (visual mapping only)
// 0: +1 (32%)
// 1: +2 (26%)
// 2: +3 (16%)
// 3: +4 (9%)
// 4: +5 (4%)
// 5: +6 (1.5%)
// 6: Retry (10%)
// 7: 2x (0.35%)
// 8: 5x (0.10%)
// 9: 10x (0.01%)

const SEGMENTS = [
  { label: '+1 Nº', color: '#10B981', icon: Clover, rarity: 'common' }, // Emerald
  { label: '+2 Nºs', color: '#34D399', icon: Clover, rarity: 'common' },
  { label: '+3 Nºs', color: '#FBBF24', icon: Star, rarity: 'uncommon' }, // Amber
  { label: '+4 Nºs', color: '#F59E0B', icon: Star, rarity: 'uncommon' },
  { label: '+5 Nºs', color: '#F97316', icon: Trophy, rarity: 'rare' }, // Orange
  { label: '+6 Nºs', color: '#EF4444', icon: Trophy, rarity: 'rare' }, // Red
  { label: 'Tente Novamente', color: '#6366F1', icon: Repeat, rarity: 'special' }, // Indigo
  { label: '2x TOTAL', color: '#8B5CF6', icon: Sparkles, rarity: 'epic' }, // Violet
  { label: '5x TOTAL', color: '#EC4899', icon: Sparkles, rarity: 'epic' }, // Pink
  { label: '10x TOTAL', color: '#000000', icon: '👑', rarity: 'legendary' }, // Black/Gold
];

export function PrizeWheel({ onSpinComplete, isSpinning, prizeIndex }: PrizeWheelProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning && prizeIndex !== null) {
      // Calculate rotation to land on the prize
      // Each segment is 360 / 10 = 36 degrees
      // Segment 0 is at top (let's say).
      // To land on index i, we rotate X full circles + offset.

      const segmentAngle = 360 / SEGMENTS.length;

      // Random extra spins (5 to 10)
      const extraSpins = 360 * (5 + Math.floor(Math.random() * 5));

      // Target angle relative to 0
      // If we want index 0 at top, and pointer is at top.
      // Index 0 center is at 0 degrees.
      // If we rotate wheel clockwise, index 0 moves right.
      // To land index 0 at top pointer, rotation should be 360 - (index * 36).
      // Let's add random jitter within the segment (+/- 15 deg)

      const targetSegmentAngle = prizeIndex * segmentAngle;
      const jitter = (Math.random() - 0.5) * 20; // +/- 10 degrees safe zone

      const finalRotation = extraSpins + (360 - targetSegmentAngle) + jitter;

      setRotation(finalRotation);

      // Animation duration matching CSS transition
      const duration = 5000;

      setTimeout(() => {
        onSpinComplete(prizeIndex);
      }, duration);
    }
  }, [isSpinning, prizeIndex]);

  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto my-8">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
        <div className="w-8 h-8 bg-gradient-to-b from-red-500 to-red-700 rotate-45 transform origin-bottom-right shadow-lg border-2 border-white" />
      </div>

      {/* Wheel Container */}
      <div
        className="w-full h-full rounded-full border-8 border-gold/30 shadow-[0_0_50px_rgba(255,215,0,0.2)] overflow-hidden relative transition-transform cubic-bezier(0.2, 0.8, 0.2, 1)"
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: isSpinning ? '5s' : '0s'
        }}
      >
        {SEGMENTS.map((segment, i) => {
          const rotation = i * (360 / SEGMENTS.length);
          return (
            <div
              key={i}
              className="absolute top-0 left-1/2 w-1/2 h-full -translate-x-1/2 origin-bottom transform-gpu"
              style={{
                transform: `rotate(${rotation}deg)`,
                clipPath: 'polygon(0 0, 100% 0, 50% 50%)', // Triangle slice logic is tricky with CSS only
                // Better approach: Conic gradient or skewed divs.
                // Let's use skewed divs for slices.
                // 10 slices = 36 deg each.
                // SkewY = 90 - 36 = 54.
              }}
            >
              {/* This structure is hard to get right with just divs.
                  Let's use a simpler Conic Gradient for background and positioned icons.
              */}
            </div>
          );
        })}

        {/* Alternate SVG implementation for perfect slices */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
          {SEGMENTS.map((segment, i) => {
            const angle = 360 / SEGMENTS.length; // 36
            // Calculate SVG arc path
            // Start angle: i * 36
            // End angle: (i+1) * 36

            const startAngle = i * angle;
            const endAngle = (i + 1) * angle;

            // Convert polar to cartesian
            // Center is 50, 50. Radius 50.

            const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
            const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
            const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
            const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

            const path = `M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`;

            return (
              <path
                key={i}
                d={path}
                fill={segment.color}
                stroke="#fff"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>

        {/* Labels/Icons Layer */}
        {SEGMENTS.map((segment, i) => {
            const angle = 360 / SEGMENTS.length;
            const rotation = i * angle + (angle / 2); // Center of slice
            return (
                <div
                    key={i}
                    className="absolute top-0 left-1/2 w-full h-full -translate-x-1/2 pointer-events-none flex justify-center pt-4"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="flex flex-col items-center gap-1 text-white drop-shadow-md">
                        {typeof segment.icon === 'string' ? (
                            <span className="text-xl">{segment.icon}</span>
                        ) : (
                            <segment.icon className="w-5 h-5" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider max-w-[60px] text-center leading-tight">
                            {segment.label}
                        </span>
                    </div>
                </div>
            )
        })}
      </div>

      {/* Center Cap */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10 border-4 border-gold">
        <Star className="w-6 h-6 text-gold fill-current" />
      </div>
    </div>
  );
}
