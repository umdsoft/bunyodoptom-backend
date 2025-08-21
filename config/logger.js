// config/logger.js
const pino = require('pino');

const level = process.env.LOG_LEVEL || 'info';
const isDev = process.env.NODE_ENV !== 'production';

let transport;
if (isDev) {
  try {
    // modul mavjudligini tekshiramiz; bo'lmasa pretty'ni yoqmang
    require.resolve('pino-pretty');
    transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    };
  } catch {
    transport = undefined; // fallback: oddiy JSON
  }
}

const logger = pino({
  level,
  transport
});

module.exports = logger;
