import { ReactNode } from 'react';
import {
  SlotMachineBackground,
  FloatingParticles,
  MarqueeLights,
  SideLights,
  BottomIcons
} from './SlotMachineDecorations';

interface SlotMachineFrameProps {
  children: ReactNode;
  showDecorations?: boolean;
}

export function SlotMachineFrame({ children, showDecorations = true }: SlotMachineFrameProps) {
  return (
    <div className="min-h-screen w-full bg-slot-background relative overflow-hidden">
      {/* Background effects */}
      <SlotMachineBackground />

      {/* Floating particles */}
      {showDecorations && <FloatingParticles />}

      {/* Main slot machine frame */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top decorative border with lights */}
        <div className="relative">
          <div className="h-3 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
          <div className="h-1 bg-gradient-to-r from-gold/50 via-gold-light to-gold/50" />
          
          {/* Marquee lights - top */}
          <MarqueeLights position="top" />
        </div>

        {/* Content area with side borders */}
        <div className="flex-1 flex relative">
          {/* Left decorative border */}
          <div className="hidden md:block w-4 relative">
            <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-b from-gold-dark via-gold to-gold-dark" />
            <div className="absolute inset-y-0 left-3 w-1 bg-gradient-to-b from-gold/50 via-gold-light to-gold/50" />
            
            {/* Side lights - left */}
            <SideLights side="left" />
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
            <SideLights side="right" />
          </div>
        </div>

        {/* Bottom decorative border with lights */}
        <div className="relative">
          <div className="h-1 bg-gradient-to-r from-gold/50 via-gold-light to-gold/50" />
          <div className="h-3 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
          
          {/* Marquee lights - bottom */}
          <MarqueeLights position="bottom" />

          {/* Bottom decorative icons */}
          <BottomIcons />
        </div>
      </div>
    </div>
  );
}
