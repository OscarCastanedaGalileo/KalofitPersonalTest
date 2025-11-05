// backend/scripts/start-with-migrate.js
const { execSync } = require('child_process');
const { Sequelize } = require('sequelize');

async function waitForDatabase() {
  console.log('⏳ Checking database connection...');
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  });

  let retries = 10;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database is ready!');
      await sequelize.close();
      return;
    } catch (err) {
      retries -= 1;
      console.log(`Database not ready yet. Retrying (${10 - retries}/10)...`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  console.error('❌ Database connection failed.');
  process.exit(1);
}

async function main() {
  await waitForDatabase();

  try {
    console.log('🚀 Running migrations...');
    execSync('npx sequelize-cli db:migrate --env production', { stdio: 'inherit' });

    console.log('🌱 Running seeders...');
    execSync('npx sequelize-cli db:seed:all --env production', { stdio: 'inherit' });
  } catch (err) {
    console.error('⚠️ Migration or seed failed:', err.message);
  }

  console.log('🟢 Starting application...');
  require('../bin/www'); // Launches your Express app
}

main();
