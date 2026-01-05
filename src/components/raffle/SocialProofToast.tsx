import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

// Brazilian first names for realistic feel
const FIRST_NAMES = [
    'João', 'Maria', 'José', 'Ana', 'Carlos', 'Juliana', 'Pedro', 'Fernanda',
    'Lucas', 'Amanda', 'Rafael', 'Camila', 'Thiago', 'Larissa', 'Bruno', 'Beatriz',
    'Felipe', 'Letícia', 'Gustavo', 'Mariana', 'Diego', 'Gabriela', 'Rodrigo', 'Isabela',
    'Marcelo', 'Patricia', 'André', 'Renata', 'Eduardo', 'Carolina'
];

// Brazilian state abbreviations
const STATES = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'SC', 'PE', 'CE', 'GO', 'DF', 'PA', 'MA', 'MT', 'ES'];

// Time phrases
const TIME_PHRASES = ['agora', 'há 1 min', 'há 2 min', 'há 3 min', 'há 5 min'];

interface SocialProofToastProps {
    enabled?: boolean;
    minInterval?: number; // minimum seconds between toasts
    maxInterval?: number; // maximum seconds between toasts
    minQuantity?: number;
    maxQuantity?: number;
}

export function useSocialProofToasts({
    enabled = true,
    minInterval = 15,
    maxInterval = 45,
    minQuantity = 5,
    maxQuantity = 50
}: SocialProofToastProps = {}) {
    const { toast } = useToast();

    const showRandomToast = useCallback(() => {
        const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const state = STATES[Math.floor(Math.random() * STATES.length)];
        const quantity = Math.floor(Math.random() * (maxQuantity - minQuantity + 1)) + minQuantity;
        const time = TIME_PHRASES[Math.floor(Math.random() * TIME_PHRASES.length)];

        toast({
            title: `🎉 ${name} de ${state}`,
            description: `Comprou ${quantity} números ${time}!`,
            duration: 4000,
        });
    }, [toast, minQuantity, maxQuantity]);

    useEffect(() => {
        if (!enabled) return;

        // Show first toast after a short delay
        const initialTimeout = setTimeout(() => {
            showRandomToast();
        }, 5000);

        // Then show at random intervals
        let intervalId: NodeJS.Timeout;

        const scheduleNext = () => {
            const delay = (Math.random() * (maxInterval - minInterval) + minInterval) * 1000;
            intervalId = setTimeout(() => {
                showRandomToast();
                scheduleNext();
            }, delay);
        };

        const startInterval = setTimeout(() => {
            scheduleNext();
        }, 8000);

        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(startInterval);
            clearTimeout(intervalId);
        };
    }, [enabled, minInterval, maxInterval, showRandomToast]);

    return { showRandomToast };
}

// Standalone component for explicit rendering
export function SocialProofProvider({
    children,
    enabled = true
}: {
    children: React.ReactNode;
    enabled?: boolean;
}) {
    useSocialProofToasts({ enabled });
    return <>{children}</>;
}
