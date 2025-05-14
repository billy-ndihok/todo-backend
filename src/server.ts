import dotenv from 'dotenv';
import { createApp } from './app';
import { initializeDatabase } from './config/database';
import { setupServices } from './services';

// Charger les variables d'environnement
dotenv.config();

// Port d'écoute
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('Initialisation de la base de données...');
    // Initialiser la base de données AVANT de créer l'application
    await initializeDatabase();
    console.log('Base de données initialisée avec succès.');
    
    // Initialiser les services APRÈS la base de données mais AVANT l'application
    console.log('Initialisation des services...');
    setupServices();
    console.log('Services initialisés avec succès.');
    
    // Créer l'application Express APRÈS l'initialisation de la base de données et des services
    const app = createApp();
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`Serveur en écoute sur le port ${PORT} en mode ${process.env.NODE_ENV || 'development'}`);
      console.log(`La base de données est située dans: ${process.env.DATABASE_PATH || 'data/todo.db'}`);
    });
  } catch (error) {
    console.error('Erreur fatale lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse non gérée rejetée:', reason);
  // Ne pas terminer le processus, mais logger l'erreur
});

process.on('uncaughtException', (error) => {
  console.error('Exception non capturée:', error);
  // Terminer le processus en cas d'exception non capturée
  process.exit(1);
});

// Démarrer le serveur
console.log('Démarrage du serveur...');
startServer();