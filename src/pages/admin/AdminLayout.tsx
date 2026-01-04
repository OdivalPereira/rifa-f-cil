import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Ticket, 
  CreditCard, 
  Trophy, 
  LogOut, 
  Loader2,
  Home,
  Sparkles,
  Clover,
  Star,
  Users,
  MessageSquareShare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlotMachineFrame } from '@/components/SlotMachineFrame';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Gerenciar Rifa', url: '/admin/rifa', icon: Ticket },
  { title: 'Pagamentos', url: '/admin/pagamentos', icon: CreditCard },
  { title: 'Sorteio', url: '/admin/sorteio', icon: Trophy },
  { title: 'Clientes', url: '/admin/clientes', icon: Users },
  { title: 'Indicações', url: '/admin/referral-settings', icon: MessageSquareShare },
];

export default function AdminLayout() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <SlotMachineFrame>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-gold mx-auto" />
            <p className="text-gold/70">Carregando...</p>
          </div>
        </div>
      </SlotMachineFrame>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <SlotMachineFrame>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <span className="text-5xl">🔒</span>
              </div>
            </div>
            <h1 className="text-2xl font-display font-bold text-gradient-gold">Acesso Restrito</h1>
            <p className="text-muted-foreground">
              Você não tem permissão de administrador. Entre em contato com o responsável para solicitar acesso.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/">
                <Button className="btn-luck text-primary-foreground">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao site
                </Button>
              </Link>
              <Button onClick={signOut} variant="ghost" className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </SlotMachineFrame>
    );
  }

  return (
    <SlotMachineFrame showDecorations={false}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar className="border-r border-gold/20 bg-card/90 backdrop-blur-sm">
            {/* Logo */}
            <div className="p-4 border-b border-gold/20">
              <Link to="/admin" className="flex items-center gap-2">
                <Clover className="w-7 h-7 text-emerald clover-icon" />
                <span className="font-display font-bold text-gradient-gold">Admin</span>
              </Link>
            </div>
            
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="text-gold/60 text-xs uppercase tracking-wider">
                  Menu
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <Link 
                              to={item.url}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                isActive 
                                  ? 'bg-emerald/15 text-emerald border border-emerald/30 shadow-emerald' 
                                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                              )}
                            >
                              <item.icon className={cn('w-5 h-5', isActive && 'text-emerald')} />
                              <span className="font-medium">{item.title}</span>
                              {isActive && <Star className="w-3 h-3 text-gold ml-auto animate-sparkle" />}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <div className="mt-auto p-4 border-t border-gold/20 space-y-2">
              <Link to="/">
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-emerald hover:bg-emerald/10">
                  <Home className="w-4 h-4 mr-2" />
                  Ver site
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </Sidebar>

          <main className="flex-1 overflow-auto">
            <header className="h-14 border-b border-gold/20 bg-card/50 backdrop-blur-sm flex items-center px-4 sticky top-0 z-10">
              <SidebarTrigger className="mr-4 text-gold hover:text-gold/80" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Logado como:</span>
                <span className="text-emerald font-medium">{user.email}</span>
              </div>
            </header>
            <div className="p-6 min-h-[calc(100vh-3.5rem)]">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </SlotMachineFrame>
  );
}
