import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swagger';
import todoRoutes from './routes/todoRoutes';

export function createApp(): Application {
  const app: Application = express();

  // Middlewares
  app.use(helmet()); // Sécurité
  app.use(cors()); // CORS pour accès frontend
  app.use(express.json()); // Parser JSON
  app.use(morgan('dev')); // Logging


   // Configuration Swagger
  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Todo List Documentation'
  }));

  app.use('/api/todos', todoRoutes);

  // Route de base
  app.get('/', (_req, res) => {
    res.json({
      message: 'API Todo list - Bienvenue!',
      endpoints: {
        todos: '/api/todos',
        documentation: '/api-docs'
      }
    });
  });

  // Gestion des routes inexistantes
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
  });

  return app;
}