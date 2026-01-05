import { MessageCircle, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppShareButtonProps {
    referralCode?: string;
    prizeDescription?: string;
    raffleName?: string;
}

export function WhatsAppShareButton({
    referralCode,
    prizeDescription = 'prêmios incríveis',
    raffleName = 'Rifa da Sorte'
}: WhatsAppShareButtonProps) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const baseUrl = window.location.origin;
    const shareUrl = referralCode
        ? `${baseUrl}/?ref=${referralCode}`
        : baseUrl;

    const shareMessage = `🍀 *${raffleName}* 🍀

Estou participando e você também pode ganhar ${prizeDescription}! 🎁

✨ Clique no link e garanta seus números da sorte:
${shareUrl}

Boa sorte! 🤞`;

    const handleWhatsAppShare = () => {
        const encodedMessage = encodeURIComponent(shareMessage);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast({
                title: '🔗 Link copiado!',
                description: 'Compartilhe com seus amigos.',
            });
            setTimeout(() => setCopied(false), 3000);
        } catch {
            toast({
                title: 'Erro ao copiar',
                description: 'Tente novamente.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* WhatsApp Button - Primary */}
            <Button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-6 text-base shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 transition-all transform hover:-translate-y-0.5"
            >
                <MessageCircle className="w-5 h-5 mr-2 fill-current" />
                Compartilhar no WhatsApp
            </Button>

            {/* Copy Link Button - Secondary */}
            <Button
                type="button"
                variant="outline"
                onClick={handleCopyLink}
                className="sm:w-auto border-gold/30 hover:border-gold hover:bg-gold/10 py-6"
            >
                {copied ? (
                    <>
                        <Check className="w-5 h-5 mr-2 text-emerald" />
                        Copiado!
                    </>
                ) : (
                    <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copiar Link
                    </>
                )}
            </Button>
        </div>
    );
}
