import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRecentPurchasesPublic } from '@/hooks/useRaffle';

interface SocialProofToastProps {
    enabled?: boolean;
    minInterval?: number; // minimum seconds between toasts
    maxInterval?: number; // maximum seconds between toasts
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

export function useSocialProofToasts({
    enabled = true,
    minInterval = 15,
    maxInterval = 45,
}: SocialProofToastProps = {}) {
    const { toast } = useToast();
    const { data: realPurchases = [], isLoading } = useRecentPurchasesPublic();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter real purchases
    const purchases = useMemo(() => realPurchases, [realPurchases]);

    const showPurchaseToast = useCallback(() => {
        if (purchases.length === 0) return;

        const purchase = purchases[currentIndex % purchases.length];
        const location = purchase.location || 'Local não informado';
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
