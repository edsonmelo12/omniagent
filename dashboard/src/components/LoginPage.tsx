import { useState } from "react";
import { backendApi } from "@/lib/backendApi";
import { ptBR } from "@/i18n/pt-BR";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState<string>(ptBR.backendOps.examples.loginEmail);
  const [password, setPassword] = useState<string>(ptBR.backendOps.examples.loginPassword);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await backendApi.login({ email, password });
      onLogin();
    } catch (err: any) {
      setError(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    setError(null);
    try {
      await backendApi.ensureAnonymousSession();
      onLogin();
    } catch (err: any) {
      setError(err.message || "Falha no login anônimo");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f7f6",
    fontFamily: "sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "400px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2c3e50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "10px",
  };

  const linkButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    backgroundColor: "transparent",
    color: "#7f8c8d",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "15px",
    textDecoration: "underline",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "30px" }}>OmniAgent</h1>
        <p style={{ textAlign: "center", color: "#7f8c8d", marginBottom: "20px" }}>Entre para gerenciar seus clientes</p>
        <p style={{ textAlign: "center", color: "#95a5a6", fontSize: "13px", marginTop: "-10px", marginBottom: "20px" }}>
          Use a conta de dev já cadastrada no ambiente local.
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          
          {error && <div style={{ color: "#e74c3c", fontSize: "14px", margin: "10px 0", textAlign: "center" }}>{error}</div>}
          
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button onClick={handleAnonymous} style={linkButtonStyle} disabled={loading}>
          Entrar como visitante (Anônimo)
        </button>
      </div>
    </div>
  );
}
