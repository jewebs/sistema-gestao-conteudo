
import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { Priority, Status, GmbStatus } from '../types';
import { addDays } from '../utils/dateUtils';


interface AddTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task: Task | null;
}

const defaultTaskState: Omit<Task, 'taskId'> = {
    taskName: '',
    projectId: '',
    client: '',
    startDate: new Date().toISOString().substring(0, 16),
    endDate: addDays(new Date(), 1).toISOString().substring(0, 16),
    priority: Priority.Media,
    status: Status.Pendente,
    canvaAssets: {
        folderUrl: '',
        folderDescription: '',
        creationDate: new Date().toISOString().split('T')[0],
    },
    websitePost: {
        postTitle: '',
        postUrl: '',
        postDate: addDays(new Date(), 7).toISOString().split('T')[0],
    },
    gmbSubtask: {
        postDate: null,
        status: GmbStatus.NA,
    },
};

const safeFormatForInput = (dateString: string | null | undefined, type: 'datetime' | 'date'): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; 

    // Adjust for timezone offset to display the correct local time in the input
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    const localISOString = localDate.toISOString();

    if (type === 'datetime') {
        return localISOString.substring(0, 16);
    } else { // 'date'
        return localISOString.split('T')[0];
    }
};


const AddTaskForm: React.FC<AddTaskFormProps> = ({ isOpen, onClose, onSave, task }) => {
  const [formData, setFormData] = useState<Omit<Task, 'taskId'> | Task>(defaultTaskState);

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        startDate: safeFormatForInput(task.startDate, 'datetime'),
        endDate: safeFormatForInput(task.endDate, 'datetime'),
        canvaAssets: {
            ...task.canvaAssets,
            creationDate: safeFormatForInput(task.canvaAssets.creationDate, 'date')
        },
        websitePost: {
            ...task.websitePost,
            postDate: safeFormatForInput(task.websitePost.postDate, 'date')
        },
        gmbSubtask: {
            ...task.gmbSubtask,
            postDate: safeFormatForInput(task.gmbSubtask.postDate, 'date')
        }
      });
    } else {
      setFormData(defaultTaskState);
    }
  }, [task, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length > 1) {
        setFormData(prev => ({
            ...prev,
            [keys[0]]: {
                // @ts-ignore
                ...prev[keys[0]],
                [keys[1]]: value
            }
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskToSave = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        canvaAssets: {
            ...formData.canvaAssets,
            creationDate: new Date(formData.canvaAssets.creationDate).toISOString()
        },
        websitePost: {
            ...formData.websitePost,
            postDate: new Date(formData.websitePost.postDate).toISOString()
        },
        gmbSubtask: {
            ...formData.gmbSubtask,
            postDate: formData.gmbSubtask.postDate ? new Date(formData.gmbSubtask.postDate).toISOString() : null
        }
    };
    onSave(taskToSave as Task);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{task ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                    {'taskId' in formData && formData.taskId && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700">ID da Tarefa (não editável)</label>
                            <input type="text" value={formData.taskId} disabled className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome da Tarefa</label>
                        <input type="text" name="taskName" value={formData.taskName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID do Projeto</label>
                            <input type="text" name="projectId" value={formData.projectId} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cliente</label>
                            <input type="text" name="client" value={formData.client} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                            <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Início da Tarefa</label>
                        <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fim da Tarefa</label>
                        <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium text-gray-700 px-2">Ativos Canva</legend>
                        <div className="space-y-2">
                             <input type="url" name="canvaAssets.folderUrl" placeholder="URL da Pasta" value={formData.canvaAssets.folderUrl} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            <input type="text" name="canvaAssets.folderDescription" placeholder="Descrição da Pasta" value={formData.canvaAssets.folderDescription} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            <input type="date" name="canvaAssets.creationDate" placeholder="Data de Criação" value={formData.canvaAssets.creationDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </fieldset>

                     <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium text-gray-700 px-2">Publicação Site</legend>
                         <div className="space-y-2">
                            <input type="text" name="websitePost.postTitle" placeholder="Título do Post" value={formData.websitePost.postTitle} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            <input type="url" name="websitePost.postUrl" placeholder="URL do Post" value={formData.websitePost.postUrl} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            <input type="date" name="websitePost.postDate" placeholder="Data de Postagem" value={formData.websitePost.postDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </fieldset>

                     <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium text-gray-700 px-2">Subtarefa GMB</legend>
                         <div className="space-y-2">
                            <select name="gmbSubtask.status" value={formData.gmbSubtask.status} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                {Object.values(GmbStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <input type="date" name="gmbSubtask.postDate" value={formData.gmbSubtask.postDate || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </fieldset>
                </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancelar
            </button>
            <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskForm;
