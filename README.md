# Kal'O Fit

Backend y frontend tienen variables de entorno copiar del .env-example

Backend
```bash
cp backend/.env-example backend/.env
```

Frontend
```bash
cp frontend/.env-example frontend/.env
```

## 🐳 Run Locally with Docker
1. Copiar las variables de entorno:
```bash
cp .env-example .env
```
2. Instalar dependencias del backend:
```bash
docker compose run --rm backend npm install
```
3. Instalar dependencias del frontend:
```bash
docker compose run --rm frontend npm install
```
4. Levantar los servicios:
```bash
docker compose up
```

## 💻 Run Locally without Docker
> ⚠️ Asegúrate de cambiar el puerto si es necesario para evitar conflictos.

### Backend
```bash
cd backend
npm install
npm run start
```

### Frontend
```bash
cd ../frontend
npm install
npm run dev
```
## Run Migrations sql

### Correr Migraciones
```bash
docker compose exec backend npx sequelize db:migrate
```

### Revertir migraciones
```
docker compose exec backend npx sequelize db:migrate:undo
```

> [Ejemplo para generar una migracion](https://sequelize.org/docs/v6/other-topics/migrations/#creating-the-first-model-and-migration)

Crear una migracion(esquema de tabla y modelo)
```
docker compose exec backend npx sequelize model:generate --name User --attributes firstName:string,lastName:string,email:string
```

## Prerrequisitos
Una clave de API de [FoodData Central (FDC)](https://fdc.nal.usda.gov/api-key-signup.html).


#### Preparar y Poblar Base de Datos

[Ejecutar migraciones antes](#correr-migraciones)

### 1. Ejecutar los seeders para poblar la base de datos
```bash
docker compose exec backend npx sequelize-cli db:seed:all
```

## 📝 Notas
- El backend se ejecuta en `http://localhost:PUERTO_BACKEND`.  
- El frontend se ejecuta en `http://localhost:PUERTO_FRONTEND`.  
- Asegúrate de que ambos servicios estén corriendo para acceder a la aplicación completa.

