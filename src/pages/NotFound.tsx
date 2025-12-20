import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SlotMachineFrame } from "@/components/SlotMachineFrame";
import { Home, AlertTriangle, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <SlotMachineFrame>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          {/* Decorative elements */}
          <div className="absolute top-20 left-1/4 text-gold/20 animate-float">
            <Star className="w-8 h-8" />
          </div>
          <div className="absolute top-32 right-1/4 text-emerald/20 animate-float" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-6 h-6" />
          </div>
          
          {/* 404 Display */}
          <div className="relative">
            <div className="text-[150px] font-display font-bold text-gradient-luck leading-none">
              404
            </div>
            <div className="absolute -top-4 -right-4 text-gold animate-sparkle">
              <AlertTriangle className="w-12 h-12" />
            </div>
          </div>
          
          {/* Message */}
          <div className="space-y-4">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Opa! Página não encontrada
            </h1>
            <p className="text-muted-foreground">
              Parece que essa página saiu para tentar a sorte em outro lugar... 🍀
            </p>
          </div>
          
          {/* Card with actions */}
          <div className="card-jackpot p-6 rounded-xl border border-gold/20 space-y-4">
            <div className="flex items-center justify-center gap-2 text-gold">
              <span className="text-2xl">🎰</span>
              <span className="font-medium">Não desanime!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Volte para a página inicial e tente sua sorte na rifa!
            </p>
            
            <Button asChild className="btn-luck w-full py-6 text-lg">
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Voltar ao Início
                <Sparkles className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          {/* Footer decoration */}
          <div className="flex items-center justify-center gap-3 text-muted-foreground/50">
            <span>💰</span>
            <span>💎</span>
            <span>⭐</span>
            <span>🍀</span>
            <span>💰</span>
          </div>
        </div>
      </div>
    </SlotMachineFrame>
  );
};

export default NotFound;