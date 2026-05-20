# Capturas sugeridas para el entregable

Recomendado tener estas capturas listas para insertar en el video o documento técnico.

## Terraform
1. `terraform init` con "Terraform has been successfully initialized!"
2. `terraform plan` mostrando "X to add, 0 to change, 0 to destroy".
3. `terraform apply` finalizado con "Apply complete! Resources: X added".
4. `terraform output deploy_summary` con la URL del ALB.

## AWS Console
5. VPC -> Your VPCs -> `parcial-valero-prod-vpc`.
6. Subnets -> 4 subnets (2 públicas + 2 privadas) en dos AZ.
7. EC2 -> Instances -> 2 instancias `parcial-valero-prod-ec2-1` y `-ec2-2` en `running`.
8. Load Balancers -> `parcial-valero-prod-alb` (state `active`).
9. Target Groups -> `parcial-valero-prod-tg` con ambas EC2 `healthy`.
10. Security Groups -> los tres SGs (`sg-alb`, `sg-ec2`, `sg-rds`).
11. RDS -> `parcial-valero-prod-rds` + `parcial-valero-prod-rds-replica`.

## Servicio funcionando
12. Navegador apuntando a `http://<alb-dns>/health`.
13. Postman/curl ejecutando GET `/api/products` con JSON formateado.
14. Loop de curl mostrando que el hostname alterna entre `instance-1` e `instance-2`.
15. POST `/api/products` exitoso (201) y GET subsiguiente que lo muestra.

## CI/CD
16. GitHub Actions con un workflow run "✅ pass" en verde.
17. Detalle de un job mostrando los tests de Jest pasando (n tests passed).
18. Settings -> Secrets and variables -> Actions con AWS_ACCESS_KEY_ID, etc. (sin mostrar valores).

## k6
19. Terminal con `k6 run k6/load-test.js` mostrando el reporte final (p95, errores, hostnames).
20. Archivo `k6-summary.json` abierto en VS Code.

## CloudWatch
21. Dashboard / panel de métrica `AWS/EC2 CPUUtilization` para ambas EC2 durante la prueba.
22. Métrica `AWS/ApplicationELB RequestCount` con la curva del test.
23. Métrica `TargetResponseTime`.
24. Listado de Alarms con `parcial-valero-prod-ec2-*-cpu-high`, `alb-unhealthy-hosts`, `alb-5xx-spike`.

## Limpieza
25. `terraform destroy` finalizado con "Destroy complete! Resources: X destroyed".
