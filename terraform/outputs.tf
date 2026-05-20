output "alb_dns_name" {
  description = "DNS publico del Application Load Balancer."
  value       = aws_lb.app.dns_name
}

output "alb_url" {
  description = "URL completa para validar el servicio."
  value       = "http://${aws_lb.app.dns_name}"
}

output "vpc_id" {
  description = "ID de la VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs de las subnets publicas."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs de las subnets privadas."
  value       = aws_subnet.private[*].id
}

output "ec2_instance_ids" {
  description = "IDs de las EC2 detras del ALB."
  value       = aws_instance.app[*].id
}

output "ec2_public_ips" {
  description = "IPs publicas de las EC2."
  value       = aws_instance.app[*].public_ip
}

output "ec2_private_ips" {
  description = "IPs privadas de las EC2."
  value       = aws_instance.app[*].private_ip
}

output "rds_endpoint" {
  description = "Endpoint de la instancia principal de RDS (MySQL)."
  value       = aws_db_instance.main.address
}

output "rds_replica_endpoint" {
  description = "Endpoint de la read replica."
  value       = var.create_read_replica ? aws_db_instance.replica[0].address : "no-replica-created"
}

output "security_group_alb_id" {
  description = "ID del Security Group del ALB."
  value       = aws_security_group.alb.id
}

output "security_group_ec2_id" {
  description = "ID del Security Group de EC2."
  value       = aws_security_group.ec2.id
}

output "security_group_rds_id" {
  description = "ID del Security Group de RDS."
  value       = aws_security_group.rds.id
}

output "deploy_summary" {
  description = "Resumen del despliegue."
  value       = <<-EOT

  =====================================================
  Parcial Valero - Despliegue Completado
  =====================================================
  ALB URL          : http://${aws_lb.app.dns_name}
  Health endpoint  : http://${aws_lb.app.dns_name}/health
  Status endpoint  : http://${aws_lb.app.dns_name}/status
  Test endpoint    : http://${aws_lb.app.dns_name}/api/test
  Productos        : http://${aws_lb.app.dns_name}/api/products

  RDS Primary      : ${aws_db_instance.main.address}:3306
  RDS Replica      : ${var.create_read_replica ? aws_db_instance.replica[0].address : "no-replica"}

  EC2 nodes        : ${join(", ", aws_instance.app[*].public_ip)}
  Target Group     : ${aws_lb_target_group.app.name}
  =====================================================
  EOT
}
