import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquareShare, Save, Smartphone, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Interface for settings
interface ReferralSettings {
  shareTitle: string;
  shareMessage: string;
  promoVideoUrl: string;
}

const DEFAULT_SETTINGS: ReferralSettings = {
  shareTitle: "Participe da Rifa!",
  shareMessage: "Olá! Estou participando dessa rifa incrível. Compre seus números através do meu link e me ajude a ganhar: {{link}}",
  promoVideoUrl: ""
};

export default function AdminReferralSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ReferralSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin_referral_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleChange = (field: keyof ReferralSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('admin_referral_settings', JSON.stringify(settings));
    setHasChanges(false);
    toast({
      title: "Configurações salvas",
      description: "As mensagens de indicação foram atualizadas com sucesso.",
    });
  };

  // Mock data for preview
  const previewData = {
    link: "rifa.app/joao.silva",
    nome: "João Silva"
  };

  const previewMessage = settings.shareMessage
    .replace('{{link}}', previewData.link)
    .replace('{{nome}}', previewData.nome);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient-gold">Configuração de Indicações</h1>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="btn-luck"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Column */}
        <Card className="border-gold/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareShare className="w-5 h-5 text-gold" />
              <span>Personalizar Mensagem</span>
            </CardTitle>
            <CardDescription>
              Defina o texto padrão que será enviado pelos usuários.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shareTitle">Título do Compartilhamento</Label>
              <Input
                id="shareTitle"
                value={settings.shareTitle}
                onChange={(e) => handleChange('shareTitle', e.target.value)}
                placeholder="Ex: Ganhe uma viagem!"
                className="bg-black/20 border-gold/10 focus:border-gold/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shareMessage">Mensagem do WhatsApp/Social</Label>
              <Textarea
                id="shareMessage"
                value={settings.shareMessage}
                onChange={(e) => handleChange('shareMessage', e.target.value)}
                placeholder="Digite a mensagem..."
                className="min-h-[150px] bg-black/20 border-gold/10 focus:border-gold/50"
              />
              <p className="text-xs text-muted-foreground">
                Use <span className="text-emerald font-mono">{"{{link}}"}</span> para o link da rifa e <span className="text-emerald font-mono">{"{{nome}}"}</span> para o nome do usuário.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoVideo">Link do Vídeo Promocional (Opcional)</Label>
              <Input
                id="promoVideo"
                value={settings.promoVideoUrl}
                onChange={(e) => handleChange('promoVideoUrl', e.target.value)}
                placeholder="Ex: YouTube, Instagram..."
                className="bg-black/20 border-gold/10 focus:border-gold/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Column */}
        <div className="space-y-6">
          <Card className="border-gold/20 bg-card/50 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-gold" />
                <span>Visualização (Preview)</span>
              </CardTitle>
              <CardDescription>
                Simulação de como a mensagem aparecerá no WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* WhatsApp Chat Simulation */}
              <div className="bg-[#e5ddd5] dark:bg-[#0b141a] rounded-xl p-4 min-h-[400px] flex flex-col relative overflow-hidden">
                {/* Chat Background Pattern (CSS Gradient as simple pattern) */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Message Bubble */}
                <div className="relative bg-[#dcf8c6] dark:bg-[#005c4b] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[90%] self-end mb-2 ml-auto text-black dark:text-white">
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {previewMessage.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                      part.match(/https?:\/\/[^\s]+/) || part.includes('rifa.app') ?
                        <span key={i} className="text-[#039be5] hover:underline cursor-pointer">{part}</span> :
                        part
                    )}
                  </div>

                  {/* Metadata Preview (Simulated) */}
                  {(settings.shareTitle || settings.promoVideoUrl) && (
                     <div className="mt-2 bg-black/5 dark:bg-black/20 rounded overflow-hidden text-xs">
                        {settings.promoVideoUrl && (
                          <div className="h-24 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-muted-foreground">
                            Preview do Vídeo
                          </div>
                        )}
                        <div className="p-2">
                          <p className="font-bold truncate">{settings.shareTitle}</p>
                          <p className="opacity-80 truncate">rifa.app</p>
                        </div>
                     </div>
                  )}

                  <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                    <span className="text-[10px]">14:30</span>
                    <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
