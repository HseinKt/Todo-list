import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Trash2, FileText, ChevronRight, AlertCircle, Sparkles, Search, Check, Lightbulb } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNotes } from '../hooks/useNotes';
import { useTasks } from '../hooks/useTasks';
import { api } from '../lib/axios';

export const Notebook: React.FC = () => {
  const { notes, isLoading, error, createNote, updateNote, deleteNote } = useNotes();
  const { createTask } = useTasks();
  const [activeNoteId, setActiveNoteId] = useState<string>('');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiCategory, setAiCategory] = useState('');
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiCategorizing, setAiCategorizing] = useState(false);

  const [aiSummary, setAiSummary] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);
  const [summarizing, setSummarizing] = useState(false);
  const [pushedSuccess, setPushedSuccess] = useState(false);

  const [ideaData, setIdeaData] = useState<any>(null);
  const [evaluatingIdea, setEvaluatingIdea] = useState(false);

  const handleEvaluateIdea = async () => {
    if (!title.trim() || !content.trim()) return;
    setEvaluatingIdea(true);
    try {
      const { data } = await api.post('/ai/notes/evaluate-idea', { ideaTitle: title, ideaDescription: content });
      setIdeaData(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingIdea(false);
    }
  };

  const handleAiCategorize = async () => {
    if (!title.trim()) return;
    setAiCategorizing(true);
    try {
      const { data } = await api.post('/ai/notes/categorize', { title, content });
      setAiCategory(data.data?.category || 'General');
      setAiTags(data.data?.tags || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAiCategorizing(false);
    }
  };

  const handleSummarizeAndExtract = async () => {
    if (!title.trim() || !content.trim()) return;
    setSummarizing(true);
    setPushedSuccess(false);
    try {
      const { data } = await api.post('/ai/notes/summarize-actions', { title, content });
      setAiSummary(data.data?.summary || '');
      setExtractedTasks(data.data?.actionTasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizing(false);
    }
  };

  const handlePushToChronos = () => {
    extractedTasks.forEach((task: any) => {
      createTask({
        title: task.title,
        description: `Extracted from note: "${title}"`,
        priority: task.priority || 'MEDIUM',
        status: 'TODO',
        category: task.category || 'Extracted Action',
      });
    });
    setPushedSuccess(true);
  };

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
    <div className="w-full max-w-[1600px] mx-auto py-2 h-[calc(100vh-80px)] flex flex-col space-y-6">
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
          <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-accent" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Drafts list
              </span>
            </div>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="AI Semantic Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/40 border border-border/40 pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-accent"
            />
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
              notes
                .filter(
                  (n) =>
                    !searchQuery ||
                    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((note) => {
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
              <div className="flex justify-between items-center border-b border-border/40 pb-2.5 gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent border-0 outline-none text-base font-bold tracking-tight text-foreground placeholder-muted-foreground w-full"
                  placeholder="Note Title"
                />
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleEvaluateIdea}
                    disabled={evaluatingIdea}
                    className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20"
                  >
                    <Lightbulb size={13} className={evaluatingIdea ? 'animate-spin' : ''} />
                    <span>{evaluatingIdea ? 'Evaluating...' : 'AI Evaluate Idea'}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSummarizeAndExtract}
                    disabled={summarizing}
                    className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20"
                  >
                    <Sparkles size={13} className={summarizing ? 'animate-spin' : ''} />
                    <span>{summarizing ? 'Analyzing...' : 'AI Summarize & Actions'}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAiCategorize}
                    disabled={aiCategorizing}
                    className="flex items-center gap-1.5 text-xs text-accent bg-accent/10 border border-accent/20"
                  >
                    <Sparkles size={13} className={aiCategorizing ? 'animate-spin' : ''} />
                    <span>{aiCategorizing ? 'Categorizing...' : 'AI Auto-Tag'}</span>
                  </Button>
                  <button
                    onClick={() => handleDeleteNote(activeNoteId)}
                    className="text-muted-foreground hover:text-destructive transition p-1.5 rounded hover:bg-secondary cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {ideaData && (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-amber-500/20 rounded-xl space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">💡 AI Idea Viability Assessment</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                      Score: {ideaData.viabilityScore}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground"><strong className="text-foreground">Target Audience:</strong> {ideaData.targetAudience}</p>
                  {ideaData.mvpSteps?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-foreground">MVP Execution Roadmap:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                        {ideaData.mvpSteps.map((step: string, idx: number) => (
                          <div key={idx} className="p-2 bg-card/80 border border-border/40 rounded-lg text-[10px] text-foreground font-medium">
                            Step {idx + 1}: {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(aiCategory || aiTags.length > 0) && (
                <div className="flex items-center gap-2 text-xs flex-wrap pb-1">
                  {aiCategory && (
                    <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20 font-semibold text-[11px]">
                      📁 {aiCategory}
                    </span>
                  )}
                  {aiTags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/40 text-[11px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {aiSummary && (
                <div className="p-3 bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">AI Executive Summary & Extracted Actions</span>
                    {extractedTasks.length > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handlePushToChronos}
                        disabled={pushedSuccess}
                        className="text-[11px] h-7 px-2.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      >
                        {pushedSuccess ? (
                          <>
                            <Check size={12} />
                            <span>Pushed to Chronos!</span>
                          </>
                        ) : (
                          <span>➕ Push {extractedTasks.length} Actions to Chronos</span>
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{aiSummary}</p>
                  {extractedTasks.length > 0 && (
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {extractedTasks.map((t: any, idx: number) => (
                        <div key={idx} className="p-2 bg-card/70 border border-border/40 rounded-lg text-xs flex justify-between items-center">
                          <span className="font-medium text-foreground">{t.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold">{t.priority}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
