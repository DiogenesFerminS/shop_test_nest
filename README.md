# SHOP TEST

## Pasos para iniciar la app en modo desarrollo

1. Clona el repositorio
2. Reconstruye los modulos de node ```npm install```
3. Levanta la base de datos ```docker compose up -d ```
4. Renombra el .env-template a .env y asigna las variables
5. Descarga el cli de Stripe
6. Inicia sesion en stripe ``` stripe login ```
7. Redirige los eventos al servidor con ``` stripe listen --forward-to localhost:8080/api/stripe/webhook --skip-verify``` y copia secret que entrega este comando
8. Asigna el secret ``` STRIPE_WEBHOOK_SECRET ``` en el .env
9. Ejecuta ``` npm run start:dev ```