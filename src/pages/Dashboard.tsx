import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { StatCard } from "@/components/molecules/StatCard";
import { Package, TrendingUp, AlertCircle, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
  });

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock < 10).length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground text-lg">Visão geral da sua loja</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Produtos"
            value={totalProducts}
            icon={Package}
            trend={{ value: "12%", isPositive: true }}
          />
          <StatCard
            title="Valor em Estoque"
            value={`R$ ${totalValue.toFixed(2)}`}
            icon={TrendingUp}
            trend={{ value: "8%", isPositive: true }}
          />
          <StatCard
            title="Estoque Baixo"
            value={lowStockProducts}
            icon={AlertCircle}
            className="border-warning/20"
          />
          <StatCard
            title="Categorias"
            value={new Set(products.map((p) => p.category)).size}
            icon={ShoppingBag}
          />
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">Produtos Recentes</h3>
                <p className="text-muted-foreground">Últimos produtos adicionados ao catálogo</p>
              </div>
              <Button 
                onClick={() => navigate("/products")}
                className="shadow-lg hover:shadow-xl transition-all"
              >
                Ver Todos
              </Button>
            </div>

            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Nenhum produto cadastrado ainda
                  </p>
                </div>
              ) : (
                products.slice(0, 5).map((product, index) => (
                  <div
                    key={product.id}
                    className="group flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-muted/30 to-transparent border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Package className="h-7 w-7 text-primary" />
                        </div>
                        <div className="absolute inset-0 bg-primary/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-lg mb-1">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Badge 
                        variant={product.stock < 10 ? "warning" : "success"}
                        className="text-sm font-semibold px-3 py-1.5"
                      >
                        {product.stock} un.
                      </Badge>
                      <p className="font-bold text-foreground text-xl">
                        R$ {product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
