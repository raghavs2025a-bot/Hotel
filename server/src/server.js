import app from './app.js';
import { assertConfig, config } from './config/env.js';
import { testConnection } from './config/db.js';

async function start() {
  assertConfig();
  try {
    await testConnection();
    console.log(`[db] Connected to MySQL database "${config.db.database}" on ${config.db.host}:${config.db.port}`);
  } catch (err) {
    console.error(`[db] Could not connect to MySQL: ${err.message}`);
    console.error('[db] Check server/.env credentials and run "npm run db:setup" from the project root.');
    process.exit(1);
  }
  app.listen(config.port, () => console.log(`[server] StayEase API running on http://localhost:${config.port} (${config.env})`));
}

start();
