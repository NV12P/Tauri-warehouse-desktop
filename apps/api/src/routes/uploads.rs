use axum::{
    extract::{Path as AxumPath, Multipart, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, post},
    Json, Router,
};
use serde::Serialize;
use serde_json::json;
use std::{
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tokio::fs;
use tower_http::services::ServeDir;

use crate::{app::AppState, errors::AppError, utils::ApiResponse};

const MAX_IMAGE_BYTES: usize = 2 * 1024 * 1024;

#[derive(Debug, Serialize)]
pub struct UploadedImage {
    pub photo_path: String,
    pub url: String,
}

pub fn uploads_router(upload_dir: PathBuf) -> Router<AppState> {
    Router::new()
        .route("/uploads/item-images", post(upload_item_image))
        .route("/uploads/item-images/{filename}", delete(delete_item_image))
        .nest_service("/uploads/items", ServeDir::new(upload_dir))
}

async fn upload_item_image(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, AppError> {
    let upload = read_image_field(&mut multipart).await?;
    let extension = image_extension(&upload.content_type, &upload.bytes)?;

    fs::create_dir_all(&state.config.upload_dir)
        .await
        .map_err(|e| AppError::Internal(format!("Gagal menyiapkan folder gambar: {e}")))?;

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let filename = format!("item-{}-{}.{}", std::process::id(), timestamp, extension);
    let target = state.config.upload_dir.join(&filename);

    fs::write(&target, &upload.bytes)
        .await
        .map_err(|e| AppError::Internal(format!("Gagal menyimpan gambar: {e}")))?;

    let response = ApiResponse::success(
        "Gambar barang berhasil diunggah",
        UploadedImage {
            photo_path: filename.clone(),
            url: format!("/api/v1/uploads/items/{filename}"),
        },
    );

    Ok((StatusCode::CREATED, Json(response)))
}

async fn delete_item_image(
    State(state): State<AppState>,
    AxumPath(filename): AxumPath<String>,
) -> Result<impl IntoResponse, AppError> {
    if !is_generated_item_photo(&filename) {
        return Err(AppError::BadRequest("Nama file gambar tidak valid".to_string()));
    }

    let target = state.config.upload_dir.join(&filename);
    match fs::remove_file(&target).await {
        Ok(_) => Ok((
            StatusCode::OK,
            Json(ApiResponse::success("Gambar lama berhasil dihapus", json!({ "deleted": true }))),
        )),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok((
            StatusCode::OK,
            Json(ApiResponse::success("Gambar sudah tidak ada", json!({ "deleted": false }))),
        )),
        Err(e) => Err(AppError::Internal(format!("Gagal menghapus gambar: {e}"))),
    }
}

fn is_generated_item_photo(filename: &str) -> bool {
    if filename.is_empty()
        || filename.contains('/')
        || filename.contains('\\')
        || Path::new(filename).file_name().and_then(|v| v.to_str()) != Some(filename)
    {
        return false;
    }

    let (stem, extension) = match filename.rsplit_once('.') {
        Some(parts) => parts,
        None => return false,
    };
    if !matches!(extension, "jpg" | "png" | "webp") {
        return false;
    }

    let rest = match stem.strip_prefix("item-") {
        Some(rest) => rest,
        None => return false,
    };
    let mut parts = rest.splitn(2, '-');
    let pid = parts.next().unwrap_or("");
    let nanos = parts.next().unwrap_or("");

    !pid.is_empty()
        && pid.bytes().all(|b| b.is_ascii_digit())
        && !nanos.is_empty()
        && nanos.bytes().all(|b| b.is_ascii_digit())
}

struct UploadedField {
    content_type: String,
    bytes: Vec<u8>,
}

async fn read_image_field(multipart: &mut Multipart) -> Result<UploadedField, AppError> {
    while let Some(mut field) = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("Form gambar tidak valid: {e}")))?
    {
        let name = field.name().unwrap_or("").to_string();
        if name != "image" && name != "file" {
            continue;
        }

        let content_type = field.content_type().unwrap_or("").to_string();
        let mut bytes = Vec::new();

        while let Some(chunk) = field
            .chunk()
            .await
            .map_err(|e| AppError::BadRequest(format!("Gagal membaca gambar: {e}")))?
        {
            if bytes.len() + chunk.len() > MAX_IMAGE_BYTES {
                return Err(AppError::BadRequest(
                    "Ukuran gambar maksimal 2 MB".to_string(),
                ));
            }
            bytes.extend_from_slice(&chunk);
        }

        if bytes.is_empty() {
            return Err(AppError::BadRequest("File gambar kosong".to_string()));
        }

        return Ok(UploadedField {
            content_type,
            bytes,
        });
    }

    Err(AppError::BadRequest("Gambar belum dipilih".to_string()))
}

fn image_extension(content_type: &str, bytes: &[u8]) -> Result<&'static str, AppError> {
    let valid = match content_type {
        "image/jpeg" => bytes.starts_with(&[0xFF, 0xD8, 0xFF]),
        "image/png" => bytes.starts_with(&[0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A]),
        "image/webp" => bytes.starts_with(b"RIFF") && bytes.get(8..12) == Some(&b"WEBP"[..]),
        _ => false,
    };

    if valid {
        match content_type {
            "image/jpeg" => Ok("jpg"),
            "image/png" => Ok("png"),
            "image/webp" => Ok("webp"),
            _ => unreachable!(),
        }
    } else {
        Err(AppError::BadRequest(
            "Format gambar harus JPG, PNG, atau WEBP".to_string(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::{image_extension, is_generated_item_photo};

    #[test]
    fn accepts_known_image_signatures() {
        assert_eq!(image_extension("image/png", b"\x89PNG\r\n\x1a\nrest").unwrap(), "png");
        assert_eq!(image_extension("image/jpeg", b"\xff\xd8\xffrest").unwrap(), "jpg");
        assert_eq!(image_extension("image/webp", b"RIFF----WEBPVP8 ").unwrap(), "webp");
    }

    #[test]
    fn rejects_unknown_or_mismatched_images() {
        assert!(image_extension("image/png", b"not-a-png").is_err());
        assert!(image_extension("application/pdf", b"%PDF-1.7").is_err());
    }

    #[test]
    fn only_accepts_generated_item_photo_names() {
        assert!(is_generated_item_photo("item-1234-1795161785443167400.webp"));
        assert!(!is_generated_item_photo("avatar.png"));
        assert!(!is_generated_item_photo("../item-1234-1.png"));
        assert!(!is_generated_item_photo("item-abc-1.jpg"));
    }
}
