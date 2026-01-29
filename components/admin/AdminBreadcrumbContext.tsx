"use client";

import * as React from "react";

interface BreadcrumbContextValue {
  dynamicLabels: Record<string, string>;
  setDynamicLabel: (path: string, label: string) => void;
}

export const AdminBreadcrumbContext = React.createContext<BreadcrumbContextValue | null>(null);

export function AdminBreadcrumbProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [dynamicLabels, setDynamicLabels] = React.useState<Record<string, string>>({});

  const setDynamicLabel = React.useCallback((path: string, label: string) => {
    setDynamicLabels((prev) => ({
      ...prev,
      [path]: label,
    }));
  }, []);

  return (
    <AdminBreadcrumbContext.Provider value={{ dynamicLabels, setDynamicLabel }}>
      {children}
    </AdminBreadcrumbContext.Provider>
  );
}

export function useAdminBreadcrumb(): BreadcrumbContextValue | null {
  return React.useContext(AdminBreadcrumbContext);
}
