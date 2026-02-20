import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Briefcase, MessageSquarePlus, Send, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Suggestions() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/suggestions", { name, email, category, message });
      return res.json();
    },
    onSuccess: (data: { message: string }) => {
      setSubmitted(true);
      toast({ title: "Enviado", description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !category || !message.trim()) {
      toast({ title: "Error", description: "Todos los campos son obligatorios", variant: "destructive" });
      return;
    }
    if (message.trim().length < 10) {
      toast({ title: "Error", description: "El mensaje debe tener al menos 10 caracteres", variant: "destructive" });
      return;
    }
    mutation.mutate();
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
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

        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3" data-testid="text-suggestion-success">Sugerencia Enviada</h2>
          <p className="text-muted-foreground mb-8">
            Gracias por tu sugerencia. La hemos recibido y la revisaremos lo antes posible.
          </p>
          <Link href="/">
            <Button variant="outline" className="gap-2" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Volver al Inicio
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Conecta FP</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-8">
          <MessageSquarePlus className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-suggestion-title">Buzón de Sugerencias</h1>
          <p className="text-muted-foreground mt-2">
            Tu opinión nos ayuda a mejorar. Cuéntanos cómo podemos hacer Conecta FP aún mejor.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enviar Sugerencia</CardTitle>
            <CardDescription>
              Todos los campos son obligatorios. Tu sugerencia será enviada al equipo de Conecta FP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  data-testid="input-suggestion-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-suggestion-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-suggestion-category">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Sugerencia General</SelectItem>
                    <SelectItem value="bug">Reporte de Error</SelectItem>
                    <SelectItem value="feature">Nueva Funcionalidad</SelectItem>
                    <SelectItem value="ux">Mejora de Usabilidad</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  placeholder="Describe tu sugerencia con el mayor detalle posible (mín. 10 caracteres)..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  data-testid="input-suggestion-message"
                />
                <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={mutation.isPending} data-testid="button-submit-suggestion">
                {mutation.isPending ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Sugerencia
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p>Las sugerencias se envían a <strong>conectafpcanarias@gmail.com</strong></p>
        </div>
      </footer>
    </div>
  );
}
