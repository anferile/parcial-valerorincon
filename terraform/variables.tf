variable "project_name" {
  description = "Nombre corto del proyecto. Se usa como prefijo de los recursos."
  type        = string
  default     = "parcial-valero"
}

variable "environment" {
  description = "Entorno logico (dev | qa | prod)."
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "Region de AWS donde se desplegara la infraestructura."
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block de la VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks para las subnets publicas (ALB y NAT)."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks para las subnets privadas (EC2 y RDS)."
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "azs" {
  description = "Zonas de disponibilidad a usar. Si esta vacio, se autodetectan."
  type        = list(string)
  default     = []
}

variable "ec2_instance_type" {
  description = "Tipo de instancia EC2 para los nodos de la aplicacion."
  type        = string
  default     = "t3.micro"
}

variable "ec2_count" {
  description = "Cantidad de instancias EC2 detras del ALB (minimo 2 para HA)."
  type        = number
  default     = 2
}

variable "key_pair_name" {
  description = "Nombre del Key Pair existente en AWS para acceder por SSH."
  type        = string
  default     = "vockey"
}

variable "instance_profile_name" {
  description = "Instance Profile preexistente en AWS Academy."
  type        = string
  default     = "LabInstanceProfile"
}

variable "app_port" {
  description = "Puerto en el que escucha la aplicacion Node.js dentro de cada EC2."
  type        = number
  default     = 3000
}

variable "app_repo_url" {
  description = "URL publica del repositorio Git que sera clonado por cada EC2."
  type        = string
  default     = "https://github.com/anferile/parcial-valero-rincon.git"
}

variable "app_repo_branch" {
  description = "Rama del repositorio a clonar."
  type        = string
  default     = "main"
}

variable "app_subdir" {
  description = "Subdirectorio dentro del repo donde esta el package.json."
  type        = string
  default     = "app"
}

variable "db_engine_version" {
  description = "Version del motor MySQL en RDS."
  type        = string
  default     = "8.0.39"
}

variable "db_instance_class" {
  description = "Clase de instancia RDS."
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "GB de storage para la instancia principal de RDS."
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Nombre logico inicial de la base de datos."
  type        = string
  default     = "appdb"
}

variable "db_username" {
  description = "Usuario maestro de la base de datos."
  type        = string
  default     = "appuser"
}

variable "db_password" {
  description = "Contrasena del usuario maestro de la BD."
  type        = string
  sensitive   = true
}

variable "create_read_replica" {
  description = "Si es true se crea una RDS Read Replica."
  type        = bool
  default     = true
}

variable "allowed_ssh_cidr" {
  description = "CIDR autorizado para SSH."
  type        = string
  default     = "0.0.0.0/0"
}
