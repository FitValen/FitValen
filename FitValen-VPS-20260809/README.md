# FitValen

Primera versión navegable de una aplicación web de entrenamiento, nutrición y seguimiento personal para móvil y ordenador.

## Incluye

- Inicio con entrenamiento del día, constancia, calorías, agua y peso.
- Rutinas semanales, progreso, volumen y récords personales.
- Entrenamiento activo con series, peso, repeticiones y descanso.
- Calendario semanal de entrenamientos y menús.
- Registro nutricional, macronutrientes e hidratación.
- Perfil, evolución corporal y actividad de amigos.
- Panel administrativo con validaciones, programación y accesos por función.

## Seguridad y almacenamiento

- Solo existen dos cuentas: administrador y miembro.
- Los PIN se derivan con `scrypt` y una sal aleatoria; nunca se guardan en texto plano ni se pueden recuperar.
- El documento de datos completo se cifra con AES-256-GCM antes de escribirse en disco.
- Las sesiones usan tokens aleatorios en cookies `HttpOnly`, `SameSite=Lax` y `Secure` en producción. Permanecen activas hasta cerrar sesión o alcanzar el límite del navegador.
- Después de cinco intentos fallidos desde el mismo origen y usuario, el acceso se pausa durante 15 minutos para impedir ataques automatizados contra el PIN de cuatro cifras.
- Las escrituras usan un archivo temporal y un cambio de nombre atómico para evitar corrupción.
- `.env` y `data/` están excluidos de Git y no deben subirse nunca al repositorio, aunque sea privado.

## Ejecutar en local

```bash
npm install
npm run build
npm run dev
```

Antes de iniciar, copia `.env.example` como `.env`, genera la clave y define los dos PIN:

```bash
cp .env.example .env
openssl rand -base64 32
```

Guarda el resultado en `FITVALEN_ENCRYPTION_KEY` y completa los dos PIN dentro de `.env`.

## Desplegar en una VPS con Docker

La VPS necesita Docker, Docker Compose, un dominio y HTTPS. Las cookies persistentes son seguras en producción únicamente detrás de HTTPS.

```bash
git clone https://github.com/FitValen/FitValen.git
cd FitValen
cp .env.example .env
mkdir -p data
sudo chown -R 1000:1000 data
docker compose up -d --build
```

Configura los secretos de `.env`, sustituye el dominio de `Caddyfile.example` y utiliza Caddy o Nginx como proxy HTTPS hacia `127.0.0.1:3000`.

Para actualizar sin perder datos:

```bash
git pull
docker compose up -d --build
```

Haz una copia de seguridad periódica de `data/fitvalen.enc.json` y conserva también `FITVALEN_ENCRYPTION_KEY`. Sin esa clave, el archivo cifrado no puede recuperarse.

## Estado actual

La primera versión persistente guarda de forma individual la hidratación, el estado de las series, los pesos, las repeticiones y el historial de actividad. El resto de pantallas conserva datos de demostración hasta conectarse progresivamente al mismo documento cifrado.
