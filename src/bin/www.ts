import 'dotenv/config';
import app from '../app';
import debug from 'debug';
import http from 'http';
import connectDB from '../config/db';

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const debugLog = debug("express-ts-mongodb:server");

const server = http.createServer(app);

const start = async () => {
  try {
    await connectDB();
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
  } catch (error) {
    console.error("🔴 Krytyczny błąd podczas uruchamiania aplikacji:", error);
    process.exit(1);
  }
};

start();

function normalizePort(val: string): number | string | false {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error: NodeJS.ErrnoException) {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
  debugLog('Listening on ' + bind);
}