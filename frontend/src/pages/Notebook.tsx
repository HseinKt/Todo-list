import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';

export const Notebook: React.FC = () => {
  const [notes] = useState([
    { id: '1', title: 'Product Vision Draft', preview: 'Horizon OS represents a cognitive shift in productivity...', date: 'Today' },
    { id: '2', title: 'Life Optimization Principles', preview: 'Routines and compound habits unblock mental bandwidth...', date: 'Yesterday' },
  ]);

  return (
    <div className="flex-1 bg-white dark:bg-neutral-950 p-8 overflow-y-auto text-neutral-800 dark:text-neutral-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Athena Notes</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Capture ideas, structure notes, and document knowledge.</p>
        </div>
        <button className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer">
          <Plus size={16} />
          <span>New Page</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map((note) => (
          <div key={note.id} className="p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:shadow-sm cursor-pointer transition duration-200">
            <div className="flex items-center gap-2 mb-3 text-neutral-400">
              <FileText size={16} />
              <span className="text-[11px] font-mono uppercase">{note.date}</span>
            </div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">{note.title}</h2>
            <p className="text-xs text-neutral-550 leading-relaxed">{note.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
