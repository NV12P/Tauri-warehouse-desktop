use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub message: String,
    pub data: T,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn success(message: impl Into<String>, data: T) -> Self {
        Self {
            success: true,
            message: message.into(),
            data,
        }
    }

    pub fn error(message: impl Into<String>, data: T) -> Self {
        Self {
            success: false,
            message: message.into(),
            data,
        }
    }
}
