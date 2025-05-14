import request from 'supertest';
import { Todo } from '../../src/models/Todo';
import { CreateTodoDto, UpdateTodoDto } from '../../src/types/todo';
// Maintenant importer l'application après avoir configuré les mocks
import { createApp } from '../../src/app';
import { AppDataSource, closeDatabase, initializeDatabase } from '../../src/config/database';
import { setupServices } from '../../src/services';

describe('Todo API Integration Tests', () => {
  let app: any;
  beforeAll(async () => {
    // Assurez-vous que NODE_ENV=test pour utiliser la configuration en mémoire (ou dédiée aux tests)
    process.env.NODE_ENV = 'test';

    await initializeDatabase();
    setupServices();
    // Créer votre application express après l'initialisation de la DB
    app = createApp();
  });
  
  beforeEach(async () => {
    // Nettoyer la table Todo avant chaque test
    await AppDataSource.getRepository(Todo).clear();
  });
  
  afterAll(async () => {
    // Fermer la connexion à la DB une fois tous les tests terminés
    await closeDatabase();
  });
  
  
  describe('GET /api/todos', () => {
    it("devrait retourner une liste vide quand il n'existe pas de todos", async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("devrait retourner tous les todos", async () => {
      // Insérer deux todos dans la base
      const todoRepository = AppDataSource.getRepository(Todo);
      const todo1 = await todoRepository.save({
        title: 'Todo 1',
        description: 'Description 1',
        completed: false,
      });
      // On attend un délai car l'ordre dépend du champ createdAt et de la sauvegarde
      const todo2 = await todoRepository.save({
        title: 'Todo 2',
        description: 'Description 2',
        completed: true,
      });

      // L’endpoint trie par createdAt en DESC (donc le dernier inséré apparait en premier)
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id', todo1.id);
      expect(response.body[1]).toHaveProperty('id', todo2.id);
    });

    it("devrait filtrer les todos par statut 'completed'", async () => {
      const todoRepository = AppDataSource.getRepository(Todo);
      await todoRepository.save({
        title: 'Todo 1',
        description: 'Description 1',
        completed: false,
      });
      const todo2 = await todoRepository.save({
        title: 'Todo 2',
        description: 'Description 2',
        completed: true,
      });

      const response = await request(app).get('/api/todos?status=completed');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('id', todo2.id);
      expect(response.body[0]).toHaveProperty('completed', true);
    });
  });

  describe('GET /api/todos/:id', () => {
    it("devrait retourner un todo par son ID", async () => {
      const todoRepository = AppDataSource.getRepository(Todo);
      const savedTodo = await todoRepository.save({
        title: 'Todo Test',
        description: 'Description test',
        completed: false,
      });

      const response = await request(app).get(`/api/todos/${savedTodo.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', savedTodo.id);
      expect(response.body).toHaveProperty('title', 'Todo Test');
    });

    it("devrait retourner 404 si le todo n'existe pas", async () => {
      const response = await request(app).get('/api/todos/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it("devrait retourner 400 si l'ID est invalide", async () => {
      const response = await request(app).get('/api/todos/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/todos', () => {
    it("devrait créer un nouveau todo", async () => {
      const todoData: CreateTodoDto = {
        title: 'Nouveau Todo',
        description: 'Description du nouveau todo',
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Nouveau Todo');
      expect(response.body).toHaveProperty('description', 'Description du nouveau todo');
      expect(response.body).toHaveProperty('completed', false);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      // Vérifier que le todo a bien été ajouté dans la base
      const todos = await AppDataSource.getRepository(Todo).find();
      expect(todos.length).toBe(1);
    });

    it("devrait retourner 400 si le titre est manquant", async () => {
      const todoData = {
        description: 'Description sans titre',
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');

      const todos = await AppDataSource.getRepository(Todo).find();
      expect(todos.length).toBe(0);
    });

    it("devrait retourner 400 si le titre est vide", async () => {
      const todoData = {
        title: '   ',
        description: 'Description avec titre vide',
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');

      const todos = await AppDataSource.getRepository(Todo).find();
      expect(todos.length).toBe(0);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it("devrait mettre à jour un todo existant", async () => {
      const todoRepository = AppDataSource.getRepository(Todo);
      const savedTodo = await todoRepository.save({
        title: 'Ancien Titre',
        description: 'Ancienne Description',
        completed: false,
      });

      const updateData: UpdateTodoDto = {
        title: 'Nouveau Titre',
        description: 'Nouvelle Description',
        completed: true,
      };

      const response = await request(app)
        .put(`/api/todos/${savedTodo.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', savedTodo.id);
      expect(response.body).toHaveProperty('title', 'Nouveau Titre');
      expect(response.body).toHaveProperty('description', 'Nouvelle Description');
      expect(response.body).toHaveProperty('completed', true);

      const updatedTodo = await todoRepository.findOneBy({ id: savedTodo.id });
      expect(updatedTodo?.title).toBe('Nouveau Titre');
      expect(updatedTodo?.description).toBe('Nouvelle Description');
      expect(updatedTodo?.completed).toBe(true);
    });

    it("devrait retourner 404 si le todo à mettre à jour n'existe pas", async () => {
      const updateData = {
        title: 'Nouveau Titre',
      };

      const response = await request(app)
        .put('/api/todos/999')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it("devrait retourner 400 si aucune donnée n'est fournie", async () => {
      const todoRepository = AppDataSource.getRepository(Todo);
      const savedTodo = await todoRepository.save({
        title: 'Titre',
        description: 'Description',
        completed: false,
      });

      const response = await request(app)
        .put(`/api/todos/${savedTodo.id}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');

      const unmodifiedTodo = await todoRepository.findOneBy({ id: savedTodo.id });
      expect(unmodifiedTodo?.title).toBe('Titre');
    });
  });
  
   describe('PATCH /api/todos/:id/status', () => {
    it("devrait changer le statut d'un todo", async () => {
      const todoRepository = AppDataSource.getRepository(Todo);
      // Créer un todo de test
      const savedTodo = await todoRepository.save({
        title: 'Todo Test',
        description: 'Description',
        completed: false,
      });

      const response = await request(app)
        .patch(`/api/todos/${savedTodo.id}/status`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', savedTodo.id);
      expect(response.body).toHaveProperty('completed', true);

      // Vérifier dans la base que le statut a bien été mis à jour
      const updatedTodo = await todoRepository.findOneBy({ id: savedTodo.id });
      expect(updatedTodo?.completed).toBe(true);
    });

    it("devrait retourner 400 si le statut n'est pas un booléen", async () => {
      const todoRepository = AppDataSource.getRepository(Todo);
      // Créer un todo de test
      const savedTodo = await todoRepository.save({
        title: 'Todo Test',
        description: 'Description',
        completed: false,
      });

      const response = await request(app)
        .patch(`/api/todos/${savedTodo.id}/status`)
        .send({ completed: 'not-a-boolean' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');

      // Vérifier que le statut n'a pas été modifié dans la base
      const unchangedTodo = await todoRepository.findOneBy({ id: savedTodo.id });
      expect(unchangedTodo?.completed).toBe(false);
    });

    it("devrait retourner 404 si le todo n'existe pas", async () => {
      const response = await request(app)
        .patch('/api/todos/999/status')
        .send({ completed: true });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  // --- Tests pour DELETE /api/todos/:id ---
  describe('DELETE /api/todos/:id', () => {
    it("devrait supprimer un todo existant", async () => {
      const todoRepository = AppDataSource.getRepository(Todo);
      // Créer un todo de test
      const savedTodo = await todoRepository.save({
        title: 'Todo à supprimer',
        description: 'Description',
        completed: false,
      });

      const response = await request(app).delete(`/api/todos/${savedTodo.id}`);

      expect(response.status).toBe(204);

      // Vérifier que le todo a bien été supprimé de la base
      const deletedTodo = await todoRepository.findOneBy({ id: savedTodo.id });
      expect(deletedTodo).toBeNull();
    });

    it("devrait retourner 404 si le todo à supprimer n'existe pas", async () => {
      const response = await request(app).delete('/api/todos/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  // --- Tests pour les routes inexistantes ---
  describe('Routes inexistantes', () => {
    it("devrait retourner 404 pour une route inexistante", async () => {
      const response = await request(app).get('/api/non-existant');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Route non trouvée');
    });
  });

  // --- Test pour la route racine ---
  describe('Route racine', () => {
    it("devrait retourner les informations de base de l'API", async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('todos', '/api/todos');
    });
  });
});