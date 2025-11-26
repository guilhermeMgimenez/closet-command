import { Store } from "lucide-react";

export function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl blur-2xl opacity-50 animate-pulse" />
          <div className="relative p-6 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-elevated animate-bounce">
            <Store className="h-16 w-16 text-primary-foreground" />
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-3">
          <h2 className="text-2xl font-bold text-gradient">Carregando...</h2>
          
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
