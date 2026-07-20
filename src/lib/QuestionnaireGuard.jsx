import { createContext, useContext, useState, useCallback } from 'react';

const GuardContext = createContext({ isDirty: false, setDirty: () => {}, clearDirty: () => {} });

export function QuestionnaireGuardProvider({ children }) {
  const [isDirty, setIsDirtyState] = useState(false);
  const setDirty   = useCallback(() => setIsDirtyState(true),  []);
  const clearDirty = useCallback(() => setIsDirtyState(false), []);
  return (
    <GuardContext.Provider value={{ isDirty, setDirty, clearDirty }}>
      {children}
    </GuardContext.Provider>
  );
}
export const useQuestionnaireGuard = () => useContext(GuardContext);