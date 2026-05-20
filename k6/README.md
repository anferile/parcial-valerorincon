# Pruebas de carga con k6

Esta carpeta contiene tres scripts de k6 listos para ejecutar contra el ALB del despliegue.

## Prerrequisitos

- Instalar [k6](https://k6.io/docs/get-started/installation/)
- Obtener el DNS del ALB:

  ```bash
  cd ../terraform
  terraform output -raw alb_dns_name
  ```

- Exportar la URL base:

  ```bash
  export BASE_URL="http://<alb-dns>"
  ```

## Scripts disponibles

| Script             | Objetivo                                          |
|--------------------|---------------------------------------------------|
| `health-check.js`  | Smoke test (5 VUs, 20s) - usar al inicio          |
| `load-test.js`     | Prueba de carga principal con thresholds y balanceo |
| `crud-test.js`     | Ejercita el CRUD completo contra RDS              |

## Comandos

```bash
# 1) Smoke test (verificar que el ALB responde)
k6 run k6/health-check.js

# 2) Prueba de carga estándar (perfil "ramp", default)
k6 run k6/load-test.js

# 3) Perfiles alternativos
STAGES=fast   k6 run k6/load-test.js
STAGES=stress k6 run k6/load-test.js

# 4) CRUD bajo carga (escribe en RDS!)
k6 run k6/crud-test.js
```

## Interpretación de resultados

El script `load-test.js` imprime al final:

- Latencia avg / p95 / p99 (rúbrica)
- % de errores
- Lista de **hostnames distintos** observados en las respuestas

> Si la lista de hostnames contiene **2 o más entradas**, el ALB está balanceando entre ambas EC2 - exactamente lo que evalúa la rúbrica.

Las métricas correspondientes en CloudWatch:

- `AWS/ApplicationELB`: `RequestCount`, `TargetResponseTime`, `HTTPCode_Target_5XX_Count`, `UnHealthyHostCount`
- `AWS/EC2`: `CPUUtilization` (debería subir en ambas instancias)
