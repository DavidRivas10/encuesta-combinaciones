# Encuesta de Combinaciones

Encuesta web para elegir una combinación de vestimenta formal para iglesia (evento de mañana).

## Funciones
- 10 opciones visuales.
- Nombre y apellido obligatorios.
- Solo una opción por voto.
- Bloqueo de duplicados por nombre normalizado y por dispositivo.
- Resultados acumulados.
- Compatible con Android/iPhone y enlaces de WhatsApp.

## Despliegue en Vercel
1. Importa este repositorio en Vercel.
2. Agrega un Redis de Upstash desde Vercel Marketplace/Storage.
3. Asegúrate de que Vercel cree estas variables de entorno (cualquiera de los dos pares es compatible):
   - `KV_REST_API_URL` y `KV_REST_API_TOKEN`, o
   - `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
4. Redeploy.

Sin Redis, la página abre normalmente pero no aceptará votos hasta configurar el almacenamiento.
