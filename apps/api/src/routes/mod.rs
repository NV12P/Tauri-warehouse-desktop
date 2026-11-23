pub mod health;
pub mod uploads;

use crate::app::AppState;
use axum::Router;
use std::path::PathBuf;

pub fn api_v1_router(upload_dir: PathBuf) -> Router<AppState> {
    Router::new()
        .merge(health::health_router())
        .merge(uploads::uploads_router(upload_dir))
}
