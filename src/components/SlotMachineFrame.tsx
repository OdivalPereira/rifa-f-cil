import { ReactNode } from 'react';
import { Clover, Star, Sparkles } from 'lucide-react';

interface SlotMachineFrameProps {
  children: ReactNode;
  showDecorations?: boolean;
}

export function SlotMachineFrame({ children, showDecorations = true }: SlotMachineFrameProps) {
  return (
    <div className="min-h-screen w-full bg-slot-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial-purple" />
        <div className="absolute inset-0 bg-gradient-radial-emerald" />
        <div className="absolute inset-0 bg-noise opacity-[0.02]" />
      </div>

      {/* Floating particles */}
      {showDecorations && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <Sparkles className="absolute top-[10%] left-[5%] w-4 h-4 text-gold/40 animate-sparkle" style={{ animationDelay: '0s' }} />
          <Star className="absolute top-[15%] right-[10%] w-3 h-3 text-gold/30 animate-float" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute top-[25%] left-[15%] w-3 h-3 text-emerald/30 animate-sparkle" style={{ animationDelay: '1s' }} />
          <Star className="absolute top-[35%] right-[5%] w-4 h-4 text-gold/20 animate-float" style={{ animationDelay: '1.5s' }} />
          <Sparkles className="absolute top-[50%] left-[8%] w-3 h-3 text-gold/30 animate-sparkle" style={{ animationDelay: '2s' }} />
          <Star className="absolute top-[60%] right-[12%] w-3 h-3 text-emerald/20 animate-float" style={{ animationDelay: '2.5s' }} />
          <Sparkles className="absolute top-[75%] left-[12%] w-4 h-4 text-gold/25 animate-sparkle" style={{ animationDelay: '3s' }} />
          <Star className="absolute top-[85%] right-[8%] w-3 h-3 text-gold/30 animate-float" style={{ animationDelay: '3.5s' }} />
        </div>
      )}

      {/* Main slot machine frame */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top decorative border with lights */}
        <div className="relative">
          <div className="h-3 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
          <div className="h-1 bg-gradient-to-r from-gold/50 via-gold-light to-gold/50" />
          
          {/* Marquee lights - top */}
          <div className="absolute top-0 left-0 right-0 flex justify-center gap-8 -translate-y-1/2">
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
        </div>

        {/* Content area with side borders */}
        <div className="flex-1 flex relative">
          {/* Left decorative border */}
          <div className="hidden md:block w-4 relative">
            <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-b from-gold-dark via-gold to-gold-dark" />
            <div className="absolute inset-y-0 left-3 w-1 bg-gradient-to-b from-gold/50 via-gold-light to-gold/50" />
            
            {/* Side lights - left */}
            <div className="absolute top-8 bottom-8 left-0 flex flex-col justify-around items-center">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full animate-bulb-flash"
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    background: i % 2 === 0 
                      ? 'radial-gradient(circle, hsl(45 100% 60%) 0%, hsl(45 100% 45%) 100%)' 
                      : 'radial-gradient(circle, hsl(145 80% 50%) 0%, hsl(145 80% 35%) 100%)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-slot-inner relative">
            {/* Inner shadow/glow effects */}
            <div className="absolute inset-0 shadow-inner-slot pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>

          {/* Right decorative border */}
          <div className="hidden md:block w-4 relative">
            <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-b from-gold-dark via-gold to-gold-dark" />
            <div className="absolute inset-y-0 right-3 w-1 bg-gradient-to-b from-gold/50 via-gold-light to-gold/50" />
            
            {/* Side lights - right */}
            <div className="absolute top-8 bottom-8 right-0 flex flex-col justify-around items-center">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full animate-bulb-flash"
                  style={{ 
                    animationDelay: `${(i * 0.2) + 0.1}s`,
                    background: i % 2 === 0 
                      ? 'radial-gradient(circle, hsl(145 80% 50%) 0%, hsl(145 80% 35%) 100%)' 
                      : 'radial-gradient(circle, hsl(45 100% 60%) 0%, hsl(45 100% 45%) 100%)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom decorative border with lights */}
        <div className="relative">
          <div className="h-1 bg-gradient-to-r from-gold/50 via-gold-light to-gold/50" />
          <div className="h-3 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
          
          {/* Marquee lights - bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 translate-y-1/2">
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

          {/* Bottom decorative icons */}
          <div className="absolute bottom-full left-0 right-0 flex justify-center items-center gap-4 py-2">
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
        </div>
      </div>
    </div>
  );
}
