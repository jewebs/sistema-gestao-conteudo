
import { useState, useMemo, useCallback } from 'react';
import type { Task } from '../types';
import { GmbStatus, Priority, Status } from '../types';
import { addDays, startOfDay, endOfDay } from '../utils/dateUtils';

const initialTasks: Task[] = [
  {
    taskId: 'TSK-1718826601',
    taskName: 'Design Landing Page "Verão 2024"',
    projectId: 'PJ01',
    client: 'Nike',
    startDate: new Date().toISOString(),
    endDate: addDays(new Date(), 4).toISOString(),
    priority: Priority.Alta,
    status: Status.EmAndamento,
    canvaAssets: {
      folderUrl: 'https://canva.com/folder/1',
      folderDescription: 'Assets para campanha de verão',
      creationDate: addDays(new Date(), -2).toISOString(),
    },
    websitePost: {
      postTitle: 'Lançamento Coleção Verão 2024',
      postUrl: 'https://site.com/verao-2024',
      postDate: addDays(new Date(), 5).toISOString(),
    },
    gmbSubtask: {
      postDate: null,
      status: GmbStatus.Pendente,
    },
  },
  {
    taskId: 'TSK-1718826602',
    taskName: 'Criação de Posts para Redes Sociais',
    projectId: 'PJ02',
    client: 'Adidas',
    startDate: addDays(new Date(), 2).toISOString(),
    endDate: addDays(new Date(), 8).toISOString(),
    priority: Priority.Media,
    status: Status.EmAndamento,
    canvaAssets: {
      folderUrl: 'https://canva.com/folder/2',
      folderDescription: 'Posts de engajamento semanal',
      creationDate: new Date().toISOString(),
    },
    websitePost: {
      postTitle: 'Novidades da Semana',
      postUrl: 'https://site.com/novidades',
      postDate: addDays(new Date(), 9).toISOString(),
    },
    gmbSubtask: {
      postDate: null,
      status: GmbStatus.NA,
    },
  },
  {
    taskId: 'TSK-1718826603',
    taskName: 'Atualização do Portfólio',
    projectId: 'PJ01',
    client: 'Nike',
    startDate: addDays(new Date(), 7).toISOString(),
    endDate: addDays(new Date(), 10).toISOString(),
    priority: Priority.Baixa,
    status: Status.EmAndamento,
    canvaAssets: {
      folderUrl: 'https://canva.com/folder/3',
      folderDescription: 'Imagens dos últimos projetos',
      creationDate: addDays(new Date(), 6).toISOString(),
    },
    websitePost: {
      postTitle: 'Novos Projetos no Portfólio',
      postUrl: 'https://site.com/portfolio-update',
      postDate: addDays(new Date(), 11).toISOString(),
    },
    gmbSubtask: {
      postDate: addDays(new Date(), 11).toISOString(),
      status: GmbStatus.Publicado,
    },
  },
   {
    taskId: 'TSK-1718826604',
    taskName: 'Revisão SEO Blog',
    projectId: 'PJ03',
    client: 'Puma',
    startDate: addDays(new Date(), -3).toISOString(),
    endDate: addDays(new Date(), 1).toISOString(),
    priority: Priority.Alta,
    status: Status.Concluido,
    canvaAssets: {
      folderUrl: 'https://canva.com/folder/4',
      folderDescription: 'Imagens para posts de blog otimizados',
      creationDate: addDays(new Date(), -4).toISOString(),
    },
    websitePost: {
      postTitle: 'Blog com SEO Renovado',
      postUrl: 'https://site.com/blog-seo',
      postDate: addDays(new Date(), 0).toISOString(),
    },
    gmbSubtask: {
      postDate: addDays(new Date(), 0).toISOString(),
      status: GmbStatus.Publicado,
    },
  },
];


const getTodayDateRange = () => {
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);
  return { start: start.toISOString(), end: end.toISOString() };
};

const initialFilterState = {
    dateRange: getTodayDateRange(),
    client: '',
    gmbStatus: '',
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filters, setFilters] = useState(initialFilterState);

  const priorityOrder = { [Priority.Alta]: 1, [Priority.Media]: 2, [Priority.Baixa]: 3 };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = new Date(task.endDate);

        let dateMatch = true;
        if (filters.dateRange.start && filters.dateRange.end) {
            const filterStartDate = new Date(filters.dateRange.start);
            const filterEndDate = new Date(filters.dateRange.end);
            dateMatch = taskStartDate <= filterEndDate && taskEndDate >= filterStartDate;
        }
        
        const clientMatch = filters.client ? task.client === filters.client : true;
        const gmbStatusMatch = filters.gmbStatus ? task.gmbSubtask.status === filters.gmbStatus : true;

        return dateMatch && clientMatch && gmbStatusMatch;
      })
      .sort((a, b) => {
        const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityComparison !== 0) {
          return priorityComparison;
        }
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
  }, [tasks, filters, priorityOrder]);

  const addTask = useCallback((task: Omit<Task, 'taskId'>) => {
    const newTask = { ...task, taskId: `TSK-${Date.now()}` };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, []);

  const addTasks = useCallback((newTasks: Omit<Task, 'taskId'>[]) => {
      const tasksWithIds = newTasks.map(task => ({
        ...task,
        taskId: `TSK-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      }));
      setTasks(prevTasks => [...prevTasks, ...tasksWithIds]);
    }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.taskId === updatedTask.taskId ? updatedTask : task))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.taskId !== taskId));
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters({
        dateRange: { start: '', end: '' },
        client: '',
        gmbStatus: '',
    });
  }, []);

  const moveTaskToNextWeek = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.taskId === taskId) {
          const newStartDate = addDays(new Date(task.startDate), 7);
          const newEndDate = addDays(new Date(task.endDate), 7);
          return {
            ...task,
            startDate: newStartDate.toISOString(),
            endDate: newEndDate.toISOString(),
          };
        }
        return task;
      })
    );
  }, []);

  return {
    tasks,
    filteredTasks,
    filters,
    setFilters,
    addTask,
    addTasks,
    updateTask,
    deleteTask,
    moveTaskToNextWeek,
    resetFilters,
  };
};
