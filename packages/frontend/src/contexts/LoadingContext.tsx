import React, { createContext, useState, useContext } from 'react';

export type LoadingStatus = 'loading' | 'success' | 'fail' | 'start';
type LoadingContextType = {
  status: LoadingStatus;
  setStatus: React.Dispatch<React.SetStateAction<LoadingStatus>>;
};

const defaultContextValue: LoadingContextType = {
  status: 'start',
  setStatus: () => {}
};

export const LoadingContext = createContext<LoadingContextType>(defaultContextValue);

type LoadingProviderProps = {
  children: React.ReactNode;
};

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<LoadingStatus>('loading');

  return (
    <LoadingContext.Provider value={{ status, setStatus }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  return useContext(LoadingContext);
};
