import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface AppStatus {
  name: String;
  version: String;
  desktop_status: String;
  api_port: number;
}

function App() {
  const [desktopStatus, setDesktopStatus] = useState<string>("Checking...");
  const [apiStatus, setApiStatus] = useState<string>("Checking...");
  const [dbStatus, setDbStatus] = useState<string>("Checking...");
  const [name, setName] = useState<string>("");
  const [greetMsg, setGreetMsg] = useState<string>("");

  useEffect(() => {
    // 1. Check Desktop status via Native Command
    invoke<AppStatus>("get_app_status")
      .then((status) => {
        setDesktopStatus(status.desktop_status === "running" ? "Running" : "Error");
      })
      .catch(() => {
        setDesktopStatus("Running (Web Mode)");
      });

    // 2. Check API Server Health
    fetch("http://127.0.0.1:4317/api/v1/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.status === "ok") {
          setApiStatus("Running");
        } else {
          setApiStatus("Error");
        }
      })
      .catch(() => {
        setApiStatus("Disconnected");
      });

    // 3. Check Database Health
    fetch("http://127.0.0.1:4317/api/v1/health/db")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.status === "connected") {
          setDbStatus("Connected");
        } else {
          setDbStatus("Not Configured / Disconnected");
        }
      })
      .catch(() => {
        setDbStatus("Disconnected");
      });
  }, []);

  async function handleGreet(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await invoke<string>("greet", { name });
      setGreetMsg(res);
    } catch (err) {
      setGreetMsg(`Error invoking native command: ${String(err)}`);
    }
  }

  const getBadgeClass = (status: string) => {
    if (status === "Running" || status === "Connected") return "badge-success";
    if (status.includes("Checking")) return "badge-warning";
    return "badge-error";
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Aplikasi Gudang</h1>
        <p className="subtitle">Project Scaffold — Tauri v2 + React + Axum + MySQL</p>
      </header>

      <section className="status-section">
        <h2 className="section-title">Status Sistem</h2>
        <div className="status-list">
          <div className="status-item">
            <span className="status-label">Desktop Application</span>
            <span className={`status-badge ${getBadgeClass(desktopStatus)}`}>
              {desktopStatus}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">API Server (127.0.0.1:4317)</span>
            <span className={`status-badge ${getBadgeClass(apiStatus)}`}>
              {apiStatus}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Database (MySQL)</span>
            <span className={`status-badge ${getBadgeClass(dbStatus)}`}>
              {dbStatus}
            </span>
          </div>
        </div>
      </section>

      <section className="native-command-section">
        <h2 className="section-title">Uji Native Command (Tauri &lt;-&gt; Rust)</h2>
        <form className="command-row" onSubmit={handleGreet}>
          <input
            type="text"
            placeholder="Masukkan nama penguji..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">Uji Native Command</button>
        </form>
        {greetMsg && <div className="command-result">{greetMsg}</div>}
      </section>
    </div>
  );
}

export default App;
