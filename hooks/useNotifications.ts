
import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { Status } from '../types';

interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'error';
}

export const useNotifications = (tasks: Task[]) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const checkTasks = () => {
      const newNotifications: Notification[] = [];
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      tasks.forEach(task => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);

        // Check for overdue tasks
        if (endDate < now && task.status !== Status.Concluido) {
          newNotifications.push({
            // FIX: Property 'id' does not exist on type 'Task'. Corrected to use 'taskId'.
            id: `${task.taskId}-overdue`,
            message: `A tarefa "${task.taskName}" está atrasada!`,
            type: 'error',
          });
        }

        // Check for upcoming tasks
        if (startDate > now && startDate <= twentyFourHoursFromNow && task.status !== Status.Concluido) {
          newNotifications.push({
            // FIX: Property 'id' does not exist on type 'Task'. Corrected to use 'taskId'.
            id: `${task.taskId}-upcoming`,
            message: `A tarefa "${task.taskName}" começa em menos de 24 horas.`,
            type: 'warning',
          });
        }
      });

      setNotifications(newNotifications);
    };

    checkTasks();
    const intervalId = setInterval(checkTasks, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(intervalId);
  }, [tasks]);

  const dismissNotification = (id: string) => {
    setNotifications(currentNotifications =>
      currentNotifications.filter(n => n.id !== id)
    );
  };

  return { notifications, dismissNotification };
};
