import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://REEMPLAZAR-CON-EL-DNS-DEL-ALB';

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'status 200':        (r) => r.status === 200,
    'json tiene status': (r) => {
      try {
        return r.json().status === 'ok';
      } catch (e) {
        return false;
      }
    },
  });
  sleep(1);
}
