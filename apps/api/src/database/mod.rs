use sqlx::mysql::{MySqlPool, MySqlPoolOptions};
use std::time::Duration;
use tracing::{error, info};

pub async fn create_connection_pool(database_url: &str) -> Result<MySqlPool, sqlx::Error> {
    info!("Initializing MySQL connection pool...");
    let pool = MySqlPoolOptions::new()
        .max_connections(10)
        .min_connections(1)
        .acquire_timeout(Duration::from_secs(5))
        .idle_timeout(Duration::from_secs(300))
        .connect(database_url)
        .await?;

    info!("MySQL connection pool initialized successfully");
    Ok(pool)
}

pub async fn check_database_health(pool: &MySqlPool) -> Result<(), sqlx::Error> {
    sqlx::query("SELECT 1")
        .execute(pool)
        .await
        .map(|_| ())
        .map_err(|err| {
            error!("Database ping failed: {}", err);
            err
        })
}
