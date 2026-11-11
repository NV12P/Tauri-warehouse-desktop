pub mod commands;
pub mod services;
pub mod state;
pub mod utils;

use tauri::Manager;
use tokio::sync::oneshot;
use tracing::info;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(state::ApiServerState::new(shutdown_tx))
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::get_app_status
        ])
        .setup(|_app| {
            let config = gudang_api::AppConfig::from_env();
            info!(
                "Spawning integrated Axum API Server on 127.0.0.1:{}",
                config.port
            );
            tauri::async_runtime::spawn(async move {
                if let Err(err) = gudang_api::run_server(config, Some(shutdown_rx)).await {
                    eprintln!("Integrated Axum server terminated with error: {}", err);
                }
            });
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                info!("Application exiting, initiating graceful shutdown for Axum API...");
                if let Some(server_state) = app_handle.try_state::<state::ApiServerState>() {
                    server_state.shutdown();
                }
            }
        });
}
