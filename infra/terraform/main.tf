module "rds" {
  source = "./modules/rds"

  db_username = var.db_username
}
