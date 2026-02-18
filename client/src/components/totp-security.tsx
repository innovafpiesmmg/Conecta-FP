import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ShieldCheck, ShieldOff, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

export function TotpSecuritySection() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [setupData, setSetupData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableOpen, setDisableOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const setupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/totp/setup");
      return res.json();
    },
    onSuccess: (data) => setSetupData(data),
    onError: () => toast({ title: "Error al iniciar configuracion 2FA", variant: "destructive" }),
  });

  const confirmMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/totp/confirm", { code: confirmCode }),
    onSuccess: () => {
      toast({ title: "Autenticacion de dos factores activada" });
      setSetupData(null);
      setConfirmCode("");
      refetch();
    },
    onError: () => toast({ title: "Codigo invalido. Intentalo de nuevo.", variant: "destructive" }),
  });

  const disableMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/totp/disable", { password: disablePassword }),
    onSuccess: () => {
      toast({ title: "Autenticacion de dos factores desactivada" });
      setDisablePassword("");
      setDisableOpen(false);
      refetch();
    },
    onError: () => toast({ title: "Contrasena incorrecta", variant: "destructive" }),
  });

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) return null;

  return (
    <Card className="p-6" data-testid="totp-security-section">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold">Autenticacion de dos factores (2FA)</h3>
            <p className="text-sm text-muted-foreground">
              Protege tu cuenta con una aplicacion de autenticacion (Google Authenticator, Authy, etc.)
            </p>
          </div>
        </div>
        {user.totpEnabled ? (
          <Badge variant="default" data-testid="badge-2fa-active">Activado</Badge>
        ) : (
          <Badge variant="outline" data-testid="badge-2fa-inactive">Desactivado</Badge>
        )}
      </div>

      {user.totpEnabled ? (
        <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" data-testid="button-disable-2fa">
              <ShieldOff className="w-4 h-4 mr-1" /> Desactivar 2FA
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Desactivar autenticacion de dos factores</DialogTitle>
              <DialogDescription>
                Introduce tu contrasena para confirmar la desactivacion de 2FA. Tu cuenta sera menos segura.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="disable-password">Contrasena</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Tu contrasena actual"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                data-testid="input-disable-2fa-password"
              />
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => disableMutation.mutate()}
                disabled={disableMutation.isPending || !disablePassword}
                data-testid="button-confirm-disable-2fa"
              >
                {disableMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Desactivar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : setupData ? (
        <div className="space-y-4" data-testid="totp-setup-form">
          <p className="text-sm text-muted-foreground">
            Escanea el codigo QR con tu aplicacion de autenticacion, o introduce la clave manualmente.
          </p>
          <div className="flex justify-center">
            <img src={setupData.qrCode} alt="Codigo QR para 2FA" className="w-48 h-48 rounded-md border" data-testid="img-qr-code" />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-md bg-accent/50 border">
            <code className="text-xs flex-1 break-all" data-testid="text-totp-secret">{setupData.secret}</code>
            <Button variant="ghost" size="icon" onClick={copySecret} data-testid="button-copy-secret">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-totp">Codigo de verificacion</Label>
            <Input
              id="confirm-totp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
              data-testid="input-confirm-totp"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending || confirmCode.length !== 6}
              data-testid="button-confirm-totp"
            >
              {confirmMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Activar 2FA
            </Button>
            <Button variant="ghost" onClick={() => { setSetupData(null); setConfirmCode(""); }} data-testid="button-cancel-setup">
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending} data-testid="button-setup-2fa">
          {setupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ShieldCheck className="w-4 h-4 mr-1" />}
          Configurar 2FA
        </Button>
      )}
    </Card>
  );
}
