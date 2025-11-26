import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { Store } from "lucide-react";
import { Loading } from "@/components/atoms/Loading";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setRedirecting(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setRedirecting(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLoginError = (error: any) => {
    if (error.message.includes("Invalid login credentials")) {
      toast.error("Email ou senha incorretos");
    } else {
      toast.error(error.message);
    }
  };

  const handleSignupError = (error: any) => {
    if (error.message.includes("already registered")) {
      toast.error("Este email já está cadastrado");
    } else {
      toast.error(error.message);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      handleLoginError(error);
      return false;
    }
    toast.success("Login realizado com sucesso!");
    return true;
  };

  const handleSignup = async (email: string, password: string) => {
    const redirectUrl = `${globalThis.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    if (error) {
      handleSignupError(error);
      return false;
    }
    toast.success("Cadastro realizado! Você já pode fazer login.");
    setIsLogin(true);
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await handleLogin(validation.data.email, validation.data.password);
      } else {
        await handleSignup(validation.data.email, validation.data.password);
      }
    } catch (error) {
      toast.error("Erro ao processar requisição");
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.radialGradient} />
      <div className={styles.floatBlob1} />
      <div className={styles.floatBlob2} style={{ animationDelay: '2s' }} />
      
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconBg} />
            <div className={styles.iconBox}>
              <Store className={styles.icon} />
            </div>
          </div>
          <div className={styles.titleBox}>
            <h1 className={styles.title}>Admin Store</h1>
            <p className={styles.subtitle}>
              {isLogin ? "Entre com sua conta" : "Crie sua conta"}
            </p>
          </div>
        </div>

        <form onSubmit={handleAuth} className={styles.form}>
          <div className={styles.inputGroup}>
            <Label htmlFor="email" className={styles.label}>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <Label htmlFor="password" className={styles.label}>Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {(() => {
            let buttonText;
            if (loading) {
              buttonText = "Carregando...";
            } else if (isLogin) {
              buttonText = "Entrar";
            } else {
              buttonText = "Cadastrar";
            }
            return (
              <Button 
                type="submit" 
                className={styles.submitButton} 
                disabled={loading}
              >
                {buttonText}
              </Button>
            );
          })()}
        </form>

        <div className={styles.toggleBox}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className={styles.toggleButton}
          >
            {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
          </button>
        </div>
      </Card>
    </div>
  );
}

// Styles
const styles = {
  container: "min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 relative overflow-hidden",
  radialGradient: "absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]",
  floatBlob1: "absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float",
  floatBlob2: "absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float",
  card: "relative w-full max-w-md p-10 space-y-8 glass-effect shadow-elevated",
  header: "flex flex-col items-center space-y-4",
  iconWrapper: "relative",
  iconBg: "absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-lg opacity-50",
  iconBox: "relative p-4 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg",
  icon: "h-10 w-10 text-primary-foreground",
  titleBox: "text-center space-y-2",
  title: "text-4xl font-bold text-gradient",
  subtitle: "text-muted-foreground",
  form: "space-y-5",
  inputGroup: "space-y-2",
  label: "text-sm font-semibold",
  input: "h-12 bg-background/50",
  submitButton: "w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all",
  toggleBox: "text-center",
  toggleButton: "text-sm text-primary hover:text-primary-glow font-medium transition-colors",
};

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }).max(100),
});
