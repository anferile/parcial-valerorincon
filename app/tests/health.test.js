require('./setup');

const request = require('supertest');

jest.mock('../src/db/pool', () => ({
  query: jest.fn(async (sql) => {
    if (/COUNT\(\*\)/i.test(sql)) return { rows: [{ total: 5 }], rowCount: 1 };
    if (/SELECT NOW\(\)/i.test(sql)) return { rows: [{ now: new Date() }], rowCount: 1 };
    return { rows: [], rowCount: 0 };
  }),
  end: jest.fn(),
}));

const app = require('../src/app');

describe('Endpoints de salud y prueba', () => {
  test('GET / responde con metadata del servicio', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('service');
    expect(res.body).toHaveProperty('hostname');
    expect(Array.isArray(res.body.endpoints)).toBe(true);
  });

  test('GET /health devuelve status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('hostname');
    expect(res.body).toHaveProperty('uptime_seconds');
  });

  test('GET /status incluye estado de BD y hostname', async () => {
    const res = await request(app).get('/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('hostname');
    expect(res.body).toHaveProperty('memory_mb');
  });

  test('GET /api/test devuelve hostname y request id', async () => {
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('hostname');
    expect(res.body).toHaveProperty('requestId');
  });

  test('Ruta inexistente devuelve 404 estructurado', async () => {
    const res = await request(app).get('/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
});
