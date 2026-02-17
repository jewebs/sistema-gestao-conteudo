
import React from 'react';
import type { Task } from '../types';
import { GmbStatus } from '../types';
import { startOfDay, addDays, endOfDay, getWeekRange } from '../utils/dateUtils';

interface Filters {
  dateRange: { start: string; end: string };
  client: string;
  gmbStatus: string;
}

interface TaskFiltersProps {
  filters: Filters;
  onFilterChange: React.Dispatch<React.SetStateAction<Filters>>;
  tasks: Task[];
  onResetFilters: () => void;
}

const FilterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
);

const ClearIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v4.992h-4.992m0 0 3.181-3.183a8.25 8.25 0 0 0-11.667 0l3.181 3.183" />
    </svg>
);


const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onFilterChange, tasks, onResetFilters }) => {
  const clients = [...new Set(tasks.map(task => task.client))].sort();

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (!value) {
           onFilterChange(prev => ({ ...prev, dateRange: { ...prev.dateRange, [name]: '' }}));
           return;
      }

      const date = new Date(value);
      const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

      const isoDate = name === 'start'
          ? startOfDay(adjustedDate).toISOString()
          : endOfDay(adjustedDate).toISOString();
      
      onFilterChange(prev => ({
          ...prev,
          dateRange: { ...prev.dateRange, [name]: isoDate }
      }));
  };

  const handleSetDatePreset = (preset: 'today' | 'week' | 'month') => {
    const today = new Date();
    let start: Date, end: Date;

    if (preset === 'today') {
        start = startOfDay(today);
        end = endOfDay(today);
    } else if (preset === 'month') {
        start = startOfDay(today);
        end = endOfDay(addDays(start, 29));
    } else { // week
        const week = getWeekRange(today);
        start = week.start;
        end = week.end;
    }
    onFilterChange(prev => ({...prev, dateRange: {start: start.toISOString(), end: end.toISOString()}}));
  };

  const isDateRangeEqual = (range1: {start: string, end: string}, range2: {start: Date, end: Date}) => {
    if (!range1.start || !range1.end) return false;
    const d1Start = new Date(range1.start).setHours(0,0,0,0);
    const d1End = new Date(range1.end).setHours(0,0,0,0);
    const d2Start = range2.start.setHours(0,0,0,0);
    const d2End = range2.end.setHours(0,0,0,0);
    return d1Start === d2Start && d1End === d2End;
  }

  const todayRange = { start: startOfDay(new Date()), end: endOfDay(new Date()) };
  const weekDateRange = getWeekRange(new Date());
  const weekRange = { start: weekDateRange.start, end: weekDateRange.end };
  const monthRange = { start: startOfDay(new Date()), end: endOfDay(addDays(new Date(), 29)) };

  const isTodayActive = isDateRangeEqual(filters.dateRange, todayRange);
  const isWeekActive = isDateRangeEqual(filters.dateRange, weekRange);
  const isMonthActive = isDateRangeEqual(filters.dateRange, monthRange);
  
  const inactiveBtnClass = "px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-full transition-colors";
  const activeBtnClass = "px-3 py-1 text-sm bg-indigo-600 text-white rounded-full transition-colors";

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
                <FilterIcon className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-600">Filtros</h3>
            </div>
             <button onClick={onResetFilters} className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 font-semibold py-1 px-3 rounded-full hover:bg-gray-200 transition-colors">
                <ClearIcon className="w-4 h-4" />
                Limpar Filtros
            </button>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        
        {/* Date Range */}
        <div className="flex flex-col">
          <label htmlFor="start" className="mb-1 text-sm font-medium text-gray-700">Data Início</label>
          <input
            type="date"
            id="start"
            name="start"
            value={filters.dateRange.start ? filters.dateRange.start.split('T')[0] : ''}
            onChange={handleDateInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="end" className="mb-1 text-sm font-medium text-gray-700">Data Fim</label>
          <input
            type="date"
            id="end"
            name="end"
            value={filters.dateRange.end ? filters.dateRange.end.split('T')[0] : ''}
            onChange={handleDateInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Client */}
        <div className="flex flex-col">
          <label htmlFor="client" className="mb-1 text-sm font-medium text-gray-700">Cliente</label>
          <select
            id="client"
            name="client"
            value={filters.client}
            onChange={e => onFilterChange(prev => ({ ...prev, client: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">Todos os Clientes</option>
            {clients.map(clientName => (
              <option key={clientName} value={clientName}>
                {clientName}
              </option>
            ))}
          </select>
        </div>
        
        {/* GMB Status */}
        <div className="flex flex-col">
          <label htmlFor="gmbStatus" className="mb-1 text-sm font-medium text-gray-700">Status GMB</label>
          <select
            id="gmbStatus"
            value={filters.gmbStatus}
            onChange={e => onFilterChange(prev => ({ ...prev, gmbStatus: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">Todos</option>
            {Object.values(GmbStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
       <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => handleSetDatePreset('today')} className={isTodayActive ? activeBtnClass : inactiveBtnClass}>Hoje</button>
            <button onClick={() => handleSetDatePreset('week')} className={isWeekActive ? activeBtnClass : inactiveBtnClass}>Esta Semana</button>
            <button onClick={() => handleSetDatePreset('month')} className={isMonthActive ? activeBtnClass : inactiveBtnClass}>Este Mês</button>
       </div>
    </div>
  );
};

export default TaskFilters;
