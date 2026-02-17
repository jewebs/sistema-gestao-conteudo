
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import type { Task } from '../types';
import { Priority, Status, GmbStatus } from '../types';

interface ImportTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tasks: Omit<Task, 'taskId'>[]) => void;
}

const TASK_FIELDS = [
    { key: 'taskName', label: 'Nome da Tarefa', required: true },
    { key: 'projectId', label: 'ID Projeto', required: true },
    // client and priority are manual inputs
    { key: 'status', label: 'Status', required: true, enum: Status },
    { key: 'canvaAssets.folderUrl', label: 'URL Pasta Canva', required: false },
    { key: 'canvaAssets.folderDescription', label: 'Descrição Pasta Canva', required: false },
    { key: 'canvaAssets.day', label: 'Dia Criação Canva', required: true, type: 'number' },
    { key: 'canvaAssets.month', label: 'Mês Criação Canva', required: true, type: 'number' },
    { key: 'canvaAssets.year', label: 'Ano Criação Canva', required: true, type: 'number' },
    
    { key: 'websitePost.postTitle', label: 'Título Post Site', required: false },
    { key: 'websitePost.postUrl', label: 'URL Post Site', required: false },
    { key: 'websitePost.day', label: 'Dia Post Site', required: true, type: 'number' },
    { key: 'websitePost.month', label: 'Mês Post Site', required: true, type: 'number' },
    { key: 'websitePost.year', label: 'Ano Post Site', required: true, type: 'number' },
    
    { key: 'gmbSubtask.status', label: 'Status GMB', required: false, enum: GmbStatus },
    { key: 'gmbSubtask.day', label: 'Dia Post GMB', required: false, type: 'number' },
    { key: 'gmbSubtask.month', label: 'Mês Post GMB', required: false, type: 'number' },
    { key: 'gmbSubtask.year', label: 'Ano Post GMB', required: false, type: 'number' },
];

const MAPPABLE_TASK_FIELDS = TASK_FIELDS.filter(field => field.key !== 'client' && field.key !== 'priority');


const ImportTasksModal: React.FC<ImportTasksModalProps> = ({ isOpen, onClose, onImport }) => {
    const [fileData, setFileData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [clientName, setClientName] = useState('');
    const [priority, setPriority] = useState<Priority>(Priority.Media);
    const [error, setError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(event.target?.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const dataAsArray: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

                if (dataAsArray.length < 3) {
                    setError('A planilha deve conter pelo menos 3 linhas (título, cabeçalho e dados).');
                    return;
                }

                const sheetHeaders = dataAsArray[1].filter((h: any) => h != null && String(h).trim() !== '');
                const dataRows = dataAsArray.slice(2);

                const data = dataRows.map(row => {
                    const rowObject: { [key: string]: any } = {};
                    sheetHeaders.forEach((header, index) => {
                        rowObject[header] = row[index];
                    });
                    return rowObject;
                }).filter(row => Object.values(row).some(val => val !== null));
                
                setFileData(data);
                setHeaders(sheetHeaders);

                const initialMapping: Record<string, string> = {};
                MAPPABLE_TASK_FIELDS.forEach(field => {
                    const foundHeader = sheetHeaders.find(h => String(h).toLowerCase().replace(/\s/g, '') === field.label.toLowerCase().replace(/\s/g, ''));
                    if (foundHeader) {
                        initialMapping[field.key] = foundHeader;
                    }
                });
                setMapping(initialMapping);
            } catch (err) {
                setError('Erro ao ler o arquivo. Verifique se é uma planilha válida.');
                console.error(err);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleMappingChange = (taskField: string, sheetHeader: string) => {
        setMapping(prev => ({...prev, [taskField]: sheetHeader }));
    };

    const generateRandomWorkTime = (date: Date): Date => {
        const workHours = [8, 9, 10, 11, 13, 14, 15]; // Exclui 12h
        const randomHour = workHours[Math.floor(Math.random() * workHours.length)];
        const randomMinute = Math.floor(Math.random() * 60);
        date.setHours(randomHour, randomMinute, 0, 0);
        return date;
    };
    
    const handleImport = () => {
        setError('');
        if (!clientName.trim()) {
            setError('Por favor, insira o nome do cliente.');
            return;
        }

        const requiredFieldsMet = MAPPABLE_TASK_FIELDS.every(field => !field.required || (field.required && mapping[field.key]));
        if (!requiredFieldsMet) {
            setError('Por favor, mapeie todos os campos obrigatórios (*).');
            return;
        }

        const newTasks: Omit<Task, 'taskId'>[] = fileData.map((row, index) => {
            const task: any = {
                client: clientName.trim(),
                priority: priority,
                canvaAssets: {},
                websitePost: {},
                gmbSubtask: {},
            };

            MAPPABLE_TASK_FIELDS.forEach(field => {
                const mappedHeader = mapping[field.key];
                if (!mappedHeader) return;
                
                let value = row[mappedHeader];
                if (value === undefined || value === null) return;
                
                 if (field.enum) {
                    const matchedEnumValue = Object.values(field.enum).find(
                        (enumVal) => String(enumVal).toLowerCase() === String(value).toLowerCase()
                    );
                    value = matchedEnumValue;
                }
                
                if (field.key.includes('.')) {
                    const [parent, child] = field.key.split('.');
                    if (!task[parent]) task[parent] = {};
                    task[parent][child] = value;
                } else {
                    task[field.key] = value;
                }
            });

            if (!task.taskName) return null;

            // --- Date Logic ---
            const createDateFromParts = (day: any, month: any, year: any): Date | null => {
                if (day && month && year && !isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    const date = new Date(year, month - 1, day);
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
                return null;
            }

            const canvaDate = createDateFromParts(task.canvaAssets?.day, task.canvaAssets?.month, task.canvaAssets?.year);
            if (!canvaDate) {
                console.error(`Linha ${index + 3}: Data de criação Canva inválida ou incompleta. Pulando tarefa.`);
                return null;
            }
            task.startDate = generateRandomWorkTime(new Date(canvaDate)).toISOString();
            task.canvaAssets.creationDate = task.startDate;
            
            const websiteDate = createDateFromParts(task.websitePost?.day, task.websitePost?.month, task.websitePost?.year);
             if (!websiteDate) {
                console.error(`Linha ${index + 3}: Data de postagem do site inválida ou incompleta. Pulando tarefa.`);
                return null;
            }
            task.websitePost.postDate = generateRandomWorkTime(new Date(websiteDate)).toISOString();

            const gmbDate = createDateFromParts(task.gmbSubtask?.day, task.gmbSubtask?.month, task.gmbSubtask?.year);
            if (gmbDate) {
                task.gmbSubtask.postDate = generateRandomWorkTime(new Date(gmbDate)).toISOString();
            }

            const finalEndDate = (gmbDate && gmbDate > websiteDate) ? gmbDate : websiteDate;
            task.endDate = generateRandomWorkTime(new Date(finalEndDate)).toISOString();

            if (new Date(task.startDate) > new Date(task.endDate)) {
                 console.warn(`Linha ${index + 3}: Data de início é posterior à data de fim. Ajustando a data de fim.`);
                 task.endDate = task.startDate;
            }

            return task as Omit<Task, 'taskId'>;
        }).filter(Boolean) as Omit<Task, 'taskId'>[];

        if (newTasks.length === 0 && fileData.length > 0) {
            setError("Nenhuma tarefa pôde ser importada. Verifique os dados das datas.");
            return;
        }

        onImport(newTasks);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Importar Tarefas de XLSX</h2>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {!fileData.length ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <label htmlFor="file-upload" className="cursor-pointer bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700">
                                Selecionar Arquivo XLSX
                            </label>
                            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx, .xls" />
                            <p className="mt-2 text-sm text-gray-500">A 1ª linha deve ser o título, a 2ª linha os cabeçalhos.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">1. Forneça os Dados Padrão</h3>
                                <p className="text-sm text-gray-600 mb-4">Estes valores serão aplicados a todas as tarefas importadas.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label htmlFor="client-name-import" className="block text-sm font-medium text-gray-700">
                                            Nome do Cliente <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="client-name-import"
                                            type="text"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Ex: Nike"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="priority-import" className="block text-sm font-medium text-gray-700">
                                            Prioridade <span className="text-red-500">*</span>
                                        </label>
                                         <select
                                            id="priority-import"
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value as Priority)}
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-700 mb-4">2. Mapeie as Colunas</h3>
                            <p className="text-sm text-gray-600 mb-4">Associe as colunas da sua planilha (lidas da linha 2) aos campos de tarefa. Campos com * são obrigatórios.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-64 overflow-y-auto pr-2">
                                {MAPPABLE_TASK_FIELDS.map(field => (
                                    <div key={field.key} className="flex items-center justify-between">
                                        <label className="font-medium text-gray-700">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <select
                                            value={mapping[field.key] || ''}
                                            onChange={e => handleMappingChange(field.key, e.target.value)}
                                            className="ml-4 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 w-1/2"
                                        >
                                            <option value="">Não importar</option>
                                            {headers.map(header => <option key={header} value={header}>{header}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-4">3. Pré-visualização (5 primeiras linhas)</h3>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {MAPPABLE_TASK_FIELDS.filter(f => mapping[f.key]).map(field => (
                                                <th key={field.key} className="p-2 text-left font-semibold text-gray-600">{field.label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {fileData.slice(0, 5).map((row, rowIndex) => (
                                            <tr key={rowIndex} className="border-t">
                                                {MAPPABLE_TASK_FIELDS.filter(f => mapping[f.key]).map(field => (
                                                    <td key={field.key} className="p-2 text-gray-700 whitespace-nowrap">
                                                        {String(row[mapping[field.key]] ?? '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <div>
                        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="button" onClick={handleImport} disabled={!fileData.length} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            Importar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportTasksModal;
