# Guion sugerido para el video (max. 10 minutos)

> Cada integrante del grupo demuestra su parte usando su propia consola AWS Academy.
> Persona que no aparezca demostrando penaliza al grupo.

## 0:00 - 0:30 - Presentación

- Nombre del grupo, integrantes y rol de cada uno.
- Mencionar la arquitectura objetivo: ALB + 2 EC2 + RDS Primary + Read Replica.

## 0:30 - 2:00 - Arquitectura (10% de la nota)

- Mostrar `docs/architecture.md` y el diagrama oficial (PNG con iconos AWS 2026).
- Justificar:
  - Por qué dos AZ (alta disponibilidad).
  - Por qué tres Security Groups encadenados (defensa en profundidad).
  - Por qué RDS en subnets privadas (RDS NO pública).
  - Por qué un endpoint /health (health check del ALB).

## 2:00 - 4:00 - Infraestructura como Código (25%)

- Mostrar la carpeta `terraform/` en VS Code.
- Recorrer brevemente: `variables.tf`, `provider.tf`, `networking.tf`, `security.tf`, `alb.tf`, `compute.tf`, `database.tf`, `outputs.tf`, `user_data.sh`.
- En la terminal:
  ```bash
  terraform init
  terraform plan
  terraform apply -auto-approve
  terraform output deploy_summary
  ```
- (Si el apply ya está hecho desde antes para no consumir tiempo en grabación, se puede mostrar `terraform plan` con la frase "no changes" para demostrar idempotencia.)

## 4:00 - 5:00 - Servicio desplegado (10%)

- Tomar el ALB del output y validar:
  ```bash
  curl http://$ALB/health
  curl http://$ALB/status
  curl http://$ALB/api/test
  curl http://$ALB/api/products
  ```
- Mostrar en navegador la lista de productos (Postman o curl).
- Hacer un POST y mostrar la respuesta 201.
- Repetir GET /health 6-8 veces y mostrar cómo cambia el `hostname` entre `instance-1` e `instance-2`.

## 5:00 - 7:00 - Pipeline CI/CD (25%)

- Abrir el repositorio en GitHub > Actions.
- Mostrar una ejecución reciente exitosa.
- Recorrer el archivo `.github/workflows/ci.yml` y explicar:
  - Job `test`: ESLint y Jest (mostrar la salida de los tests).
  - Job `terraform`: `fmt -check`, `init -backend=false`, `validate` y `plan`.
  - Uso de Secrets (Settings → Secrets) sin exponer valores.
- Mostrar el archivo `app/tests/products.test.js` con pruebas CRUD.

## 7:00 - 9:30 - Desempeño y monitoreo (30%)

- En una terminal lanzar `k6 run k6/load-test.js`.
- Mientras corre la prueba abrir CloudWatch en el navegador y mostrar:
  - `AWS/EC2 -> CPUUtilization` para ambas instancias subiendo en paralelo (evidencia de balanceo).
  - `AWS/ApplicationELB -> RequestCount`, `TargetResponseTime`.
- Al finalizar k6 leer el resumen y subrayar:
  - `http_req_failed` < 2%.
  - `p(95)`.
  - Lista de hostnames distintos.
- Mostrar las alarmas de CloudWatch (`ec2-cpu-high`, `alb-unhealthy-hosts`, `alb-5xx-spike`).

## 9:30 - 10:00 - Cierre

- Resumen de lo demostrado.
- Comentar destrucción de recursos (`terraform destroy`) para evitar costos.
- Agradecimientos y créditos.

---

## Tips de grabación

- Usar OBS / Loom con resolución 1080p y captura completa de pantalla.
- Tener tres terminales preparadas:
  1. `cd terraform` con plan/apply listos.
  2. `curl`/Postman para endpoints.
  3. `k6 run`.
- Tener el navegador con tabs ya abiertas: GitHub Actions, CloudWatch (métricas + alarmas), AWS Console (EC2, RDS, ALB).
- Si algún apartado se demora, narrar mientras AWS aprovisiona; no dejar silencios largos.
