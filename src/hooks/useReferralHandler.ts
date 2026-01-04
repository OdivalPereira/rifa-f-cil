import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const useReferralHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    // Avoid running twice in strict mode dev if already processed
    if (processedRef.current) return;

    const refCode = searchParams.get('ref');

    if (refCode) {
      const storedRef = localStorage.getItem('rifa_referrer');

      // Only save if no referrer is currently stored (First Click Wins / No Overwrite)
      if (!storedRef) {
        localStorage.setItem('rifa_referrer', refCode);
        console.log(`Código de indicação capturado: ${refCode}`);
        toast.success('Indicação registrada com sucesso! Boa sorte 🍀');
      }

      // Cleanup URL: Remove 'ref' parameter
      // We create a new URLSearchParams object to avoid mutating the current state directly before the update
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('ref');
      setSearchParams(newSearchParams, { replace: true });

      processedRef.current = true;
    }
  }, [searchParams, setSearchParams]);
};
