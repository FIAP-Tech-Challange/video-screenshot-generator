output "endpoint" {
  description = "RDS instance endpoint (DNS name)"
  value       = aws_db_instance.this.address
}

output "port" {
  description = "RDS instance port"
  value       = aws_db_instance.this.port
}

output "identifier" {
  description = "RDS instance identifier"
  value       = aws_db_instance.this.identifier
}

output "arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.this.arn
}

output "vpc_security_group_ids" {
  description = "VPC security group IDs attached to the RDS instance"
  value       = aws_db_instance.this.vpc_security_group_ids
}

output "db_subnet_group" {
  description = "DB subnet group associated with the RDS instance"
  value       = aws_db_instance.this.db_subnet_group
}

output "username" {
  description = "Master username for the RDS instance (not the password)"
  value       = aws_db_instance.this.username
}

output "password" {
  description = "Auto-generated DB password (sensitive)"
  value       = random_password.db_password.result
  sensitive   = true
}
