# Plain Flags GCP Terraform

This directory contains Terraform configuration to deploy the GCP-native Plain Flags stack:

- Cloud SQL (PostgreSQL)
- Cloud Run services:
  - plainflags-management
  - plainflags-states (Cloud Run variant only)
  - plainflags-dashboard
- Secret Manager secrets for DB password, dashboard passkey, and states API key
- Service account + IAM bindings required by runtime services

Cloud tests are excluded from this Terraform module.
By default, Terraform appends the suffix `tf` to created resource names to avoid conflicts with resources created by shell scripts.

Cloud SQL destroy behavior: the `google_sql_database` and `google_sql_user` resources use `deletion_policy = "ABANDON"` so `terraform destroy` can reliably delete the Cloud SQL instance without failing on Postgres object/connection constraints.

## Prerequisites

- Terraform >= 1.6.0
- Access to a GCP project with permission to create IAM, Cloud Run, Cloud SQL, Secret Manager, and enable project services

Fixed image repositories used by this module:

- `andreileonte011/plain-flags-gcp-management:latest`
- `andreileonte011/plain-flags-gcp-states:latest`
- `andreileonte011/plain-flags-gcp-dashboard:latest`

You can control the image tags (versions) via Terraform variables.

## Quick Start

1. Copy the example variables file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` and set at minimum:

- `project_id`
- `superadmin_email`
- `firebase_auth_domain`
- `firebase_api_key`
- `firebase_app_id`

3. Initialize and deploy:

```bash
terraform init
terraform plan
terraform apply
```

## Input Variables

### Required

- `project_id`
- `superadmin_email`

### Usually required for dashboard runtime

- `firebase_auth_domain`
- `firebase_api_key`
- `firebase_app_id`

### Optional

- `region` (default: `us-central1`)
- `deployment_name_suffix` (default: `tf`; must match `^[a-z0-9-]{1,12}$`)
- `stale_flag_days` (default: `14`)
- `states_cache_ttl` (default: `0`)
- `firebase_project_id` (defaults to `project_id` when empty)
- `management_image_version` (default: `latest`)
- `states_image_version` (default: `latest`)
- `dashboard_image_version` (default: `latest`)

## Outputs

- `service_account_email`: runtime service account

- `cloud_sql`: Cloud SQL instance info (name, connection name, DB user, public IP)

- `service_urls`: public URLs for management, states, and dashboard
  - management: if you use the mobile app, pass this URL when connecting, together with the dashboard passkey (see below)
  - states: when configuring the SDK in your software, pass this URL on initialization, together with the value of states_apikey (see below)
  - dashboard: navigate to this URL in a browser to control your feature flags

- `generated_secrets` (sensitive):
  - `db_password`
  - `dashboard_passkey` (8 characters)
  - `states_apikey`

- `runtime_config`: project and Firebase runtime config values

- `deployment_names`: resolved Terraform resource names and secret IDs

To read sensitive outputs:

```bash
terraform output generated_secrets
```

## Using This Module From Another Team Repo

This directory is designed to be consumable as a module. Example:

```hcl
module "plainflags" {
  source = "git::https://github.com/andreileonte1981/plain-flags.git//gcp/infrastructure/terraform?ref=<tag-or-commit>"

  project_id         = var.project_id
  superadmin_email   = var.superadmin_email
  firebase_auth_domain = var.firebase_auth_domain
  firebase_api_key   = var.firebase_api_key
  firebase_app_id    = var.firebase_app_id
}
```

Then consume outputs, for example:

```hcl
output "plainflags_dashboard_url" {
  value = module.plainflags.service_urls.dashboard
}
```
