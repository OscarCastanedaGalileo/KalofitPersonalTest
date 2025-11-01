# Kal'O Fit

Bienvenido al proyecto Kal'O Fit. Este repositorio contiene el backend y frontend para una aplicación de gestión de nutrición y actividad física.

## 🚀 Inicio Rápido

### 1. Clona el repositorio y entra al directorio
```bash
git clone <URL_DEL_REPO>
cd kalo
```

### 2. Copia las variables de entorno
```bash
cp backend/.env-example backend/.env
cp frontend/.env-example frontend/.env
```

### 3. Instala dependencias (usando Docker)
```bash
docker compose run --rm backend npm install
docker compose run --rm frontend npm install
```

### 4. Levanta los servicios
```bash
docker compose up
```

Accede a:
- Backend: [http://localhost:3001](http://localhost:3001)
- Frontend: [http://localhost:3000](http://localhost:3000)

---

## 💻 Desarrollo Local sin Docker

### Backend
```bash
cd backend
npm install
npm run start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ Migraciones y Seeders

### Migraciones
Ejecuta migraciones para crear las tablas:
```bash
docker compose exec backend npx sequelize db:migrate
```

Revertir la última migración:
```bash
docker compose exec backend npx sequelize db:migrate:undo
```

Crear una migración/modelo:
```bash
docker compose exec backend npx sequelize model:generate --name User --attributes firstName:string,lastName:string,email:string
```

Más info: [Documentación de Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/#creating-the-first-model-and-migration)

### Seeders
Pobla la base de datos con datos iniciales:
```bash
docker compose exec backend npx sequelize-cli db:seed:all
```

---

## 🔑 Prerrequisitos

- Node.js y Docker instalados
- Clave de API de [FoodData Central (FDC)](https://fdc.nal.usda.gov/api-key-signup.html) (añádela en el archivo `.env` del backend)

---

## 📝 Notas y Consejos

- El backend corre en `http://localhost:3001` y el frontend en `http://localhost:3000` por defecto.
- Si tienes problemas de puertos, revisa los archivos `.env` y `docker-compose.yml`.
- Ejecuta migraciones antes de los seeders.
- Si tienes problemas con dependencias, ejecuta `npm install` dentro de cada carpeta o usando Docker.
- Para desarrollo, puedes modificar el frontend y ver los cambios en tiempo real con Vite.

---

## 🆘 Troubleshooting

- Si tienes errores de conexión a la base de datos, revisa las variables de entorno y que el contenedor `database` esté corriendo.
- Si la API FDC no responde, revisa tu clave y la variable `FDC_API_KEY` en el backend.
- Para limpiar la base de datos, puedes usar:
```bash
docker compose exec backend npx sequelize db:migrate:undo:all
docker compose exec backend npx sequelize db:seed:undo:all
```

---

## 📚 Recursos


