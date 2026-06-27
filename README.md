# Fiestas Centenera 2026

Página web estática con el programa de fiestas de verano de **Centenera**. Muestra el programa de fiestas de 8 días (2–9 de agosto de 2026) con un carrusel interactivo, lista de colaboradores y sección de cuentas con datos desde Google Sheets.

Construida con [Astro](https://astro.build) 6 + Tailwind CSS v4 + TypeScript y desplegada en **Cloudflare Pages**.

---

## Primeros pasos

```bash
git clone https://github.com/AlexAlgarate/fiestas-centenera-2026.git
cd fiestas-centenera-2026
pnpm install
pnpm dev
```

El servidor de desarrollo arranca en `http://localhost:4321`.

## Scripts disponibles

| Comando        | Acción                           |
| -------------- | -------------------------------- |
| `pnpm dev`     | Servidor de desarrollo           |
| `pnpm build`   | Build estático en `dist/`        |
| `pnpm preview` | Build + previsualización local   |
| `pnpm deploy`  | Build + despliegue en Cloudflare |
| `pnpm lint`    | ESLint                           |
| `pnpm format`  | Prettier                         |

## Configurar la sección de cuentas (Google Sheets)

La sección de gastos se alimenta de un CSV publicado desde Google Sheets.

### 1. Crear la hoja

Crea una hoja con dos columnas: **concepto** y **total**. La primera fila se ignora como cabecera.

Ejemplo:

| Concepto          | Total   |
| ----------------- | ------- |
| Comidas populares | 1500,00 |
| Charanga          | 800,00  |

### 2. Publicar como CSV

En Google Sheets: **Archivo → Compartir → Publicar en web**. Selecciona «Valores separados por comas (.csv)» y copia la URL.

### 3. Configurar la URL

Crea un archivo `.env` en la raíz del proyecto:

```env
PUBLIC_SHOW_EXPENSES=true
GOOGLE_SHEET_EXPENSES_CSV_URL=https://docs.google.com/spreadsheets/d/...
```

En producción, define `PUBLIC_SHOW_EXPENSES` y `GOOGLE_SHEET_EXPENSES_CSV_URL` como variables de entorno en el panel de **Cloudflare Pages → Settings → Environment variables** y redepliega.

> **Aviso**: el CSV es público. Cualquiera con la URL puede ver los datos. No incluyas información sensible.

## Despliegue en Cloudflare Pages

### Desde GitHub (automático)

1. Conecta el repositorio en el panel de **Cloudflare Pages**
2. Comando de build: `pnpm run build`
3. Directorio de salida: `dist`
4. Cloudflare desplegará automáticamente con cada `push`

### Desde CLI (manual)

```bash
pnpm deploy
```

Requiere tener [Wrangler](https://developers.cloudflare.com/workers/wrangler/) configurado con una sesión activa de Cloudflare.

---

Desarrollado por [Álex Algarate](https://github.com/AlexAlgarate).
