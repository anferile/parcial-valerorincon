import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://REEMPLAZAR-CON-EL-DNS-DEL-ALB';

export const options = {
  vus: 10,
  duration: '60s',
  thresholds: {
    http_req_failed:   ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  let createdId = null;

  group('Create -> Read -> Update -> Delete', () => {
    const payload = JSON.stringify({
      name: `k6-product-${__VU}-${__ITER}`,
      description: 'Producto creado por k6',
      price: Math.round(Math.random() * 100000) + 1000,
      stock: Math.floor(Math.random() * 50),
    });
    const headers = { 'Content-Type': 'application/json' };

    const create = http.post(`${BASE_URL}/api/products`, payload, { headers });
    check(create, { 'POST 201': (r) => r.status === 201 });
    try {
      createdId = create.json().data.id;
    } catch (_) { /* ignore */ }

    if (createdId) {
      const get = http.get(`${BASE_URL}/api/products/${createdId}`);
      check(get, { 'GET 200': (r) => r.status === 200 });

      const upd = http.put(
        `${BASE_URL}/api/products/${createdId}`,
        JSON.stringify({ price: 9999 }),
        { headers }
      );
      check(upd, { 'PUT 200': (r) => r.status === 200 });

      const del = http.del(`${BASE_URL}/api/products/${createdId}`);
      check(del, { 'DELETE 200': (r) => r.status === 200 });
    }
  });

  sleep(1);
}
