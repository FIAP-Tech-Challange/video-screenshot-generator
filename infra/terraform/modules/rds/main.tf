# Use the default VPC subnets in the lab account
data "aws_default_vpc" "default" {}

data "aws_subnet_ids" "default_vpc" {
  vpc_id = data.aws_default_vpc.default.id
}

# DB subnet group using default VPC subnets
resource "aws_db_subnet_group" "rds_subnet" {
  name        = "rds-subnet-group"
  subnet_ids  = data.aws_subnet_ids.default_vpc.ids
  description = "Subnet group for RDS in the default VPC (lab use)"

  tags = {
    Name        = "rds-subnet-group"
    Environment = "lab"
  }
}

# Security group for the DB (lab: allows Postgres from anywhere)
resource "aws_security_group" "db_sg" {
  name        = "rds-db-sg"
  description = "Security group for RDS instance; allows Postgres access (lab)"
  vpc_id      = data.aws_default_vpc.default.id

  ingress {
    description = "Postgres ingress"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "rds-db-sg"
    Environment = "lab"
  }
}

# Generated password for the DB master user
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!@#$%&*()-_=+[]{}<>?"
}

# RDS instance (hard-coded settings;
resource "aws_db_instance" "this" {
  identifier        = "app-db"
  allocated_storage = 20
  engine            = "postgres"
  engine_version    = "13.7"
  instance_class    = "db.t3.micro"

  username = var.db_username
  password = random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.rds_subnet.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  publicly_accessible     = true
  multi_az                = false
  skip_final_snapshot     = true
  backup_retention_period = 7
  storage_type            = "gp2"

  performance_insights_enabled = false

  tags = {
    Name        = "app-db"
    Environment = "lab"
    ManagedBy   = "terraform"
  }
}
