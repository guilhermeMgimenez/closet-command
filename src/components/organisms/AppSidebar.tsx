import { LayoutDashboard, Package, LogOut, Menu, ShoppingCart, BarChart3, FolderKanban } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Produtos", url: "/products", icon: Package },
  { title: "Categorias", url: "/categories", icon: FolderKanban },
  { title: "Pedidos", url: "/orders", icon: ShoppingCart },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      navigate("/auth");
      toast.success("Logout realizado com sucesso");
    }
  };

  return (
    <Sidebar className={isCollapsed ? "w-[80px]" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-sidebar-background to-sidebar-background/95">
        <div className={cn("p-4 border-b border-sidebar-border/50", isCollapsed && "px-2")}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-xl shadow-lg">
                <Menu className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/80 bg-clip-text text-transparent">
                Admin Store
              </h2>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center">
              <div className="p-2 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-xl shadow-lg">
                <Menu className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        <SidebarGroup className="mt-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60 font-semibold px-4">
              Menu Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn("space-y-1", isCollapsed ? "px-2" : "px-2")}>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="group"
                  >
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-sidebar-accent/50",
                        isCollapsed ? "justify-center px-0" : "px-3"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-200 flex-shrink-0",
                        location.pathname === item.url 
                          ? "bg-sidebar-primary shadow-lg shadow-sidebar-primary/30" 
                          : "bg-sidebar-accent/50 group-hover:bg-sidebar-accent"
                      )}>
                        <item.icon className={cn(
                          "h-4 w-4 transition-colors",
                          location.pathname === item.url 
                            ? "text-sidebar-primary-foreground" 
                            : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                        )} />
                      </div>
                      {!isCollapsed && (
                        <span className={cn(
                          "font-medium transition-colors",
                          location.pathname === item.url 
                            ? "text-sidebar-foreground" 
                            : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                        )}>
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className={cn("mt-auto p-4 border-t border-sidebar-border/50", isCollapsed && "px-2")}>
          <Button
            variant="ghost"
            className={cn(
              "w-full text-sidebar-foreground hover:bg-sidebar-accent rounded-xl transition-all duration-200",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={handleLogout}
          >
            <div className="p-2 rounded-lg bg-sidebar-accent/50 flex-shrink-0">
              <LogOut className="h-4 w-4" />
            </div>
            {!isCollapsed && <span className="ml-3 font-medium">Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
