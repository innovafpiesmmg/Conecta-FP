import { useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Briefcase, Loader2, Lock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b">
          <div className="max-w-7xl mx-auto flex items-center gap-2 px-4 py-3 sm:px-6">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
                  <Briefcase className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg tracking-tight">FP Empleo</span>
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md p-6 sm:p-8 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Enlace invalido</h2>
            <p className="text-muted-foreground mb-4">El enlace de restablecimiento no es valido.</p>
            <Link href="/forgot-password">
              <Button variant="outline" className="w-full">Solicitar nuevo enlace</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Las contrasenas no coinciden", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Error", description: "La contrasena debe tener al menos 8 caracteres", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token, password });
      setStatus("success");
    } catch {
      setStatus("error");
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
          {status === "success" ? (
            <div className="text-center space-y-4" data-testid="reset-success">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto" />
              <h2 className="text-xl font-bold">Contrasena restablecida</h2>
              <p className="text-muted-foreground">Tu contrasena ha sido actualizada correctamente.</p>
              <Link href="/login">
                <Button className="w-full" data-testid="button-go-login">Iniciar sesion</Button>
              </Link>
            </div>
          ) : status === "error" ? (
            <div className="text-center space-y-4" data-testid="reset-error">
              <XCircle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-xl font-bold">Error</h2>
              <p className="text-muted-foreground">El enlace ha expirado o no es valido.</p>
              <Link href="/forgot-password">
                <Button variant="outline" className="w-full" data-testid="button-request-new">Solicitar nuevo enlace</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h1 className="text-2xl font-bold mb-1">Nueva contrasena</h1>
                <p className="text-muted-foreground text-sm">Introduce tu nueva contrasena.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contrasena</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Minimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contrasena</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repite la contrasena"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    data-testid="input-confirm-password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-reset-submit">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Restablecer contrasena"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
