import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/atoms/Badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { z } from "zod";
import { format } from "date-fns";

const orderSchema = z.object({
  customer_name: z.string().trim().min(1, "Nome é obrigatório").max(200),
  customer_email: z.string().trim().email("Email inválido").max(255),
  customer_phone: z.string().trim().max(20).optional(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().positive(),
  })).min(1, "Adicione pelo menos um produto"),
});

const statusLabels = {
  pending: "Pendente",
  processing: "Processando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusVariants: Record<string, "default" | "warning" | "success" | "destructive"> = {
  pending: "warning",
  processing: "default",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
};

export default function Orders() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    status: "pending",
    items: [] as Array<{ product_id: string; quantity: number }>,
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const total = data.items.reduce((sum: number, item: any) => {
        const product = products.find(p => p.id === item.product_id);
        return sum + (product?.price || 0) * item.quantity;
      }, 0);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          status: data.status,
          total,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = data.items.map((item: any) => {
        const product = products.find(p => p.id === item.product_id);
        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: product?.price || 0,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Pedido criado com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar pedido");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      status: "pending",
      items: [],
    });
  };

  const addProduct = () => {
    if (products.length > 0) {
      setFormData({
        ...formData,
        items: [...formData.items, { product_id: products[0].id, quantity: 1 }],
      });
    }
  };

  const removeProduct = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast.error("Adicione pelo menos um produto");
      return;
    }

    createMutation.mutate(formData);
  };

  const viewOrderDetails = async (orderId: string) => {
    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select("*, products(*)")
      .eq("order_id", orderId);

    if (error) {
      toast.error("Erro ao carregar detalhes");
      return;
    }

    const order = orders.find((o) => o.id === orderId);
    setSelectedOrder({ ...order, items: orderItems });
    setViewOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Pedidos</h2>
            <p className="text-muted-foreground">Gerencie os pedidos da sua loja</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Pedido</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Nome do Cliente *</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_email">Email *</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customer_phone">Telefone</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Produtos *</Label>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={item.product_id} className="flex gap-2">
                        <Select
                          value={item.product_id}
                          onValueChange={(value) => {
                            const newItems = [...formData.items];
                            newItems[index].product_id = value;
                            setFormData({ ...formData, items: newItems });
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - R$ {product.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].quantity = Number.parseInt(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="w-24"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeProduct(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addProduct} className="w-full">
                      + Adicionar Produto
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Criar Pedido
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            {/* Refatoração: extrai o ternário para uma variável */}
            {(() => {
              let tableRows;
              if (isLoading) {
                tableRows = (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                );
              } else if (orders.length === 0) {
                tableRows = (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum pedido cadastrado
                    </TableCell>
                  </TableRow>
                );
              } else {
                tableRows = orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{order.customer_email}</TableCell>
                    <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(status) =>
                          updateStatusMutation.mutate({ id: order.id, status })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <Badge variant={statusVariants[order.status]}>
                            {statusLabels[order.status as keyof typeof statusLabels]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{format(new Date(order.created_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewOrderDetails(order.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ));
              }
              return <TableBody>{tableRows}</TableBody>;
            })()}
          </Table>
        </div>

        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Produtos</p>
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between py-2 border-b">
                      <span>{item.products.name} x{item.quantity}</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>R$ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
