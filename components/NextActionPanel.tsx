
import React, { useMemo } from 'react';
import type { Task } from '../types';
import { Status } from '../types';
import { formatDateTime } from '../utils/dateUtils';


const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
);

const NextActionPanel: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const nextTask = useMemo(() => {
    const now = new Date();
    return tasks
      .filter(task => task.status !== Status.Concluido && new Date(task.websitePost.postDate) >= now)
      .sort((a, b) => new Date(a.websitePost.postDate).getTime() - new Date(b.websitePost.postDate).getTime())[0];
  }, [tasks]);

  if (!nextTask) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-center text-center">
        <div className="text-gray-500">
          <h3 className="text-xl font-semibold mb-2">Tudo em dia!</h3>
          <p>Nenhuma ação imediata pendente com base nas datas de postagem futuras.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-2xl">
      <h3 className="text-lg font-bold mb-3 border-b border-indigo-400 pb-2">
        Próxima Ação
      </h3>
      <div className="flex items-start gap-4">
        <FolderIcon className="w-12 h-12 text-indigo-200 mt-1 flex-shrink-0" />
        <div>
          <p className="font-semibold text-indigo-100">Próxima Pasta do Canva a ser trabalhada:</p>
          <a
            href={nextTask.canvaAssets.folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold hover:underline text-white"
          >
            {nextTask.canvaAssets.folderDescription || 'Pasta do Projeto ' + nextTask.projectId}
          </a>
          <p className="text-sm text-indigo-200 mt-2">
            Relacionado à tarefa: <span className="font-semibold">{nextTask.taskName}</span>
          </p>
          <p className="text-sm text-indigo-200">
            Data de postagem no site: <span className="font-semibold">{formatDateTime(nextTask.websitePost.postDate)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NextActionPanel;
