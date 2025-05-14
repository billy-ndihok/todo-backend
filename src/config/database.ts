import { DataSource } from 'typeorm';
import { Todo } from '../models/Todo';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const isTestEnv = process.env.NODE_ENV === 'test';

const dbPath = isTestEnv 
  ? ':memory:'  // Base en mémoire pour les tests  
  : process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'todo.db');

// Assurez-vous que Todo est explicitement importé et listé dans les entités
export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: dbPath,
  entities: [Todo],  // Spécifier explicitement l'entité Todo ici
  synchronize: isTestEnv ? true : process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Vérifier si la base de données est déjà initialisée
    if (AppDataSource.isInitialized) {
      console.log('Base de données déjà connectée');
      return;
    }
    
    // Initialiser la connexion
    await AppDataSource.initialize();
    console.log('Base de données connectée avec succès');
    
    // Vérifier que les métadonnées sont bien chargées
    const todoMetadata = AppDataSource.getMetadata(Todo);
    console.log(`Métadonnées pour l'entité Todo chargées: ${todoMetadata.name}`);
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Connexion à la base de données fermée');
    }
  } catch (error) {
    console.error('Erreur lors de la fermeture de la connexion:', error);
    throw error;
  }
};