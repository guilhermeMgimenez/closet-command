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
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral da sua loja</p>
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

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">Produtos Recentes</h3>
            <Button onClick={() => navigate("/products")}>Ver Todos</Button>
          </div>

          <div className="space-y-4">
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum produto cadastrado ainda
              </p>
            ) : (
              products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={product.stock < 10 ? "warning" : "success"}>
                      {product.stock} un.
                    </Badge>
                    <p className="font-semibold text-foreground">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
