import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useState } from "react";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  description: z.string().trim().max(500).optional(),
});

export default function Categories() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category");

      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("categories").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria criada com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate key")) {
        toast.error("Já existe uma categoria com este nome");
      } else {
        toast.error("Erro ao criar categoria");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria atualizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar categoria");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria removida com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover categoria");
    },
  });

  const getProductCount = (categoryName: string) => {
    return products.filter((p) => p.category === categoryName).length;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = categorySchema.safeParse(formData);

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    createMutation.mutate(validation.data);
  };

  let tableRows;
  if (isLoading) {
    tableRows = (
      <TableRow>
        <TableCell colSpan={4} className="text-center py-8">
          Carregando...
        </TableCell>
      </TableRow>
    );
  } else if (categories.length === 0) {
    tableRows = (
      <TableRow>
        <TableCell
          colSpan={4}
          className="text-center py-8 text-muted-foreground"
        >
          Nenhuma categoria cadastrada
        </TableCell>
      </TableRow>
    );
  } else {
    tableRows = categories.map((category) => (
      <TableRow key={category.id}>
        <TableCell className="font-medium">{category.name}</TableCell>
        <TableCell className="text-muted-foreground">
          {category.description || "-"}
        </TableCell>
        <TableCell>
          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
            {getProductCount(category.name)} produtos
          </span>
        </TableCell>
        <TableCell className="text-right">
          <div className={styles.actionButtons}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate(category.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Categorias</h2>
            <p className={styles.subtitle}>
              Organize seus produtos por categorias
            </p>
          </div>
          
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Camisetas"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descreva a categoria (opcional)"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Criar Categoria
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className={styles.tableWrapper}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{tableRows}</TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  container: "space-y-6",
  header: "flex items-center justify-between",
  title: "text-3xl font-bold text-foreground",
  subtitle: "text-muted-foreground",
  tableWrapper: "bg-card rounded-lg border border-border",
  badgeWrapper: "text-sm bg-primary/10 text-primary px-2 py-1 rounded",
  actionButtons: "flex justify-end gap-2",
};
