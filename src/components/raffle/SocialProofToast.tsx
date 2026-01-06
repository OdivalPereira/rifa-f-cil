import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRecentPurchasesPublic } from '@/hooks/useRaffle';

// Fallback locations (MS cities) for when no real location is available
const MS_CITIES = [
    'Dourados/MS', 'Campo Grande/MS', 'Três Lagoas/MS', 'Corumbá/MS',
    'Ponta Porã/MS', 'Naviraí/MS', 'Nova Andradina/MS', 'Aquidauana/MS',
    'Maracaju/MS', 'Paranaíba/MS', 'Sidrolândia/MS', 'Coxim/MS'
];

// Fallback names for when there aren't enough real purchases
const FALLBACK_PURCHASES = [
    { display_name: 'João S.', initials: 'JS', quantity: 10 },
    { display_name: 'Maria L.', initials: 'ML', quantity: 25 },
    { display_name: 'Carlos A.', initials: 'CA', quantity: 15 },
    { display_name: 'Ana P.', initials: 'AP', quantity: 50 },
    { display_name: 'Lucas M.', initials: 'LM', quantity: 8 },
];

interface SocialProofToastProps {
    enabled?: boolean;
    minInterval?: number; // minimum seconds between toasts
    maxInterval?: number; // maximum seconds between toasts
}

interface PublicPurchase {
    display_name: string;
    initials: string;
    location: string | null;
    quantity: number;
    created_at: string;
}

// Format relative time ago (pt-BR)
function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'agora';
    if (diffMins === 1) return 'há 1 min';
    if (diffMins < 60) return `há ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'há 1 hora';
    if (diffHours < 24) return `há ${diffHours} horas`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'há 1 dia';
    return `há ${diffDays} dias`;
}

// Get a random MS city for fallback location
function getRandomMSCity(): string {
    return MS_CITIES[Math.floor(Math.random() * MS_CITIES.length)];
}

export function useSocialProofToasts({
    enabled = true,
    minInterval = 15,
    maxInterval = 45,
}: SocialProofToastProps = {}) {
    const { toast } = useToast();
    const { data: realPurchases = [], isLoading } = useRecentPurchasesPublic();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Merge real purchases with fallbacks if needed (minimum 5 items for rotation)
    const purchases = useMemo(() => {
        const result: Array<PublicPurchase & { isFallback?: boolean }> = [...realPurchases];

        // If less than 5 real purchases, add fallbacks
        if (result.length < 5) {
            const needed = 5 - result.length;
            for (let i = 0; i < needed; i++) {
                const fallback = FALLBACK_PURCHASES[i % FALLBACK_PURCHASES.length];
                result.push({
                    ...fallback,
                    location: getRandomMSCity(),
                    created_at: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(), // Random within last 30min
                    isFallback: true,
                });
            }
        }

        return result;
    }, [realPurchases]);

    const showPurchaseToast = useCallback(() => {
        if (purchases.length === 0) return;

        const purchase = purchases[currentIndex % purchases.length];
        const location = purchase.location || getRandomMSCity();
        const timeAgo = formatTimeAgo(purchase.created_at);

        toast({
            title: `🎉 ${purchase.display_name} de ${location}`,
            description: `Comprou ${purchase.quantity} números ${timeAgo}!`,
            duration: 4000,
        });

        // Move to next purchase for rotation
        setCurrentIndex((prev) => (prev + 1) % purchases.length);
    }, [toast, purchases, currentIndex]);

    useEffect(() => {
        if (!enabled || isLoading) return;

        // Show first toast after a short delay (5 seconds)
        const initialTimeout = setTimeout(() => {
            showPurchaseToast();
        }, 5000);

        // Then show at random intervals
        let intervalId: NodeJS.Timeout;

        const scheduleNext = () => {
            const delay = (Math.random() * (maxInterval - minInterval) + minInterval) * 1000;
            intervalId = setTimeout(() => {
                showPurchaseToast();
                scheduleNext();
            }, delay);
        };

        // Start the interval loop after 8 seconds
        const startInterval = setTimeout(() => {
            scheduleNext();
        }, 8000);

        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(startInterval);
            clearTimeout(intervalId);
        };
    }, [enabled, isLoading, minInterval, maxInterval, showPurchaseToast]);

    return { showPurchaseToast };
}

// Standalone provider component for explicit rendering
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
