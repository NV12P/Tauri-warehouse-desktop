use std::sync::Mutex;
use tokio::sync::oneshot;

pub struct ApiServerState {
    pub shutdown_tx: Mutex<Option<oneshot::Sender<()>>>,
}

impl ApiServerState {
    pub fn new(shutdown_tx: oneshot::Sender<()>) -> Self {
        Self {
            shutdown_tx: Mutex::new(Some(shutdown_tx)),
        }
    }

    pub fn shutdown(&self) {
        if let Ok(mut lock) = self.shutdown_tx.lock() {
            if let Some(tx) = lock.take() {
                let _ = tx.send(());
            }
        }
    }
}
