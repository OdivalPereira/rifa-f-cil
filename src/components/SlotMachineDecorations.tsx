import { memo } from 'react';
import { Sparkles, Star, Clover } from 'lucide-react';

export const BackgroundEffects = memo(() => (
  <div className="fixed inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-radial-purple" />
    <div className="absolute inset-0 bg-gradient-radial-emerald" />
    <div className="absolute inset-0 bg-noise opacity-[0.02]" />
  </div>
));
BackgroundEffects.displayName = 'BackgroundEffects';

export const FloatingParticles = memo(() => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    <Sparkles className="absolute top-[10%] left-[5%] w-4 h-4 text-gold/40 animate-sparkle" style={{ animationDelay: '0s' }} />
    <Star className="absolute top-[15%] right-[10%] w-3 h-3 text-gold/30 animate-float" style={{ animationDelay: '0.5s' }} />
    <Sparkles className="absolute top-[25%] left-[15%] w-3 h-3 text-emerald/30 animate-sparkle" style={{ animationDelay: '1s' }} />
    <Star className="absolute top-[35%] right-[5%] w-4 h-4 text-gold/20 animate-float" style={{ animationDelay: '1.5s' }} />
    <Sparkles className="absolute top-[50%] left-[8%] w-3 h-3 text-gold/30 animate-sparkle" style={{ animationDelay: '2s' }} />
    <Star className="absolute top-[60%] right-[12%] w-3 h-3 text-emerald/20 animate-float" style={{ animationDelay: '2.5s' }} />
    <Sparkles className="absolute top-[75%] left-[12%] w-4 h-4 text-gold/25 animate-sparkle" style={{ animationDelay: '3s' }} />
    <Star className="absolute top-[85%] right-[8%] w-3 h-3 text-gold/30 animate-float" style={{ animationDelay: '3.5s' }} />
  </div>
));
FloatingParticles.displayName = 'FloatingParticles';

export const TopLights = memo(() => (
  <div className="absolute top-0 left-0 right-0 flex justify-center gap-8 -translate-y-1/2" aria-hidden="true">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="w-3 h-3 rounded-full animate-bulb-flash"
        style={{
          animationDelay: `${i * 0.15}s`,
          background: i % 2 === 0
            ? 'radial-gradient(circle, hsl(45 100% 60%) 0%, hsl(45 100% 45%) 100%)'
            : 'radial-gradient(circle, hsl(145 80% 50%) 0%, hsl(145 80% 35%) 100%)'
        }}
      />
    ))}
  </div>
));
TopLights.displayName = 'TopLights';

export const BottomLights = memo(() => (
  <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 translate-y-1/2" aria-hidden="true">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="w-3 h-3 rounded-full animate-bulb-flash"
        style={{
          animationDelay: `${(i * 0.15) + 0.08}s`,
          background: i % 2 === 0
            ? 'radial-gradient(circle, hsl(145 80% 50%) 0%, hsl(145 80% 35%) 100%)'
            : 'radial-gradient(circle, hsl(45 100% 60%) 0%, hsl(45 100% 45%) 100%)'
        }}
      />
    ))}
  </div>
));
BottomLights.displayName = 'BottomLights';

export const SideLights = memo(({ side }: { side: 'left' | 'right' }) => (
  <div className={`absolute top-8 bottom-8 ${side}-0 flex flex-col justify-around items-center`} aria-hidden="true">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="w-2.5 h-2.5 rounded-full animate-bulb-flash"
        style={{
          animationDelay: side === 'left' ? `${i * 0.2}s` : `${(i * 0.2) + 0.1}s`,
          background: i % 2 === 0
            ? (side === 'left'
                ? 'radial-gradient(circle, hsl(45 100% 60%) 0%, hsl(45 100% 45%) 100%)'
                : 'radial-gradient(circle, hsl(145 80% 50%) 0%, hsl(145 80% 35%) 100%)')
            : (side === 'left'
                ? 'radial-gradient(circle, hsl(145 80% 50%) 0%, hsl(145 80% 35%) 100%)'
                : 'radial-gradient(circle, hsl(45 100% 60%) 0%, hsl(45 100% 45%) 100%)')
        }}
      />
    ))}
  </div>
));
SideLights.displayName = 'SideLights';

export const BottomDecorations = memo(() => (
  <div className="absolute bottom-full left-0 right-0 flex justify-center items-center gap-4 py-2" aria-hidden="true">
    <div className="flex items-center gap-2 text-gold/60">
      <span className="text-lg">💰</span>
      <span className="text-lg">💎</span>
      <span className="text-lg">⭐</span>
      <Clover className="w-5 h-5 text-emerald clover-icon" />
      <span className="text-lg">⭐</span>
      <span className="text-lg">💎</span>
      <span className="text-lg">💰</span>
    </div>
  </div>
));
BottomDecorations.displayName = 'BottomDecorations';
