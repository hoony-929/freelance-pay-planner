'use client';

import React, { useState, useEffect } from 'react';
import { translations, Language } from '@/lib/i18n';
import { translateText } from '@/lib/translate';
import { mockProjects } from '@/lib/mock-data';
import { Globe, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TaskForm() {
  const [lang, setLang] = useState<Language>('ko');
  const [translatedLabels, setTranslatedLabels] = useState<Record<string, string>>({});
  const t = translations[lang];
  const router = useRouter();

  // Labels to dynamically translate if they aren't in the static i18n file yet
  const labelsToTranslate = [
    'Create New Task',
    'Task Details',
    'Task Title',
    'Select Project',
    'Due Date',
    'Payment Information',
    'Payment Status',
    'Payment Amount ($)',
    'Expected Payment Date',
    'Cancel',
    'Save Task',
    'Unpaid',
    'Invoice Sent',
    'Paid'
  ];

  useEffect(() => {
    const translateLabels = async () => {
      if (lang === 'en') {
        setTranslatedLabels({});
        return;
      }

      const results: Record<string, string> = {};
      const promises = labelsToTranslate.map(async (label) => {
        try {
          results[label] = await translateText(label, lang);
        } catch (e) {
          results[label] = label;
        }
      });

      await Promise.all(promises);
      setTranslatedLabels(results);
    };

    translateLabels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const getT = (label: string) => translatedLabels[label] || label;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normally you'd save data here. For phase 1, just redirect back.
    router.push('/');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getT('Create New Task')}</h1>
          </div>
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Task Details Section */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{getT('Task Details')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{getT('Task Title')}</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getT('Select Project')}</label>
              <select
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
              >
                <option value="">--</option>
                {mockProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getT('Due Date')}</label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Payment Tracking Section */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{getT('Payment Information')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getT('Payment Status')}</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
              >
                <option value="Unpaid">{getT('Unpaid')}</option>
                <option value="Invoice Sent">{getT('Invoice Sent')}</option>
                <option value="Paid">{getT('Paid')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getT('Payment Amount ($)')}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getT('Expected Payment Date')}</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-end space-x-4">
          <Link href="/" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium">
            {getT('Cancel')}
          </Link>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center">
            <Save className="w-4 h-4 mr-2" />
            {getT('Save Task')}
          </button>
        </div>
      </form>
    </div>
  );
}
