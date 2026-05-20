# Parcial Valero - Infraestructura Tecnologica en AWS

Examen final del curso de Infraestructura Tecnologica. Este repositorio implementa una arquitectura DevOps completa en AWS con:

- API REST en Node.js (Express + MySQL).
- Infraestructura como Codigo con Terraform (VPC, subnets, ALB, EC2 multi-AZ, RDS + Read Replica).
- Pipeline CI/CD con GitHub Actions (lint, Jest, terraform fmt/init/validate).
- Pruebas de carga con k6 (thresholds, p95, evidencia de balanceo).
- Monitoreo basico con CloudWatch (alarmas de CPU, 5xx y hosts unhealthy).

## Arquitectura

```
                       Usuarios
                          |
                  Application LB         (publico, SG-ALB)
                  /              \
            public-1            public-2  (subnets publicas, 2 AZ)
                  \              /
                  Target Group           (health check /health)
                  /              \
                EC2-1            EC2-2   (Node.js, SG-EC2)
                  \              /
                  RDS MySQL               (primary + read replica, subnets privadas)
```

## Stack tecnologico

- Node.js 20 + Express 4
- MySQL 8.0 (Amazon RDS)
- mysql2 (driver oficial con prepared statements)
- Terraform 1.7+ (provider AWS 5.x)
- GitHub Actions (jobs `test` y `terraform`)
- k6 (pruebas de carga)
- AWS CloudWatch (alarmas CPU/5xx/unhealthy)

## Despliegue rapido (AWS Academy)

1. `git clone https://github.com/anferile/parcial-valero-rincon.git`
2. `cd parcial-valero-rincon`
3. Iniciar el laboratorio en AWS Academy y exportar credenciales en PowerShell.
4. Crear el key pair: `aws ec2 create-key-pair --key-name vockey --query 'KeyMaterial' --output text > vockey.pem`
5. `cd terraform && copy terraform.tfvars.example terraform.tfvars`
6. `terraform init && terraform validate && terraform plan -out=plan.out && terraform apply plan.out`
7. `terraform output -raw alb_dns_name`
8. Probar `http://<alb-dns>/health`, `/status`, `/api/test`, `/api/products`.
9. Cargar k6: `k6 run -e BASE_URL=http://<alb-dns> k6/load-test.js`.
10. Al finalizar: `terraform destroy -auto-approve`.

## Endpoints

- `GET /health` - Health check usado por el Target Group.
- `GET /status` - Estado con conexion a la BD y memoria.
- `GET /api/test` - Endpoint usado por k6.
- `GET /api/products` - Listado de productos.
- `POST /api/products` - Crear producto.
- `GET /api/products/:id` - Obtener producto.
- `PUT /api/products/:id` - Actualizar producto.
- `DELETE /api/products/:id` - Eliminar producto.

## Variables clave de Terraform

- `key_pair_name = "vockey"` (creado en AWS Academy).
- `instance_profile_name = "LabInstanceProfile"` (rol IAM preexistente de Academy).
- `db_engine_version = "8.0.39"` (MySQL).
- `db_password` (inyectado por TF_VAR_db_password o tfvars).
