import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { z } from "zod";
import { Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast({ title: "Bienvenido/a", description: "Inicio de sesion correcto" });
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.message?.includes("401") ? "Email o contrasena incorrectos" : "Error al iniciar sesion";
      toast({ title: "Error", description: msg, variant: "destructive" });
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
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1">Iniciar Sesion</h1>
            <p className="text-muted-foreground text-sm">Accede a tu cuenta en FP Empleo</p>
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
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contrasena"
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
              <span className="text-primary cursor-pointer font-medium" data-testid="link-register">Registrate aqui</span>
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
