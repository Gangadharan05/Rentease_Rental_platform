require('dotenv').config();
const app = require('./src/app');
const { sequelize, connectDB } = require('./src/config/db');
require('./src/models'); // ensure associations are registered before sync

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // In production, prefer proper migrations. `alter: true` keeps this
  // demo/dev-friendly by auto-syncing the schema with the models.
  await sequelize.sync({ alter: true });
  console.log('Database synced');

  app.listen(PORT, () => {
    console.log(`RentEase API running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
