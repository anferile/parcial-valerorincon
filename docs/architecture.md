# Diagrama de arquitectura - Parcial Valero

## 1. Diagrama lógico (texto)

```
                              ┌──────────────────────────┐
                              │       USUARIOS           │
                              │  (curl, postman, k6,     │
                              │   navegador, video)      │
                              └─────────────┬────────────┘
                                            │   HTTP :80
                                            ▼
                              ┌──────────────────────────┐
                              │  Application LB (ALB)    │  Internet-facing
                              │  SG-ALB: 80,443 desde    │  Listener HTTP → TG
                              │  0.0.0.0/0               │
                              └─────┬─────────────┬──────┘
                                    │             │
                       ┌────────────┘             └────────────┐
                       ▼                                       ▼
              ┌──────────────────┐                  ┌──────────────────┐
              │ Public subnet 1  │                  │ Public subnet 2  │
              │   10.0.1.0/24    │                  │   10.0.2.0/24    │
              │   us-east-1a     │                  │   us-east-1b     │
              │                  │                  │                  │
              │  ┌────────────┐  │                  │  ┌────────────┐  │
              │  │  EC2 #1    │  │                  │  │  EC2 #2    │  │
              │  │ instance-1 │  │                  │  │ instance-2 │  │
              │  │ Node.js    │  │                  │  │ Node.js    │  │
              │  │ port 3000  │  │                  │  │ port 3000  │  │
              │  │ SG-EC2     │  │                  │  │ SG-EC2     │  │
              │  └─────┬──────┘  │                  │  └─────┬──────┘  │
              └────────┼─────────┘                  └────────┼─────────┘
                       │             VPC 10.0.0.0/16         │
                       │           NAT GW (en public-1)      │
                       │                                     │
              ┌────────┼─────────┐                  ┌────────┼─────────┐
              │ Private subnet 1│                  │ Private subnet 2 │
              │   10.0.11.0/24   │                  │  10.0.12.0/24   │
              │                  │                  │                  │
              │ ┌──────────────┐ │                  │ ┌──────────────┐ │
              │ │   RDS PG     │◄┼──────────────────┼─┤ Read Replica │ │
              │ │  Primary     │ │  replicación     │ │              │ │
              │ │  SG-RDS:5432 │ │  asíncrona       │ │              │ │
              │ └──────────────┘ │                  │ └──────────────┘ │
              └──────────────────┘                  └──────────────────┘

  Internet Gateway  ◄── adjunto a VPC, ruta default de subnets públicas
  NAT Gateway       ◄── salida a internet para subnets privadas

                                        ┌──────────────────────────────┐
                                        │     CI/CD GitHub Actions     │
  GitHub repo ──push──────────────────►│  - npm install / lint / test │
                                        │  - terraform fmt/init/validate│
                                        │  - secrets AWS_*, DB_PASSWORD │
                                        └──────────────────────────────┘

  CloudWatch  ──── métricas CPU, ALB, alarmas (5xx, UnHealthyHostCount)
```

## 2. Diagrama oficial AWS 2026 - Instrucciones para construirlo

Generar el diagrama en [draw.io / diagrams.net](https://app.diagrams.net) o en [Lucidchart](https://lucid.app) usando los iconos oficiales del paquete **AWS Icons 2026** (`AWS Icons (2024)` library en draw.io).

Estructura sugerida del diagrama:

1. **Usuarios** (icono *User*) en la parte superior.
2. Una **AWS Region** etiquetada `us-east-1` que contiene:
   - **VPC** (icono *Virtual Private Cloud*) etiquetada `vpc-parcial-valero (10.0.0.0/16)`.
   - Dentro de la VPC:
     - **Internet Gateway** conectado al borde exterior.
     - **Application Load Balancer** (`AWS Elastic Load Balancing -> Application Load Balancer`).
     - Dos **Availability Zones** (`us-east-1a` y `us-east-1b`), cada una con:
       - Una **subnet pública** (icono *Public subnet*) con su **EC2** (Ubuntu Server, AMD64) etiquetada `instance-1` / `instance-2` y su Security Group `SG-EC2`.
       - Una **subnet privada** (icono *Private subnet*) con la **RDS PostgreSQL** (primary en AZ-1 y replica en AZ-2) y su Security Group `SG-RDS`.
     - Un **NAT Gateway** en la subnet pública de AZ-1.
3. Bloque externo: **GitHub Actions** ➜ flecha hacia la VPC etiquetada `CI/CD: terraform plan, validate`.
4. Bloque externo: **k6** y **navegador** ➜ flecha al ALB etiquetada `:80`.
5. **CloudWatch** dentro de la región, conectado por una flecha a las EC2 y al ALB con la etiqueta `Métricas / Alarmas`.
6. Etiquetas de Security Groups:
   - `SG-ALB`: ingress 80/443 desde `0.0.0.0/0`.
   - `SG-EC2`: ingress 3000 sólo desde `SG-ALB`, 22 desde `allowed_ssh_cidr`.
   - `SG-RDS`: ingress 5432 sólo desde `SG-EC2`.

> Exportar a PNG / PDF en alta resolución y guardarlo como `docs/architecture.png` para incluirlo en el video.

## 3. Justificación técnica

- **Multi-AZ**: dos EC2 en AZ distintas + read replica garantizan que la caída de una AZ no afecte el servicio.
- **ALB** delante de las EC2 distribuye round-robin, ejecuta health checks `/health` y desconecta automáticamente instancias unhealthy.
- **Segmentación**: la RDS jamás recibe tráfico público; sus únicos clientes son las EC2 a través de `SG-RDS ← SG-EC2`.
- **NAT Gateway** permite que las EC2 (si se mueven a subnets privadas) sigan haciendo `apt-get update`, `npm install` y consultas a RDS.
- **Terraform** versiona la infraestructura: cualquier estudiante puede reproducir el ambiente con `terraform apply`.
- **CloudWatch** entrega métricas listas para el video sin instrumentación adicional.
