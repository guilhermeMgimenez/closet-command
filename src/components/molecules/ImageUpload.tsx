import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export const ImageUpload = ({ value, onChange, onRemove }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5242880) {
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao enviar imagem");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
          <img
            src={value}
            alt="Product"
            className="w-full h-full object-cover"
          />
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-border rounded-lg p-8",
            "flex flex-col items-center justify-center space-y-2",
            "hover:border-primary transition-colors cursor-pointer"
          )}
        >
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhuma imagem selecionada
          </p>
        </div>
      )}

      <div>
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => document.getElementById("image-upload")?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Enviando..." : "Escolher Imagem"}
        </Button>
      </div>
    </div>
  );
};
