import { AppDataSource } from '../config/database';
import { createTodoService } from './todoService';

// Fonction pour initialiser tous les services
export const initializeServices = () => {
  if (!AppDataSource.isInitialized) {
    throw new Error('DataSource not initialized. Call initializeDatabase() before initializing services');
  }
  
  // Créer les instances des services avec le repository
  const todoService = createTodoService();
  
  // Retourner les services initialisés
  return {
    todoService
  };
};

// Exporter une fonction pour obtenir l'instance du service Todo
let services: ReturnType<typeof initializeServices> | null = null;

export const getServices = () => {
  if (!services) {
    throw new Error('Services not initialized. Call initializeServices() first');
  }
  return services;
};

export const setupServices = () => {
  services = initializeServices();
  return services;
};