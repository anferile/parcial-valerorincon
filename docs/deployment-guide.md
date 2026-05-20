# Guía de despliegue (AWS Academy)

Pasos exactos para desplegar la infraestructura completa desde una sesión de AWS Academy.

## 0. Pre-requisitos

- AWS Academy con laboratorio "AWS Academy Learner Lab" activo.
- Terraform >= 1.5 instalado localmente.
- Node.js 20+ (opcional, sólo para probar local).
- k6 (opcional, sólo para pruebas de carga).

## 1. Obtener credenciales temporales de AWS Academy

1. Iniciar el "AWS Academy Learner Lab".
2. Click en **"AWS Details"**.
3. Click en **"Show"** debajo de "AWS CLI".
4. Copiar las tres variables y exportarlas en la terminal:

```bash
export AWS_ACCESS_KEY_ID="ASIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
export AWS_DEFAULT_REGION="us-east-1"
```

> El token expira aprox. cada 4 horas. Si Terraform falla con `ExpiredToken`, repetir esta exportación.

## 2. Configurar Terraform

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Editar `terraform.tfvars` y ajustar al menos:

```hcl
key_pair_name = "vockey"               # provisto por AWS Academy
db_password   = "ParcialValero!2026"   # MÍNIMO 8 caracteres, evitar caracteres reservados de Postgres
```

## 3. Desplegar la infraestructura

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=plan.out
terraform apply plan.out
```

Esperado: 25-30 recursos creados, demora 6-9 minutos (RDS es lo más lento).

## 4. Obtener los datos del despliegue

```bash
terraform output deploy_summary
terraform output -raw alb_dns_name
terraform output -json
```

## 5. Validar los endpoints

```bash
ALB="http://$(terraform output -raw alb_dns_name)"
curl -s "$ALB/health" | jq
curl -s "$ALB/status" | jq
curl -s "$ALB/api/test" | jq
curl -s "$ALB/api/products" | jq
```

Para evidenciar el balanceo:

```bash
for i in {1..15}; do
  curl -s "$ALB/health" | jq -r '.hostname'
done | sort | uniq -c
```

Se esperan dos valores (instance-1, instance-2) con counts distintos de cero.

## 6. Probar el CRUD desde Postman/curl

```bash
# Crear
curl -X POST "$ALB/api/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Producto Demo","price":50000,"stock":7,"description":"Creado en el video"}'

# Listar
curl "$ALB/api/products"

# Actualizar (sustituir ID)
curl -X PUT "$ALB/api/products/6" \
  -H "Content-Type: application/json" \
  -d '{"price":75000}'

# Eliminar
curl -X DELETE "$ALB/api/products/6"
```

## 7. Ejecutar pruebas de carga

```bash
cd ../k6
export BASE_URL="$ALB"
k6 run health-check.js
k6 run load-test.js
```

Observar `CPUUtilization` en consola CloudWatch durante la ejecución.

## 8. Limpieza (IMPORTANTE)

```bash
cd ../terraform
terraform destroy -auto-approve
```

Confirmar en la consola AWS que ALB, EC2, RDS y replica fueron eliminados.

## Troubleshooting

| Síntoma                                          | Causa probable / solución                                         |
|---------------------------------------------------|-------------------------------------------------------------------|
| `error: InvalidClientTokenId`                     | Token AWS Academy expirado, re-exportar credenciales              |
| ALB en estado `provisioning`                      | Esperar 2-3 minutos, AWS aprovisiona el LB en varios pasos        |
| `/health` devuelve 502                            | EC2 aún arrancando, esperar a que `user_data.sh` finalice (~3 min)|
| RDS sin endpoint                                   | El recurso aún en `creating`. `terraform apply` se reintenta      |
| k6 no ve dos hostnames                            | Verificar que `ec2_count >= 2` y que ambos targets estén healthy  |
| `terraform destroy` se cuelga en NAT GW           | Eliminar manualmente Elastic IP huérfana, luego re-ejecutar       |
