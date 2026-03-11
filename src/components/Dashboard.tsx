'use client';

import React, { useState } from 'react';
import { mockTasks, mockProjects, mockClients } from '@/lib/mock-data';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Calendar, CheckCircle2, Circle, Clock, DollarSign, AlertCircle, Globe } from 'lucide-react';
import { Task, Project, Client } from '@/types';
import { translations, Language } from '@/lib/i18n';

export default function Dashboard() {
  const [lang, setLang] = useState<Language>('ko');
  const t = translations[lang];

  // Helpers
  const getProject = (projectId: string) => mockProjects.find(p => p.id === projectId);
  const getClient = (clientId: string) => mockClients.find(c => c.id === clientId);

  // Derived state (mocked)
  const incompleteTasks = mockTasks.filter(t => !t.isCompleted).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const pendingPayments = mockTasks.filter(t => t.paymentStatus !== 'Paid' && t.paymentAmount).sort((a, b) => new Date(a.paymentDueDate || '').getTime() - new Date(b.paymentDueDate || '').getTime());

  // Aggregate stats
  const totalExpected = pendingPayments.reduce((acc, task) => acc + (task.paymentAmount || 0), 0);
  const totalProjects = mockProjects.length;
  const activeClients = mockClients.length;

  const formatDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return <span className="text-red-600 font-semibold">{t.today}</span>;
    if (isTomorrow(date)) return <span className="text-orange-600 font-semibold">{t.tomorrow}</span>;
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.dashboardTitle}</h1>
          <p className="text-gray-600 mt-2">{t.dashboardSubtitle}</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Globe className="w-4 h-4 text-gray-500" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
            title={t.languageLabel}
            aria-label={t.languageLabel}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t.pendingTasks}</p>
            <p className="text-2xl font-bold text-gray-900">{incompleteTasks.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t.expectedPayments}</p>
            <p className="text-2xl font-bold text-gray-900">${totalExpected.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t.activeProjects}</p>
            <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
              {t.upcomingDeadlines}
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {incompleteTasks.length === 0 ? (
              <p className="p-6 text-center text-gray-500">{t.allCaughtUp}</p>
            ) : (
              incompleteTasks.map(task => {
                const project = getProject(task.projectId);
                const client = getClient(project?.clientId || '');
                return (
                  <div key={task.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start space-x-3">
                        <Circle className="w-5 h-5 mt-0.5 text-gray-300" />
                        <div>
                          <h3 className="text-md font-semibold text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-500">
                            {project?.name} ({client?.company || client?.name})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm bg-gray-100 px-2 py-1 rounded-md inline-block">
                          {t.due}: {formatDateLabel(task.dueDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Tracking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              {t.expectedPayments}
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingPayments.length === 0 ? (
              <p className="p-6 text-center text-gray-500">{t.noPendingPayments}</p>
            ) : (
              pendingPayments.map(task => {
                const project = getProject(task.projectId);

                let statusColor = 'bg-yellow-100 text-yellow-800';
                if (task.paymentStatus === 'Invoice Sent') statusColor = 'bg-blue-100 text-blue-800';

                return (
                  <div key={task.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-md font-semibold text-gray-900">${task.paymentAmount?.toLocaleString()}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                            {task.paymentStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{task.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{t.projectLabel}: {project?.name}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="text-sm flex items-center text-gray-600 mb-1">
                          <AlertCircle className="w-4 h-4 mr-1 text-gray-400" />
                          {t.expected}: {task.paymentDueDate ? formatDateLabel(task.paymentDueDate) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
