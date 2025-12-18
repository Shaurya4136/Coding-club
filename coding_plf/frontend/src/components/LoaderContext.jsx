import React, { createContext, useContext, useState, useCallback } from "react";

const LoaderContext = createContext(null);

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = useCallback(() => setIsLoading(true), []);
  const hideLoader = useCallback(() => setIsLoading(false), []);

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useGlobalLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) {
    throw new Error("useGlobalLoader must be used inside LoaderProvider");
  }
  return ctx;
};
