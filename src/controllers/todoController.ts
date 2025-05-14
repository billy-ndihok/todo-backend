import { Request, Response } from 'express';
import { getServices } from '../services';
import { CreateTodoDto, TodoStatus, UpdateTodoDto } from '../types/todo';

export class TodoController {
  /**
   * GET /todos
   * Récupère toutes les tâches avec filtrage optionnel
   */
  async getAllTodos(req: Request, res: Response): Promise<void> {
    try {
      const status = (req.query.status as TodoStatus) || TodoStatus.ALL;
      const { todoService } = getServices();
      const todos = await todoService.getAllTodos(status);
      res.json(todos);
    } catch (error) {
      console.error('Erreur lors de la récupération des todos:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des todos' });
    }
  }

  /**
   * GET /todos/:id
   * Récupère une tâche par son ID
   */
  async getTodoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID invalide' });
        return;
      }
      
      const { todoService } = getServices();
      const todo = await todoService.getTodoById(id);
      
      if (!todo) {
        res.status(404).json({ message: 'Todo non trouvé' });
        return;
      }
      
      res.json(todo);
    } catch (error) {
      console.error(`Erreur lors de la récupération du todo ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * POST /todos
   * Crée une nouvelle tâche
   */
  async createTodo(req: Request, res: Response): Promise<void> {
    try {
      const todoData: CreateTodoDto = req.body;
      
      if (!todoData.title || todoData.title.trim() === '') {
        res.status(400).json({ message: 'Le titre est obligatoire' });
        return;
      }
      
      const { todoService } = getServices();
      const newTodo = await todoService.createTodo(todoData);
      res.status(201).json(newTodo);
    } catch (error) {
      console.error('Erreur lors de la création du todo:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la création du todo' });
    }
  }

  /**
   * PUT /todos/:id
   * Met à jour une tâche existante
   */
  async updateTodo(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID invalide' });
        return;
      }
      
      const todoData: UpdateTodoDto = req.body;
      
      // Vérifier qu'au moins un champ est fourni
      if (Object.keys(todoData).length === 0) {
        res.status(400).json({ message: 'Aucune donnée fournie pour la mise à jour' });
        return;
      }
      
      const { todoService } = getServices();
      const updatedTodo = await todoService.updateTodo(id, todoData);
      
      if (!updatedTodo) {
        res.status(404).json({ message: 'Todo non trouvé' });
        return;
      }
      
      res.json(updatedTodo);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du todo ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
    }
  }

  /**
   * PATCH /todos/:id/status
   * Change uniquement le statut d'une tâche
   */
  async toggleTodoStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID invalide' });
        return;
      }
      
      const { completed } = req.body;
      
      if (typeof completed !== 'boolean') {
        res.status(400).json({ message: 'Le statut completed doit être un booléen' });
        return;
      }
      
      const { todoService } = getServices();
      const updatedTodo = await todoService.toggleTodoStatus(id, completed);
      
      if (!updatedTodo) {
        res.status(404).json({ message: 'Todo non trouvé' });
        return;
      }
      
      res.json(updatedTodo);
    } catch (error) {
      console.error(`Erreur lors du changement de statut du todo ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  /**
   * DELETE /todos/:id
   * Supprime une tâche
   */
  async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID invalide' });
        return;
      }
      
      const { todoService } = getServices();
      const deleted = await todoService.deleteTodo(id);
      
      if (!deleted) {
        res.status(404).json({ message: 'Todo non trouvé' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(`Erreur lors de la suppression du todo ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
    }
  }
}

export default new TodoController();