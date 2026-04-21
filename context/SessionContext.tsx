import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type DrinkType = 'beer' | 'wine' | 'cocktail' | 'shot';

export type Drink = {
  id: string;
  type: DrinkType;
  timestamp: number;
};

export type Session = {
  id: string;
  startTime: number;
  endTime: number | null;
  drinks: Drink[];
};

type SessionContextType = {
  currentSession: Session | null;
  sessions: Session[];
  pendingSession: Session | null; 
  isLoaded: boolean;
  logDrink: (type: DrinkType) => void;
  undoLastDrink: () => void;
  endSession: () => void;
  commitPendingSession: () => void;
  undoEndSession: () => void;
  clearHistory: () => void;
};

type StoredSessionState = {
  currentSession: Session | null;
  sessions: Session[];
};

const STORAGE_KEY = 'drink-tracker-state';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

type SessionProviderProps = {
  children: ReactNode;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [pendingSession, setPendingSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadSessionState() {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedState) {
          const parsedState: StoredSessionState = JSON.parse(savedState);
          setCurrentSession(parsedState.currentSession);
          setSessions(parsedState.sessions);
        }
      } catch (error) {
        console.error('Failed to load session state:', error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadSessionState();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    async function saveSessionState() {
      try {
        const stateToSave: StoredSessionState = {
          currentSession,
          sessions,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Failed to save session state:', error);
      }
    }

    saveSessionState();
  }, [currentSession, sessions, isLoaded]);

  const logDrink = (type: DrinkType) => {
    const now = Date.now();

    const newDrink: Drink = {
      id: createId(),
      type,
      timestamp: now,
    };

    setCurrentSession((prev) => {
      if (!prev) {
        return {
          id: createId(),
          startTime: now,
          endTime: null,
          drinks: [newDrink],
        };
      }

      return {
        ...prev,
        drinks: [...prev.drinks, newDrink],
      };
    });
  };

  const undoLastDrink = () => {
    setCurrentSession((prev) => {
      if (!prev) return null;

      const updatedDrinks = prev.drinks.slice(0, -1);

      if (updatedDrinks.length === 0) {
        return null;
      }

      return {
        ...prev,
        drinks: updatedDrinks,
      };
    });
  };

  const endSession = () => {
    setCurrentSession((prev) => {
      if (!prev || prev.drinks.length === 0) return null;
  
      const endedSession: Session = {
        ...prev,
        endTime: Date.now(),
      };
  
      setPendingSession(endedSession); // store temporarily
      return null; // clear active session
    });
  };

  const commitPendingSession = () => {
    if (!pendingSession) return;
  
    setSessions((prev) => [...prev, pendingSession]);
    setPendingSession(null);
  };

  const undoEndSession = () => {
    if (!pendingSession) return;
  
    setCurrentSession({
      ...pendingSession,
      endTime: null,
    });
  
    setPendingSession(null);
  };

  const clearHistory = () => {
    setSessions([]);
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        sessions,
        pendingSession,
        commitPendingSession,
        undoEndSession,
        isLoaded,
        logDrink,
        undoLastDrink,
        endSession,
        clearHistory,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }

  return context;
}