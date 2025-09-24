import { defineStore } from 'pinia';

// Define the shape of a single todo item
interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
}

// Define the state shape
interface TodoState {
  todo: TodoItem[];
  showTodoSlide: boolean;
}

export const useTodoStore = defineStore('todo', {
  state: (): TodoState => {
    // Initialize state from localStorage
    const savedTodo = localStorage.getItem('myTodo');
    return {
      todo: savedTodo ? JSON.parse(savedTodo) : [],
      showTodoSlide: false,
    };
  },
  getters: {
    getTodoDatas(state: TodoState): TodoItem[] {
      return state.todo;
    },
    getShowTodoSlide(state: TodoState): boolean {
      return state.showTodoSlide;
    },
  },
  actions: {
    setTodo(data: TodoItem[]) {
      this.todo = data;
      localStorage.setItem('myTodo', JSON.stringify(data));
    },
    toggleTodoSlide() {
      this.showTodoSlide = !this.showTodoSlide;
    },
    clearShowTodoSlide() {
      this.showTodoSlide = false;
    },
  },
});
