output "rds_endpoint" {
  description = "RDS instance endpoint (DNS name) to connect to the database."
  value       = module.rds.endpoint
}

output "rds_port" {
  description = "Port on which the RDS instance is listening."
  value       = module.rds.port
}

output "rds_identifier" {
  description = "RDS instance identifier (the instance name)."
  value       = module.rds.identifier
}

output "rds_master_username" {
  description = "Master username for the RDS instance (not the password)."
  value       = module.rds.username
}

output "rds_password" {
  description = "Generated DB password (sensitive)"
  value       = module.rds.password
  sensitive   = true
}
