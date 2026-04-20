variable "project_id" {
  description = "GCP project ID where Plain Flags resources are deployed."
  type        = string
}

variable "region" {
  description = "Primary region for Cloud Run and Cloud SQL."
  type        = string
  default     = "us-central1"
}

variable "superadmin_email" {
  description = "Email to bootstrap as superadmin in management service."
  type        = string
}

variable "stale_flag_days" {
  description = "Flags are stale after this many days without updates."
  type        = number
  default     = 14
}

variable "states_cache_ttl" {
  description = "In-memory cache TTL for flag-states-run service in seconds."
  type        = number
  default     = 0
}

variable "management_image_version" {
  description = "Version tag for the fixed GCP flag-management Docker Hub image."
  type        = string
  default     = "latest"
}

variable "states_image_version" {
  description = "Version tag for the fixed GCP flag-states-run Docker Hub image."
  type        = string
  default     = "latest"
}

variable "dashboard_image_version" {
  description = "Version tag for the fixed GCP dashboard Docker Hub image."
  type        = string
  default     = "latest"
}

variable "firebase_project_id" {
  description = "Firebase project id used by dashboard and management auth checks."
  type        = string
  default     = ""
}

variable "firebase_auth_domain" {
  description = "Firebase auth domain for dashboard runtime config."
  type        = string
  default     = ""
}

variable "firebase_api_key" {
  description = "Firebase web API key for dashboard runtime config."
  type        = string
  default     = ""
  sensitive   = true
}

variable "firebase_app_id" {
  description = "Firebase web app id for dashboard runtime config."
  type        = string
  default     = ""
}
