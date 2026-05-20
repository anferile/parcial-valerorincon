module.exports = (req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    hostname: require('os').hostname(),
    timestamp: new Date().toISOString(),
  });
};
