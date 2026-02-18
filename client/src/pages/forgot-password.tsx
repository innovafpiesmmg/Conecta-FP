import { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Briefcase, Loader2, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setSent(true);
    } catch {
      toast({ title: "Error", description: "Error al procesar la solicitud", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-2 px-4 py-3 sm:px-6">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight">FP Empleo</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-6 sm:p-8">
          {sent ? (
            <div className="text-center space-y-4" data-testid="forgot-sent">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto" />
              <h2 className="text-xl font-bold">Correo enviado</h2>
              <p className="text-muted-foreground">
                Si existe una cuenta con el email <strong>{email}</strong>, recibiras un correo con instrucciones para restablecer tu contrasena.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full" data-testid="button-back-login">Volver al inicio de sesion</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Mail className="w-10 h-10 text-primary mx-auto mb-3" />
                <h1 className="text-2xl font-bold mb-1">Recuperar contrasena</h1>
                <p className="text-muted-foreground text-sm">
                  Introduce tu email y te enviaremos un enlace para restablecer tu contrasena.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-forgot-email"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || !email} data-testid="button-forgot-submit">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar enlace de recuperacion"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link href="/login">
                  <span className="text-primary cursor-pointer font-medium" data-testid="link-login">Volver al inicio de sesion</span>
                </Link>
              </p>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
