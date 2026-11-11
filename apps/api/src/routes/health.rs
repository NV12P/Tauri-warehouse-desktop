use axum::{extract::State, http::StatusCode, response::IntoResponse, routing::get, Json, Router};
use serde_json::json;

use crate::{app::AppState, database::check_database_health, utils::ApiResponse};

pub fn health_router() -> Router<AppState> {
    Router::new()
        .route("/health", get(health_check))
        .route("/health/db", get(db_health_check))
}

async fn health_check() -> impl IntoResponse {
    let response = ApiResponse::success("API server is running", json!({ "status": "ok" }));
    (StatusCode::OK, Json(response))
}

async fn db_health_check(State(state): State<AppState>) -> impl IntoResponse {
    match &state.db_pool {
        Some(pool) => match check_database_health(pool).await {
            Ok(_) => {
                let response = ApiResponse::success(
                    "Database is connected",
                    json!({
                        "status": "connected",
                        "database": "mysql"
                    }),
                );
                (StatusCode::OK, Json(response))
            }
            Err(_) => {
                let response = ApiResponse::error(
                    "Database connection check failed",
                    json!({ "status": "disconnected" }),
                );
                (StatusCode::SERVICE_UNAVAILABLE, Json(response))
            }
        },
        None => {
            let response = ApiResponse::error(
                "Database is not configured or unavailable",
                json!({ "status": "not_configured" }),
            );
            (StatusCode::SERVICE_UNAVAILABLE, Json(response))
        }
    }
}
