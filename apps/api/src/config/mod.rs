use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub database_url: Option<String>,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let _ = dotenvy::dotenv();

        let host = env::var("API_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let port = env::var("API_PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(4317);

        let database_url = env::var("DATABASE_URL")
            .ok()
            .filter(|s| !s.trim().is_empty());

        Self {
            host,
            port,
            database_url,
        }
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            host: "127.0.0.1".to_string(),
            port: 4317,
            database_url: None,
        }
    }
}
