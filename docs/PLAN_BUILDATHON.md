# Plan — ME PERDÍ On-Chain (Buildathon Ethereum Bolivia 2026)

## Tracks

- Bolivia Hackathon (registro base, obligatorio).
- EAG Global — **Real-World Ethereum Applications**: coordinación comunitaria,
  registro de contribución, aplicaciones para regiones emergentes. Es el track
  principal, el que mejor describe lo que ya es ME PERDÍ.
- HSK Chain — sub-track **Payment** y **Stablecoins**.
- Se necesita doble inscripción: Devfolio Ethereum Bolivia y Devfolio oficial de EAG,
  seleccionando los mismos tracks en ambos.

## Principio central

**ME PERDÍ premia la devolución segura, nunca incentiva a salir a buscar mascotas u
objetos por dinero.** Toda decisión de producto se filtra por esto:

- La recompensa siempre es opcional y la decide el dueño, nunca la plataforma.
- No hay ranking público de personas ni se muestra cuánto "gana" alguien por ayudar.
- El valor del regalo comunitario no se anuncia antes de la devolución.
- Nadie cobra dos veces por el mismo caso.
- Por defecto, ayudar no tiene ninguna recompensa económica asociada.

## Qué hace la blockchain (y qué no)

Hace:
- Congela una recompensa opcional ofrecida por el dueño hasta que la devolución se
  confirme.
- Administra ese fondo de forma transparente y auditable por cualquiera.
- Libera el pago automáticamente cuando (y solo cuando) se cumple la condición: el
  mismo código de entrega de un solo uso que ya usa el resto de la app.
- Deja un registro público de que un caso se resolvió, sin exponer quién es nadie.

No hace:
- No decide por sí sola si una devolución es legítima.
- No expone nombre, teléfono, ubicación exacta, fotos ni conversaciones.
- No construye un ranking de personas ni convierte ayudar en un trabajo remunerado.
- No le da a un único servicio automático la capacidad de vaciar el fondo por su
  cuenta — solo puede completar un caso puntual, ya congelado, ya con su condición
  cumplida.

## Roles del sistema on-chain

| Rol | Puede | No puede |
|---|---|---|
| Dueño | Crear un caso y congelar una recompensa opcional | Retirar la recompensa una vez confirmada la devolución |
| Verificador (backend) | Completar un caso ya congelado, cuando el código de entrega es correcto | Cambiar el monto, el token, elegir un destinatario libremente, pausar o administrar el contrato |
| Administrador | Pausar el contrato en una emergencia | Mover fondos de casos activos |
| Cualquiera | Consultar el estado, el balance del fondo y el historial de eventos | — |

## Red

- **Testnet (donde se construye y prueba todo primero):** chainId `133`, RPC
  `https://testnet.hsk.xyz`, explorador `https://testnet-explorer.hsk.xyz`.
- **Mainnet (paso final, solo si el tiempo alcanza):** chainId `177`, RPC
  `https://mainnet.hsk.xyz`, explorador `https://hashkey.blockscout.com`.
- El track permite entregar en testnet si el tiempo es limitado.

## Prioridades

**P0 — tiene que existir para el demo:**
1. Token de prueba (moneda estable simulada, sin valor real, claramente etiquetada
   como tal).
2. Contrato de custodia: crea un caso con recompensa opcional, la congela, la libera
   solo cuando el verificador confirma el código de entrega correcto, permite
   recuperar los fondos si el caso vence sin resolverse.
3. Pruebas automatizadas de los casos críticos: doble pago revierte, solo el
   verificador libera fondos, el reembolso respeta el plazo, pausar bloquea la
   liberación.
4. Despliegue en la testnet de HSK Chain y verificación del código fuente en el
   explorador.
5. El flujo del finder (que ya existe en la app) se extiende: al confirmarse el
   código de entrega, si el caso tiene recompensa, aparece la opción de recibirla —
   se pega una dirección de wallet y se muestra el comprobante real con el enlace al
   explorador.
6. Un caso sin recompensa se completa exactamente igual, sin pasos extra.
7. Documentación (README) explicando todo lo anterior.

**P1 — si el tiempo alcanza después de P0:**
1. Una señal de riesgo simple antes de liberar fondos (nunca decide sola, nunca
   reemplaza la verificación por código; si no hay forma de calcularla, se cae a
   revisión manual, nunca se simula un resultado).
2. Opción de donar la recompensa recibida de vuelta al fondo comunitario.
3. Panel público con el estado agregado del fondo (total, casos resueltos, sin
   nombres ni datos personales).

**P2 — solo si P0 y P1 ya funcionan de punta a punta:**
1. Repetir el despliegue, ya probado, en la mainnet de HSK Chain.
2. Negocios aliados liquidados directamente desde el fondo, on-chain.
3. Reconocimiento privado y opcional para quien ayuda (nunca un ranking público).

No se avanza a la siguiente prioridad sin que la anterior esté demostrada
funcionando de punta a punta: contrato desplegado, probado, backend conectado,
frontend conectado, y una transacción real visible en el explorador.
