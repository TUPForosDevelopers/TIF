# Ejecutar React y la API .NET

Desde la raíz del repositorio, con el SDK de .NET 10 y Node.js 22.12 o posterior:

```sh
dotnet ef database update --project src/Infrastructure --startup-project src/Web
dotnet run --project src/Web --launch-profile http
```

La primera orden requiere la herramienta `dotnet-ef` de la rama 10.0. Aplica las migraciones a la base SQLite local. La API escucha en `http://localhost:5073`.

En otra terminal:

```sh
cd Frontend/ForosTUP
npm ci
npm run dev
```

Abrí la dirección que imprime Vite. Si la API escucha en otro puerto, configurá `API_PROXY_TARGET` en `Frontend/ForosTUP/.env.local` y reiniciá Vite. El proxy también funciona con `npm run preview` después de compilar el frontend.

## Despliegue

Por defecto, el frontend envía las solicitudes a `/api` bajo el mismo origen. En el servidor de producción, enviá `/api/auth/*` a la API .NET con la ruta intacta y quitá el prefijo `/api` de las demás solicitudes a la API. Las rutas de la interfaz deben servir `index.html` para que React Router pueda resolverlas. Si se sirve la API en otro origen, configurá `VITE_API_URL` con la URL raíz de la API al compilar y habilitá el origen del frontend en CORS en el servidor que expone la API.

## Operaciones conectadas

- Registro, login, restauración de sesión, edición y baja del perfil.
- Consulta y gestión de foros, según el rol.
- Publicaciones, comentarios y respuestas, con edición y eliminación por su autor.
- Reacciones positivas y negativas y retiro de una reacción. La API permite escribir reacciones y carece de una operación para consultar el voto actual o los totales.
- Alta, edición y revocación de baneos y ascenso a administrador por un SysAdmin.

El backend autentica las operaciones protegidas con un token Bearer y valida el rol y la propiedad del recurso. La fecha de nacimiento se informa al registrarse. El perfil devuelve la edad y permite cambiar nombre, correo y contraseña.
