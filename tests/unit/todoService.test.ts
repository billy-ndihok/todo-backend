import { AppDataSource } from '../../src/config/database';
import { TodoService } from '../../src/services/todoService';
import { CreateTodoDto, TodoItem, TodoStatus, UpdateTodoDto } from '../../src/types/todo';

// Mock AppDataSource avant d'importer le service
jest.mock('../../src/config/database', () => ({
  AppDataSource: {
    isInitialized: true,
    getRepository: jest.fn()
  }
}));

// Fonction utilitaire pour créer un mock Todo
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

describe('TodoService', () => {
  let todoService: TodoService;
  let mockRepository: any;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();
    
    // Configurer le mock repository
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([])
      }),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 0 })
    };
    
    // Configurer AppDataSource pour retourner notre mock repository
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    
    // Instancier le service (sans passer de repository)
    todoService = new TodoService();
  });
  
  describe('getAllTodos', () => {
    it('devrait récupérer toutes les tâches sans filtre', async () => {
      // Configuration
      const mockTodos: TodoItem[] = [
        createMockTodo({ id: 1, title: 'Todo 1' }),
        createMockTodo({ id: 2, title: 'Todo 2', completed: true })
      ];
      
      mockRepository.createQueryBuilder().getMany.mockResolvedValue(mockTodos);
      
      // Exécution
      const result = await todoService.getAllTodos();
      
      // Vérification
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('todo');
      expect(mockRepository.createQueryBuilder().orderBy).toHaveBeenCalledWith('todo.createdAt', 'DESC');
      expect(result).toEqual(mockTodos);
      expect(result.length).toBe(2);
    });
    
    it('devrait filtrer les tâches complétées', async () => {
      // Configuration
      const mockTodos: TodoItem[] = [
        createMockTodo({ id: 2, title: 'Completed Todo', completed: true })
      ];
      
      mockRepository.createQueryBuilder().getMany.mockResolvedValue(mockTodos);
      
      // Exécution
      const result = await todoService.getAllTodos(TodoStatus.COMPLETED);
      
      // Vérification
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('todo');
      expect(mockRepository.createQueryBuilder().where).toHaveBeenCalledWith('todo.completed = :completed', { completed: true });
      expect(result).toEqual(mockTodos);
    });
    
    it('devrait filtrer les tâches actives', async () => {
      // Configuration
      const mockTodos: TodoItem[] = [
        createMockTodo({ id: 1, title: 'Active Todo', completed: false })
      ];
      
      mockRepository.createQueryBuilder().getMany.mockResolvedValue(mockTodos);
      
      // Exécution
      const result = await todoService.getAllTodos(TodoStatus.ACTIVE);
      
      // Vérification
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('todo');
      expect(mockRepository.createQueryBuilder().where).toHaveBeenCalledWith('todo.completed = :completed', { completed: false });
      expect(result).toEqual(mockTodos);
    });
  });
  
  describe('getTodoById', () => {
    it('devrait récupérer une tâche par son ID', async () => {
      // Configuration
      const mockTodo = createMockTodo({ id: 1, title: 'Test Todo' });
      mockRepository.findOneBy.mockResolvedValue(mockTodo);
      
      // Exécution
      const result = await todoService.getTodoById(1);
      
      // Vérification
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockTodo);
    });
    
    it('devrait retourner null si la tâche n\'existe pas', async () => {
      // Configuration
      mockRepository.findOneBy.mockResolvedValue(null);
      
      // Exécution
      const result = await todoService.getTodoById(999);
      
      // Vérification
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(result).toBeNull();
    });
  });
  
  describe('createTodo', () => {
    it('devrait créer une nouvelle tâche', async () => {
      // Configuration
      const todoData: CreateTodoDto = { title: 'Nouvelle tâche', description: 'Description' };
      const createdTodo = createMockTodo({
        id: 1,
        title: todoData.title,
        description: todoData.description,
        completed: false
      });
      
      mockRepository.create.mockReturnValue(createdTodo);
      mockRepository.save.mockResolvedValue(createdTodo);
      
      // Exécution
      const result = await todoService.createTodo(todoData);
      
      // Vérification
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...todoData,
        completed: false
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdTodo);
      expect(result).toEqual(createdTodo);
    });
  });
  
  describe('updateTodo', () => {
    it('devrait mettre à jour une tâche existante', async () => {
      // Configuration
      const todoId = 1;
      const updateData: UpdateTodoDto = { 
        title: 'Titre mis à jour', 
        description: 'Description mise à jour',
        completed: true
      };
      
      const existingTodo = createMockTodo({
        id: todoId,
        title: 'Ancien titre',
        description: 'Ancienne description',
        completed: false
      });
      
      const updatedTodo = createMockTodo({
        ...existingTodo,
        ...updateData,
        updatedAt: new Date()
      });
      
      mockRepository.findOneBy.mockResolvedValue(existingTodo);
      mockRepository.save.mockResolvedValue(updatedTodo);
      
      // Exécution
      const result = await todoService.updateTodo(todoId, updateData);
      
      // Vérification
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: todoId });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: todoId,
        title: updateData.title,
        description: updateData.description,
        completed: updateData.completed
      }));
      expect(result).toEqual(updatedTodo);
    });
    
    it('devrait retourner null si la tâche à mettre à jour n\'existe pas', async () => {
      // Configuration
      mockRepository.findOneBy.mockResolvedValue(null);
      
      // Exécution
      const result = await todoService.updateTodo(999, { title: 'Test' });
      
      // Vérification
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('toggleTodoStatus', () => {
    it('devrait changer le statut d\'une tâche', async () => {
      // Configuration
      const todoId = 1;
      const existingTodo = createMockTodo({
        id: todoId,
        title: 'Test Todo',
        completed: false
      });
      
      const updatedTodo = createMockTodo({
        ...existingTodo,
        completed: true,
        updatedAt: new Date()
      });
      
      mockRepository.findOneBy.mockResolvedValue(existingTodo);
      mockRepository.save.mockResolvedValue(updatedTodo);
      
      // Exécution
      const result = await todoService.toggleTodoStatus(todoId, true);
      
      // Vérification
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: todoId });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        ...existingTodo,
        completed: true
      }));
      expect(result).toEqual(updatedTodo);
    });
    
    it('devrait retourner null si la tâche n\'existe pas', async () => {
      // Configuration
      mockRepository.findOneBy.mockResolvedValue(null);
      
      // Exécution
      const result = await todoService.toggleTodoStatus(999, true);
      
      // Vérification
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('deleteTodo', () => {
    it('devrait supprimer une tâche existante', async () => {
      // Configuration
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      
      // Exécution
      const result = await todoService.deleteTodo(1);
      
      // Vérification
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
    
    it('devrait retourner false si la tâche à supprimer n\'existe pas', async () => {
      // Configuration
      mockRepository.delete.mockResolvedValue({ affected: 0 });
      
      // Exécution
      const result = await todoService.deleteTodo(999);
      
      // Vérification
      expect(mockRepository.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
});