# Conecta FP - Portal de Empleo Privado

Portal de empleo privado y seguro, diseñado específicamente para **Titulados de Formación Profesional (FP)** y **empresas** que buscan talento cualificado. Cumple con la normativa RGPD de protección de datos.

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Roles de Usuario](#roles-de-usuario)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos del Servidor](#requisitos-del-servidor)
- [Instalación](#instalación)
  - [Opción A: Instalación Automática (Recomendada)](#opción-a-instalación-automática-recomendada)
  - [Opción B: Instalación Manual](#opción-b-instalación-manual)
- [Acceso HTTPS con Cloudflare Tunnel](#acceso-https-con-cloudflare-tunnel)
- [Actualización](#actualización)
- [Administración](#administración)
- [Configuración del Correo Electrónico (SMTP)](#configuración-del-correo-electrónico-smtp)
- [Estructura de Archivos en el Servidor](#estructura-de-archivos-en-el-servidor)
- [Comandos Útiles](#comandos-útiles)
- [Solución de Problemas](#solución-de-problemas)
- [Credenciales por Defecto](#credenciales-por-defecto)
- [Seguridad](#seguridad)

---

## Descripción General

Conecta FP es una plataforma web que conecta a titulados de Formación Profesional con empresas que buscan perfiles técnicos cualificados. La plataforma está orientada a centros educativos de FP que desean ofrecer a sus egresados una bolsa de empleo privada y controlada.

Los titulados pueden buscar ofertas de empleo, gestionar su perfil profesional, construir su CV de forma dinámica y postularse a ofertas. Las empresas pueden publicar ofertas, gestionar candidaturas y buscar talento. Los administradores tienen control total sobre la plataforma, los usuarios y la configuración.

---

## Características Principales

### Para Titulados de FP (Alumni)
- **Búsqueda de empleo** con filtros por familia profesional, ciclo formativo, ubicación y palabras clave
- **Constructor de CV dinámico** con secciones de formación, experiencia laboral, idiomas e información adicional
- **Gestión de candidaturas** con seguimiento del estado de cada solicitud
- **Subida de documentos** (foto de perfil y CV en PDF)
- **Perfil privado por defecto**: solo visible para empresas cuando el titulado se postula voluntariamente a una oferta
- **Recordatorio anual de actualización de CV** por correo electrónico

### Para Empresas
- **Publicación de ofertas de empleo** con campos específicos de FP (familia profesional, ciclo formativo)
- **Edición de ofertas** existentes (título, descripción, ubicación, salario, requisitos, etc.)
- **Gestión de candidatos** con visualización de perfiles y CVs de los postulantes
- **Actualización de estado de candidaturas** (en revisión, aceptada, rechazada)
- **Perfil de empresa** con logo, descripción, sitio web, sector, email corporativo y CIF/NIF
- **Fecha de expiración obligatoria** en todas las ofertas
- **Notificación por email** 7 días antes de que expire una oferta
- **Búsqueda y filtrado** de sus propias ofertas

### Para Administradores
- **Panel de administración completo** con estadísticas de la plataforma
- **Gestión de usuarios** (visualización, eliminación)
- **Gestión de ofertas** (activar/desactivar, eliminar)
- **Vista general de candidaturas**
- **Configuración SMTP** del servidor de correo electrónico desde el panel web
- **Envío de correo de prueba** para verificar la configuración

### Seguridad y Privacidad (RGPD)
- **Consentimiento explícito** al registrarse, con marca de tiempo registrada
- **Visibilidad selectiva de perfiles**: los datos del titulado solo son accesibles para empresas a las que se ha postulado
- **Derecho al olvido**: cualquier usuario puede eliminar permanentemente su cuenta y todos sus datos asociados
- **Verificación de email** obligatoria para nuevos registros
- **Recuperación de contraseña** por correo electrónico (enlaces con expiración de 1 hora)
- **Autenticación de dos factores (2FA)** opcional mediante aplicaciones TOTP (Google Authenticator, Authy, etc.)
- **Contraseñas cifradas** con bcrypt
- **Sesiones seguras** con soporte para cookies HTTPS

### Familias Profesionales y Ciclos Formativos
La plataforma incluye las **23 familias profesionales** oficiales del sistema de FP español, cada una con sus ciclos formativos correspondientes:
- Informática y Comunicaciones (DAW, DAM, ASIR, SMR...)
- Administración y Gestión
- Comercio y Marketing
- Electricidad y Electrónica
- Sanidad
- Y 18 familias más con todos sus ciclos

Todos los nombres utilizan caracteres españoles correctos (ñ, á, é, í, ó, ú).

---

## Roles de Usuario

| Rol | Descripción | Dashboard |
|-----|-------------|-----------|
| **Titulado FP** (ALUMNI) | Graduados de FP que buscan empleo | `/alumni` |
| **Empresa** (COMPANY) | Empresas que publican ofertas | `/company` |
| **Administrador** (ADMIN) | Gestión completa de la plataforma | `/admin` |

---

## Stack Tecnológico

| Componente | Tecnología |
|------------|-----------|
| Frontend | React + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL (con Drizzle ORM) |
| Autenticación | Passport.js + bcrypt + express-session |
| Email | Nodemailer (SMTP configurable desde panel admin) |
| 2FA | TOTP (otpauth + qrcode) |
| Subida de archivos | Multer (almacenamiento local en disco) |
| Proceso | systemd (en producción) |
| Proxy reverso | Nginx |

---

## Requisitos del Servidor

- **Sistema operativo**: Ubuntu Server 22.04 LTS o 24.04 LTS
- **RAM mínima**: 1 GB (recomendado 2 GB)
- **Disco**: 10 GB mínimo (más espacio para CVs y archivos subidos)
- **Acceso**: Usuario con privilegios de root (sudo)
- **Red**: Conexión a Internet para descargar dependencias
- **Puerto**: 80 (HTTP) libre para Nginx

> **Nota**: No es necesario tener instalado ningún software previo. El instalador se encarga de todo, incluyendo `curl`, `git`, `Node.js`, `PostgreSQL`, `Nginx` y todas las dependencias necesarias.

---

## Instalación

### Opción A: Instalación Automática (Recomendada)

El script `install.sh` instala y configura todo automáticamente en un servidor Ubuntu limpio. No necesitas tener nada instalado previamente.

#### Paso 1: Preparar el servidor

Conéctate a tu servidor Ubuntu por SSH:

```bash
ssh usuario@ip-del-servidor
```

#### Paso 2: Actualizar el sistema operativo

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

#### Paso 3: Instalar herramientas básicas necesarias para descargar el script

```bash
sudo apt-get install -y wget
```

#### Paso 4: Descargar el script de instalación

```bash
wget https://raw.githubusercontent.com/innovafpiesmmg/Conecta-FP/main/install.sh
```

> Si `wget` no está disponible, puedes usar este método alternativo:
> ```bash
> sudo apt-get install -y curl
> curl -O https://raw.githubusercontent.com/innovafpiesmmg/Conecta-FP/main/install.sh
> ```

#### Paso 5: Dar permisos de ejecución

```bash
chmod +x install.sh
```

#### Paso 6: Ejecutar el instalador

```bash
sudo ./install.sh
```

El instalador te pedirá los siguientes datos:

- **Email del administrador**: el correo electrónico para la cuenta de administrador
- **Contraseña del administrador**: la contraseña para acceder al panel de administración (mínimo 6 caracteres, se pide confirmación)
- **Nombre del administrador**: nombre que se mostrará en el panel (opcional, por defecto "Administrador")

Después, realizará automáticamente las siguientes acciones:

1. Instalar todas las dependencias del sistema (`curl`, `git`, `openssl`, `nginx`, `postgresql`, `build-essential`)
2. Instalar Node.js 20.x
3. Crear la base de datos PostgreSQL con usuario y contraseña seguros generados automáticamente
4. Crear el usuario del sistema `conectafp`
5. Guardar la configuración en `/etc/conectafp/env`
6. Clonar el repositorio, instalar dependencias npm y compilar la aplicación
7. Ejecutar las migraciones de base de datos
8. Crear la cuenta de administrador con las credenciales proporcionadas
9. Configurar el servicio systemd para que la aplicación se inicie automáticamente
10. Configurar Nginx como proxy reverso en el puerto 80
11. (Opcional) Configurar Cloudflare Tunnel para acceso HTTPS

Al finalizar, el instalador mostrará la URL de acceso y el email del administrador.

#### Paso 7: Verificar la instalación

Abre un navegador web y accede a:

```
http://IP-DE-TU-SERVIDOR
```

---

### Opción B: Instalación Manual

Si prefieres instalar manualmente o necesitas más control, sigue estos pasos:

#### 1. Actualizar el sistema e instalar dependencias

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl wget gnupg git openssl nginx postgresql postgresql-contrib build-essential
```

#### 2. Instalar Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
```

Verificar la instalación:

```bash
node -v    # Debería mostrar v20.x.x
npm -v     # Debería mostrar 10.x.x
```

#### 3. Configurar PostgreSQL

```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Crear usuario y base de datos
# Sustituye TU_CONTRASEÑA_SEGURA por una contraseña real
sudo -u postgres psql -c "CREATE USER conectafp WITH PASSWORD 'TU_CONTRASEÑA_SEGURA';"
sudo -u postgres psql -c "CREATE DATABASE conectafp OWNER conectafp;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE conectafp TO conectafp;"
```

Configurar autenticación por contraseña en PostgreSQL:

```bash
# Localizar el archivo pg_hba.conf
PG_HBA=$(sudo -u postgres psql -t -c "SHOW hba_file;" | xargs)

# Añadir reglas de autenticación md5
sudo sed -i "/^# IPv4 local connections:/a host    conectafp    conectafp    127.0.0.1/32    md5" "$PG_HBA"
sudo sed -i '/^# "local" is for Unix domain socket connections only/a local   conectafp    conectafp                            md5' "$PG_HBA"

# Reiniciar PostgreSQL para aplicar cambios
sudo systemctl restart postgresql
```

#### 4. Crear usuario del sistema

```bash
sudo useradd --system --create-home --shell /bin/bash conectafp
```

#### 5. Clonar el repositorio

```bash
sudo git clone --depth 1 https://github.com/innovafpiesmmg/Conecta-FP.git /var/www/conectafp
sudo chown -R conectafp:conectafp /var/www/conectafp
```

#### 6. Crear directorios de uploads

```bash
sudo mkdir -p /var/www/conectafp/uploads/avatars
sudo mkdir -p /var/www/conectafp/uploads/logos
sudo mkdir -p /var/www/conectafp/uploads/cvs
sudo chown -R conectafp:conectafp /var/www/conectafp/uploads
```

#### 7. Crear archivo de configuración

```bash
sudo mkdir -p /etc/conectafp
sudo chmod 700 /etc/conectafp

# Generar secreto de sesión
SESSION_SECRET=$(openssl rand -base64 32)

# Crear archivo de configuración
# Sustituye TU_CONTRASEÑA_SEGURA por la misma contraseña que usaste en PostgreSQL
sudo bash -c "cat > /etc/conectafp/env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://conectafp:TU_CONTRASEÑA_SEGURA@localhost:5432/conectafp
SESSION_SECRET=$SESSION_SECRET
SECURE_COOKIES=false
EOF"

sudo chmod 600 /etc/conectafp/env
```

#### 8. Instalar dependencias y compilar

```bash
cd /var/www/conectafp

# Instalar todas las dependencias (incluye herramientas de compilación)
sudo -u conectafp npm install

# Compilar la aplicación
sudo -u conectafp npm run build

# Ejecutar migraciones de base de datos
source /etc/conectafp/env
sudo -u conectafp DATABASE_URL="$DATABASE_URL" npx drizzle-kit push --force

# Eliminar dependencias de desarrollo para reducir espacio
sudo -u conectafp npm prune --omit=dev
```

#### 9. Configurar servicio systemd

```bash
sudo bash -c 'cat > /etc/systemd/system/conectafp.service << EOF
[Unit]
Description=Conecta FP - Portal de Empleo
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=conectafp
Group=conectafp
WorkingDirectory=/var/www/conectafp
EnvironmentFile=/etc/conectafp/env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=conectafp

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload
sudo systemctl enable conectafp
sudo systemctl start conectafp
```

#### 10. Configurar Nginx

```bash
sudo bash -c 'cat > /etc/nginx/sites-available/conectafp << EOF
server {
    listen 80;
    server_name _;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection '\''upgrade'\'';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'

sudo ln -sf /etc/nginx/sites-available/conectafp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

#### 11. Verificar

```bash
# Comprobar que el servicio está activo
sudo systemctl status conectafp

# Probar la conexión
curl http://localhost:5000
```

---

## Acceso HTTPS con Cloudflare Tunnel

Si necesitas acceso HTTPS sin abrir puertos en tu router (por ejemplo, si el servidor está detrás de un NAT), puedes usar Cloudflare Tunnel.

### Requisitos previos
1. Una cuenta en [Cloudflare](https://dash.cloudflare.com/)
2. Un dominio gestionado por Cloudflare
3. Un tunnel creado en el panel de Cloudflare Zero Trust

### Configuración

#### Si usaste el instalador automático:
El instalador te pregunta por el token de Cloudflare al final. Si lo omitiste, puedes configurarlo después:

```bash
# Descargar e instalar cloudflared
curl -L -o /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i /tmp/cloudflared.deb
rm /tmp/cloudflared.deb

# Instalar el servicio con tu token
sudo cloudflared service install TU_TOKEN_DE_CLOUDFLARE
sudo systemctl enable cloudflared
sudo systemctl start cloudflared

# Habilitar cookies seguras (HTTPS activo)
sudo sed -i 's/SECURE_COOKIES=false/SECURE_COOKIES=true/' /etc/conectafp/env
sudo systemctl restart conectafp
```

### Verificar el tunnel

```bash
sudo systemctl status cloudflared
```

Accede a tu dominio configurado en Cloudflare (ejemplo: `https://empleo.tucentro.es`).

---

## Actualización

Cuando se publiquen nuevas versiones en el repositorio de GitHub, puedes actualizar tu servidor de dos formas.

### Opción 1: Usando el script de instalación (Recomendada)

El mismo `install.sh` sirve para actualizar. Primero, descarga la versión más reciente del script y luego ejecútalo:

```bash
# 1. Descargar la última versión del script de instalación desde GitHub
cd ~
wget -O install.sh https://raw.githubusercontent.com/innovafpiesmmg/Conecta-FP/main/install.sh
chmod +x install.sh

# 2. Ejecutar el instalador
sudo ./install.sh
```

El script detectará automáticamente que ya existe una instalación (modo ACTUALIZACIÓN) y:
- **NO** pedirá datos del administrador (ya existe)
- **Preservará** la base de datos y todos los datos de usuarios, ofertas y candidaturas
- **Preservará** la configuración (`/etc/conectafp/env`) con las contraseñas y secretos
- **Preservará** los archivos subidos (fotos de perfil, logos, CVs)
- Descargará el código más reciente del repositorio de GitHub
- Reinstalará las dependencias npm necesarias
- Recompilará la aplicación
- Ejecutará las migraciones de base de datos (si hay cambios en el esquema)
- Reiniciará los servicios automáticamente

> **Nota**: Es importante descargar siempre la última versión de `install.sh` antes de ejecutarlo, ya que el propio script puede haber sido actualizado con mejoras o correcciones.

### Opción 2: Actualización manual paso a paso

Si prefieres tener más control sobre el proceso, puedes actualizar manualmente:

```bash
# 1. Detener la aplicación
sudo systemctl stop conectafp

# 2. Descargar la última versión del código
cd /var/www/conectafp
sudo -u conectafp git fetch --all
sudo -u conectafp git reset --hard origin/main

# 3. Instalar dependencias (incluye herramientas de compilación)
sudo -u conectafp npm install

# 4. Recompilar la aplicación
sudo -u conectafp npm run build

# 5. Ejecutar migraciones de base de datos
source /etc/conectafp/env
sudo -u conectafp DATABASE_URL="$DATABASE_URL" npx drizzle-kit push --force

# 6. Limpiar dependencias de desarrollo
sudo -u conectafp npm prune --omit=dev

# 7. Reiniciar la aplicación
sudo systemctl start conectafp

# 8. Verificar que funciona
sudo systemctl status conectafp
```

### Verificar la actualización

Después de actualizar, comprueba que todo funciona:

```bash
# Ver el estado del servicio
sudo systemctl status conectafp

# Ver los logs en tiempo real (Ctrl+C para salir)
sudo journalctl -u conectafp -f

# Probar la conexión
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000
# Debería devolver 200
```

Si algo va mal, revisa los logs con `journalctl -u conectafp -n 50` para identificar el error.

---

## Administración

### Panel de Administración

Accede al panel de administración en `/admin` con las credenciales de administrador. Desde allí puedes:

- Ver estadísticas generales de la plataforma (usuarios, ofertas, candidaturas)
- Gestionar usuarios (ver, eliminar)
- Gestionar ofertas de empleo (activar/desactivar, eliminar)
- Ver todas las candidaturas
- Configurar el servidor de correo electrónico (SMTP)
- Enviar correos de prueba

### Crear un nuevo administrador

No existe un formulario de registro para administradores. Para crear uno, accede a la base de datos:

```bash
source /etc/conectafp/env
sudo -u postgres psql conectafp

-- Verificar usuarios existentes
SELECT id, email, role FROM users WHERE role = 'ADMIN';

-- Cambiar el rol de un usuario existente a ADMIN
UPDATE users SET role = 'ADMIN' WHERE email = 'correo@ejemplo.es';
```

---

## Configuración del Correo Electrónico (SMTP)

La plataforma necesita un servidor SMTP para enviar:
- Correos de verificación de email al registrarse
- Enlaces de recuperación de contraseña
- Recordatorios de actualización de CV (anuales)
- Avisos de expiración de ofertas de empleo

### Configurar SMTP desde el Panel de Administración

1. Inicia sesión como administrador
2. Ve al panel de administración (`/admin`)
3. Haz clic en la sección "Configuración SMTP"
4. Rellena los campos:
   - **Servidor SMTP**: dirección del servidor (ejemplo: `smtp.gmail.com`)
   - **Puerto**: normalmente `587` (TLS) o `465` (SSL)
   - **Usuario**: tu dirección de correo
   - **Contraseña**: contraseña o contraseña de aplicación
   - **Email remitente**: dirección que aparecerá como remitente
   - **Nombre remitente**: nombre que aparecerá (ejemplo: `Conecta FP`)
5. Haz clic en "Guardar configuración"
6. Usa el botón "Enviar correo de prueba" para verificar que funciona

### Ejemplo con Gmail

| Campo | Valor |
|-------|-------|
| Servidor SMTP | `smtp.gmail.com` |
| Puerto | `587` |
| Usuario | `tu-correo@gmail.com` |
| Contraseña | Contraseña de aplicación (ver nota) |
| Email remitente | `tu-correo@gmail.com` |
| Nombre remitente | `Conecta FP - IES Tu Centro` |

> **Nota sobre Gmail**: Necesitas crear una "Contraseña de aplicación" en la configuración de seguridad de tu cuenta de Google. No funciona con tu contraseña normal si tienes 2FA activado. Ve a: Cuenta Google > Seguridad > Contraseñas de aplicaciones.

### Ejemplo con servidor SMTP propio

| Campo | Valor |
|-------|-------|
| Servidor SMTP | `mail.tucentro.es` |
| Puerto | `587` |
| Usuario | `conectafp@tucentro.es` |
| Contraseña | La contraseña del buzón |
| Email remitente | `conectafp@tucentro.es` |
| Nombre remitente | `Conecta FP` |

---

## Estructura de Archivos en el Servidor

```
/var/www/conectafp/              Código de la aplicación
├── dist/                        Aplicación compilada (producción)
├── uploads/                     Archivos subidos por usuarios
│   ├── avatars/                 Fotos de perfil
│   ├── logos/                   Logos de empresas
│   └── cvs/                     CVs en PDF
├── package.json                 Dependencias del proyecto
└── ...

/etc/conectafp/                  Configuración (fuera del código)
└── env                          Variables de entorno

/etc/systemd/system/
└── conectafp.service            Servicio systemd

/etc/nginx/sites-available/
└── conectafp                    Configuración Nginx
```

---

## Comandos Útiles

### Gestión del servicio

```bash
# Ver estado de la aplicación
sudo systemctl status conectafp

# Ver logs en tiempo real
sudo journalctl -u conectafp -f

# Ver los últimos 100 logs
sudo journalctl -u conectafp -n 100

# Reiniciar la aplicación
sudo systemctl restart conectafp

# Detener la aplicación
sudo systemctl stop conectafp

# Iniciar la aplicación
sudo systemctl start conectafp
```

### Base de datos

```bash
# Acceder a la consola PostgreSQL
source /etc/conectafp/env
sudo -u postgres psql conectafp

# Consultas útiles dentro de psql:
# Ver todos los usuarios
SELECT id, email, name, role, created_at FROM users;

# Ver ofertas de empleo activas
SELECT id, title, company_id, expires_at, is_active FROM job_offers WHERE is_active = true;

# Contar estadísticas
SELECT role, COUNT(*) FROM users GROUP BY role;

# Salir de psql
\q
```

### Nginx

```bash
# Ver estado de Nginx
sudo systemctl status nginx

# Verificar configuración
sudo nginx -t

# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/error.log
```

### Configuración

```bash
# Ver configuración actual (sin mostrar contraseñas en pantalla)
sudo cat /etc/conectafp/env

# Editar configuración
sudo nano /etc/conectafp/env

# Después de editar, reiniciar la aplicación
sudo systemctl restart conectafp
```

### Copias de seguridad

```bash
# Backup de la base de datos
source /etc/conectafp/env
sudo -u postgres pg_dump conectafp > backup_conectafp_$(date +%Y%m%d).sql

# Backup de archivos subidos
sudo tar czf backup_uploads_$(date +%Y%m%d).tar.gz /var/www/conectafp/uploads/

# Restaurar base de datos desde backup
sudo -u postgres psql conectafp < backup_conectafp_20250101.sql

# Restaurar archivos subidos
sudo tar xzf backup_uploads_20250101.tar.gz -C /
sudo chown -R conectafp:conectafp /var/www/conectafp/uploads
```

---

## Solución de Problemas

### La aplicación no arranca

```bash
# Verificar el estado del servicio
sudo systemctl status conectafp

# Ver los logs para identificar el error
sudo journalctl -u conectafp -n 50

# Verificar que PostgreSQL está funcionando
sudo systemctl status postgresql

# Probar conexión directa a la aplicación
curl http://localhost:5000
```

### No puedo iniciar sesión (el login no funciona)

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| Redirige a login después de autenticarse | Cookies `secure:true` sin HTTPS | Verificar que `SECURE_COOKIES=false` en `/etc/conectafp/env` si no usas HTTPS |
| "Email o contraseña incorrectos" | Credenciales erróneas | Verificar las credenciales o usar las de demo |
| "Email no verificado" | Cuenta sin verificar | El admin puede verificar manualmente: `UPDATE users SET email_verified = true WHERE email = 'correo@ejemplo.es';` |

### La página no carga (error 502 o 504)

```bash
# Verificar que la aplicación está corriendo
sudo systemctl status conectafp

# Si no está corriendo, iniciarla
sudo systemctl start conectafp

# Verificar que Nginx apunta al puerto correcto
sudo cat /etc/nginx/sites-available/conectafp | grep proxy_pass

# Reiniciar ambos servicios
sudo systemctl restart conectafp nginx
```

### No se envían correos electrónicos

1. Accede al panel de administración (`/admin`)
2. Ve a la sección SMTP
3. Verifica que la configuración es correcta
4. Usa el botón "Enviar correo de prueba"
5. Si falla, revisa:
   - Que el servidor SMTP sea accesible desde tu servidor
   - Que el puerto no esté bloqueado por el firewall
   - Que las credenciales sean correctas
   - Para Gmail: que uses una "Contraseña de aplicación" y no tu contraseña normal

### Los archivos subidos no se muestran

```bash
# Verificar permisos de la carpeta uploads
ls -la /var/www/conectafp/uploads/

# Corregir permisos si es necesario
sudo chown -R conectafp:conectafp /var/www/conectafp/uploads/
sudo chmod -R 755 /var/www/conectafp/uploads/
```

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL está activo
sudo systemctl status postgresql

# Verificar la cadena de conexión
source /etc/conectafp/env
echo $DATABASE_URL

# Probar conexión manual
sudo -u postgres psql -U conectafp -d conectafp -h localhost

# Si falla con error de autenticación, verificar pg_hba.conf
sudo -u postgres psql -t -c "SHOW hba_file;"
# Verificar que existe una línea para el usuario conectafp con método md5
```

### Cloudflare Tunnel no funciona

```bash
# Verificar estado del servicio
sudo systemctl status cloudflared

# Ver logs de Cloudflare
sudo journalctl -u cloudflared -f

# Reiniciar el tunnel
sudo systemctl restart cloudflared
```

---

## Credenciales

### Producción (servidor Ubuntu)
Durante la instalación, el script te pedirá el email y la contraseña del administrador. No se crean usuarios de demostración en producción. Los titulados y empresas se registran ellos mismos a través del formulario de registro.

### Desarrollo (entorno Replit)
En el entorno de desarrollo se crean automáticamente usuarios de demostración:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@conectafp.es` | `admin123` |
| Titulado FP | `maria@alumni.com` | `password123` |
| Empresa | `empresa@techcorp.es` | `password123` |

> **Nota**: Estos usuarios de demostración solo se crean en desarrollo, nunca en producción.

---

## Seguridad

### Recomendaciones de seguridad para producción

1. **Cambiar las contraseñas por defecto** de todos los usuarios de demostración
2. **Configurar HTTPS** mediante Cloudflare Tunnel o certificados SSL
3. **Configurar un firewall** (ufw):
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Mantener el sistema actualizado**:
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```
5. **Realizar copias de seguridad** periódicas de la base de datos y los archivos subidos
6. **Configurar el SMTP** para que los correos de verificación y recuperación funcionen correctamente

### Variables de entorno sensibles

Las credenciales se almacenan de forma segura en `/etc/conectafp/env` con permisos `600` (solo lectura para root). systemd las carga automáticamente al iniciar la aplicación. Nunca se exponen en el código fuente ni en el repositorio.

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (incluye contraseña) |
| `SESSION_SECRET` | Secreto para firmar las cookies de sesión |
| `SECURE_COOKIES` | `true` si usas HTTPS, `false` si usas solo HTTP |
| `PORT` | Puerto interno de la aplicación (por defecto 5000) |
| `NODE_ENV` | Entorno de ejecución (`production`) |

---

## Licencia

Este proyecto ha sido desarrollado para uso educativo en centros de Formación Profesional.
