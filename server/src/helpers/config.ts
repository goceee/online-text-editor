import 'dotenv/config';

const SERVER_HOSTNAME = process.env.HOSTNAME || 'localhost';
const SERVER_PORT = parseInt(process.env.PORT as string, 10) || 3001;
const DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://localhost:27017/google-docs';
const SECRET = process.env.SECRET as string;

const config = {
  hostname: SERVER_HOSTNAME,
  port: SERVER_PORT,
  database_url: DATABASE_URL,
  secret: SECRET,
};

export default config;
