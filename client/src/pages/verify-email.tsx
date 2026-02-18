import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Briefcase, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VerifyEmail() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificacion no proporcionado");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Error al verificar el email");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexion");
      });
  }, [token]);

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
        <Card className="w-full max-w-md p-6 sm:p-8 text-center">
          {status === "loading" && (
            <div className="space-y-4" data-testid="verify-loading">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Verificando tu correo electronico...</p>
            </div>
          )}
          {status === "success" && (
            <div className="space-y-4" data-testid="verify-success">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto" />
              <h2 className="text-xl font-bold">{message}</h2>
              <p className="text-muted-foreground">Ya puedes iniciar sesion en tu cuenta.</p>
              <Link href="/login">
                <Button className="w-full" data-testid="button-go-login">Iniciar sesion</Button>
              </Link>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-4" data-testid="verify-error">
              <XCircle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-xl font-bold">Error de verificacion</h2>
              <p className="text-muted-foreground">{message}</p>
              <Link href="/login">
                <Button variant="outline" className="w-full" data-testid="button-go-login">Ir al inicio de sesion</Button>
              </Link>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
