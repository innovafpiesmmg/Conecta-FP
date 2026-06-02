#!/bin/bash
set -euo pipefail

# =============================================================================
# Conecta FP - Autoinstalador para Ubuntu 22.04/24.04
# Portal de Empleo Privado para Titulados de Formación Profesional
# =============================================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_status()  { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[AVISO]${NC} $1"; }
print_error()   { echo -e "${RED}[ERROR]${NC} $1"; }
print_header()  { echo -e "\n${CYAN}${BOLD}=== $1 ===${NC}\n"; }

# ─────────────────────────────────────────────────────────────────────────────
# Configuración
# ─────────────────────────────────────────────────────────────────────────────
APP_NAME="conectafp"
APP_DIR="/var/www/$APP_NAME"
CONFIG_DIR="/etc/$APP_NAME"
UPLOADS_DIR="$APP_DIR/uploads"
APP_PORT="5000"
APP_USER="conectafp"
DB_NAME="conectafp"
DB_USER="conectafp"
GITHUB_REPO="https://github.com/innovafpiesmmg/Conecta-FP.git"

# ─────────────────────────────────────────────────────────────────────────────
# Verificaciones iniciales
# ─────────────────────────────────────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
    print_error "Este script debe ejecutarse como root (sudo ./install.sh)"
    exit 1
fi

if ! grep -qiE "ubuntu" /etc/os-release 2>/dev/null; then
    print_warning "Este script está diseñado para Ubuntu 22.04/24.04"
    read -p "¿Deseas continuar de todos modos? (s/N): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[sS]$ ]]; then exit 1; fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# Cabecera
# ─────────────────────────────────────────────────────────────────────────────
clear
echo -e "${CYAN}${BOLD}"
echo "  ╔═══════════════════════════════════════════════════════╗"
echo "  ║          Conecta FP - Autoinstalador v1.2            ║"
echo "  ║     Portal de Empleo para Titulados de FP            ║"
echo "  ╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─────────────────────────────────────────────────────────────────────────────
# Detección de instalación previa
# ─────────────────────────────────────────────────────────────────────────────
IS_UPDATE=false
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
ADMIN_NAME=""

if [ -f "$CONFIG_DIR/env" ]; then
    IS_UPDATE=true
    set -a; source "$CONFIG_DIR/env"; set +a
    print_warning "Instalación existente detectada - modo ACTUALIZACIÓN"
    print_status "Se preservarán las credenciales y la base de datos"
    echo ""

    CURRENT_APP_URL="${APP_URL:-No configurada}"
    echo -e "  URL actual de la aplicación: ${BOLD}$CURRENT_APP_URL${NC}"
    echo ""
    read -p "¿Deseas cambiar la URL de la aplicación? (s/N): " CHANGE_URL
    if [[ "$CHANGE_URL" =~ ^[sS]$ ]]; then
        echo -e "Ejemplos: ${BOLD}https://conectafp.midominio.es${NC} o ${BOLD}http://192.168.1.100${NC}"
        read -p "Nueva URL de la aplicación: " NEW_APP_URL
        if [ -n "${NEW_APP_URL:-}" ]; then
            NEW_APP_URL=${NEW_APP_URL%/}
            if grep -q "^APP_URL=" "$CONFIG_DIR/env"; then
                sed -i "s|^APP_URL=.*|APP_URL=$NEW_APP_URL|" "$CONFIG_DIR/env"
            else
                echo "APP_URL=$NEW_APP_URL" >> "$CONFIG_DIR/env"
            fi
            APP_URL="$NEW_APP_URL"
            print_success "APP_URL actualizada a $NEW_APP_URL"
        fi
    fi
    echo ""
else
    print_status "Instalación nueva detectada"
    echo ""

    print_header "Datos del administrador"
    echo -e "Se necesita un email y contraseña para la cuenta de administrador."
    echo ""

    while true; do
        read -p "Email del administrador: " ADMIN_EMAIL
        if [[ "$ADMIN_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
            break
        else
            print_error "Email no válido. Introduce un email correcto."
        fi
    done

    while true; do
        read -s -p "Contraseña del administrador (mínimo 6 caracteres): " ADMIN_PASSWORD
        echo ""
        if [ ${#ADMIN_PASSWORD} -ge 6 ]; then
            read -s -p "Repite la contraseña: " ADMIN_PASSWORD_CONFIRM
            echo ""
            if [ "$ADMIN_PASSWORD" = "$ADMIN_PASSWORD_CONFIRM" ]; then
                break
            else
                print_error "Las contraseñas no coinciden. Inténtalo de nuevo."
            fi
        else
            print_error "La contraseña debe tener al menos 6 caracteres."
        fi
    done

    read -p "Nombre del administrador [Administrador]: " ADMIN_NAME
    ADMIN_NAME=${ADMIN_NAME:-"Administrador"}
    print_success "Datos del administrador recogidos"
    echo ""

    print_header "URL de la aplicación"
    echo -e "Introduce la URL pública con la que se accederá a Conecta FP."
    echo -e "Ejemplos: ${BOLD}https://conectafp.midominio.es${NC} o ${BOLD}http://192.168.1.100${NC}"
    echo -e "Los enlaces en los correos electrónicos usarán esta dirección."
    echo ""
    read -p "URL de la aplicación [http://localhost:$APP_PORT]: " APP_URL
    APP_URL=${APP_URL:-"http://localhost:$APP_PORT"}
    APP_URL=${APP_URL%/}
    print_success "URL configurada: $APP_URL"
    echo ""
fi

# ─────────────────────────────────────────────────────────────────────────────
# 1. Dependencias del sistema
# ─────────────────────────────────────────────────────────────────────────────
print_header "1/7 - Instalando dependencias del sistema"

apt-get update -qq
apt-get install -y -qq ca-certificates curl wget gnupg git openssl nginx postgresql postgresql-contrib build-essential
apt-mark manual nginx
print_success "Dependencias del sistema instaladas"

# ─────────────────────────────────────────────────────────────────────────────
# Generar credenciales (solo instalación nueva)
# ─────────────────────────────────────────────────────────────────────────────
if [ "$IS_UPDATE" = false ]; then
    DB_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
    SESSION_SECRET=$(openssl rand -base64 32)
    print_success "Credenciales generadas automáticamente"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. Node.js 20.x
# ─────────────────────────────────────────────────────────────────────────────
print_header "2/7 - Instalando Node.js 20.x"

install_nodejs() {
    print_status "Descargando e instalando Node.js 20.x desde NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
}

NODE_NEEDS_INSTALL=true
if command -v node &>/dev/null && command -v npm &>/dev/null; then
    NODE_VERSION=$(node -v 2>/dev/null || echo "v0")
    if [[ "$NODE_VERSION" =~ ^v(20|2[1-9]|[3-9][0-9])\. ]]; then
        print_status "Node.js ya instalado: $NODE_VERSION / npm $(npm -v)"
        NODE_NEEDS_INSTALL=false
    else
        print_warning "Node.js $NODE_VERSION es antiguo, actualizando a v20..."
    fi
fi

if [ "$NODE_NEEDS_INSTALL" = true ]; then
    install_nodejs
fi

# Verificar resultado
if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
    print_error "Node.js o npm no disponibles tras la instalación. Abortando."
    exit 1
fi

# Rutas absolutas (evita problemas de PATH con sudo)
NPM_BIN=$(command -v npm)
NPX_BIN=$(command -v npx)
NODE_BIN=$(command -v node)
chmod 755 "$NODE_BIN" "$NPM_BIN" "$NPX_BIN" 2>/dev/null || true

print_success "Node.js $(node -v) / npm $(npm -v)"
print_status "  node=$NODE_BIN  npm=$NPM_BIN"

# ─────────────────────────────────────────────────────────────────────────────
# 3. PostgreSQL
# ─────────────────────────────────────────────────────────────────────────────
print_header "3/7 - Configurando PostgreSQL"

systemctl enable postgresql --quiet
systemctl start postgresql

if [ "$IS_UPDATE" = false ]; then
    if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
        print_success "Usuario de BD '$DB_USER' creado"
    else
        print_status "Usuario de BD '$DB_USER' ya existe"
    fi

    if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
        print_success "Base de datos '$DB_NAME' creada"
    else
        print_status "Base de datos '$DB_NAME' ya existe"
    fi

    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

    PG_HBA=$(sudo -u postgres psql -tAc "SHOW hba_file;" 2>/dev/null | xargs)
    if [ -f "$PG_HBA" ] && ! grep -q "^host.*$DB_NAME.*$DB_USER" "$PG_HBA" 2>/dev/null; then
        echo "host    $DB_NAME    $DB_USER    127.0.0.1/32    md5" >> "$PG_HBA"
        echo "local   $DB_NAME    $DB_USER                    md5" >> "$PG_HBA"
        systemctl restart postgresql
        print_success "pg_hba.conf actualizado"
    fi
else
    print_status "Base de datos existente - sin cambios"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. Usuario del sistema y directorios
# ─────────────────────────────────────────────────────────────────────────────
print_header "4/7 - Configurando usuario y directorios"

if ! id "$APP_USER" &>/dev/null; then
    useradd --system --create-home --shell /bin/bash "$APP_USER"
    print_success "Usuario del sistema '$APP_USER' creado"
else
    print_status "Usuario '$APP_USER' ya existe"
fi

APP_USER_HOME=$(getent passwd "$APP_USER" | cut -d: -f6)
mkdir -p "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# 5. Configuración persistente
# ─────────────────────────────────────────────────────────────────────────────
print_header "5/7 - Guardando configuración"

if [ "$IS_UPDATE" = false ]; then
    DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
    cat > "$CONFIG_DIR/env" << EOF
NODE_ENV=production
PORT=$APP_PORT
DATABASE_URL=$DATABASE_URL
SESSION_SECRET=$SESSION_SECRET
SECURE_COOKIES=false
APP_URL=$APP_URL
EOF
    chmod 600 "$CONFIG_DIR/env"
    chown root:root "$CONFIG_DIR/env"
    print_success "Configuración creada en $CONFIG_DIR/env"
else
    print_status "Configuración existente preservada"
fi

# Cargar y exportar todas las variables de entorno para procesos hijos
set -a; source "$CONFIG_DIR/env"; set +a

# ─────────────────────────────────────────────────────────────────────────────
# 6. Código de la aplicación
# ─────────────────────────────────────────────────────────────────────────────
print_header "6/7 - Descargando y compilando la aplicación"

# Parar el servicio antes de actualizar
if systemctl is-active --quiet "$APP_NAME" 2>/dev/null; then
    print_status "Deteniendo servicio para actualización..."
    systemctl stop "$APP_NAME"
fi

git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true

if [ -d "$APP_DIR/.git" ]; then
    print_status "Actualizando código desde GitHub..."
    cd "$APP_DIR"
    if git fetch --all 2>/dev/null; then
        git reset --hard origin/main 2>/dev/null || git reset --hard origin/master
        print_success "Código actualizado al último commit"
    else
        print_warning "Sin acceso a internet - manteniendo código actual"
    fi
else
    TEMP_UPLOADS=""
    if [ -d "$UPLOADS_DIR" ]; then
        TEMP_UPLOADS=$(mktemp -d)
        cp -a "$UPLOADS_DIR/." "$TEMP_UPLOADS/" 2>/dev/null || true
    fi
    [ -d "$APP_DIR" ] && rm -rf "$APP_DIR"

    print_status "Clonando repositorio..."
    git clone --depth 1 "$GITHUB_REPO" "$APP_DIR"

    if [ -n "${TEMP_UPLOADS:-}" ] && [ -d "$TEMP_UPLOADS" ]; then
        mkdir -p "$UPLOADS_DIR"
        cp -a "$TEMP_UPLOADS/." "$UPLOADS_DIR/" 2>/dev/null || true
        rm -rf "$TEMP_UPLOADS"
        print_status "Uploads restaurados"
    fi
    print_success "Repositorio clonado"
fi

# Permisos
mkdir -p "$UPLOADS_DIR/avatars" "$UPLOADS_DIR/logos" "$UPLOADS_DIR/cvs"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chmod 600 "$CONFIG_DIR/env"

cd "$APP_DIR"

# ── Instalar dependencias npm ────────────────────────────────────────────────
# Siempre intentar instalar. Si hay node_modules intenta offline primero.
# IMPORTANTE: no se hace prune de devDependencies para que tsx esté disponible
# en futuras actualizaciones.
print_status "Instalando dependencias npm..."
if [ -d "$APP_DIR/node_modules" ]; then
    # Intento 1: offline (usa caché local, sin internet)
    if sudo -u "$APP_USER" HOME="$APP_USER_HOME" \
            "$NPM_BIN" install --no-fund --no-audit --prefer-offline 2>/dev/null; then
        print_success "Dependencias actualizadas (modo offline)"
    else
        print_warning "npm offline falló - usando node_modules existentes"
    fi
else
    # Sin node_modules previo: necesita internet
    sudo -u "$APP_USER" HOME="$APP_USER_HOME" \
        "$NPM_BIN" install --no-fund --no-audit
    print_success "Dependencias instaladas"
fi

# Verificar que tsx está disponible (necesario para build y migrate)
if [ ! -f "$APP_DIR/node_modules/.bin/tsx" ]; then
    print_status "tsx no encontrado, instalando desde caché..."
    sudo -u "$APP_USER" HOME="$APP_USER_HOME" \
        "$NPM_BIN" install --no-fund --no-audit --prefer-offline tsx 2>/dev/null || \
    sudo -u "$APP_USER" HOME="$APP_USER_HOME" \
        "$NPM_BIN" install --no-fund --no-audit tsx
    print_success "tsx instalado"
fi

TSX_BIN="$APP_DIR/node_modules/.bin/tsx"

# ── Compilar ─────────────────────────────────────────────────────────────────
print_status "Compilando la aplicación (puede tardar 1-2 minutos)..."
sudo -u "$APP_USER" HOME="$APP_USER_HOME" "$NPM_BIN" run build

# Verificar que el build generó el archivo esperado
if [ ! -f "$APP_DIR/dist/index.cjs" ]; then
    print_error "El build no generó dist/index.cjs. Revisa los errores de compilación."
    exit 1
fi
print_success "Aplicación compilada correctamente"

# ── Migraciones de base de datos ──────────────────────────────────────────────
print_status "Ejecutando migraciones de base de datos..."
sudo -u "$APP_USER" HOME="$APP_USER_HOME" \
    DATABASE_URL="$DATABASE_URL" \
    "$TSX_BIN" "$APP_DIR/server/migrate.ts"
print_success "Esquema de base de datos actualizado"

# ── Crear administrador (solo instalación nueva) ──────────────────────────────
if [ "$IS_UPDATE" = false ] && [ -n "${ADMIN_EMAIL:-}" ]; then
    print_status "Creando usuario administrador..."
    sudo -u "$APP_USER" HOME="$APP_USER_HOME" \
        ADMIN_EMAIL="$ADMIN_EMAIL" \
        ADMIN_PASSWORD="$ADMIN_PASSWORD" \
        ADMIN_NAME="$ADMIN_NAME" \
        DATABASE_URL="$DATABASE_URL" \
        "$TSX_BIN" "$APP_DIR/server/create-admin.ts"
    print_success "Administrador creado: $ADMIN_EMAIL"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 7. Servicios (systemd + nginx)
# ─────────────────────────────────────────────────────────────────────────────
print_header "7/7 - Configurando servicios"

# Servicio systemd — usa node directamente (mejor manejo de señales)
cat > "/etc/systemd/system/$APP_NAME.service" << EOF
[Unit]
Description=Conecta FP - Portal de Empleo
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=$CONFIG_DIR/env
ExecStart=$NODE_BIN $APP_DIR/dist/index.cjs
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$APP_NAME

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$APP_NAME" --quiet
print_success "Servicio systemd configurado"

# Nginx
cat > "/etc/nginx/sites-available/$APP_NAME" << NGINX_EOF
server {
    listen 80;
    server_name _;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_EOF

ln -sf "/etc/nginx/sites-available/$APP_NAME" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

if nginx -t 2>/dev/null; then
    print_success "Configuración de Nginx válida"
else
    print_error "Error en configuración de Nginx"
    nginx -t
    exit 1
fi

systemctl enable nginx --quiet
systemctl restart nginx
print_success "Nginx configurado como proxy reverso"

# Iniciar / reiniciar la aplicación
systemctl restart "$APP_NAME"

# Verificar que arrancó
sleep 5
if systemctl is-active --quiet "$APP_NAME"; then
    print_success "Servicio $APP_NAME arrancado correctamente"
else
    print_error "El servicio no arrancó. Revisa los logs:"
    journalctl -u "$APP_NAME" -n 20 --no-pager
    exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# Cloudflare Tunnel (opcional)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
print_header "Cloudflare Tunnel (opcional)"
echo -e "Si tienes un Cloudflare Tunnel configurado, introduce el token."
echo -e "Esto permite acceso HTTPS sin abrir puertos en el router."
echo ""
read -p "Token de Cloudflare Tunnel (Enter para omitir): " CF_TOKEN

if [ -n "${CF_TOKEN:-}" ]; then
    print_status "Instalando Cloudflare Tunnel..."
    curl -L --silent -o /tmp/cloudflared.deb \
        https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    dpkg -i /tmp/cloudflared.deb
    rm -f /tmp/cloudflared.deb

    cloudflared service install "$CF_TOKEN"
    systemctl enable cloudflared --quiet
    systemctl start cloudflared

    sed -i 's/^SECURE_COOKIES=.*/SECURE_COOKIES=true/' "$CONFIG_DIR/env"

    echo ""
    read -p "Dominio de Cloudflare (ej: conectafp.midominio.es) — Enter para omitir: " CF_DOMAIN
    if [ -n "${CF_DOMAIN:-}" ]; then
        CF_DOMAIN=${CF_DOMAIN#http://}; CF_DOMAIN=${CF_DOMAIN#https://}; CF_DOMAIN=${CF_DOMAIN%/}
        if grep -q "^APP_URL=" "$CONFIG_DIR/env"; then
            sed -i "s|^APP_URL=.*|APP_URL=https://$CF_DOMAIN|" "$CONFIG_DIR/env"
        else
            echo "APP_URL=https://$CF_DOMAIN" >> "$CONFIG_DIR/env"
        fi
        print_success "APP_URL actualizada a https://$CF_DOMAIN"
    fi

    systemctl restart "$APP_NAME"
    print_success "Cloudflare Tunnel instalado y cookies seguras activadas"
else
    print_status "Cloudflare Tunnel omitido"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Verificación HTTP final
# ─────────────────────────────────────────────────────────────────────────────
echo ""
print_status "Verificando respuesta HTTP (espera 10 segundos)..."
sleep 10

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$APP_PORT 2>/dev/null || echo "000")
if [[ "$HTTP_CODE" =~ ^(200|301|302)$ ]]; then
    print_success "La aplicación responde correctamente (HTTP $HTTP_CODE)"
    APP_OK=true
else
    print_warning "La aplicación no responde por HTTP (código: $HTTP_CODE)"
    APP_OK=false
fi

# ─────────────────────────────────────────────────────────────────────────────
# Resumen final
# ─────────────────────────────────────────────────────────────────────────────
SERVER_IP=$(hostname -I | awk '{print $1}')
set -a; source "$CONFIG_DIR/env"; set +a

echo ""
echo -e "${CYAN}${BOLD}╔═══════════════════════════════════════════════════════╗${NC}"
if [ "$IS_UPDATE" = true ]; then
    echo -e "${CYAN}${BOLD}║         ACTUALIZACIÓN COMPLETADA ✓                    ║${NC}"
else
    echo -e "${CYAN}${BOLD}║         INSTALACIÓN COMPLETADA ✓                      ║${NC}"
fi
echo -e "${CYAN}${BOLD}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}URL de acceso:${NC}   http://$SERVER_IP"
if [ -n "${APP_URL:-}" ] && [ "$APP_URL" != "http://localhost:$APP_PORT" ]; then
    echo -e "  ${BOLD}URL pública:${NC}     $APP_URL"
fi
[ -n "${CF_TOKEN:-}" ] && echo -e "  ${BOLD}Cloudflare:${NC}      Configurado (HTTPS activo)"
echo ""
if [ "$IS_UPDATE" = false ] && [ -n "${ADMIN_EMAIL:-}" ]; then
    echo -e "  ${BOLD}Cuenta de administrador:${NC}"
    echo -e "    Email:      $ADMIN_EMAIL"
    echo -e "    Contraseña: (la que introdujiste)"
    echo ""
fi
echo -e "  ${BOLD}Comandos útiles:${NC}"
echo -e "    Estado:     ${GREEN}systemctl status $APP_NAME${NC}"
echo -e "    Logs:       ${GREEN}journalctl -u $APP_NAME -f${NC}"
echo -e "    Reiniciar:  ${GREEN}systemctl restart $APP_NAME${NC}"
echo -e "    Config:     ${GREEN}cat $CONFIG_DIR/env${NC}"
echo ""
echo -e "  ${BOLD}Archivos importantes:${NC}"
echo -e "    App:        $APP_DIR"
echo -e "    Config:     $CONFIG_DIR/env"
echo -e "    Uploads:    $UPLOADS_DIR"
echo -e "    Servicio:   /etc/systemd/system/$APP_NAME.service"
echo ""

if [ "${APP_OK:-false}" = false ]; then
    echo -e "  ${YELLOW}${BOLD}La app no responde aún. Revisa los logs:${NC}"
    echo -e "  ${GREEN}journalctl -u $APP_NAME -n 50${NC}"
    echo ""
fi
