import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Trash2, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNotes } from '../hooks/useNotes';

export const Notebook: React.FC = () => {
  const { notes, isLoading, error, createNote, updateNote, deleteNote } = useNotes();
  const [activeNoteId, setActiveNoteId] = useState<string>('');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (activeNoteId) {
      const active = notes.find((n) => n.id === activeNoteId);
      if (active) {
        setTitle(active.title);
        setContent(active.content);
      }
    } else if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
      setTitle(notes[0].title);
      setContent(notes[0].content);
    }
  }, [activeNoteId, notes]);

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    const selected = notes.find((n) => n.id === id);
    if (selected) {
      setTitle(selected.title);
      setContent(selected.content);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({ title: 'Untitled Draft', content: '' });
      setActiveNoteId(newNote.id);
      setTitle(newNote.title);
      setContent(newNote.content);
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  const handleSaveNote = () => {
    if (!activeNoteId) return;
    updateNote({ id: activeNoteId, title, content });
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    if (activeNoteId === id) {
      setActiveNoteId('');
      setTitle('');
      setContent('');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive gap-2 text-sm font-medium">
        <AlertCircle size={24} />
        <span>Failed to load notes from the database server.</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 h-[calc(100vh-100px)] flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Athena Notebook</h1>
          <p className="text-xs text-muted-foreground">
            Write drafts, plan research, and map product blueprints.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleCreateNote} className="flex items-center gap-1.5 self-start">
          <Plus size={14} />
          <span>New Note</span>
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        <Card className="p-4 md:col-span-1 flex flex-col space-y-3 overflow-hidden text-left" glass>
          <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
            <BookOpen size={16} className="text-accent" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Drafts list
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isLoading ? (
              [...Array(3)].map((_, idx) => (
                <div key={idx} className="p-3 bg-secondary/20 rounded-xl space-y-2 animate-pulse">
                  <div className="h-3 bg-secondary rounded w-3/4" />
                  <div className="h-2.5 bg-secondary rounded w-5/6" />
                </div>
              ))
            ) : notes.length > 0 ? (
              notes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition text-left cursor-pointer ${
                      isActive ? 'bg-secondary' : 'hover:bg-secondary/40'
                    }`}
                  >
                    <FileText size={16} className={`mt-0.5 shrink-0 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-foreground truncate">{note.title || 'Untitled'}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{note.content || 'Empty note...'}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-muted-foreground/60 shrink-0 self-center" />
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No drafts found
              </div>
            )}
          </div>
        </Card>

        <Card className="md:col-span-2 p-6 flex flex-col justify-between text-left relative" glass>
          {activeNoteId ? (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent border-0 outline-none text-base font-bold tracking-tight text-foreground placeholder-muted-foreground w-full"
                  placeholder="Note Title"
                />
                <button
                  onClick={() => handleDeleteNote(activeNoteId)}
                  className="text-muted-foreground hover:text-destructive transition p-1.5 rounded hover:bg-secondary cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full bg-transparent border-0 outline-none resize-none text-xs leading-relaxed text-foreground placeholder-muted-foreground pr-2"
                placeholder="Start typing your thoughts, checklists, or blueprints here..."
              />

              <div className="flex justify-end pt-4 border-t border-border/40">
                <Button variant="primary" size="sm" onClick={handleSaveNote}>
                  Save Draft
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <BookOpen size={24} />
              <span className="text-xs">Select or create a note to begin writing</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
