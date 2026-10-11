import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const num = (v, d) => (v !== undefined && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : d);

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: num(process.env.PORT, 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  serveClient: process.env.SERVE_CLIENT === 'true',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: num(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotel_reservation',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
  pricing: {
    taxRate: num(process.env.TAX_RATE, 12),
    serviceFeeRate: num(process.env.SERVICE_FEE_RATE, 5),
    maxStayNights: num(process.env.MAX_STAY_NIGHTS, 30),
  },
  demo: {
    adminEmail: process.env.DEMO_ADMIN_EMAIL || 'admin@stayease.test',
    adminPassword: process.env.DEMO_ADMIN_PASSWORD || 'Admin@12345',
    customerEmail: process.env.DEMO_CUSTOMER_EMAIL || 'guest@stayease.test',
    customerPassword: process.env.DEMO_CUSTOMER_PASSWORD || 'Guest@12345',
  },
};

export function assertConfig() {
  if (!config.jwt.secret || config.jwt.secret.length < 16) {
    throw new Error('JWT_SECRET is missing or too short. Copy server/.env.example to server/.env and set a long random value.');
  }
}
