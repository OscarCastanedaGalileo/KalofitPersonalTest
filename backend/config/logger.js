// backend/config/logger.js
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

function getThreadLabel() {
  let workerId = null;
  try {
    const cluster = require('cluster');
    if (cluster.isWorker && cluster.worker) workerId = cluster.worker.id;
  } catch (_) {}
  let threadId = null;
  try {
    const { isMainThread, threadId: tid } = require('worker_threads');
    if (!isMainThread) threadId = tid;
  } catch (_) {}
  if (workerId != null) return `w${workerId}`;
  if (threadId != null) return `t${threadId}`;
  return 'main';
}

const baseFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.splat(),
  format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  format.printf(info => {
    // construimos un objeto JSON limpio
    const log = {
      timestamp: info.timestamp,
      level: info.level,
      pid: process.pid,
      thread: getThreadLabel(),
      message: info.message
    };
    if (info.metadata.ip) log.ip = info.metadata.ip;
    if (info.metadata.reqId) log.reqId = info.metadata.reqId;
    if (info.stack) log.stack = info.stack;
    if (info.metadata.errors) log.errors = info.metadata.errors;
    return JSON.stringify(log);
  })
);

const dailyAll = new transports.DailyRotateFile({
  filename: 'logs/combined-%DATE%.json',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});
const dailyErr = new transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.json',
  level: 'error',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
});

const logger = createLogger({
  level: 'info',
  format: baseFormat,
  transports: [
    new transports.Console({ format: baseFormat }),
    dailyAll,
    dailyErr,
  ],
});

module.exports = logger;
