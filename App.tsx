
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Header from './components/Header';
import NextActionPanel from './components/NextActionPanel';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
import { useTasks } from './hooks/useTasks';
import type { Task } from './types';
import { useNotifications } from './hooks/useNotifications';
import Notifications from './components/Notifications';
import { formatDate } from './utils/dateUtils';
import ImportTasksModal from './components/ImportTasksModal';


const AddTaskIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const ImportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);


export default function App() {
  const {
    tasks,
    filteredTasks,
    setFilters,
    addTask,
    addTasks,
    updateTask,
    deleteTask,
    moveTaskToNextWeek,
    filters,
    resetFilters,
  } = useTasks();

  const { notifications, dismissNotification } = useNotifications(tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleOpenModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleSaveTask = (task: Task) => {
    if (task.taskId) {
      updateTask(task);
    } else {
      addTask(task);
    }
    handleCloseModal();
  };
  
  const handleExportXLSX = () => {
    if (filteredTasks.length === 0) {
      alert('Não há tarefas para exportar com os filtros atuais.');
      return;
    }

    const headers = [
      'ID Tarefa', 'Nome da Tarefa', 'ID Projeto', 'Cliente', 'Início', 'Fim', 'Prioridade', 'Status',
      'URL Pasta Canva', 'Descrição Pasta Canva', 'Criação Canva',
      'Título Post Site', 'URL Post Site', 'Data Post Site',
      'Status GMB', 'Data Post GMB'
    ];

    const data = filteredTasks.map(task => [
      task.taskId,
      task.taskName,
      task.projectId,
      task.client,
      formatDate(task.startDate),
      formatDate(task.endDate),
      task.priority,
      task.status,
      task.canvaAssets.folderUrl,
      task.canvaAssets.folderDescription,
      formatDate(task.canvaAssets.creationDate),
      task.websitePost.postTitle,
      task.websitePost.postUrl,
      formatDate(task.websitePost.postDate),
      task.gmbSubtask.status,
      formatDate(task.gmbSubtask.postDate)
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tarefas');
    XLSX.writeFile(workbook, 'tarefas.xlsx');
  };

  const handleImportTasks = (newTasks: Omit<Task, 'taskId'>[]) => {
    addTasks(newTasks);
    setIsImportModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <NextActionPanel tasks={tasks} />
          </div>
          <div className="lg:col-span-12 bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-wrap justify-between items-center mb-6 border-b pb-4 gap-4">
              <h2 className="text-2xl font-bold text-gray-700">Painel de Tarefas</h2>
              <div className="flex items-center gap-2">
                 <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                  >
                    <ImportIcon className="w-5 h-5" />
                    <span>Importar XLSX</span>
                  </button>
                 <button
                    onClick={handleExportXLSX}
                    className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-md"
                  >
                    <ExportIcon className="w-5 h-5" />
                    <span>Exportar XLSX</span>
                  </button>
                 <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md"
                >
                  <AddTaskIcon className="w-6 h-6" />
                  <span>Nova Tarefa</span>
                </button>
              </div>
            </div>
            <Notifications notifications={notifications} onDismiss={dismissNotification} />
            <TaskFilters filters={filters} onFilterChange={setFilters} tasks={tasks} onResetFilters={resetFilters} />
            <TaskList
              tasks={filteredTasks}
              onEdit={handleOpenModal}
              onDelete={deleteTask}
              onMoveToNextWeek={moveTaskToNextWeek}
              dateRange={filters.dateRange}
            />
          </div>
        </div>
      </main>
      {isModalOpen && (
        <AddTaskForm
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          task={editingTask}
        />
      )}
      {isImportModalOpen && (
        <ImportTasksModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImportTasks}
        />
      )}
    </div>
  );
}
