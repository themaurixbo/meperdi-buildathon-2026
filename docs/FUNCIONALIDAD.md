# ME PERDÍ — Funcionalidad completa

ME PERDÍ conecta un tag físico con QR a un perfil digital seguro, para que una
mascota o un objeto de valor perdido pueda volver con su dueño. No es solo para
mascotas: cualquier cosa importante — un celular, una mochila, una bicicleta, un
instrumento musical, un equipaje, un juego de llaves, una laptop, una cámara, una
billetera, herramientas de trabajo, documentos — puede llevar un tag ME PERDÍ.

## 1. Roles

### Dueño
Persona que registra y activa uno o más tags para sus mascotas u objetos. Tiene
cuenta, ve su panel, coordina devoluciones, decide si ofrece una recompensa.

### Finder (quien encuentra)
Persona que escanea un tag, con o sin cuenta. Puede avisar, compartir ubicación,
mandar un mensaje, coordinar la entrega y reclamar un agradecimiento — todo sin
instalar nada ni registrarse si no quiere.

### Aliado comercial
Negocio (veterinaria, pet shop, refugio, tienda) que participa del fondo comunitario:
valida canjes, aparece en campañas, recibe liquidaciones.

### Administración
Equipo interno de ME PERDÍ. Opera lotes de tags, modera contenido, resuelve casos y
disputas, administra el fondo comunitario, ajusta reglas y configuración global.

### Verificador on-chain (nuevo, técnico)
No es una persona: es el rol que tiene el backend dentro del contrato de blockchain.
Solo puede completar un caso y liberar una recompensa ya congelada — no puede retirar
fondos de ninguna otra forma, no decide montos, no tiene autoridad de administrador.

## 2. Casos de uso

**Mascotas:** perros, gatos y cualquier otra mascota con collar o placa.

**Objetos de valor:** celulares, mochilas, laptops, bicicletas, cámaras, instrumentos
musicales, equipaje, llaves de auto o casa, billeteras, lentes, herramientas de
trabajo, documentos importantes — cualquier cosa que alguien quiera proteger con la
posibilidad de que un extraño la devuelva sin fricción.

## 3. Onboarding y acceso

- Pantalla de bienvenida con explicación corta de cómo funciona.
- El recorrido de bienvenida (onboarding) se muestra solo la primera vez que alguien
  entra a la app.
- Inicio de sesión: Google, Apple, Facebook, Instagram, o correo con código de un
  solo uso — se elige el que la persona ya usa, sin crear una cuenta nueva a mano.
- Splash screen animado al abrir la app.

## 4. Activar un tag (asistente paso a paso)

1. Escanear el QR con la cámara real del dispositivo.
2. Ingresar el PIN privado que viene impreso o raspable dentro del empaque.
3. Elegir si es una mascota o un objeto.
4. Si es mascota: especie, raza, color, sexo, edad aproximada, temperamento, cuidado
   urgente (por ejemplo, medicación).
5. Si es objeto: qué es, marca, color, y qué lo distingue — nunca se pregunta "raza"
   para un objeto.
6. Foto de perfil, tomada con la cámara o elegida de la galería.
7. Fotos de apoyo adicionales, una por una, se pueden agregar o quitar.
8. Mensaje público — la app sugiere una plantilla distinta si es mascota (más
   emocional) u objeto (más directo), y se puede editar.
9. Contactos: hasta 5, cada uno con nombre, teléfono, canales de contacto (llamada,
   WhatsApp, SMS), horario, prioridad y si se muestra públicamente o no.
10. Vista previa de cómo se va a ver el perfil público antes de confirmar.

## 5. Perfil público (lo que ve quien escanea el tag)

- Foto de perfil grande y redonda, con las fotos de apoyo debajo en un carrusel que se
  puede ampliar.
- El contenido que se muestra depende del estado del tag: si está sin activar,
  suspendido o desactivado, nunca se expone ningún dato del item ni de sus contactos.
- Mensaje del dueño y los datos correspondientes (mascota u objeto).
- Contactos visibles, ordenados por prioridad, con botón directo para llamar,
  escribir por WhatsApp o mandar SMS.
- **Avisar que estoy aquí** — comparte la ubicación aproximada en un mapa real, con un
  marcador que se puede arrastrar; si se mueve del punto detectado automáticamente,
  pide una nota explicando por qué (por ejemplo, "voy a estar acá en 30 minutos").
- **Mensaje** — enviarle un texto directo al dueño sin necesidad de cuenta.
- Consejos de seguridad para quien encontró algo.
- Reportar un problema con el tag: dañado, contenido incorrecto, posible fraude, o
  situación de riesgo.
- Botón para volver al inicio (a la app si hay sesión, o a la portada si no).

## 6. Actividad y trazabilidad

Cada vez que alguien escanea un tag — sea uno nuevo o uno ya activo — queda un
registro con fecha, hora, una aproximación de ubicación por IP, y lo que el
dispositivo expone sin pedir ningún permiso (idioma, zona horaria, tipo de pantalla,
de dónde vino la visita). Compartir ubicación desde "avisar que estoy aquí" queda en
esa misma línea de tiempo. El dueño puede ver un historial completo, ordenado del más
reciente al más antiguo, con cada escaneo, aviso, activación, declaración de pérdida,
confirmación de devolución, vuelta a casa, transferencia, desactivación o eliminación.

## 7. Declarar pérdida y coordinar la devolución

- El dueño declara la pérdida: cuándo pasó, la zona aproximada, las circunstancias, e
  instrucciones para quien lo encuentre (puede actualizarlo después).
- Mientras el tag está en estado de pérdida, el dueño ve una tarjeta con las métricas
  de escaneos y avisos recibidos, un botón para compartir un cartel de búsqueda, y un
  botón "ya volvió" para los casos que se resuelven fuera del flujo formal.
- Cuando alguien avisa que lo encontró, el dueño puede abrir un caso de devolución.
- Se genera un código de entrega de 6 dígitos, de un solo uso.
- El finder ve una pantalla con el estado del caso en tiempo real (propuesta
  enviada → aceptada → en camino → entregado, con opción de cancelar o abrir una
  disputa) y un campo para introducir el código que le compartió el dueño en persona.
- El dueño confirma la devolución una vez completada la entrega.

## 8. Recompensa comunitaria

- Al confirmarse la devolución, el finder puede reclamar un agradecimiento —incluso
  sin haberse registrado, con un enlace de un solo uso.
- Dos modalidades: un regalo garantizado de un patrocinador, o (si el país y la edad
  lo permiten) una dinámica gratuita.
- El mismo enlace nunca entrega el premio dos veces.
- La pantalla de "revelar premio" muestra el patrocinador, la vigencia y el código de
  canje.
- Se aclara siempre que aportar al fondo comunitario no da ninguna ventaja para ganar.

## 9. Panel del dueño

- Lista de todos sus tags/items, con estado y foto.
- Detalle de cada uno: editar foto, fotos de apoyo, mensaje público, datos de mascota
  u objeto.
- Gestión de contactos: reordenar por prioridad, cambiar canales y visibilidad,
  agregar o quitar (máximo 5).
- Ver los avisos recibidos, con el mapa de ubicación (solo lo ve el dueño, nunca es
  público), datos de contacto del finder si él los compartió, y opción de reportar
  abuso.
- Transferir el tag a otra persona con un código y un enlace.
- Desactivar (reversible) o eliminar (libera el tag para reactivarse) con doble
  confirmación.
- Preferencias de notificación por tipo de evento y canal.
- Perfil: métodos de acceso vinculados, sesiones activas, exportar mis datos, cerrar
  sesión, eliminar cuenta (con doble confirmación).

## 10. Portal de aliados comerciales

- Acceso con verificación en dos pasos (correo + código).
- Validar un código de canje: ver el beneficio antes de confirmar, y confirmar el
  canje.
- Historial de redenciones, con filtros por estado y exportación a CSV.
- Catálogo de campañas: ver las existentes y crear nuevas (beneficio, stock, vigencia,
  locales donde aplica, reglas).

## 11. Panel de administración

- Dashboard con tags totales, activaciones, pérdidas, devoluciones, tasa de
  recuperación, saldo del fondo, y desglose por estado.
- Lotes de tags: generar lotes nuevos con cantidad y prefijo de código.
- Usuarios: buscar, ver métodos de acceso vinculados, suspender o reactivar cuentas.
- Moderación: fotos o mensajes reportados, con acciones de advertir, suspender el
  perfil, o descartar el reporte.
- Casos: avisos, devoluciones y disputas, con tiempo límite de atención y asignación
  a una persona del equipo.
- Fondo comunitario: entradas, reservas, premios emitidos, saldo actual, alerta si
  el saldo baja demasiado.
- Catálogo de premios: aliado, inventario, costo, a quién va dirigido, vigencia,
  prioridad.
- Reglas de recompensa: premio garantizado siempre activo; dinámica opcional que se
  puede prender o apagar, con tope por persona, edad mínima, países habilitados y
  reglas antifraude.
- Riesgo y fraude: señales como muchos escaneos seguidos del mismo tag, cuentas
  duplicadas, o ubicaciones que no tienen sentido — con acción de bloquear o descartar.
- Auditoría: quién hizo qué, cuándo, con qué motivo, y el antes/después de cada
  cambio importante.
- Configuración: países, idiomas, proveedores de acceso, activadores de funciones,
  canales de notificación disponibles.

## 12. Plataforma

- Funciona como aplicación instalable (PWA), sin depender de una tienda de apps.
- El frontend puede desplegarse tanto en la raíz de un dominio como en una subcarpeta,
  sin cambios de código.
- El backend real (base de datos y API) ya está construido y probado en producción,
  cubriendo hoy el perfil público de un tag; el resto de los flujos vive en una capa
  de simulación mientras se termina de construir el backend completo.

## 13. Capa on-chain (agregado para la Buildathon)

- El dueño puede, de forma opcional, ofrecer una recompensa en una moneda estable de
  prueba al declarar la pérdida o al coordinar la devolución.
- Esa recompensa queda congelada en un contrato — nadie puede tocarla hasta que se
  confirme la devolución con el mismo código de entrega que ya usa el resto de la app.
- El pago se libera solo después de esa confirmación, nunca antes y nunca por
  decisión de un proceso automático sin ese paso de verificación.
- La transacción es real y se puede revisar en el explorador público de la red.
- No se guarda en la blockchain nombre, teléfono, ubicación exacta ni fotos — solo
  montos, estados y un identificador del caso que no revela información personal.
- Si nadie ofrece recompensa, el caso se completa exactamente igual, sin ningún paso
  extra ni fricción — la recompensa es siempre opcional, nunca un requisito para
  ayudar.
