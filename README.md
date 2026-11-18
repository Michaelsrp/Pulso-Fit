# Pulso Fit · Aplicación web

Aplicación responsive mobile-first en español, construida con Next.js 16 (App Router), React 19, Tailwind CSS 4 y Supabase. La interfaz conserva la identidad clara de Pulso Fit: fondo `#FAFAFA`, acento `#FFB81C`, texto `#222` y tipografía Poppins cargada mediante `next/font/google`. Las capturas de Smart Fit se usaron únicamente como referencia de composición (barra superior, buscador, filtros, tarjetas y menú lateral), no como marca ni como recursos visuales reutilizados.

> **Estado:** el código, los scripts y el SQL se han revisado estáticamente. No se afirma que la aplicación haya sido compilada o ejecutada en este entorno. Ejecuta `npm run build` en tu equipo antes de desplegar.

## Requisitos

- Node.js 20.9 o superior (recomendado Node.js 22 LTS).
- npm.
- Proyecto Supabase para autenticación, Postgres y almacenamiento.
- Cuenta de Vercel para publicar.

## Ejecutar localmente

**Abre la terminal en la carpeta que contiene directamente `package.json`.** En el ZIP actualizado, `package.json` queda en la raíz del proyecto (no hay una segunda carpeta `pulsfit-web` dentro). En VS Code, abre esa misma carpeta como proyecto.

```bash
npm install
cp .env.example .env.local
npm run dev
```

En PowerShell:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Abre `http://localhost:3000`. Sin variables Supabase se habilita una demostración local para recorrer onboarding, inicio, entrenamiento, alimentación y ajustes. La demostración no crea una cuenta real, no sincroniza información y no sirve para validar RLS ni funciones de Supabase.

Si Next.js informa que detectó varios `package-lock.json`, verifica que no hayas ejecutado `npm install` en una carpeta superior que no contiene el `package.json` de Pulso Fit. Puedes borrar únicamente el `package-lock.json` accidental de esa carpeta superior; conserva el que se genera junto al `package.json` del proyecto. `next.config.ts` fija `turbopack.root` a la carpeta actual para evitar que Turbopack tome OneDrive o el directorio del usuario como raíz.

Antes de publicar, ejecuta:

```bash
npm run typecheck
npm run build
npm run lint
```

## Variables de entorno

`.env.example` contiene únicamente variables públicas necesarias para el cliente web:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_O_PUBLISHABLE
NEXT_PUBLIC_EXERCISE_MEDIA_BASE_URL=
```

`NEXT_PUBLIC_EXERCISE_MEDIA_BASE_URL` es opcional. Solo debe configurarse si el proveedor de animaciones confirma derechos de uso, distribución y carga desde el dominio de la aplicación. La aplicación forma la ruta `{base}/{media_id}.mp4`.

## Configurar Supabase (orden recomendado)

1. Crea un proyecto Supabase y copia Project URL y la clave anon/publishable en `.env.local`.
2. Ejecuta `supabase/schema.sql` desde Supabase → SQL Editor. El esquema crea las tablas, vistas, índices, políticas RLS, buckets privados y funciones seguras. Puede volver a ejecutarse para aplicar las migraciones incluidas; revisa el resultado de SQL Editor antes de continuar.
3. Importa el catálogo completo de `data/exercises_es_slim.json` (1.324 ejercicios) con el importador local:

   macOS/Linux:

   ```bash
   SUPABASE_URL=https://TU-PROYECTO.supabase.co SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY npm run import:exercises
   ```

   PowerShell:

   ```powershell
   $env:SUPABASE_URL="https://TU-PROYECTO.supabase.co"
   $env:SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY"
   npm run import:exercises
   ```

   **La `service_role` se utiliza únicamente por el importador local.** No la incluyas en `.env.local`, en el cliente, en GitHub ni en las variables de Vercel. Nunca debe llevar el prefijo `NEXT_PUBLIC_`. El importador se ejecuta como script local y no se incorpora al bundle web.
4. Después de importar los ejercicios, ejecuta `supabase/routines_seed.sql` en SQL Editor. El archivo crea ejercicios originales de caminata/trote y parque para exterior, 60 plantillas y 300 jornadas de lunes a viernes con calentamiento y vuelta a la calma. **Al volver a ejecutarlo, reemplaza el conjunto de plantillas de `public.routines` y sus jornadas/asignaciones** para garantizar que queden exactamente las 60 combinaciones incluidas en este proyecto; no lo uses si guardaste rutinas personalizadas en esas mismas tablas.
5. Para comprobar los datos con RLS, usa una cuenta normal autenticada (no la service role):

   macOS/Linux:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA SUPABASE_USER_EMAIL=TU_CORREO SUPABASE_USER_PASSWORD=TU_CONTRASENA npm run verify:routines
   ```

   PowerShell:

   ```powershell
   $env:NEXT_PUBLIC_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
   $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="TU_CLAVE_PUBLICA"
   $env:SUPABASE_USER_EMAIL="TU_CORREO"
   $env:SUPABASE_USER_PASSWORD="TU_CONTRASENA"
   npm run verify:routines
   ```

   El verificador consulta usando la clave pública y una sesión normal. Pagina los resultados para no quedarse en el límite habitual de filas de la API. Comprueba las 60 plantillas, las 300 jornadas (cinco días distintos por plantilla), la selección exacta de 60 ejercicios destacados, que estén importados todos los 1.324 `source_id` del JSON y que cada ejercicio asignado a casa sea de peso corporal y cada ejercicio de aire libre sea contenido propio de carrera/parque sin aparatos. No requiere la `service_role`.
6. En Authentication → URL Configuration registra `http://localhost:3000` y la URL final de Vercel. Habilita el flujo de recuperación de contraseña y verifica que el enlace de redirección apunte al dominio autorizado.
7. En Storage confirma que existan los buckets privados `avatars` y `post-images`. El esquema los crea si faltan. No los conviertas en públicos.

## Rutinas y decisiones de personalización

El sistema contempla 60 combinaciones de plantilla: género declarado, objetivo, lugar de entrenamiento y, para `prefiero_no_decirlo`, preferencia de rutina (fuerza, tonificación o equilibrada). Cada plantilla tiene cinco jornadas de lunes a viernes. El SQL registra `routine_days.warmup` y `routine_days.cooldown` como listas de cinco actividades cada una, con duración/repeticiones y pasos.

- **Casa:** usa ejercicios del catálogo cuyo equipo es exclusivamente `body weight`. No requiere bandas, máquinas ni equipos adicionales.
- **Gimnasio:** puede utilizar barra, mancuernas, poleas y máquinas presentes en la selección del catálogo.
- **Aire libre:** utiliza sesiones originales de caminata/trote por intervalos para principiantes, con progresión simple (1 minuto, luego 90 segundos y luego 2 minutos de trote, separados por caminata). Los martes y jueves son de recuperación/caminata suave. Se combinan con sentadilla, flexión inclinada en banca, plancha, zancada y extensión alterna aptas para un parque.

Los intervalos de caminata/trote y los cinco ejercicios de parque son **contenido original redactado para Pulso Fit**; no provienen del JSON. El esquema de principiante distribuye sesiones de 1, 1,5 y 2 minutos de trote entre lunes, miércoles y viernes, con caminatas de recuperación martes y jueves. La progresión de una semana a otra es condicional: solo se sugieren incrementos pequeños (15 segundos por intervalo) después de completar la semana sin dolor ni fatiga excesiva; de lo contrario se repite el nivel. Se insertan mediante `routines_seed.sql` con `is_custom = true` y `source_id = NULL`, precisamente porque no tienen un identificador del catálogo fuente. El JSON conserva sus propios identificadores `source_id`; el script de verificación comprueba que todo identificador no nulo esté en `exercises_es_slim.json`.

Las plantillas se separan por género para poder consultar la preferencia seleccionada y permitir rotaciones deterministas del catálogo, pero **no se aplican restricciones de ejercicio basadas en estereotipos de género**. La selección se determina principalmente por lugar/equipo disponible, objetivo y preferencia de rutina. El objetivo y la preferencia cambian el volumen, series, repeticiones y descansos; el género no presupone fuerza, capacidad ni tipo de ejercicio.

La rutina local de demostración reproduce el esquema general sin requerir Supabase. Para el lugar aire libre, el modo demostración también muestra los intervalos y ejercicios de parque; con Supabase se cargan las plantillas del SQL.

## Catálogo y animaciones

- El JSON suministrado tiene 1.324 ejercicios y pasos en español. La aplicación presenta nombres traducidos para ejercicios destacados y etiquetas descriptivas en español para el resto.
- El importador guarda `media_id` pero deja `media_url = NULL`. Un identificador de medio no prueba por sí mismo la licencia del archivo.
- No se incluyen GIF, fotos o videos de procedencia/licencia dudosa en el repositorio.
- Mientras `media_url` esté vacío, se muestra una animación CSS esquemática de patrón de movimiento. No es una demostración biomecánica específica de cada ejercicio.
- Al configurar un proveedor autorizado con `NEXT_PUBLIC_EXERCISE_MEDIA_BASE_URL`, se carga el video mediante `media_url` o la convención `{base}/{media_id}.mp4`, de forma diferida cuando el componente entra en pantalla. La interfaz genera una pista WebVTT en español con los pasos del ejercicio para cada video; el proveedor debe entregar material con derechos comerciales.

## Funciones principales

- Registro e inicio de sesión con correo y contraseña a través de Supabase Auth; casilla obligatoria de aceptación de Términos y Política de privacidad al registrarse.
- Recuperación de contraseña mediante `resetPasswordForEmail` y pantalla para actualizarla.
- Onboarding secuencial: género, preferencia condicional, peso, estatura, fecha de nacimiento (solo mayores de 18 años), objetivo y lugar.
- Inicio con siete tarjetas de consejos, buscador y filtro por categoría.
- Navegación con historial del navegador mediante fragmentos (`#inicio`, `#perfil`, etc.); atrás/adelante cambia de sección sin abandonar la aplicación.
- Perfil con avatar, nombre editable y muro que muestra únicamente las publicaciones del usuario actual.
- Entrenamiento de lunes a viernes con calentamiento, ejercicios, series/repeticiones/descanso, pasos y vuelta a la calma. La interfaz avisa que se debe detener la actividad ante dolor, mareo o malestar.
- Alimentación orientativa con ejemplos de comidas comunes en Colombia, según objetivo. El cálculo es aproximado, aplica un ajuste moderado y nunca muestra menos de 1.500 kcal/día para hombres ni 1.200 kcal/día para mujeres o personas que prefieren no decirlo; cuando aplica el piso muestra un aviso para consultar a un profesional. No constituye prescripción nutricional.
- Comunidad con publicaciones, likes, comentarios y reportes. El texto de cada publicación se limita a 1.000 caracteres en cliente y base de datos.
- Fotos en buckets privados; URLs firmadas en lote con `createSignedUrls` y renovación periódica antes de expirar.
- Ajustes de daltonismo, alto contraste, tamaño de texto, foco visible, navegación por teclado y respeto a `prefers-reduced-motion`. Los criterios deben validarse con TalkBack/VoiceOver y personas reales antes de afirmar conformidad.
- Acceso a Términos y Política de privacidad como borradores jurídicos para Colombia, con referencia a la Ley 1581 de 2012, datos relacionados con la salud y mayoría de edad.

## Privacidad y eliminación de cuenta

El perfil completo solo puede consultarlo su titular mediante RLS. La vista `profiles_public` expone únicamente `id`, `username` y `avatar_url` para identificar autores en el muro; no publica peso, estatura, fecha de nacimiento, género, lugar ni objetivo.

La eliminación de cuenta se divide en dos pasos seguros sin enviar la `service_role` al navegador:

1. La sesión autenticada pagina las carpetas propias del usuario en los buckets `avatars` y `post-images`, y elimina todos sus archivos (incluidos posibles archivos huérfanos) mediante la API de Storage con el JWT del usuario y las políticas de propietario.
2. El cliente invoca `delete_my_pulso_account()`, una función SQL `SECURITY DEFINER` que elimina el registro de `auth.users`. Las claves foráneas con `ON DELETE CASCADE` eliminan perfiles, publicaciones, comentarios, likes y reportes asociados.

No se borran filas de `storage.objects` directamente: los objetos se retiran mediante la API oficial de Storage. Si la eliminación de archivos falla, la interfaz se detiene y no ejecuta la eliminación de cuenta. Las políticas y la función deben revisarse en el proyecto Supabase antes de producción.

Los textos de `app/terminos/page.tsx` y `app/privacidad/page.tsx` son borradores. Deben completarse con la identidad, dirección y canales del responsable del tratamiento y ser revisados por un abogado en Colombia antes de publicarlos como documentos vinculantes.

## Moderación

Después de crear el usuario moderador en Supabase Auth, copia su UUID y ejecuta en SQL Editor:

```sql
insert into public.moderators(user_id) values ('UUID-DE-TU-USUARIO');
```

El panel de moderación aparece solo a cuentas autorizadas por `is_pulso_moderator()`. Permite marcar reportes, ocultar comentarios (el permiso SQL se limita a la columna `is_hidden`), eliminar comentarios y eliminar publicaciones que tengan por lo menos un reporte. RLS limita la eliminación de publicaciones reportadas y la eliminación de sus archivos a moderadores. Los usuarios pueden eliminar sus propias publicaciones, comentarios y fotografías.

## Accesibilidad y visualización

El sistema visual usa Poppins y componentes responsive con contraste claro. Hay modo apto para daltonismo, alto contraste, letra ampliada, foco visible, enlace para saltar al contenido, controles etiquetados y soporte de movimiento reducido. Los videos enlazados reciben una pista WebVTT generada a partir de los pasos del ejercicio en español. La ficha de ejercicio presenta errores comunes según el patrón de movimiento (empuje, tracción, sentadilla, bisagra, zona media, cardio, movilidad, flexión y elevación). No afirmes cumplimiento certificado sin comprobar la aplicación con tecnologías de asistencia reales.

## Publicar en Vercel

1. Ejecuta `npm install`, `npm run lint` y `npm run build` localmente y corrige los errores detectados.
2. Sube el proyecto a GitHub sin `.env.local`, claves ni secretos. Comprueba que `data/exercises_es_slim.json` y los scripts no contienen credenciales.
3. En Vercel importa el repositorio y selecciona Next.js.
4. Configura únicamente `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en las variables de entorno de Vercel. Añade la variable opcional del proveedor de animaciones solo cuando tengas derechos comprobados.
5. Despliega y registra el dominio de Vercel en Supabase Authentication → URL Configuration.
6. Prueba registro, confirmación de correo, recuperación de contraseña, publicación/eliminación de fotos, comentarios, likes, reportes, moderación y eliminación de cuenta en un entorno de prueba.

## Estructura principal

```text
app/                    App Router, páginas legales y estilos
components/FitnessApp.tsx  Orquestación de la experiencia
components/fitness/     Vistas separadas para inicio, entrenamiento, alimentación, perfil, social, moderación, ajustes, consejos, ejercicios y bloques de rutina
lib/                    Lógica de ejercicios, alimentación, rutinas y clientes Supabase
data/                   JSON fuente y selección de ejercicios destacados
supabase/schema.sql     Tablas, vistas, RLS, Storage y funciones seguras
supabase/routines_seed.sql Plantillas y bloques de calentamiento/estiramiento L-V
scripts/import-exercises.ts Importador local (service_role solo aquí)
scripts/verify-routines.ts Verificador con clave pública y sesión autenticada
```
