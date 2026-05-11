import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/DashboardPage";
import { ClientFormPage, ClientManagerPage } from "@/components/ClientsWorkspacePages";
import { LoginPage } from "@/components/LoginPage";
import { backendApi, getSession } from "@/lib/backendApi";
import { ptBR } from "@/i18n/pt-BR";

if (typeof document !== "undefined") {
  document.title = ptBR.app.title;
}

export function App() {
  const [session, setSession] = useState(getSession());
  const [screen, setScreen] = useState<"dashboard" | "clients" | "client-form">("dashboard");
  const [clientFormClientId, setClientFormClientId] = useState<string | null>(null);

  const isAuthenticated = !!session.accessToken;

  const refreshSession = () => {
    setSession(getSession());
  };

  const handleLogout = () => {
    backendApi.clearSession();
    refreshSession();
    setScreen("dashboard");
  };

  const openDashboard = () => {
    setScreen("dashboard");
    setClientFormClientId(null);
  };

  const openClients = () => {
    setScreen("clients");
  };

  const createClient = () => {
    setClientFormClientId(null);
    setScreen("client-form");
  };

  const editClient = (clientId: string) => {
    setClientFormClientId(clientId);
    setScreen("client-form");
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={refreshSession} />;
  }

  if (screen === "clients") {
    return <ClientManagerPage onNavigateDashboard={openDashboard} onCreateClient={createClient} onEditClient={editClient} />;
  }

  if (screen === "client-form") {
    return (
      <ClientFormPage
        clientId={clientFormClientId}
        onNavigateDashboard={openDashboard}
        onNavigateClients={openClients}
        onPersistClientId={(clientId) => {
          setClientFormClientId(clientId);
        }}
      />
    );
  }

  return <DashboardPage onOpenClients={openClients} onCreateClient={createClient} onLogout={handleLogout} />;
}
