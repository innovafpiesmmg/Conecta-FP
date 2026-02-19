import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Briefcase, Loader2, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totpStep, setTotpStep] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [totpSubmitting, setTotpSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setUnverifiedEmail(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const body = await res.json();

      if (res.status === 403 && body.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(body.email || data.email);
        return;
      }

      if (!res.ok) {
        toast({ title: "Error", description: body.message || "Credenciales inválidas", variant: "destructive" });
        return;
      }

      if (body.totpRequired) {
        setTotpStep(true);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Bienvenido/a", description: "Inicio de sesión correcto" });
    } catch {
      toast({ title: "Error", description: "Error al iniciar sesión", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpSubmitting(true);
    try {
      const res = await fetch("/api/auth/totp/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode }),
        credentials: "include",
      });
      const body = await res.json();

      if (!res.ok) {
        toast({ title: "Error", description: body.message || "Código inválido", variant: "destructive" });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Bienvenido/a", description: "Inicio de sesión correcto" });
    } catch {
      toast({ title: "Error", description: "Error al verificar código", variant: "destructive" });
    } finally {
      setTotpSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendingVerification(true);
    try {
      await apiRequest("POST", "/api/auth/resend-verification", { email: unverifiedEmail });
      toast({ title: "Correo enviado", description: "Se ha reenviado el correo de verificación" });
    } catch {
      toast({ title: "Error", description: "Error al reenviar verificación", variant: "destructive" });
    } finally {
      setResendingVerification(false);
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
              <span className="font-semibold text-lg tracking-tight">Conecta FP</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-6 sm:p-8">
          {unverifiedEmail ? (
            <div className="text-center space-y-4" data-testid="unverified-email-notice">
              <Mail className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-xl font-bold">Verifica tu correo electrónico</h2>
              <p className="text-muted-foreground">
                Tu cuenta aún no ha sido verificada. Revisa tu bandeja de entrada en <strong>{unverifiedEmail}</strong> y haz clic en el enlace de verificación.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                data-testid="button-resend-verification"
              >
                {resendingVerification ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Reenviar correo de verificación
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setUnverifiedEmail(null)} data-testid="button-back-login-form">
                Volver al inicio de sesión
              </Button>
            </div>
          ) : totpStep ? (
            <div data-testid="totp-step">
              <div className="text-center mb-6">
                <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
                <h1 className="text-2xl font-bold mb-1">Verificación en dos pasos</h1>
                <p className="text-muted-foreground text-sm">Introduce el código de tu aplicación de autenticación.</p>
              </div>

              <form onSubmit={handleTotpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totp-code">Código de autenticación</Label>
                  <Input
                    id="totp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                    data-testid="input-totp-code"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={totpSubmitting || totpCode.length !== 6} data-testid="button-totp-submit">
                  {totpSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar"}
                </Button>
              </form>

              <Button variant="ghost" className="w-full mt-4" onClick={() => { setTotpStep(false); setTotpCode(""); }} data-testid="button-back-login">
                Volver al inicio de sesión
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-1">Iniciar Sesion</h1>
                <p className="text-muted-foreground text-sm">Accede a tu cuenta en Conecta FP</p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    data-testid="input-email"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link href="/forgot-password">
                      <span className="text-xs text-primary cursor-pointer" data-testid="link-forgot-password">Has olvidado tu contraseña?</span>
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tu contraseña"
                    data-testid="input-password"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-login">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Iniciar Sesion"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                No tienes cuenta?{" "}
                <Link href="/register">
                  <span className="text-primary cursor-pointer font-medium" data-testid="link-register">Regístrate aquí</span>
                </Link>
              </p>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
