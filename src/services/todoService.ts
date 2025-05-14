import { AppDataSource } from '../config/database';
import { Todo } from '../models/Todo';
import { CreateTodoDto, TodoItem, UpdateTodoDto, TodoStatus } from '../types/todo';
import { Repository } from 'typeorm';

export class TodoService {
  private todoRepository: Repository<Todo>;
  
  /**
   * Crée une instance du service Todo
   * @param repository Repository à utiliser (optionnel, utile pour les tests)
   */
  constructor(repository?: Repository<Todo>) {
    if (repository) {
      // Si un repository est fourni, l'utiliser directement (pour les tests)
      this.todoRepository = repository;
    } else {
      // Sinon, vérifier que DataSource est initialisé et obtenir le repository
      if (!AppDataSource.isInitialized) {
        throw new Error('DataSource not initialized. Call initializeDatabase() before using TodoService');
      }
      this.todoRepository = AppDataSource.getRepository(Todo);
    }
  }

  /**
   * Récupère toutes les tâches
   * @param status Filtre les tâches par statut (all, completed, active)
   * @returns Liste des tâches
   */
  async getAllTodos(status: TodoStatus = TodoStatus.ALL): Promise<TodoItem[]> {
    let query = this.todoRepository.createQueryBuilder('todo');
    
    if (status === TodoStatus.COMPLETED) {
      query = query.where('todo.completed = :completed', { completed: true });
    } else if (status === TodoStatus.ACTIVE) {
      query = query.where('todo.completed = :completed', { completed: false });
    }
    
    return query.orderBy('todo.createdAt', 'DESC').getMany();
  }

  /**
   * Récupère une tâche par son ID
   * @param id ID de la tâche
   * @returns La tâche si elle existe
   */
  async getTodoById(id: number): Promise<TodoItem | null> {
    return this.todoRepository.findOneBy({ id });
  }

  /**
   * Crée une nouvelle tâche
   * @param todoData Données de la tâche à créer
   * @returns La tâche créée
   */
  async createTodo(todoData: CreateTodoDto): Promise<TodoItem> {
    const newTodo = this.todoRepository.create({
      ...todoData,
      completed: false
    });
    
    return this.todoRepository.save(newTodo);
  }

  /**
   * Met à jour une tâche
   * @param id ID de la tâche à mettre à jour
   * @param todoData Données à mettre à jour
   * @returns La tâche mise à jour
   */
  async updateTodo(id: number, todoData: UpdateTodoDto): Promise<TodoItem | null> {
    const todo = await this.todoRepository.findOneBy({ id });
    
    if (!todo) {
      return null;
    }
    
    // Mettre à jour les propriétés
    Object.assign(todo, todoData);
    
    return this.todoRepository.save(todo);
  }

  /**
   * Change le statut d'une tâche (terminée ou non)
   * @param id ID de la tâche
   * @param completed Nouveau statut de complétion
   * @returns La tâche mise à jour
   */
  async toggleTodoStatus(id: number, completed: boolean): Promise<TodoItem | null> {
    const todo = await this.todoRepository.findOneBy({ id });
    
    if (!todo) {
      return null;
    }
    
    todo.completed = completed;
    return this.todoRepository.save(todo);
  }

  /**
   * Supprime une tâche
   * @param id ID de la tâche à supprimer
   * @returns true si supprimée, false sinon
   */
  async deleteTodo(id: number): Promise<boolean> {
    const result = await this.todoRepository.delete(id);
    return result.affected !== 0;
  }
}
  
export function createTodoService(repository?: Repository<Todo>): TodoService {
  return new TodoService(repository);
}