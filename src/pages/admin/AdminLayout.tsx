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
  Home
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background pattern-luxury p-4">
        <div className="text-center space-y-4 max-w-md">
          <Ticket className="w-16 h-16 text-gold/50 mx-auto" />
          <h1 className="text-2xl font-display font-semibold">Acesso Restrito</h1>
          <p className="text-muted-foreground">
            Você não tem permissão de administrador. Entre em contato com o responsável para solicitar acesso.
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/">
              <Button variant="outline">Voltar ao site</Button>
            </Link>
            <Button onClick={signOut} variant="ghost">
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
          <div className="p-4 border-b border-border">
            <Link to="/admin" className="flex items-center gap-2">
              <Ticket className="w-6 h-6 text-gold" />
              <span className="font-display font-semibold">Admin</span>
            </Link>
          </div>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
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
                              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                              isActive 
                                ? 'bg-gold/10 text-gold' 
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            )}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
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
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Home className="w-4 h-4 mr-2" />
                Ver site
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="w-full justify-start text-muted-foreground"
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
              Logado como: <span className="text-foreground">{user.email}</span>
            </span>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
