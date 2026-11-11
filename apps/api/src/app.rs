use axum::{
    http::{
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method,
    },
    Router,
};
use sqlx::MySqlPool;
use tower_http::cors::CorsLayer;

use crate::{config::AppConfig, routes::api_v1_router};

#[derive(Clone)]
pub struct AppState {
    pub db_pool: Option<MySqlPool>,
    pub config: AppConfig,
}

pub fn create_router(state: AppState) -> Router {
    let allowed_origins = [
        "http://localhost:1420".parse::<HeaderValue>().unwrap(),
        "http://127.0.0.1:1420".parse::<HeaderValue>().unwrap(),
        "tauri://localhost".parse::<HeaderValue>().unwrap(),
        "http://tauri.localhost".parse::<HeaderValue>().unwrap(),
    ];

    let cors = CorsLayer::new()
        .allow_origin(allowed_origins)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([CONTENT_TYPE, AUTHORIZATION, ACCEPT]);

    Router::new()
        .nest("/api/v1", api_v1_router())
        .layer(cors)
        .with_state(state)
}
