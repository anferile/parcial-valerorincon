import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const errorRate    = new Rate('custom_errors');
const responseTime = new Trend('custom_response_time_ms');
const hostnameSeen = new Counter('hostname_observations');

const seenHostnames = new Set();

const BASE_URL = __ENV.BASE_URL || 'http://REEMPLAZAR-CON-EL-DNS-DEL-ALB';

const stagesByProfile = {
  fast: [
    { duration: '15s', target: 10 },
    { duration: '30s', target: 30 },
    { duration: '15s', target: 0 },
  ],
  ramp: [
    { duration: '30s', target: 10 },
    { duration: '1m',  target: 50 },
    { duration: '1m',  target: 100 },
    { duration: '30s', target: 0 },
  ],
  stress: [
    { duration: '30s', target: 50 },
    { duration: '1m',  target: 150 },
    { duration: '1m',  target: 250 },
    { duration: '30s', target: 0 },
  ],
};

const profile = __ENV.STAGES && stagesByProfile[__ENV.STAGES] ? __ENV.STAGES : 'ramp';

export const options = {
  stages: stagesByProfile[profile],
  thresholds: {
    http_req_failed:        ['rate<0.02'],
    http_req_duration:      ['p(95)<800', 'p(99)<1500'],
    custom_errors:          ['rate<0.05'],
    'http_req_duration{endpoint:health}':   ['p(95)<500'],
    'http_req_duration{endpoint:test}':     ['p(95)<700'],
    'http_req_duration{endpoint:products}': ['p(95)<900'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

function recordResponse(res, endpoint) {
  responseTime.add(res.timings.duration);
  errorRate.add(res.status < 200 || res.status >= 400);

  try {
    const body = res.json();
    if (body && body.hostname) {
      seenHostnames.add(body.hostname);
      hostnameSeen.add(1, { hostname: body.hostname });
    }
  } catch (_) { /* respuesta no JSON */ }

  check(res, {
    [`[${endpoint}] status 2xx`]: (r) => r.status >= 200 && r.status < 300,
    [`[${endpoint}] tiempo < 1500ms`]: (r) => r.timings.duration < 1500,
    [`[${endpoint}] body no vacio`]: (r) => r.body && r.body.length > 0,
  });
}

export default function () {
  group('GET /health', () => {
    const res = http.get(`${BASE_URL}/health`, { tags: { endpoint: 'health' } });
    recordResponse(res, 'health');
  });

  group('GET /api/test', () => {
    const res = http.get(`${BASE_URL}/api/test`, { tags: { endpoint: 'test' } });
    recordResponse(res, 'test');
  });

  group('GET /api/products', () => {
    const res = http.get(`${BASE_URL}/api/products?limit=20`, { tags: { endpoint: 'products' } });
    recordResponse(res, 'products');
  });

  sleep(Math.random() * 1.5 + 0.5);
}

export function handleSummary(data) {
  const hostnamesList = Array.from(seenHostnames).sort();

  // eslint-disable-next-line no-console
  console.log('\n==================================================');
  console.log(' Hostnames observados (evidencia de balanceo):');
  if (hostnamesList.length === 0) {
    console.log('  (ninguno - revisa que la app responda con campo hostname)');
  } else {
    hostnamesList.forEach((h) => console.log(`   - ${h}`));
  }
  console.log(`Total distintos: ${hostnamesList.length}`);
  console.log('==================================================\n');

  return {
    'stdout': textSummary(data, hostnamesList),
    'k6-summary.json': JSON.stringify({
      profile,
      base_url: BASE_URL,
      distinct_hostnames: hostnamesList,
      metrics: data.metrics,
    }, null, 2),
  };
}

function textSummary(data, hostnames) {
  const m = data.metrics;
  const get = (name, stat) => (m[name] && m[name].values && m[name].values[stat] !== undefined)
    ? m[name].values[stat].toFixed(2) : 'N/A';

  return `
==============================================
 Parcial Valero - Resumen k6
==============================================
 Perfil           : ${profile}
 Base URL         : ${BASE_URL}
 VUs maximos      : ${get('vus_max', 'max')}
 Iteraciones      : ${get('iterations', 'count')}
 Requests totales : ${get('http_reqs', 'count')}
 Errores (%)      : ${(parseFloat(get('http_req_failed', 'rate')) * 100).toFixed(2)} %
 Latencia avg     : ${get('http_req_duration', 'avg')} ms
 Latencia p95     : ${get('http_req_duration', 'p(95)')} ms
 Latencia p99     : ${get('http_req_duration', 'p(99)')} ms
 Hostnames vistos : ${hostnames.join(', ') || 'NINGUNO'}
==============================================
`;
}
