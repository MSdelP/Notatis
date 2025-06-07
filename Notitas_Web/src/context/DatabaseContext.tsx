// Notitas_Web/src/context/DatabaseContext.tsx

import React, { createContext, useState, ReactNode, useContext } from 'react';

interface DatabaseContextProps {
  refreshCounter: number;
  triggerRefresh: () => void;
}

const DatabaseContext = createContext<DatabaseContextProps | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const triggerRefresh = () => setRefreshCounter((c) => c + 1);

  return (
    <DatabaseContext.Provider value={{ refreshCounter, triggerRefresh }}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Hook para usar el context
export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext debe usarse dentro de DatabaseProvider');
  }
  return context;
};
