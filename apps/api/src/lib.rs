pub mod app;
pub mod config;
pub mod database;
pub mod errors;
pub mod middleware;
pub mod modules;
pub mod routes;
pub mod utils;

use std::net::SocketAddr;
use tokio::sync::oneshot;
use tracing::{info, warn};

pub use app::{create_router, AppState};
pub use config::AppConfig;
pub use database::create_connection_pool;

pub async fn build_app_state(config: &AppConfig) -> AppState {
    let db_pool = if let Some(ref db_url) = config.database_url {
        match create_connection_pool(db_url).await {
            Ok(pool) => {
                info!("Database connection established");
                Some(pool)
            }
            Err(e) => {
                warn!("Could not connect to MySQL at startup: {}. Database endpoints will report unavailable.", e);
                None
            }
        }
    } else {
        warn!("DATABASE_URL is not set. Database features are disabled.");
        None
    };

    AppState {
        db_pool,
        config: config.clone(),
    }
}

pub async fn run_server(
    config: AppConfig,
    shutdown_rx: Option<oneshot::Receiver<()>>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr: SocketAddr = format!("{}:{}", config.host, config.port).parse()?;
    let state = build_app_state(&config).await;
    let router = create_router(state);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    info!("Axum API server listening on http://{}", addr);

    if let Some(rx) = shutdown_rx {
        axum::serve(listener, router)
            .with_graceful_shutdown(async move {
                let _ = rx.await;
                info!("Axum API server received graceful shutdown signal");
            })
            .await?;
    } else {
        axum::serve(listener, router).await?;
    }

    Ok(())
}

pub fn spawn_server(
    config: AppConfig,
) -> (
    oneshot::Sender<()>,
    tokio::task::JoinHandle<Result<(), String>>,
) {
    let (tx, rx) = oneshot::channel();
    let handle = tokio::spawn(async move {
        run_server(config, Some(rx))
            .await
            .map_err(|e| e.to_string())
    });

    (tx, handle)
}
