import { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Todo List',
      version: '1.0.0',
      description: 'API pour gérer une liste de tâches (Todo List)',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      schemas: {
        Todo: {
          type: 'object',
          required: ['title'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID auto-généré de la tâche'
            },
            title: {
              type: 'string',
              description: 'Titre de la tâche'
            },
            description: {
              type: 'string',
              description: 'Description détaillée de la tâche'
            },
            completed: {
              type: 'boolean',
              description: 'Statut de complétion de la tâche',
              default: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création de la tâche'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour de la tâche'
            }
          },
          example: {
            id: 1,
            title: 'Apprendre TypeScript',
            description: 'Étudier les concepts avancés de TypeScript',
            completed: false,
            createdAt: '2025-05-12T10:00:00Z',
            updatedAt: '2025-05-12T10:00:00Z'
          }
        },
        CreateTodoDto: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Titre de la tâche'
            },
            description: {
              type: 'string',
              description: 'Description détaillée de la tâche'
            }
          },
          example: {
            title: 'Apprendre Express',
            description: 'Créer une API RESTful avec Express et TypeScript'
          }
        },
        UpdateTodoDto: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Titre de la tâche'
            },
            description: {
              type: 'string',
              description: 'Description détaillée de la tâche'
            },
            completed: {
              type: 'boolean',
              description: 'Statut de complétion de la tâche'
            }
          },
          example: {
            title: 'Apprendre Express (mis à jour)',
            description: 'Créer une API RESTful avec Express, TypeScript, et Swagger',
            completed: true
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message d\'erreur'
            }
          },
          example: {
            message: 'Todo non trouvé'
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Requête invalide',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erreur serveur',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export default swaggerOptions;