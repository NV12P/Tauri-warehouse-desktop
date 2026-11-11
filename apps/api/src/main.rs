use gudang_api::{config::AppConfig, run_server};
use tokio::sync::oneshot;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,gudang_api=debug".into()),
        )
        .init();

    let config = AppConfig::from_env();
    info!(
        "Starting standalone Gudang API on http://{}:{}",
        config.host, config.port
    );

    let (shutdown_tx, shutdown_rx) = oneshot::channel();

    tokio::spawn(async move {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to listen for ctrl_c signal");
        info!("Shutdown signal received, terminating server...");
        let _ = shutdown_tx.send(());
    });

    run_server(config, Some(shutdown_rx)).await?;

    info!("Standalone server exited cleanly");
    Ok(())
}
