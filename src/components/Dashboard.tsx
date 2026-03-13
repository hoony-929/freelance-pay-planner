'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { mockTasks, mockProjects, mockClients } from '@/lib/mock-data';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Calendar, CheckCircle2, Circle, Clock, DollarSign, AlertCircle, Globe, Plus, Send, Bell, X } from 'lucide-react';
import { Task, Project, Client } from '@/types';
import { translations, Language } from '@/lib/i18n';
import { translateText } from '@/lib/translate';
import Link from 'next/link';

export default function Dashboard() {
  const [lang, setLang] = useState<Language>('ko');
  const [translatedData, setTranslatedData] = useState<Record<string, string>>({});
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'deadline'|'payment'}[]>([]);
  const t = translations[lang];

  // Load translations for dynamic data when language changes
  useEffect(() => {
    const translateDynamicData = async () => {
      if (lang === 'en') {
        setTranslatedData({}); // Clear cache/translations if English is selected since it's the source
        return;
      }

      const textsToTranslate = new Set<string>();

      tasks.forEach(task => textsToTranslate.add(task.title));
      mockProjects.forEach(proj => textsToTranslate.add(proj.name));
      mockClients.forEach(client => {
        if (client.company) textsToTranslate.add(client.company);
        textsToTranslate.add(client.name);
      });

      const results: Record<string, string> = {};

      // Parallelize translation requests
      const promises = Array.from(textsToTranslate).map(async (text) => {
        try {
          const translated = await translateText(text, lang);
          results[text] = translated;
        } catch (e) {
          console.error(`Failed to translate: ${text}`);
          results[text] = text; // Fallback to original
        }
      });

      await Promise.all(promises);
      setTranslatedData(results);
    };

    translateDynamicData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, tasks]);

  // Helper to get translated string or fallback
  const getT = (str: string | undefined) => {
    if (!str) return '';
    if (lang === 'en') return str;
    return translatedData[str] || str;
  };

  // Helpers
  const getProject = (projectId: string) => mockProjects.find(p => p.id === projectId);
  const getClient = (clientId: string) => mockClients.find(c => c.id === clientId);

  // Derived state (mocked)
  const incompleteTasks = useMemo(() => {
    return tasks
      .filter(t => !t.isCompleted)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks]);

  // Setup notifications on load
  useEffect(() => {
    const newNotifications: {id: string, message: string, type: 'deadline'|'payment'}[] = [];

    // Check for today's deadlines
    incompleteTasks.forEach(task => {
      if (isToday(parseISO(task.dueDate))) {
        const project = getProject(task.projectId);
        // We defer translation formatting to the render stage
        newNotifications.push({
          id: `deadline-${task.id}`,
          message: `[${project?.name || task.title}]`,
          type: 'deadline'
        });
      }
    });

    // Check for today's payments
    pendingPayments.forEach(task => {
      if (task.paymentDueDate && isToday(parseISO(task.paymentDueDate))) {
        const project = getProject(task.projectId);
        const client = getClient(project?.clientId || '');
        newNotifications.push({
          id: `payment-${task.id}`,
          message: `$${task.paymentAmount?.toLocaleString()} (${client?.company || client?.name})`,
          type: 'payment'
        });
      }
    });

    setNotifications(newNotifications);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const pendingPayments = useMemo(() => {
    return tasks
      .filter(t => t.paymentStatus !== 'Paid' && t.paymentAmount)
      .sort((a, b) => new Date(a.paymentDueDate || '').getTime() - new Date(b.paymentDueDate || '').getTime());
  }, [tasks]);

  // Aggregate stats
  const totalExpected = useMemo(() => {
    return pendingPayments.reduce((acc, task) => acc + (task.paymentAmount || 0), 0);
  }, [pendingPayments]);
  const totalProjects = mockProjects.length;
  const activeClients = mockClients.length;

  const formatDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return <span className="text-red-600 font-semibold">{t.today}</span>;
    if (isTomorrow(date)) return <span className="text-orange-600 font-semibold">{t.tomorrow}</span>;
    return format(date, 'MMM d, yyyy');
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId ? { ...task, isCompleted: true } : task
    ));
  };

  const handleSendInvoice = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, paymentStatus: 'Invoice Sent' } : task
    ));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-3">
          {notifications.map(notif => (
            <div key={notif.id} className={`p-4 rounded-lg shadow-sm border flex justify-between items-start ${notif.type === 'deadline' ? 'bg-red-50 border-red-100 text-red-900' : 'bg-green-50 border-green-100 text-green-900'}`}>
              <div className="flex items-start space-x-3">
                <Bell className={`w-5 h-5 mt-0.5 ${notif.type === 'deadline' ? 'text-red-500' : 'text-green-500'}`} />
                <div>
                  <h4 className="font-semibold text-sm">{t.notificationTitle}</h4>
                  <p className="text-sm mt-0.5">
                    {notif.type === 'deadline'
                      ? `${t.today} ${notif.message} ${t.deadlineToday}`
                      : `${t.today} ${notif.message} ${t.paymentToday}`
                    }
                  </p>
                </div>
              </div>
              <button onClick={() => dismissNotification(notif.id)} className={`p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity ${notif.type === 'deadline' ? 'hover:bg-red-100' : 'hover:bg-green-100'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.dashboardTitle}</h1>
          <p className="text-gray-600 mt-2">{t.dashboardSubtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/new" className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>{t.newTask || 'New Task'}</span>
          </Link>
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
                  <div key={task.id} className="p-5 hover:bg-gray-50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="mt-0.5 text-gray-300 hover:text-green-500 transition-colors focus:outline-none"
                          title={getT('Mark as completed')}
                          aria-label={getT('Mark as completed')}
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <div>
                          <h3 className="text-md font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{getT(task.title)}</h3>
                          <p className="text-sm text-gray-500">
                            {getT(project?.name)} ({getT(client?.company || client?.name)})
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
                        <p className="text-sm text-gray-600">{getT(task.title)}</p>
                        <p className="text-xs text-gray-400 mt-1">{t.projectLabel}: {getT(project?.name)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end justify-between">
                        <div className="text-sm flex items-center text-gray-600 mb-2">
                          <AlertCircle className="w-4 h-4 mr-1 text-gray-400" />
                          {t.expected}: {task.paymentDueDate ? formatDateLabel(task.paymentDueDate) : 'N/A'}
                        </div>
                        {task.isCompleted && task.paymentStatus === 'Unpaid' && (
                          <button
                            onClick={() => handleSendInvoice(task.id)}
                            className="flex items-center space-x-1 text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md font-medium transition-colors border border-blue-200"
                          >
                            <Send className="w-3 h-3" />
                            <span>{t.sendInvoice}</span>
                          </button>
                        )}
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
