import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Client, Interface } from '../types';
import { clientService } from '../services/clientService';
import { interfaceService } from '../services/interfaceService';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

type SortOrder = 'asc' | 'desc';

interface ClientInterfaceContextType {
  clients: Client[];
  interfaces: Interface[];
  selectedClient: Client | null;
  selectedInterface: Interface | null;
  loading: boolean;
  error: string | null;
  refreshClients: (page?: number, pageSize?: number, sortField?: string, sortOrder?: SortOrder) => Promise<void>;
  refreshInterfaces: () => Promise<void>;
  setSelectedClient: (client: Client | null) => void;
  setSelectedInterface: (interface_: Interface | null) => void;
  hasRole: (role: string) => boolean;
  setError: (error: string | null) => void;
  setClients: (clients: Client[]) => void;
}

const ClientInterfaceContext = createContext<ClientInterfaceContextType | undefined>(undefined);

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_FIELD = 'name';
const DEFAULT_SORT_ORDER: SortOrder = 'asc';

export const ClientInterfaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [interfaces, setInterfaces] = useState<Interface[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedInterface, setSelectedInterface] = useState<Interface | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();

  const clearAllData = () => {
    setClients([]);
    setInterfaces([]);
    setSelectedClient(null);
    setSelectedInterface(null);
    setError(null);
  };

  const clearSavedSelections = () => {
    localStorage.removeItem('selectedClientId');
    localStorage.removeItem('selectedInterfaceId');
  };

  const handleError = useCallback((error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAllData();
      if (error.response.status === 403) {
        setError('You do not have permission to access this data.');
      }
      navigate('/login');
      return;
    }
    
    setError(error.message || `Failed to ${action}. Please try again.`);
  }, [navigate, clearAllData]);

  // Load clients when authentication state changes
  useEffect(() => {
    const loadInitialClients = async () => {
      if (!isAuthenticated) {
        clearAllData();
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('Loading clients after auth state change...');
        const response = await clientService.getAllClients({ 
          page: 0, 
          size: DEFAULT_PAGE_SIZE, 
          sort: DEFAULT_SORT_FIELD, 
          direction: DEFAULT_SORT_ORDER 
        });
        
        if (response?.content) {
          setClients(response.content);
        } else {
          console.warn('No clients found in response');
          setClients([]);
        }
      } catch (error: any) {
        handleError(error, 'load initial clients');
      } finally {
        setLoading(false);
      }
    };

    loadInitialClients();
  }, [isAuthenticated, handleError]);

  const refreshClients = useCallback(async (
    page = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    sortField = DEFAULT_SORT_FIELD,
    sortOrder: SortOrder = DEFAULT_SORT_ORDER
  ) => {
    if (!isAuthenticated) {
      clearAllData();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await clientService.getAllClients({
        page,
        size: pageSize,
        sort: sortField,
        direction: sortOrder
      });
      setClients(response.content);
    } catch (err: any) {
      handleError(err, 'load clients');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, handleError]);

  const loadInterfaces = async (clientId: number) => {
    try {
      console.log('Loading interfaces for client ID:', clientId);
      setLoading(true);
      setError(null);
      const response = await interfaceService.getInterfacesByClientId(clientId);
      console.log('Received interfaces:', response);
      setInterfaces(response || []);
    } catch (err: any) {
      console.error('Error in loadInterfaces:', err);
      handleError(err, 'load interfaces');
      setInterfaces([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshInterfaces = async () => {
    if (!selectedClient || !isAuthenticated) {
      console.log('Cannot refresh interfaces:', { 
        hasSelectedClient: !!selectedClient, 
        isAuthenticated,
        selectedClientId: selectedClient?.id 
      });
      setInterfaces([]);
      return;
    }
    
    console.log('Refreshing interfaces for client:', selectedClient.id);
    await loadInterfaces(selectedClient.id);
  };

  const handleSetSelectedClient = async (client: Client | null) => {
    console.log('Setting selected client:', client?.id);
    setSelectedClient(client);
    setSelectedInterface(null);
    
    if (client) {
      localStorage.setItem('selectedClientId', client.id.toString());
      console.log('Loading interfaces for new client:', client.id);
      await loadInterfaces(client.id);
    } else {
      clearSavedSelections();
      setInterfaces([]);
    }
  };

  const value: ClientInterfaceContextType = {
    clients,
    interfaces,
    selectedClient,
    selectedInterface,
    loading,
    error,
    refreshClients,
    refreshInterfaces,
    setSelectedClient: handleSetSelectedClient,
    setSelectedInterface,
    hasRole,
    setError,
    setClients
  };

  return (
    <ClientInterfaceContext.Provider value={value}>
      {children}
    </ClientInterfaceContext.Provider>
  );
};

export const useClientInterface = () => {
  const context = useContext(ClientInterfaceContext);
  if (context === undefined) {
    throw new Error('useClientInterface must be used within a ClientInterfaceProvider');
  }
  return context;
}; 