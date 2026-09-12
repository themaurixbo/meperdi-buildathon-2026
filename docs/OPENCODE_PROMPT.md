# Prompt de desarrollo — ME PERDÍ On-Chain (P0)

Estás implementando la integración blockchain de ME PERDÍ, una app real de
recuperación de mascotas y objetos perdidos vía tags QR. El repo ya tiene un frontend
(React + TanStack Router + Vite, en `apps/web`) y un backend (NestJS + TypeORM +
PostgreSQL, en `apps/api`) funcionando. Lee `docs/FUNCIONALIDAD.md` y
`docs/PLAN_BUILDATHON.md` antes de empezar — ahí está el contexto completo del
producto y del plan. Este documento es la especificación técnica exacta de lo que hay
que construir. Impleméntalo en el orden en que aparece. No avances a una sección
sin que la anterior compile, pase sus pruebas, y (donde aplique) esté desplegada y
verificada.

## Principio que gobierna cada decisión de diseño

ME PERDÍ premia la devolución segura, nunca incentiva a buscar mascotas u objetos por
dinero. Consecuencias directas para lo que construyes:

- La recompensa es siempre opcional y la fija el dueño al crear el caso. Nunca la
  elige el backend ni el verificador.
- El pago se libera únicamente cuando se cumple una condición verificable (el código
  de entrega de un solo uso), nunca por una decisión discrecional de un servicio
  automático.
- No hay ranking público de personas, ni se expone cuánto "gana" alguien.
- Nunca se guarda on-chain: nombre, teléfono, dirección, ubicación exacta, fotos,
  mensajes, ni ninguna identidad. Solo montos, estados, fechas y un identificador de
  caso que es un hash, no texto legible.
- Un mismo caso no puede pagarse dos veces.
- Un caso sin recompensa se completa exactamente igual de bien que uno con recompensa.

## Red

- **Testnet HSK Chain** (usar esta primero, y para todo el desarrollo/pruebas):
  chainId `133`, RPC `https://testnet.hsk.xyz`, explorador
  `https://testnet-explorer.hsk.xyz` (Blockscout — verifica el código fuente ahí tras
  cada deploy).
- Mainnet (no desplegar ahí hasta que todo lo de abajo esté probado en testnet):
  chainId `177`, RPC `https://mainnet.hsk.xyz`, explorador
  `https://hashkey.blockscout.com`.
- Faucet de testnet: revisa `https://hskchain.net/faucet` o la documentación oficial
  vigente al momento de construir esto — la wallet del "verificador" y la wallet
  "dueño de demo" necesitan HSK de prueba para pagar gas.

## Lo que ya existe en el repo (no lo reconstruyas, reutilízalo)

- `packages/domain/src/returnCase.ts` — estados de un caso de devolución
  (`ReturnCaseStatus`: proposed/accepted/in_transit/delivered/cancelled/disputed) y
  las transiciones válidas.
- `packages/validation/src/returnCase.ts` — `handoffCodeSchema` (código de 6 dígitos
  numéricos) y `lostReportSchema`. El código de entrega on-chain debe seguir el mismo
  formato de 6 dígitos.
- `apps/web/src/routes/return.$caseToken.tsx` — la pantalla del finder donde ya
  introduce el código de entrega de 6 dígitos y ve el estado del caso
  (`verifyHandoffCode`, `getPublicReturnCase`). Aquí es donde se agrega la pieza
  nueva, no en una pantalla aparte.
- `apps/api/src/common/` — ya existe un interceptor que envuelve toda respuesta en
  `{ data, error, meta, requestId }` (`envelope.interceptor.ts`) y un filtro de
  excepciones (`all-exceptions.filter.ts`, junto con `api-exception.ts` para lanzar
  errores con código propio). Los endpoints nuevos deben usar este mismo patrón — no
  crear un formato de respuesta distinto.
- `apps/api/src/setup/setup.controller.ts` — patrón ya usado para proteger un
  endpoint sensible con una clave compartida leída de una variable de entorno
  (`SETUP_SECRET`). Usa el mismo patrón para proteger el endpoint que crea casos de
  demo.
- `apps/api/src/health/`, `apps/api/src/public/` — patrón de módulo NestJS a seguir
  (`*.module.ts`, `*.controller.ts`, `*.service.ts`).
- `packages/api-client/src/` — cada área de la API tiene su propio archivo de cliente
  (`publicApi.ts`, `ownerApi.ts`, etc.) que envuelve `apiRequest` de `http.ts`. Sigue
  el mismo patrón para el cliente nuevo.

No modifiques el flujo de "gift token" ya existente
(`apps/web/src/mocks/handlers/reward.ts`, `apps/web/src/routes/reward.$claimToken.tsx`)
— esa modalidad de agradecimiento (regalo de un patrocinador) sigue funcionando
exactamente igual, simulada, sin blockchain. Lo que construyes es una modalidad
nueva y separada: recompensa opcional del dueño, en un token de prueba, con custodia
on-chain.

## 1. Contratos — `apps/contracts/` (workspace nuevo)

Stack: Solidity `0.8.24`, Hardhat, `@openzeppelin/contracts` (usa `AccessControl`,
`Pausable`, `ReentrancyGuard` de ahí, no los reimplementes), `@nomicfoundation/hardhat-toolbox`,
`@nomicfoundation/hardhat-verify` configurado para el explorador de HSK testnet
(Blockscout expone una API compatible con Etherscan; confirma la URL exacta de esa
API contra `https://testnet-explorer.hsk.xyz` antes de configurar `hardhat.config.ts`).

Añade este workspace al `workspaces` del `package.json` raíz si no queda incluido
automáticamente por el patrón `apps/*`.

### 1.1 `contracts/MockUSDC.sol`

- ERC-20 estándar (hereda de OpenZeppelin), 6 decimales (igual que USDC real).
- `mint(address to, uint256 amount)` — solo el owner del contrato.
- Nombre y símbolo que dejen claro que es de prueba, por ejemplo
  `"USDC de prueba (ME PERDÍ demo)"` / `"mUSDC"`. No lo llames ni lo describas como
  una stablecoin real en ningún comentario, evento o metadato.

### 1.2 `contracts/RecoveryEscrow.sol`

Hereda `AccessControl`, `Pausable`, `ReentrancyGuard`.

Roles:
- `DEFAULT_ADMIN_ROLE` — puede pausar/despausar. Para el demo, la wallet
  administradora puede ser una wallet de desarrollo separada (no la wallet personal
  del dueño del proyecto, y nunca la misma que `VERIFIER_ROLE`).
- `VERIFIER_ROLE` — únicamente puede llamar a `completeReturn`. No tiene ninguna otra
  capacidad: no puede pausar, no puede crear casos, no puede cambiar montos ni
  destinatarios fuera de lo que ya se validó al crear el caso.

Estado por caso:

```solidity
enum CaseStatus { NONE, FUNDED, COMPLETED, REFUNDED }

struct RecoveryCase {
    address owner;
    address token;
    uint256 rewardAmount;
    uint64 deadline;
    CaseStatus status;
}

mapping(bytes32 => RecoveryCase) public cases;
```

`caseId` es siempre un `bytes32` (por ejemplo `keccak256` del número de caso interno
de ME PERDÍ, calculado off-chain) — nunca un `string` con el número de caso en texto
legible on-chain.

Funciones:

```solidity
function createCase(
    bytes32 caseId,
    address token,
    uint256 rewardAmount,
    uint64 deadline
) external whenNotPaused;
```
- Revierte si `caseId` ya existe.
- Si `rewardAmount > 0`, transfiere ese monto desde `msg.sender` (el dueño) al
  contrato vía `transferFrom` (el dueño debe haber aprobado el gasto antes — o, para
  el flujo de demo del punto 2 más abajo, quien llama es la wallet "dueño de demo" que
  el propio backend controla y que ya se auto-aprobó el gasto).
- Si `rewardAmount == 0`, el caso igual se crea (para que un caso sin recompensa
  también exista on-chain como registro, sin mover fondos) — decide si esto amerita
  status `FUNDED` igual o un status separado; lo importante es que `completeReturn`
  funcione igual en ambos casos.
- Guarda el caso con status `FUNDED`, emite `CaseCreated(caseId, owner, token, rewardAmount, deadline)`.

```solidity
function completeReturn(
    bytes32 caseId,
    address helper
) external onlyRole(VERIFIER_ROLE) nonReentrant whenNotPaused;
```
- Revierte si el caso no existe o no está `FUNDED`.
- Marca `COMPLETED`.
- Si `rewardAmount > 0`, transfiere el token al `helper`.
- Emite `CaseCompleted(caseId, helper, rewardAmount)`.
- Un caso `COMPLETED` no puede volver a completarse (el chequeo de status ya lo
  garantiza).

```solidity
function refundExpired(bytes32 caseId) external nonReentrant;
```
- Cualquiera puede llamarla.
- Revierte si el caso no está `FUNDED`, o si `block.timestamp < deadline`.
- Devuelve el monto al `owner` original, marca `REFUNDED`, emite `CaseRefunded(caseId)`.

```solidity
function pause() external onlyRole(DEFAULT_ADMIN_ROLE);
function unpause() external onlyRole(DEFAULT_ADMIN_ROLE);
```

Lectura pública: `getCase(bytes32 caseId)` devolviendo el struct completo (para que
cualquiera pueda auditar el estado del fondo sin necesitar el backend).

Usa errores personalizados (`error CaseAlreadyExists();`, etc.) en vez de strings de
`require` donde sea razonable, para ahorrar gas y quedar prolijo.

### 1.3 Pruebas — `test/RecoveryEscrow.test.ts`

Con Hardhat + Chai/Mocha, cubrir como mínimo:
1. Crear y fondear un caso mueve el balance del dueño al contrato.
2. Crear un caso con `rewardAmount = 0` funciona sin mover fondos.
3. `completeReturn` llamado por una cuenta sin `VERIFIER_ROLE` revierte.
4. `completeReturn` dos veces sobre el mismo caso revierte la segunda vez.
5. `completeReturn` transfiere el monto correcto al helper.
6. `refundExpired` antes del `deadline` revierte.
7. `refundExpired` después del `deadline` devuelve los fondos al dueño.
8. `pause()` bloquea `completeReturn`; `unpause()` lo vuelve a habilitar.
9. Crear un caso con un `caseId` repetido revierte.

Todas deben pasar (`npx hardhat test`) antes de seguir.

### 1.4 Deploy — `scripts/deploy.ts`

- Despliega `MockUSDC` y `RecoveryEscrow` en HSK testnet.
- Otorga `VERIFIER_ROLE` a la wallet del verificador (dirección desde variable de
  entorno).
- Acuña una cantidad de `MockUSDC` de prueba a una wallet "dueño de demo" (dirección
  desde variable de entorno) para poder crear casos con recompensa durante la demo.
- Imprime las direcciones desplegadas — van a necesitarse en el backend.
- Después del deploy, verifica el código fuente de ambos contratos en
  `https://testnet-explorer.hsk.xyz` (vía `hardhat-verify`) y confirma que el enlace
  al código verificado funciona antes de continuar.

## 2. Backend — `apps/api/src/blockchain/` (módulo nuevo)

### `chain.service.ts`
- `ethers.js` (o `viem`, lo que ya esté más integrado en el resto del backend —
  revisa si hay una preferencia establecida antes de elegir). `JsonRpcProvider`
  apuntando al RPC de HSK testnet.
- Dos `Wallet`: la del **verificador** (única con `VERIFIER_ROLE`, solo puede llamar
  `completeReturn`) y la del **dueño de demo** (usada únicamente para poder crear
  casos de ejemplo sin pedirle a un juez que tenga una wallet fondeada — documentar
  esto como una simplificación de demo en el README, no como el flujo de producción
  real, donde el dueño real firmaría con su propia wallet).
- Instancias tipadas de `RecoveryEscrow` y `MockUSDC` (ABI generado por Hardhat).
- Función para construir la URL del explorador a partir de un hash de transacción.

### `case-otp.service.ts`
- Genera un código de 6 dígitos al crear un caso (mismo formato que
  `handoffCodeSchema`).
- Guarda solo el hash del código (no el código en texto plano), asociado al `caseId`,
  con una expiración razonable (ej. 24 horas) y un contador de intentos fallidos.
- Para el alcance de esta Buildathon, un `Map` en memoria dentro del servicio es
  aceptable — no hace falta una tabla nueva en PostgreSQL todavía (dejarlo como
  próximo paso en el README).
- Marca el código como usado tras una verificación exitosa; una segunda verificación
  con el mismo código debe fallar.

### `blockchain.controller.ts`

```
POST /api/chain/cases
```
- Protegido con el mismo patrón de clave compartida que `SETUP_SECRET`
  (`apps/api/src/setup/`) — variable de entorno propia, ej. `CHAIN_DEMO_SECRET`.
- Body: `{ itemName: string, rewardAmount?: string }` (monto en unidades legibles,
  ej. `"10"` para 10 mUSDC; convertir a la unidad on-chain con los decimales
  correctos).
- Genera un `caseId` nuevo (hash de un identificador interno), llama a `createCase`
  desde la wallet "dueño de demo", genera el código OTP, y devuelve
  `{ caseId, code, txHash, explorerUrl }`. El `code` solo se devuelve en esta
  respuesta (simulando que el dueño se lo comparte al finder en persona) — no se
  vuelve a exponer después.

```
POST /api/chain/complete-return
```
- Body: `{ caseId: string, code: string, helperAddress: string }`.
- Valida el formato de `helperAddress` (dirección EVM válida).
- Verifica el código contra `case-otp.service.ts`; si falla, responde con un error
  claro (reutilizar `ApiException` con un código propio, ej. `invalid_code`) y no
  toca la blockchain.
- Si el código es válido, llama a `completeReturn(caseId, helperAddress)` con la
  wallet verificadora, espera la confirmación, y devuelve
  `{ txHash, explorerUrl, rewardAmount }`.
- Si el caso no existe, ya está completado, o el helper address es inválida, devolver
  errores específicos y entendibles, nunca un 500 genérico.

Registrar `BlockchainModule` en `apps/api/src/app.module.ts`, igual que los módulos
existentes.

### Variables de entorno nuevas (agregar a `apps/api/.env.example`)

```
HSK_RPC_URL=https://testnet.hsk.xyz
HSK_CHAIN_ID=133
RECOVERY_ESCROW_ADDRESS=
MOCK_USDC_ADDRESS=
VERIFIER_PRIVATE_KEY=
DEMO_OWNER_PRIVATE_KEY=
CHAIN_DEMO_SECRET=
```

Ninguna de estas dos claves privadas debe ser una wallet personal real ni tener
fondos más allá de lo mínimo para pagar gas de prueba. Nunca deben llegar al
frontend ni a git.

## 3. Frontend

### `packages/api-client/src/chainApi.ts` (nuevo)
Cliente para los dos endpoints, siguiendo el mismo patrón que el resto de
`packages/api-client/src/*Api.ts` (usar `apiRequest` de `./http`).

### `apps/web/src/routes/return.$caseToken.tsx` (modificar)
En la rama donde `status === 'in_transit' || verified` (donde hoy se muestra
"Código verificado. Esperando confirmación del propietario."), agregar: si el caso
tiene una recompensa asociada (esto requiere que `getPublicReturnCase` o un nuevo
campo indique si hay recompensa — revisa `packages/api-client/src/types.ts` y
extiende `PublicReturnCaseView` si hace falta), mostrar un bloque nuevo:
- Campo de texto: "Tu dirección de wallet (0x...)".
- Botón "Recibir recompensa".
- Al confirmar, llama a `/api/chain/complete-return` con el `caseId` correspondiente,
  el código ya verificado, y la dirección ingresada.
- Muestra el resultado: monto recibido, hash de transacción, y un enlace que abre
  `explorerUrl` en una pestaña nueva.
- Si el caso no tiene recompensa, no se muestra nada nuevo — el flujo actual
  ("¡Volvió a casa! Gracias por tu ayuda.") sigue exactamente igual.

No se conecta ninguna wallet tipo MetaMask en este flujo — la persona solo pega su
dirección pública. Es una decisión deliberada por confiabilidad del demo en vivo, no
un descuido; déjalo explícito en el README.

## 4. README (raíz del repo)

Debe incluir, en este orden: qué es ME PERDÍ y el problema real que resuelve; el
principio "se premia la devolución, no la búsqueda"; los tracks a los que postula;
arquitectura (un diagrama simple de texto está bien); qué ya existía de ME PERDÍ antes
de esta Buildathon y qué se construyó durante el evento (sé explícito y honesto en
esta distinción); direcciones de los contratos desplegados y enlaces a su código
verificado en el explorador; cómo instalar y correr el proyecto; cómo correr las
pruebas de los contratos; guion de la demo paso a paso; limitaciones conocidas
(código de entrega en vez de firma criptográfica del propietario, OTP en memoria en
vez de base de datos, wallet pegada a mano en vez de conexión real, testnet en vez de
mainnet); y roadmap con esos mismos puntos como próximos pasos. Tono simple y
directo. No menciones que el código fue generado por un asistente de IA en ninguna
parte del texto.

## Qué no construir ahora

No implementes firma EIP-712 del propietario, roles adicionales (`TREASURY_ROLE`,
`SPONSOR_ROLE`), NFTs de reputación, panel público de impacto, verificación
antifraude con visión por IA, multisig, smart wallets con passkey, ni deploy en
mainnet. Todo eso queda documentado como roadmap en el README. Constrúyelo solo si
todo lo de arriba (P0) ya está funcionando de punta a punta — contratos probados y
verificados, backend conectado a la red real, frontend mostrando una transacción real
con su enlace al explorador — y todavía queda tiempo.

## Checklist de "terminado" para P0

- [ ] `npx hardhat test` en verde.
- [ ] Contratos desplegados en HSK testnet, código fuente verificado, enlaces
      funcionando.
- [ ] `POST /api/chain/cases` y `POST /api/chain/complete-return` probados con
      `curl` contra la testnet real, con hash de transacción real.
- [ ] Flujo completo en `/return/:caseToken`: verificar código, pegar wallet, ver el
      comprobante con el enlace real al explorador.
- [ ] Un caso sin recompensa se completa sin ningún paso extra.
- [ ] README completo con todas las secciones pedidas arriba.
