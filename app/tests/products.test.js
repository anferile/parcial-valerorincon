require('./setup');

const request = require('supertest');

let nextId = 1;
const store = new Map();

jest.mock('../src/services/productService', () => ({
  async listAll() {
    return Array.from(store.values());
  },
  async findById(id) {
    return store.get(Number(id)) || null;
  },
  async create({ name, description = null, price, stock = 0 }) {
    const item = {
      id: nextId++,
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      created_at: new Date(),
      updated_at: new Date(),
    };
    store.set(item.id, item);
    return item;
  },
  async update(id, body) {
    const existing = store.get(Number(id));
    if (!existing) return null;
    const merged = { ...existing, ...body, updated_at: new Date() };
    store.set(Number(id), merged);
    return merged;
  },
  async remove(id) {
    return store.delete(Number(id));
  },
  async count() {
    return store.size;
  },
}));

jest.mock('../src/db/pool', () => ({
  query: jest.fn(async () => ({ rows: [{ total: 0, now: new Date() }], rowCount: 1 })),
  end: jest.fn(),
}));

const app = require('../src/app');

beforeEach(() => {
  store.clear();
  nextId = 1;
});

describe('CRUD /api/products', () => {
  test('GET /api/products inicialmente devuelve lista vacia', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.data).toEqual([]);
  });

  test('POST /api/products crea un producto valido', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Laptop', price: 4500000, stock: 5, description: 'i7' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.data).toMatchObject({ name: 'Laptop', price: 4500000 });
  });

  test('POST /api/products rechaza payload invalido', async () => {
    const res = await request(app).post('/api/products').send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('GET /api/products/:id devuelve un producto existente', async () => {
    const created = await request(app)
      .post('/api/products')
      .send({ name: 'Mouse', price: 100 });
    const id = created.body.data.id;

    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  test('GET /api/products/:id devuelve 404 si no existe', async () => {
    const res = await request(app).get('/api/products/9999');
    expect(res.status).toBe(404);
  });

  test('PUT /api/products/:id actualiza un producto', async () => {
    const created = await request(app)
      .post('/api/products')
      .send({ name: 'Teclado', price: 200 });
    const id = created.body.data.id;

    const res = await request(app).put(`/api/products/${id}`).send({ price: 250 });
    expect(res.status).toBe(200);
    expect(Number(res.body.data.price)).toBe(250);
  });

  test('DELETE /api/products/:id elimina y luego 404 al consultar', async () => {
    const created = await request(app)
      .post('/api/products')
      .send({ name: 'Monitor', price: 1000 });
    const id = created.body.data.id;

    const del = await request(app).delete(`/api/products/${id}`);
    expect(del.status).toBe(200);

    const get = await request(app).get(`/api/products/${id}`);
    expect(get.status).toBe(404);
  });
});
