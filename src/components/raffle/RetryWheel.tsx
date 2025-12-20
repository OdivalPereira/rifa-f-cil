import { useEffect, useState } from 'react';
import { Clover, Frown } from 'lucide-react';

interface RetryWheelProps {
  onSpinComplete: (prizeIndex: number) => void;
  isSpinning: boolean;
  prizeIndex: number | null;
}

// Probabilities (Visual mapping)
// 0: +1 (30%)
// 1: +2 (15%)
// 2: Nothing (55%)

const SEGMENTS = [
  { label: '+1 Chance', color: '#10B981', icon: Clover },
  { label: '+2 Chances', color: '#34D399', icon: Clover },
  { label: 'Nada', color: '#9CA3AF', icon: Frown },
];

export function RetryWheel({ onSpinComplete, isSpinning, prizeIndex }: RetryWheelProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning && prizeIndex !== null) {
      const segmentAngle = 360 / SEGMENTS.length;
      const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
      const targetSegmentAngle = prizeIndex * segmentAngle;
      const jitter = (Math.random() - 0.5) * 40;
      const finalRotation = extraSpins + (360 - targetSegmentAngle) + jitter;

      setRotation(finalRotation);

      const duration = 4000;
      setTimeout(() => {
        onSpinComplete(prizeIndex);
      }, duration);
    }
  }, [isSpinning, prizeIndex]);

  return (
    <div className="relative w-64 h-64 mx-auto my-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20">
        <div className="w-6 h-6 bg-red-600 rotate-45 transform origin-bottom-right shadow border border-white" />
      </div>

      <div
        className="w-full h-full rounded-full border-4 border-gray-200 shadow-inner overflow-hidden relative transition-transform"
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: isSpinning ? '4s' : '0s',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
        }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
          {SEGMENTS.map((segment, i) => {
            const angle = 360 / SEGMENTS.length;
            const startAngle = i * angle;
            const endAngle = (i + 1) * angle;

            const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
            const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
            const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
            const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

            const path = `M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`;

            return (
              <path key={i} d={path} fill={segment.color} stroke="#fff" strokeWidth="1" />
            );
          })}
        </svg>

        {SEGMENTS.map((segment, i) => {
            const angle = 360 / SEGMENTS.length;
            const rotation = i * angle + (angle / 2);
            return (
                <div
                    key={i}
                    className="absolute top-0 left-1/2 w-full h-full -translate-x-1/2 pointer-events-none flex justify-center pt-6"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="flex flex-col items-center text-white drop-shadow-md">
                        <segment.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-bold uppercase">{segment.label}</span>
                    </div>
                </div>
            )
        })}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center z-10">
        <div className="w-8 h-8 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}
