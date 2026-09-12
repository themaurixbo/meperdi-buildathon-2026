# ME PERDÍ — Documentación Técnica Completa

## Visión General

**ME PERDÍ** conecta un tag físico con QR a un perfil digital seguro para que una mascota u objeto de valor perdido pueda volver con su dueño. No es solo para mascotas: cualquier cosa importante (celular, mochila, laptop, bicicleta, llaves, documentos, etc.) puede llevar un tag ME PERDÍ.

**Principio rector:** *ME PERDÍ premia la devolución segura, nunca incentiva a salir a buscar mascotas u objetos por dinero.*

---

## Tracks del Buildathon

| Track | Descripción |
|-------|-------------|
| **Bolivia Hackathon** | Registro base obligatorio |
| **EAG Global — Real-World Ethereum Applications** | Coordinación comunitaria, registro de contribución, apps para regiones emergentes |
| **HSK Chain — Payment & Stablecoins** | Sub-track de pagos con stablecoins |

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (PWA)                                 │
│  React 18 + TanStack Router + Vite + Tailwind CSS                       │
│  Servido en: https://appweb.meperdi.com (puerto 8080, pm2 serve)        │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTPS + CORS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND API                                    │
│  NestJS 11 + TypeORM + PostgreSQL                                       │
│  Corriendo en: https://apiappweb.meperdi.com (puerto 3001, pm2)         │
│  Endpoints: /api/health, /api/public/*, /api/chain/*, /api/setup        │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
       ┌─────────────┐    ┌──────────────┐    ┌────────────────┐
       │  PostgreSQL │    │  HSK Testnet │    │   Resend.com   │
       │  (Docker)   │    │  (chainId 133)│    │   (Email API)  │
       │  127.0.0.1:5434  │   MockUSDC +   │    │   Transaccional│
       └─────────────┘    │   RecoveryEscrow│    └────────────────┘
                          └──────────────┘
```

---

## Funcionalidad Principal (del documento FUNCIONALIDAD.md)

### Roles
1. **Dueño** — Registra/activa tags, gestiona perfil, coordina devoluciones, ofrece recompensa opcional
2. **Finder** — Escanea tag, avisa, comparte ubicación, mensaje, coordina entrega, reclama agradecimiento (sin cuenta obligatoria)
3. **Aliado Comercial** — Valida códigos de canje, ve historial, crea campañas
4. **Administración** — Dashboard, lotes de tags, moderación, fondo comunitario, auditoría
5. **Verificador On-Chain** — Backend con `VERIFIER_ROLE`: solo completa casos y libera recompensa congelada

### Flujo Principal
1. **Onboarding** — Splash animado, login (Google, Apple, Facebook, Instagram, email+OTP)
2. **Activar Tag** — Escanear QR → PIN raspable → Mascota/Objeto → Datos → Foto → Contactos (máx 5) → Vista previa
3. **Perfil Público** — Foto, datos, contactos visibles, "Avisar que estoy aquí" (mapa + nota), "Mensaje" directo, reportar problema
4. **Actividad** — Historial completo: escaneos, avisos, ubicaciones, activaciones, pérdidas, devoluciones, transferencias
5. **Declarar Pérdida** — Cuándo, zona, circunstancias, instrucciones → métricas de escaneos/avisos → botón "ya volvió"
6. **Coordinar Devolución** — Dueño abre caso → código 6 dígitos único → Finder introduce código → Estados: proposed → accepted → in_transit → delivered
7. **Recompensa Comunitaria** — Al confirmar entrega: regalo garantizado (patrocinador) O dinámica gratuita (si país/edad permite) → enlace único → revela patrocinador, vigencia, código canje
8. **Panel Dueño** — Lista tags, editar, contactos, avisos (mapa privado), transferir, desactivar/eliminar, notificaciones, perfil
9. **Portal Aliados** — 2FA, validar canjes (ver beneficio antes), historial CSV, catálogo campañas
10. **Panel Admin** — Dashboard KPIs, lotes tags, usuarios, moderación, casos con SLA, fondo comunitario, catálogo premios, reglas recompensa, riesgo/fraude, auditoría, configuración global

### Capa On-Chain (Buildathon P0)
- Dueño ofrece recompensa opcional en **mUSDC** (MockUSDC, 6 decimales, token de prueba)
- Recompensa congelada en `RecoveryEscrow` hasta confirmación con **mismo código 6 dígitos** del flujo off-chain
- Pago liberado solo tras verificación del código por `VERIFIER_ROLE` (backend)
- On-chain: solo montos, estados, fechas, `caseId` (bytes32 hash) — **nunca datos personales**
- Caso sin recompensa completa igual, sin pasos extra

---

## Backend Implementation (NestJS)

### Estructura
```
apps/api/src/
├── main.ts                    # Bootstrap, puerto 3001, CORS, global prefix /api
├── app.module.ts              # Imports: Config, TypeORM, Health, Public, Setup, Blockchain
├── common/
│   ├── envelope.interceptor.ts    # Envoltura {data, error, meta, requestId}
│   ├── api-exception.ts           # ApiException(code, message, status, fieldErrors)
│   ├── all-exceptions.filter.ts   # Filtro global → envelope
│   └── request-id.middleware.ts   # requestId por petición
├── database/
│   ├── typeorm-options.ts         # buildTypeOrmOptions() → prod: DATABASE_URL + ssl, dev: vars
│   ├── data-source.ts             # DataSource para CLI migraciones
│   ├── migrations/                # 1738900000000-InitSchema.ts (tags, items, enums)
│   └── seed.ts                    # Datos iniciales
├── health/
│   ├── health.controller.ts       # GET /api/health → {status, db}
│   └── health.module.ts
├── public/
│   ├── public.controller.ts       # GET /api/public/tags/:slug, POST scans, finder-reports, location, messages
│   ├── public.service.ts
│   └── public-tag-profile.dto.ts
├── setup/
│   ├── setup.controller.ts        # GET /api/setup/run?key=SETUP_SECRET → migraciones + seed
│   └── setup.module.ts
├── blockchain/                    # ← NUEVO (Buildathon)
│   ├── blockchain.module.ts
│   ├── chain.service.ts           # ethers v6, provider HSK, wallets verifier/demo, contratos tipados
│   ├── case-otp.service.ts        # OTP 6 dígitos en memoria (hash SHA-256, 24h TTL, 5 intentos, single-use)
│   ├── blockchain.controller.ts   # POST /api/chain/cases, POST /api/chain/complete-return
│   └── abis/                      # ABIs TypeScript de MockUSDC + RecoveryEscrow
├── tags/, items/                  # Módulos existentes (entidades, controladores, servicios)
└── auth/                          # Módulo auth existente (OAuth, magic links)
```

### Patrones Clave
- **Envelope interceptor** — Toda respuesta: `{ data, error, meta, requestId }`
- **ApiException** — Códigos estables: `invalid_key`, `invalid_code`, `case_not_found`, etc.
- **Shared secret** — `SETUP_SECRET` y `CHAIN_DEMO_SECRET` protegen endpoints sensibles
- **TypeORM** — Entidades `Tag` (uuid, publicSlug, status enum, activationPinHash, itemId) + `Item` (uuid, type enum[pet|object], name, photoUrl, supportPhotoUrls[], publicMessage, petDetails JSON, objectDetails JSON, contacts JSON, lostReport JSON)
- **Migraciones** — `npm run migration:run` con `data-source.ts`

### Variables de Entorno (Producción)
```env
PORT=3001
FRONTEND_ORIGIN=https://appweb.meperdi.com
DATABASE_URL=postgresql://meperdi:xxx@127.0.0.1:5434/meperdi?sslmode=disable
HSK_RPC_URL=https://testnet.hsk.xyz
HSK_CHAIN_ID=133
RECOVERY_ESCROW_ADDRESS=0x42CaC70563DaA7a0833d8F22413bD8dBA0Dd0888
MOCK_USDC_ADDRESS=0x902f9814d334e3c61a57962381DbE6f2f64946f1
VERIFIER_PRIVATE_KEY=0x...
DEMO_OWNER_PRIVATE_KEY=0x...
CHAIN_DEMO_SECRET=dev-secret-change-in-prod
SETUP_SECRET=...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@meperdi.com
```

---

## Smart Contracts (Solidity 0.8.24, Hardhat)

### Ubicación
`apps/contracts/contracts/`

### MockUSDC.sol
```solidity
// ERC-20 estándar (OpenZeppelin), 6 decimales
// Nombre: "USDC de prueba (ME PERDÍ demo)" / Símbolo: "mUSDC"
// mint(address to, uint256 amount) — solo owner
```
- **Desplegado en HSK Testnet:** `0x902f9814d334e3c61a57962381DbE6f2f64946f1`
- Verificado en Blockscout

### RecoveryEscrow.sol
```solidity
// Hereda: AccessControl, Pausable, ReentrancyGuard
// Roles: DEFAULT_ADMIN_ROLE (pause/unpause), VERIFIER_ROLE (solo completeReturn)
// Enum CaseStatus: NONE, FUNDED, COMPLETED, REFUNDED
// Struct RecoveryCase { owner, token, rewardAmount, deadline, status }
// mapping(bytes32 => RecoveryCase) public cases

// createCase(bytes32 caseId, address token, uint256 rewardAmount, uint64 deadline)
//   - Si rewardAmount > 0: transferFrom(msg.sender) → contrato (requiere approve previo)
//   - Si rewardAmount == 0: registra caso sin mover fondos
//   - Emite CaseCreated

// completeReturn(bytes32 caseId, address helper) — onlyRole(VERIFIER_ROLE), nonReentrant
//   - Requiere status == FUNDED
//   - Marca COMPLETED, transfiere rewardAmount al helper (si > 0)
//   - Emite CaseCompleted

// refundExpired(bytes32 caseId) — anyone
//   - Requiere status == FUNDED y block.timestamp >= deadline
//   - Devuelve rewardAmount al owner, marca REFUNDED
//   - Emite CaseRefunded

// getCase(bytes32 caseId) — lectura pública completa
```
- **Desplegado en HSK Testnet:** `0x42CaC70563DaA7a0833d8F22413bD8dBA0Dd0888`
- Verificado en Blockscout
- `VERIFIER_ROLE` otorgado a `0x2506f83C52B0525D406Dab6659e70acFDDE60754` (backend wallet)

### Tests (10 passing)
```bash
cd apps/contracts && npx hardhat test
# 1. createCase mueve fondos owner → contrato
# 2. createCase rewardAmount=0 sin mover fondos
# 3. completeReturn sin VERIFIER_ROLE revierte
# 4. completeReturn doble revierte
# 5. completeReturn transfiere monto correcto
# 6. refundExpired antes deadline revierte
# 7. refundExpired después deadline devuelve fondos
# 8. pause bloquea completeReturn; unpause habilita
# 9. caseId duplicado revierte
# 10. decimales mUSDC = 6, símbolo = mUSDC
```

### Deploy Script
`scripts/deploy.ts` — Despliega MockUSDC + RecoveryEscrow, otorga VERIFIER_ROLE, mintea mUSDC a demo owner, imprime direcciones para backend.

---

## Frontend (React PWA)

### Stack
- **React 18** + **TanStack Router** (file-based routes) + **Vite**
- **Tailwind CSS** + **Lucide React** (iconos)
- **TanStack Query** (server state, cache, refetch)
- **Vite PWA Plugin** (service worker, workbox, manifest)
- **MSW** (mocks para desarrollo)

### Estructura de Rutas Principales
```
/
├── /                                    # Landing / Onboarding
├── /activate/:slug                      # Activar tag (wizard multi-paso)
├── /tag/:slug                           # Perfil público (finder view)
├── /return/:caseToken                   # Flujo finder: código 6 dígitos → reward claim
├── /reward/:claimToken                  # Reclamar gift token (patrocinador, simulado)
├── /dashboard                           # Panel dueño (tags, contactos, avisos, perfil)
├── /admin/*                             # Panel admin (protegido)
├── /partner/*                           # Portal aliados (protegido)
└── /loading                             # Pantalla loading animada (tracks + pasos)
```

### Componentes UI Reutilizables (`apps/web/src/components/ui/`)
`Screen`, `Card`, `Button`, `TextField`, `PhotoFrame`, `CardSkeleton`, `ErrorState`, `Switch`, `Chip`, `Modal`, `Toast`, `QRScanner`, `LocationMap`, `Avatar`, `Badge`, `Tabs`, `Dropdown`

### Estado Global (Zustand)
- `authStore` — usuario, tokens, métodos linked
- `finderReportStore` — reporte activo, ubicación
- `returnCaseStore` — caso activo, código, estado
- `notificationPrefsStore` — preferencias por canal/evento

### Integración Blockchain (Buildathon)
- `packages/api-client/src/chainApi.ts` — `createChainCase()`, `completeChainReturn()`
- `return.$caseToken.tsx` — Cuando `status === 'delivered' && hasReward`:
  - Input "Tu dirección de wallet (0x...)"
  - Botón "Recibir recompensa" → `completeChainReturn({ caseId, code, helperAddress })`
  - Muestra: monto, txHash, link a Blockscout explorer

### PWA Config
- `vite-plugin-pwa` → `generateSW`, precache 140+ assets
- `manifest.webmanifest` — name, icons 192/512, maskable, theme_color `#0f172a`
- Service Worker: `sw.js` + `workbox-*.js`
- Offline-first para assets estáticos, network-first para API

---

## Despliegue en VPS (Ubuntu 26.04)

### Servidor
- **Host:** 169.58.222.178
- **Usuario:** meperdi (sin sudo, home 750)
- **Stack:** Node 22, npm, pm2, nginx, Docker (PostgreSQL)
- **DNS:** `appweb.meperdi.com` (frontend), `apiappweb.meperdi.com` (backend) → A records a la IP

### Estructura en Servidor
```
/home/meperdi/
├── meperdi-backend/      # NestJS build (dist/), node_modules/, .env, ecosystem.config.js, logs/
├── meperdi-frontend/     # Archivos estáticos Vite (index.html, assets/, sw.js, manifest.webmanifest)
├── meperdi-packages/     # Paquetes locales (@meperdi/domain, validation, api-client, etc.)
└── .pm2/                 # pm2 home
```

### Procesos pm2
| Proceso | Script | Puerto | Descripción |
|---------|--------|--------|-------------|
| `meperdi-backend` | `dist/main.js` | 3001 | NestJS API |
| `meperdi-frontend` | `serve -s . -l 8080` | 8080 | Static serve (frontend) |

### Nginx (puertos 80/443)
- `appweb.meperdi.com` → `proxy_pass http://127.0.0.1:8080` (frontend)
- `apiappweb.meperdi.com` → `proxy_pass http://127.0.0.1:3001` (backend)
- Headers: CORS para frontend origin, security headers (X-Frame-Options, etc.)
- **SSL:** Let's Encrypt via certbot (90 días, auto-renew)

### Base de Datos
- **PostgreSQL 16 en Docker** — `127.0.0.1:5434`
- Usuario: `meperdi`, Pass: `wvog7Pgi3cfGslY8CuaIPV6y5o287iip`, DB: `meperdi`
- Conexión: `DATABASE_URL=postgresql://meperdi:xxx@127.0.0.1:5434/meperdi?sslmode=disable`

### Despliegue Típico
```bash
# Backend
rsync -avz -e "ssh -i ~/.ssh/meperdi_deploy_key" --exclude node_modules --exclude dist apps/api/ meperdi@IP:~/meperdi-backend/
ssh -i ~/.ssh/meperdi_deploy_key meperdi@IP "cd ~/meperdi-backend && npm install --omit=dev && pm2 restart meperdi-backend"

# Frontend
cd apps/web && npm run build
rsync -avz -e "ssh -i ~/.ssh/meperdi_deploy_key" apps/web/dist/ meperdi@IP:~/meperdi-frontend/
# pm2 restart meperdi-frontend (si cambió serve config)
```

---

## Variables Críticas para Blockchain (Testnet HSK)

| Variable | Valor | Dónde |
|----------|-------|-------|
| `HSK_RPC_URL` | `https://testnet.hsk.xyz` | backend `.env` |
| `HSK_CHAIN_ID` | `133` | backend `.env` |
| `RECOVERY_ESCROW_ADDRESS` | `0x42CaC70563DaA7a0833d8F22413bD8dBA0Dd0888` | backend `.env` |
| `MOCK_USDC_ADDRESS` | `0x902f9814d334e3c61a57962381DbE6f2f64946f1` | backend `.env` |
| `VERIFIER_PRIVATE_KEY` | `0x1e34a51fd2a3e01911a45039e4e24da4937660b3eac12e4be83086a40da35118` | backend `.env` |
| `DEMO_OWNER_PRIVATE_KEY` | `0x3fd262dbca093ae5a26060f6e2319613d82b5cf16edaa2a1ba150a21492aec7f` | backend `.env` |
| `VERIFIER_ADDRESS` | `0x2506f83C52B0525D406Dab6659e70acFDDE60754` | contracts `.env` |
| `DEMO_OWNER_ADDRESS` | `0xb7DDe50f5c81c2c1DD4aD8dcc1f0D1A49D899905` | contracts `.env` |
| `DEPLOYER_PRIVATE_KEY` | (wallet con HSK testnet) | contracts `.env` |

**Wallets necesitan HSK testnet (faucet: https://hskchain.net/faucet):**
- Verifier: para firmar `completeReturn` cada devolución
- Demo Owner: para `createCase` + `approve` mUSDC

---

## Tests y Comandos Útiles

```bash
# Contratos
cd apps/contracts && npx hardhat test           # 10 passing
cd apps/contracts && npx hardhat run scripts/deploy.ts --network hskTestnet

# Backend
cd apps/api && npm run build
cd apps/api && npm run start:dev
cd apps/api && npm run migration:run

# Frontend
cd apps/web && npm run dev
cd apps/web && npm run build

# Monorepo
npm run build        # build all packages + apps
npm run lint
npm run typecheck
```

---

## 🎯 WOW Factors para Jurados HSK Chain / EAG Global

### 1. **Producto Real en Producción, No Demo**
ME PERDÍ **ya existe y opera** (perfil público de tags activo). La capa on-chain se integra a un flujo real de devoluciones (código 6 dígitos, geolocalización, notificaciones), no es un hackathon prototype desconectado de la realidad.

### 2. **Código 6 Dígitos = Puente Off-Chain ↔ On-Chain**
El mismo código de entrega que usa la app off-chain (finder introduce 6 dígitos, dueño confirma en persona) **es la condición de liberación on-chain**. No hay oracle externo, no hay firma EIP-712 compleja: el código que ya existe en el flujo off-chain **es la llave on-chain**. Simplicidad extrema, auditabilidad total.

### 3. **Recompensa Realmente Opcional y Dueño-Controlada**
- Dueño decide **si** hay recompensa y **cuánto** (0 = sin recompensa, caso completa igual)
- Fondos **congelados en escrow** hasta verificación — ni platforma ni verificador pueden tocarlos
- `VERIFIER_ROLE` solo ejecuta `completeReturn` cuando el código es válido; **no decide montos, ni destinatarios, ni pausa el contrato**
- Caso sin recompensa (0 mUSDC) **completa idéntico** — blockchain no añade fricción

### 4. **Privacy by Design On-Chain**
On-chain **solo**: `caseId` (bytes32 hash), `rewardAmount`, `deadline`, `status`, `owner`, `token`.  
**Nunca**: nombres, teléfonos, GPS exacto, fotos, mensajes, identidades. El `caseId` es un hash opaco, no un ID legible.

### 5. **Despliegue Real en HSK Testnet + Verificación Blockscout**
- MockUSDC: `0x902f9814d334e3c61a57962381DbE6f2f64946f1`
- RecoveryEscrow: `0x42CaC70563DaA7a0833d8F22413bD8dBA0Dd0888`
- Código verificado en Blockscout (HSK testnet explorer)
- Transacciones reales visibles: `createCase`, `completeReturn`, `refundExpired`

### 6. **Integración Full-Stack Desplegada**
- Frontend PWA: https://appweb.meperdi.com (SSL, PWA, service worker)
- Backend API: https://apiappweb.meperdi.com/api/health (SSL, CORS, DB connected)
- Base de datos PostgreSQL en Docker aislado
- SSL Let's Encrypt en ambos dominios
- pm2 management, logs, restart policies

### 7. **Alineación Exacta con Tracks HSK/EAG**
| Track | Cómo ME PERDÍ encaja |
|-------|---------------------|
| **HSK Payment & Stablecoins** | MockUSDC (6 decimales, ERC-20) + Escrow con liberación condicional |
| **EAG Real-World Apps** | App real de recuperación comunitaria, coordenación off/on-chain, regiones emergentes (Bolivia) |
| **Bolivia Hackathon** | Equipo local, problema local (mascotas/objetos perdidos en LatAm) |

---

## ⚠️ 3 Puntos Débiles / Dudas / No Implementados

### 1. **OTP en Memoria (No Persistente)**
- `CaseOtpService` usa `Map` en memoria para guardar hash del código 6 dígitos + TTL + intentos
- **Problema:** Reinicio del backend = pérdida de códigos activos. En producción necesita Redis o tabla PostgreSQL.
- **Estado actual:** Aceptable para demo/hackathon; **blocker para producción**.

### 2. **Wallets Custodiadas en Backend (Demo Owner + Verifier)**
- `VERIFIER_PRIVATE_KEY` y `DEMO_OWNER_PRIVATE_KEY` viven en `.env` del backend
- Flujo real: dueño firma con su wallet (EIP-712 / smart wallet / passkey), no backend
- **Riesgo:** Si backend comprometido, atacante puede `completeReturn` o crear casos falsos
- **Mitigación actual:** Solo demo; claves separadas del deployer; wallets con fondos mínimos de testnet.

### 3. **Sin Firma Criptográfica del Dueño (EIP-712 / Smart Wallet)**
- El dueño **no firma** la creación del caso ni la liberación — comparte código 6 dígitos en persona
- **Consecuencia:** No hay prueba criptográfica on-chain de que el dueño autorizó la recompensa
- **Camino correcto (P1/P2):** EIP-712 `createCaseWithSignature` + `completeReturnWithSignature` o Smart Wallet (ERC-4337) con passkey
- **Por qué no está:** Tiempo limitado del buildathon; priorizamos flujo funcional end-to-end sobre UX criptográfica completa.

---

## Próximos Pasos (Roadmap P1/P2)

**P1 (si tiempo):**
- Señal de riesgo simple antes de liberar fondos (fallback a revisión manual)
- Opción donar recompensa al fondo comunitario
- Panel público agregado del fondo (total, casos resueltos, sin datos personales)

**P2 (post-buildathon):**
- Deploy en HSK Mainnet (chainId 177)
- Liquidación on-chain a aliados comerciales
- Reconocimiento privado opcional para helpers (no ranking público)
- Firma EIP-712 del owner (reemplazar código 6 dígitos)
- Smart wallets con passkey, multisig treasury

---

## Contacto / Referencias

- **Repositorio:** (privado)
- **HSK Testnet Explorer:** https://testnet-explorer.hsk.xyz
- **Contratos verificados:**
  - MockUSDC: `0x902f9814d334e3c61a57962381DbE6f2f64946f1`
  - RecoveryEscrow: `0x42CaC70563DaA7a0833d8F22413bD8dBA0Dd0888`
- **API Health:** https://apiappweb.meperdi.com/api/health
- **Frontend:** https://appweb.meperdi.com