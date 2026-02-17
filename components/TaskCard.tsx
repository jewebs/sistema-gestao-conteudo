
import React from 'react';
import type { Task } from '../types';
import { Priority, GmbStatus, Status } from '../types';
import { formatDate, formatDateTime } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMoveToNextWeek: (taskId: string) => void;
}

const priorityStyles = {
  [Priority.Alta]: 'border-l-4 border-red-500 bg-red-50',
  [Priority.Media]: 'border-l-4 border-yellow-500 bg-yellow-50',
  [Priority.Baixa]: 'border-l-4 border-blue-500 bg-blue-50',
};

const priorityLabelStyles = {
  [Priority.Alta]: 'bg-red-100 text-red-800',
  [Priority.Media]: 'bg-yellow-100 text-yellow-800',
  [Priority.Baixa]: 'bg-blue-100 text-blue-800',
};

const gmbStatusStyles = {
  [GmbStatus.Pendente]: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
  [GmbStatus.Publicado]: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20',
  [GmbStatus.NA]: 'bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-500/20',
};

const statusStyles = {
    [Status.Pendente]: 'bg-orange-100 text-orange-800',
    [Status.EmAndamento]: 'bg-blue-100 text-blue-800',
    [Status.Pausado]: 'bg-gray-200 text-gray-800',
    [Status.Concluido]: 'bg-green-100 text-green-800',
}

const MoveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);
const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);
const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onMoveToNextWeek }) => {
  const gmbIsPending = task.gmbSubtask.status === GmbStatus.Pendente;
  const cardBorderColor = gmbIsPending ? 'ring-2 ring-offset-2 ring-yellow-400' : '';

  return (
    <div className={`bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl ${priorityStyles[task.priority]} ${cardBorderColor}`}>
        <div className="p-5">
            <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-lg font-bold text-gray-800">{task.taskName}</h4>
                      <span className="text-sm font-semibold text-gray-500">({task.client})</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs mt-1">
                      <span className="font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">ID Tarefa: {task.taskId}</span>
                      <span className="font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">ID Projeto: {task.projectId}</span>
                    </div>
                </div>
                 <div className="flex items-center flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${priorityLabelStyles[task.priority]}`}>{task.priority}</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[task.status]}`}>{task.status}</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${gmbStatusStyles[task.gmbSubtask.status]}`}>GMB: {task.gmbSubtask.status}</span>
                </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <p className="font-semibold text-gray-600">Período da Tarefa</p>
                    <p className="text-gray-500">{formatDateTime(task.startDate)} - {formatDateTime(task.endDate)}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-600">Postagem no Site</p>
                    <p className="text-gray-500">Título: {task.websitePost.postTitle}</p>
                    <p className="text-gray-500">Data: {formatDate(task.websitePost.postDate)}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-600">Ativos Canva</p>
                    <a href={task.canvaAssets.folderUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">{task.canvaAssets.folderDescription}</a>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                    <button onClick={() => onEdit(task)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDelete(task.taskId)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"><DeleteIcon className="w-5 h-5"/></button>
                </div>
                {gmbIsPending && (
                    <button 
                        onClick={() => onMoveToNextWeek(task.taskId)}
                        className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-2 px-3 rounded-lg hover:bg-indigo-50"
                    >
                       Mover para próxima semana <MoveIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default TaskCard;
