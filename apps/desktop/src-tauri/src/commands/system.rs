use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AppStatus {
    pub name: String,
    pub version: String,
    pub desktop_status: String,
    pub api_port: u16,
}

#[tauri::command]
pub fn get_app_status() -> AppStatus {
    AppStatus {
        name: "Aplikasi Gudang".to_string(),
        version: "0.1.0".to_string(),
        desktop_status: "running".to_string(),
        api_port: 4317,
    }
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Halo, {}! Koneksi Tauri Native Command berhasil.", name)
}
