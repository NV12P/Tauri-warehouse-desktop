pub mod health;

use crate::app::AppState;
use axum::Router;

pub fn api_v1_router() -> Router<AppState> {
    Router::new().merge(health::health_router())
}
