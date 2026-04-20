locals {
  management_image = "andreileonte011/plain-flags-gcp-management:${var.management_image_version}"
  states_image     = "andreileonte011/plain-flags-gcp-states:${var.states_image_version}"
  dashboard_image  = "andreileonte011/plain-flags-gcp-dashboard:${var.dashboard_image_version}"

  firebase_project_id = var.firebase_project_id != "" ? var.firebase_project_id : var.project_id
}

resource "google_project_service" "required" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "identitytoolkit.googleapis.com",
    "firebase.googleapis.com"
  ])

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_service_account" "runner" {
  account_id   = "plainflags-runner"
  display_name = "Plain Flags runner"
}

resource "google_project_iam_member" "runner_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/firebaseauth.admin"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.runner.email}"
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

resource "random_password" "dashboard_passkey" {
  length  = 48
  special = false
}

resource "random_password" "states_apikey" {
  length  = 48
  special = false
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "plainflags-db-password"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

resource "google_secret_manager_secret" "dashboard_passkey" {
  secret_id = "plainflags-dashboard-passkey"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "dashboard_passkey" {
  secret      = google_secret_manager_secret.dashboard_passkey.id
  secret_data = random_password.dashboard_passkey.result
}

resource "google_secret_manager_secret" "states_apikey" {
  secret_id = "plainflags-states-apikey"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "states_apikey" {
  secret      = google_secret_manager_secret.states_apikey.id
  secret_data = random_password.states_apikey.result
}

resource "google_sql_database_instance" "plainflags" {
  name                = "plainflags-db"
  database_version    = "POSTGRES_15"
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    disk_size         = 10
    disk_autoresize   = true

    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled = true
    }
  }

  depends_on = [google_project_service.required]
}

resource "google_sql_database" "plainflags" {
  name     = "plainflags"
  instance = google_sql_database_instance.plainflags.name
}

resource "google_sql_user" "plainflags" {
  name     = "plainflags"
  instance = google_sql_database_instance.plainflags.name
  password = random_password.db_password.result
}

resource "google_cloud_run_v2_service" "management" {
  name     = "plainflags-management"
  location = var.region

  template {
    service_account = google_service_account.runner.email

    scaling {
      min_instance_count = 0
      max_instance_count = 1
    }

    containers {
      image = local.management_image

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "DB_CONNECTION_NAME"
        value = google_sql_database_instance.plainflags.connection_name
      }
      env {
        name  = "DB_NAME"
        value = google_sql_database.plainflags.name
      }
      env {
        name  = "DB_USER"
        value = google_sql_user.plainflags.name
      }
      env {
        name  = "SUPERADMIN_EMAIL"
        value = var.superadmin_email
      }
      env {
        name  = "FIREBASE_PROJECT_ID"
        value = local.firebase_project_id
      }
      env {
        name  = "STALE_FLAG_DAYS"
        value = tostring(var.stale_flag_days)
      }
      env {
        name  = "TEST_SERVICE_EMAIL"
        value = var.test_service_email
      }
      env {
        name = "DB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_password.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "DASHBOARD_PASSKEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.dashboard_passkey.secret_id
            version = "latest"
          }
        }
      }
    }

    timeout = "300s"
  }

  depends_on = [
    google_project_service.required,
    google_project_iam_member.runner_roles,
    google_secret_manager_secret_version.db_password,
    google_secret_manager_secret_version.dashboard_passkey,
    google_sql_database.plainflags,
    google_sql_user.plainflags
  ]
}

resource "google_cloud_run_v2_service_iam_member" "management_public" {
  project  = google_cloud_run_v2_service.management.project
  location = google_cloud_run_v2_service.management.location
  name     = google_cloud_run_v2_service.management.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service" "states" {
  name     = "plainflags-states"
  location = var.region

  template {
    service_account = google_service_account.runner.email

    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }

    containers {
      image = local.states_image

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "CLOUD_SQL_CONNECTION_NAME"
        value = google_sql_database_instance.plainflags.connection_name
      }
      env {
        name  = "DB_NAME"
        value = google_sql_database.plainflags.name
      }
      env {
        name  = "DB_USER"
        value = google_sql_user.plainflags.name
      }
      env {
        name  = "CACHE_TTL"
        value = tostring(var.states_cache_ttl)
      }
      env {
        name = "DB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_password.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "APIKEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.states_apikey.secret_id
            version = "latest"
          }
        }
      }
    }

    timeout = "60s"
  }

  depends_on = [
    google_project_service.required,
    google_project_iam_member.runner_roles,
    google_secret_manager_secret_version.db_password,
    google_secret_manager_secret_version.states_apikey,
    google_sql_database.plainflags,
    google_sql_user.plainflags
  ]
}

resource "google_cloud_run_v2_service_iam_member" "states_public" {
  project  = google_cloud_run_v2_service.states.project
  location = google_cloud_run_v2_service.states.location
  name     = google_cloud_run_v2_service.states.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service" "dashboard" {
  name     = "plainflags-dashboard"
  location = var.region

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = local.dashboard_image

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "MANAGEMENT_SERVICE_URL"
        value = google_cloud_run_v2_service.management.uri
      }
      env {
        name  = "FIREBASE_PROJECT_ID"
        value = local.firebase_project_id
      }
      env {
        name  = "FIREBASE_AUTH_DOMAIN"
        value = var.firebase_auth_domain
      }
      env {
        name  = "FIREBASE_API_KEY"
        value = var.firebase_api_key
      }
      env {
        name  = "FIREBASE_APP_ID"
        value = var.firebase_app_id
      }
    }

    timeout = "300s"
  }

  depends_on = [google_project_service.required, google_cloud_run_v2_service.management]
}

resource "google_cloud_run_v2_service_iam_member" "dashboard_public" {
  project  = google_cloud_run_v2_service.dashboard.project
  location = google_cloud_run_v2_service.dashboard.location
  name     = google_cloud_run_v2_service.dashboard.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
