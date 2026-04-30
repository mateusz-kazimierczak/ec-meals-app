import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

const ConnectivityContext = createContext({
  isConnected: true,
  isConnectionKnown: false,
  refreshConnection: async () => true,
});

function resolveConnectionState(state) {
  if (typeof state?.isInternetReachable === "boolean") {
    return state.isInternetReachable;
  }

  if (typeof state?.isConnected === "boolean") {
    return state.isConnected;
  }

  return false;
}

function readBrowserConnection() {
  if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") {
    return true;
  }

  return navigator.onLine;
}

export function ConnectivityProvider({ children }) {
  const [isConnected, setIsConnected] = useState(Platform.OS === "web" ? readBrowserConnection() : true);
  const [isConnectionKnown, setIsConnectionKnown] = useState(Platform.OS === "web");

  useEffect(() => {
    if (Platform.OS === "web") {
      const syncBrowserConnection = () => {
        setIsConnected(readBrowserConnection());
        setIsConnectionKnown(true);
      };

      syncBrowserConnection();
      window.addEventListener("online", syncBrowserConnection);
      window.addEventListener("offline", syncBrowserConnection);

      return () => {
        window.removeEventListener("online", syncBrowserConnection);
        window.removeEventListener("offline", syncBrowserConnection);
      };
    }

    let mounted = true;

    const syncState = (state) => {
      if (!mounted) return;

      setIsConnected(resolveConnectionState(state));
      setIsConnectionKnown(true);
    };

    NetInfo.fetch().then(syncState).catch(() => {
      if (!mounted) return;

      setIsConnected(false);
      setIsConnectionKnown(true);
    });

    const unsubscribe = NetInfo.addEventListener(syncState);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const refreshConnection = useCallback(async () => {
    if (Platform.OS === "web") {
      const currentConnection = readBrowserConnection();
      setIsConnected(currentConnection);
      setIsConnectionKnown(true);
      return currentConnection;
    }

    try {
      const state = await NetInfo.fetch();
      const currentConnection = resolveConnectionState(state);
      setIsConnected(currentConnection);
      setIsConnectionKnown(true);
      return currentConnection;
    } catch (error) {
      setIsConnected(false);
      setIsConnectionKnown(true);
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      isConnected,
      isConnectionKnown,
      refreshConnection,
    }),
    [isConnected, isConnectionKnown, refreshConnection]
  );

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}

export function createOfflineError(message = "Internet connection required") {
  const error = new Error(message);
  error.code = "OFFLINE";
  error.isOfflineError = true;
  return error;
}

export function isOfflineError(error) {
  return Boolean(error?.isOfflineError || error?.code === "OFFLINE");
}
