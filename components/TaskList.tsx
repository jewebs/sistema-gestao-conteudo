
import React, { useMemo } from 'react';
import type { Task } from '../types';
import TaskCard from './TaskCard';
import { addDays, startOfDay } from '../utils/dateUtils';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMoveToNextWeek: (taskId: string) => void;
  dateRange: { start: string; end: string };
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onMoveToNextWeek, dateRange }) => {

  const effectiveDateRange = useMemo(() => {
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return { start, end };
      }
    }

    if (tasks.length === 0) {
      return null;
    }

    let minDate = new Date(tasks[0].startDate);
    let maxDate = new Date(tasks[0].endDate);

    for (const task of tasks) {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      if (taskStart < minDate) minDate = taskStart;
      if (taskEnd > maxDate) maxDate = taskEnd;
    }
    
    return { start: minDate, end: maxDate };
  }, [dateRange, tasks]);

  const daysInRange = useMemo(() => {
    if (!effectiveDateRange) return [];

    const days: Date[] = [];
    let currentDate = startOfDay(effectiveDateRange.start);
    const endDate = startOfDay(effectiveDateRange.end);
    
    if (isNaN(currentDate.getTime()) || isNaN(endDate.getTime()) || currentDate > endDate) return [];
    
    let i = 0;
    while (currentDate <= endDate && i < 366) { // Loop safeguard
      days.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
      i++;
    }
    return days;
  }, [effectiveDateRange]);


  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    daysInRange.forEach(day => {
      const dayKey = day.toISOString().split('T')[0];
      const tasksForDay = tasks.filter(task => {
        const taskStart = startOfDay(new Date(task.startDate));
        const taskEnd = startOfDay(new Date(task.endDate));
        return day >= taskStart && day <= taskEnd;
      });
      if (tasksForDay.length > 0) {
        map.set(dayKey, tasksForDay);
      }
    });
    return map;
  }, [daysInRange, tasks]);
  
  if (tasks.length === 0) {
    return <div className="text-center py-10 text-gray-500">Nenhuma tarefa encontrada para os filtros selecionados.</div>;
  }
  
  if (daysInRange.length === 0 && tasks.length > 0) {
     return (
        <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2 mb-4">
                Todas as Tarefas
            </h3>
            {tasks.map(task => (
              <TaskCard
                key={task.taskId}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onMoveToNextWeek={onMoveToNextWeek}
              />
            ))}
        </div>
     )
  }

  return (
    <div className="space-y-8 mt-6">
      {Array.from(tasksByDay.entries()).map(([day, dayTasks]) => (
        <div key={day}>
          <h3 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2 mb-4">
            {new Date(day + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </h3>
          <div className="space-y-4">
            {dayTasks.map(task => (
              <TaskCard
                key={task.taskId}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onMoveToNextWeek={onMoveToNextWeek}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
