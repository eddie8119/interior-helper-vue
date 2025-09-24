import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

export interface SimplifiedProject {
  id: string;
  title: string;
  constructionContainer: string[];
}

export const useProjectsStore = defineStore('projects', () => {
  // State to hold the projects
  const projects: Ref<SimplifiedProject[]> = ref([]);

  // Action to set the projects
  function setProjects(newProjects: SimplifiedProject[]) {
    projects.value = newProjects;
  }

  return {
    projects,
    setProjects,
  };
});
