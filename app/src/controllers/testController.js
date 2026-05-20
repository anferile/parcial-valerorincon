const os = require('os');

exports.test = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Endpoint de prueba funcionando correctamente',
    hostname: os.hostname(),
    requestId: req.id,
    served_by_pid: process.pid,
    instance_metadata: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      load_average_1m: os.loadavg()[0],
      free_memory_mb: Math.round(os.freemem() / 1024 / 1024),
    },
    timestamp: new Date().toISOString(),
  });
};
