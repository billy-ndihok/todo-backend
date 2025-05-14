// Importer d'abord uniquement les types dont nous avons besoin
import { Request, Response } from 'express';
import { TodoStatus, TodoItem, CreateTodoDto, UpdateTodoDto } from '../../src/types/todo';

jest.mock('../../src/services/todoService', () => ({
  createTodoService: jest.fn(() => mockServiceFunctions)
}));

jest.mock('../../src/services', () => ({
  initializeServices: jest.fn(() => ({
    todoService: mockServiceFunctions
  })),
  getServices: jest.fn(() => ({
    todoService: mockServiceFunctions
  }))
}));

// Fonction utilitaire pour créer des TodoItem de test
function createMockTodo(override: Partial<TodoItem> = {}): TodoItem {
  return {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override
  };
}

// Création des mocks pour le service Todo
const mockServiceFunctions = {
  getAllTodos: jest.fn(),
  getTodoById: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  toggleTodoStatus: jest.fn(),
  deleteTodo: jest.fn()
};


// Mock de AppDataSource pour éviter l'erreur "DataSource not initialized"
jest.mock('../../src/config/database', () => ({
  AppDataSource: {
    isInitialized: true,
    getRepository: jest.fn()
  }
}));

// Maintenant, importer le contrôleur après avoir configuré les mocks
import todoController from '../../src/controllers/todoController';

describe('TodoController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObj: any = {};
  
  beforeEach(() => {
    // Réinitialiser les mocks entre les tests
    jest.clearAllMocks();
    
    // Créer des objets request et response mock
    mockRequest = {
      params: {},
      body: {},
      query: {}
    };
    
    // Définir le type pour eviter l'erreur TS2683
    type MockResponseType = {
      statusCode: number;
      json: jest.Mock;
      status: jest.Mock;
      send: jest.Mock;
    };
    
    // Créer un objet response mock avec des fonctions jest
    responseObj = {
      statusCode: 200,
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockImplementation(function(this: MockResponseType, code: number) {
        this.statusCode = code;
        return this;
      }),
      send: jest.fn()
    } as MockResponseType;
    
    mockResponse = responseObj;
  });
  
  describe('getAllTodos', () => {
    it('devrait récupérer toutes les tâches sans filtre', async () => {
      // Configuration
      const mockTodos: TodoItem[] = [
        createMockTodo({ id: 1, title: 'Todo 1' }),
        createMockTodo({ id: 2, title: 'Todo 2', completed: true })
      ];
      mockServiceFunctions.getAllTodos.mockResolvedValue(mockTodos);
      
      // Exécution
      await todoController.getAllTodos(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.getAllTodos).toHaveBeenCalledWith(TodoStatus.ALL);
      expect(responseObj.json).toHaveBeenCalledWith(mockTodos);
      expect(responseObj.statusCode).toBe(200);
    });
    
    it('devrait filtrer les tâches par statut', async () => {
      // Configuration
      const mockTodos: TodoItem[] = [
        createMockTodo({ id: 2, title: 'Todo 2', completed: true })
      ];
      mockRequest.query = { status: TodoStatus.COMPLETED };
      mockServiceFunctions.getAllTodos.mockResolvedValue(mockTodos);
      
      // Exécution
      await todoController.getAllTodos(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.getAllTodos).toHaveBeenCalledWith(TodoStatus.COMPLETED);
      expect(responseObj.json).toHaveBeenCalledWith(mockTodos);
    });
    
    it('devrait gérer les erreurs', async () => {
      // Configuration
      const error = new Error('Database error');
      mockServiceFunctions.getAllTodos.mockRejectedValue(error);
      
      // Exécution
      await todoController.getAllTodos(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(responseObj.status).toHaveBeenCalledWith(500);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });
  
  describe('getTodoById', () => {
    it('devrait récupérer une tâche par ID', async () => {
      // Configuration
      const mockTodo: TodoItem = createMockTodo({ id: 1, title: 'Todo 1' });
      mockRequest.params = { id: '1' };
      mockServiceFunctions.getTodoById.mockResolvedValue(mockTodo);
      
      // Exécution
      await todoController.getTodoById(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.getTodoById).toHaveBeenCalledWith(1);
      expect(responseObj.json).toHaveBeenCalledWith(mockTodo);
    });
    
    it('devrait retourner 404 si la tâche n\'existe pas', async () => {
      // Configuration
      mockRequest.params = { id: '999' };
      mockServiceFunctions.getTodoById.mockResolvedValue(null);
      
      // Exécution
      await todoController.getTodoById(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.getTodoById).toHaveBeenCalledWith(999);
      expect(responseObj.status).toHaveBeenCalledWith(404);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
    
    it('devrait retourner 400 si l\'ID est invalide', async () => {
      // Configuration
      mockRequest.params = { id: 'invalid' };
      
      // Exécution
      await todoController.getTodoById(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.getTodoById).not.toHaveBeenCalled();
      expect(responseObj.status).toHaveBeenCalledWith(400);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });
  
  describe('createTodo', () => {
    it('devrait créer une nouvelle tâche', async () => {
      // Configuration
      const todoData: CreateTodoDto = { title: 'Nouvelle tâche', description: 'Description' };
      const newTodo: TodoItem = createMockTodo({ 
        id: 1, 
        title: 'Nouvelle tâche', 
        description: 'Description'
      });
      
      mockRequest.body = todoData;
      mockServiceFunctions.createTodo.mockResolvedValue(newTodo);
      
      // Exécution
      await todoController.createTodo(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.createTodo).toHaveBeenCalledWith(todoData);
      expect(responseObj.status).toHaveBeenCalledWith(201);
      expect(responseObj.json).toHaveBeenCalledWith(newTodo);
    });
    
    it('devrait retourner 400 si le titre est manquant', async () => {
      // Configuration
      mockRequest.body = { description: 'Description sans titre' };
      
      // Exécution
      await todoController.createTodo(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.createTodo).not.toHaveBeenCalled();
      expect(responseObj.status).toHaveBeenCalledWith(400);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });
  
  describe('updateTodo', () => {
    it('devrait mettre à jour une tâche existante', async () => {
      // Configuration
      const todoId = 1;
      const updateData: UpdateTodoDto = { 
        title: 'Titre mis à jour', 
        description: 'Description mise à jour' 
      };
      const updatedTodo: TodoItem = createMockTodo({ 
        id: todoId, 
        ...updateData
      });
      
      mockRequest.params = { id: todoId.toString() };
      mockRequest.body = updateData;
      mockServiceFunctions.updateTodo.mockResolvedValue(updatedTodo);
      
      // Exécution
      await todoController.updateTodo(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.updateTodo).toHaveBeenCalledWith(todoId, updateData);
      expect(responseObj.json).toHaveBeenCalledWith(updatedTodo);
    });
    
    it('devrait retourner 404 si la tâche n\'existe pas', async () => {
      // Configuration
      mockRequest.params = { id: '999' };
      mockRequest.body = { title: 'Test' };
      mockServiceFunctions.updateTodo.mockResolvedValue(null);
      
      // Exécution
      await todoController.updateTodo(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.updateTodo).toHaveBeenCalledWith(999, { title: 'Test' });
      expect(responseObj.status).toHaveBeenCalledWith(404);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
    
    it('devrait retourner 400 si l\'ID est invalide', async () => {
      // Configuration
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { title: 'Test' };
      
      // Exécution
      await todoController.updateTodo(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.updateTodo).not.toHaveBeenCalled();
      expect(responseObj.status).toHaveBeenCalledWith(400);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
    
    it('devrait retourner 400 si aucune donnée n\'est fournie', async () => {
      // Configuration
      mockRequest.params = { id: '1' };
      mockRequest.body = {};
      
      // Exécution
      await todoController.updateTodo(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.updateTodo).not.toHaveBeenCalled();
      expect(responseObj.status).toHaveBeenCalledWith(400);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });
  
  describe('toggleTodoStatus', () => {
    it('devrait changer le statut d\'une tâche', async () => {
      // Configuration
      const todoId = 1;
      const updatedTodo: TodoItem = createMockTodo({ 
        id: todoId, 
        title: 'Test Todo', 
        completed: true 
      });
      
      mockRequest.params = { id: todoId.toString() };
      mockRequest.body = { completed: true };
      mockServiceFunctions.toggleTodoStatus.mockResolvedValue(updatedTodo);
      
      // Exécution
      await todoController.toggleTodoStatus(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.toggleTodoStatus).toHaveBeenCalledWith(todoId, true);
      expect(responseObj.json).toHaveBeenCalledWith(updatedTodo);
    });
    
    it('devrait retourner 400 si completed n\'est pas un booléen', async () => {
      // Configuration
      mockRequest.params = { id: '1' };
      mockRequest.body = { completed: 'not-a-boolean' };
      
      // Exécution
      await todoController.toggleTodoStatus(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.toggleTodoStatus).not.toHaveBeenCalled();
      expect(responseObj.status).toHaveBeenCalledWith(400);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
    
    it('devrait retourner 404 si la tâche n\'existe pas', async () => {
      // Configuration
      mockRequest.params = { id: '999' };
      mockRequest.body = { completed: true };
      mockServiceFunctions.toggleTodoStatus.mockResolvedValue(null);
      
      // Exécution
      await todoController.toggleTodoStatus(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.toggleTodoStatus).toHaveBeenCalledWith(999, true);
      expect(responseObj.status).toHaveBeenCalledWith(404);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });
  
  describe('deleteTodo', () => {
    it('devrait supprimer une tâche existante', async () => {
      // Configuration
      mockRequest.params = { id: '1' };
      mockServiceFunctions.deleteTodo.mockResolvedValue(true);
      
      // Exécution
      await todoController.deleteTodo(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.deleteTodo).toHaveBeenCalledWith(1);
      expect(responseObj.status).toHaveBeenCalledWith(204);
      expect(responseObj.send).toHaveBeenCalled();
    });
    
    it('devrait retourner 404 si la tâche n\'existe pas', async () => {
      // Configuration
      mockRequest.params = { id: '999' };
      mockServiceFunctions.deleteTodo.mockResolvedValue(false);
      
      // Exécution
      await todoController.deleteTodo(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.deleteTodo).toHaveBeenCalledWith(999);
      expect(responseObj.status).toHaveBeenCalledWith(404);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
    
    it('devrait retourner 400 si l\'ID est invalide', async () => {
      // Configuration
      mockRequest.params = { id: 'invalid' };
      
      // Exécution
      await todoController.deleteTodo(mockRequest as Request, mockResponse as Response);
      
      // Vérification
      expect(mockServiceFunctions.deleteTodo).not.toHaveBeenCalled();
      expect(responseObj.status).toHaveBeenCalledWith(400);
      expect(responseObj.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });
});