"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AppRole = "company" | "accountant";

interface RoleContextValue {
  role: AppRole;
  setRole: (role: AppRole) => void;
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
}

const RoleContext = createContext<RoleContextValue>({
  role: "company",
  setRole: () => {},
  activeClientId: null,
  setActiveClientId: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<AppRole>("company");
  const [activeClientId, setActiveClientIdState] = useState<string | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("cf_role") as AppRole | null;
    const savedClientId = localStorage.getItem("cf_client_id");
    if (savedRole === "company" || savedRole === "accountant") setRoleState(savedRole);
    if (savedClientId) setActiveClientIdState(savedClientId);
  }, []);

  function setRole(r: AppRole) {
    setRoleState(r);
    localStorage.setItem("cf_role", r);
  }

  function setActiveClientId(id: string | null) {
    setActiveClientIdState(id);
    if (id) localStorage.setItem("cf_client_id", id);
    else localStorage.removeItem("cf_client_id");
  }

  return (
    <RoleContext.Provider value={{ role, setRole, activeClientId, setActiveClientId }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
