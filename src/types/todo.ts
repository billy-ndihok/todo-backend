export interface TodoItem {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

export enum TodoStatus {
  ALL = 'all',
  COMPLETED = 'completed',
  ACTIVE = 'active',
}