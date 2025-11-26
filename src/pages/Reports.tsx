import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Package, TrendingUp, ShoppingCart, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/molecules/StatCard";

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#ca8a04"];

export default function Reports() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Dados por categoria
  const categoryData = products.reduce((acc: any[], product) => {
    const category = product.category || "Sem Categoria";
    const existing = acc.find((item) => item.name === category);

    if (existing) {
      existing.quantidade += 1;
      existing.valor += product.price * product.stock;
    } else {
      acc.push({
        name: category,
        quantidade: 1,
        valor: product.price * product.stock,
      });
    }

    return acc;
  }, []);

  // Produtos com baixo estoque
  const lowStockData = products
    .filter((p) => p.stock < 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      estoque: p.stock,
    }));

  // Estatísticas gerais
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Relatórios</h2>
          <p className="text-muted-foreground">
            Análise detalhada do seu negócio
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Produtos"
            value={totalProducts}
            icon={Package}
          />
          <StatCard
            title="Valor em Estoque"
            value={`R$ ${totalValue.toFixed(2)}`}
            icon={TrendingUp}
          />
          <StatCard
            title="Total de Pedidos"
            value={totalOrders}
            icon={ShoppingCart}
          />
          <StatCard
            title="Receita Total"
            value={`R$ ${totalRevenue.toFixed(2)}`}
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Produtos por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, quantidade }) => `${name}: ${quantidade}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Valor em Estoque por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="valor" fill="#2563eb" name="Valor Total" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {lowStockData.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">
                Produtos com Estoque Baixo
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lowStockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="estoque"
                  fill="#ea580c"
                  name="Unidades em Estoque"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
