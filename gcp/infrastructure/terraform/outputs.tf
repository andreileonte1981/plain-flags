output "service_account_email" {
  description = "Service account used by Plain Flags runtime services."
  value       = google_service_account.runner.email
}

output "cloud_sql" {
  description = "Cloud SQL connection details."
  value = {
    instance_name = google_sql_database_instance.plainflags.name
    instance_conn = google_sql_database_instance.plainflags.connection_name
    database_name = google_sql_database.plainflags.name
    database_user = google_sql_user.plainflags.name
    public_ip     = google_sql_database_instance.plainflags.public_ip_address
  }
}

output "service_urls" {
  description = "Public service URLs."
  value = {
    management = google_cloud_run_v2_service.management.uri
    states     = google_cloud_run_v2_service.states.uri
    dashboard  = google_cloud_run_v2_service.dashboard.uri
  }
}

output "generated_secrets" {
  description = "Generated secret values needed by operators and SDK clients."
  sensitive   = true
  value = {
    db_password       = random_password.db_password.result
    dashboard_passkey = random_password.dashboard_passkey.result
    states_apikey     = random_password.states_apikey.result
  }
}

output "runtime_config" {
  description = "Runtime values commonly needed by downstream infrastructure modules."
  value = {
    project_id           = var.project_id
    region               = var.region
    firebase_project_id  = local.firebase_project_id
    firebase_auth_domain = var.firebase_auth_domain
    firebase_app_id      = var.firebase_app_id
  }
}

output "deployment_names" {
  description = "Names generated for Terraform-managed resources."
  value = {
    deployment_name_suffix     = local.deployment_name_suffix
    service_account_account_id = local.names.service_account_account_id
    cloud_sql_instance_name    = local.names.cloud_sql_instance
    cloud_run_service_names = {
      management = local.names.cloud_run_management
      states     = local.names.cloud_run_states
      dashboard  = local.names.cloud_run_dashboard
    }
    secret_ids = local.secret_ids
  }
}
