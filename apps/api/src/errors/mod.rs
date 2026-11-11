use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Database is not configured")]
    DatabaseNotConfigured,

    #[error("Internal server error: {0}")]
    Internal(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Bad request: {0}")]
    BadRequest(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::Database(_) => (
                StatusCode::SERVICE_UNAVAILABLE,
                "Database error or service unavailable".to_string(),
            ),
            AppError::DatabaseNotConfigured => (
                StatusCode::SERVICE_UNAVAILABLE,
                "Database is not configured".to_string(),
            ),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
        };

        let body = Json(json!({
            "success": false,
            "message": message,
            "data": null
        }));

        (status, body).into_response()
    }
}
