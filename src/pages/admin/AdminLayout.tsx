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
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Gerenciar Rifa', url: '/admin/rifa', icon: Ticket },
  { title: 'Pagamentos', url: '/admin/pagamentos', icon: CreditCard },
  { title: 'Sorteio', url: '/admin/sorteio', icon: Trophy },
];

export default function AdminLayout() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pattern-casino">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background pattern-casino p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative inline-block">
            <span className="text-6xl">🔒</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-gradient-luck">Acesso Restrito</h1>
          <p className="text-muted-foreground">
            Você não tem permissão de administrador. Entre em contato com o responsável para solicitar acesso.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/">
              <Button variant="outline" className="border-emerald/30 hover:border-emerald">
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
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border bg-card">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-2xl">🍀</span>
              <span className="font-display font-bold text-gradient-luck">Admin</span>
            </Link>
          </div>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground">Menu</SidebarGroupLabel>
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
                                ? 'bg-emerald/10 text-emerald border border-emerald/30 glow-emerald' 
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            )}
                          >
                            <item.icon className={cn('w-5 h-5', isActive && 'text-emerald')} />
                            <span className="font-medium">{item.title}</span>
                            {isActive && <Sparkles className="w-3 h-3 text-gold ml-auto" />}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="mt-auto p-4 border-t border-border space-y-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-emerald">
                <Home className="w-4 h-4 mr-2" />
                Ver site
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="w-full justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm text-muted-foreground">
              Logado como: <span className="text-emerald font-medium">{user.email}</span>
            </span>
          </header>
          <div className="p-6 pattern-luck min-h-[calc(100vh-3.5rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
