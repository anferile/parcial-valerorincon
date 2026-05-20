const levels = ['debug', 'info', 'warn', 'error'];

const log = (level, ...args) => {
  if (process.env.NODE_ENV === 'test') return;
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(`[${ts}] [${level.toUpperCase()}]`, ...args);
};

module.exports = Object.fromEntries(
  levels.map((lvl) => [lvl, (...args) => log(lvl, ...args)])
);
