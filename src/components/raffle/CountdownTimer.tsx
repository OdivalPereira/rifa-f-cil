import { useState, useEffect } from 'react';
import { Timer, Flame } from 'lucide-react';

interface CountdownTimerProps {
    targetDate: string;
    label?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function CountdownTimer({ targetDate, label = 'Sorteio em' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const difference = target - now;

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            // Urgent if less than 3 days
            setIsUrgent(days < 3);

            return { days, hours, minutes, seconds };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const TimeBlock = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div className={`
        w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-display text-2xl sm:text-3xl font-bold
        ${isUrgent
                    ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
                    : 'bg-gold/10 text-gold border border-gold/30'
                }
        transition-all duration-300
      `}>
                {value.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase mt-1 font-medium">
                {label}
            </span>
        </div>
    );

    const Separator = () => (
        <div className={`text-2xl font-bold ${isUrgent ? 'text-red-400' : 'text-gold'} animate-pulse`}>
            :
        </div>
    );

    return (
        <div className={`
      p-4 sm:p-5 rounded-2xl border-2 transition-all duration-500
      ${isUrgent
                ? 'bg-red-500/5 border-red-500/30 animate-pulse'
                : 'bg-gold/5 border-gold/20'
            }
    `}>
            {/* Label */}
            <div className="flex items-center justify-center gap-2 mb-3">
                {isUrgent ? (
                    <Flame className="w-4 h-4 text-red-400 animate-bounce" />
                ) : (
                    <Timer className="w-4 h-4 text-gold" />
                )}
                <span className={`text-sm font-semibold uppercase tracking-wider ${isUrgent ? 'text-red-400' : 'text-gold'}`}>
                    {isUrgent ? '🔥 Últimos dias!' : label}
                </span>
            </div>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
                <TimeBlock value={timeLeft.days} label="Dias" />
                <Separator />
                <TimeBlock value={timeLeft.hours} label="Horas" />
                <Separator />
                <TimeBlock value={timeLeft.minutes} label="Min" />
                <Separator />
                <TimeBlock value={timeLeft.seconds} label="Seg" />
            </div>
        </div>
    );
}
