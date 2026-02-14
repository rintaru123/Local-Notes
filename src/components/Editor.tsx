import React from 'react';
import ReactMarkdown from 'react-markdown';
import { saveAs } from 'file-saver';
import { Note } from '../types';
import { Edit3, Eye, Calendar, Clock, ArrowLeft, Columns, Download } from 'lucide-react';
import { cn } from '../utils/cn';

interface EditorProps {
  activeNote: Note | undefined;
  onUpdateNote: (key: keyof Note, value: string) => void;
  onBack: () => void;
  editorFontSize: number;
}

type ViewMode = 'edit' | 'split' | 'preview';

export function Editor({ activeNote, onUpdateNote, onBack, editorFontSize }: EditorProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('edit');

  if (!activeNote) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-card p-8 text-center text-muted-foreground">
        <div className="mb-4 rounded-full bg-secondary p-6">
          <Edit3 className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">Select a note to view</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Choose a note from the list on the left, or create a new one to get started.
        </p>
        <button 
            onClick={onBack}
            className="mt-8 text-primary underline md:hidden"
        >
            Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-card w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-4 md:px-6">
        <button 
            onClick={onBack}
            className="mr-3 rounded-full p-2 hover:bg-secondary md:hidden"
        >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <div className="flex-1 overflow-hidden mr-4">
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => onUpdateNote('title', e.target.value)}
            placeholder="Untitled Note"
            className="w-full bg-transparent text-xl font-bold text-foreground placeholder:text-muted/50 outline-none md:text-2xl"
          />
          <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Created</span> {new Date(activeNote.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">Updated</span> {new Date(activeNote.updatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* View Toggle Group */}
        <div className="flex items-center gap-2">
            <button
                onClick={() => {
                    const blob = new Blob([activeNote.content], { type: "text/markdown;charset=utf-8" });
                    saveAs(blob, `${activeNote.title || 'untitled'}.md`);
                }}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                title="Export as Markdown"
            >
                <Download className="h-5 w-5" />
            </button>
            <div className="h-6 w-px bg-border mx-1"></div>
            <div className="flex rounded-lg bg-secondary p-1">
            <button
                onClick={() => setViewMode('edit')}
                className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === 'edit' 
                    ? "bg-card text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                title="Edit Mode"
            >
                <Edit3 className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Edit</span>
            </button>
            <button
                onClick={() => setViewMode('split')}
                className={cn(
                "hidden md:flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === 'split' 
                    ? "bg-card text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                title="Split Mode"
            >
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Split</span>
            </button>
            <button
                onClick={() => setViewMode('preview')}
                className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === 'preview' 
                    ? "bg-card text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                title="Preview Mode"
            >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Preview</span>
            </button>
            </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex relative">
        {/* Editor Pane */}
        <div 
            className={cn(
                "h-full overflow-y-auto transition-all duration-200",
                viewMode === 'edit' ? "w-full flex-1" : 
                viewMode === 'split' ? "w-1/2 border-r border-border" : 
                "hidden"
            )}
        >
          <textarea
            value={activeNote.content}
            onChange={(e) => onUpdateNote('content', e.target.value)}
            placeholder="Start writing your note here..."
            className="h-full w-full resize-none p-4 leading-relaxed text-foreground bg-card outline-none placeholder:text-muted-foreground/40 md:p-6 font-editor max-w-none block"
            style={{ minHeight: '100%', fontSize: `${editorFontSize}px` }} 
          />
        </div>

        {/* Preview Pane */}
        <div 
            className={cn(
                "h-full overflow-y-auto bg-secondary/30 transition-all duration-200",
                viewMode === 'preview' ? "w-full" : 
                viewMode === 'split' ? "w-1/2" : 
                "hidden"
            )}
        >
          <div 
            className="prose prose-slate dark:prose-invert max-w-none p-4 md:p-8 font-editor text-foreground"
            style={{ fontSize: `${editorFontSize}px` }}
          >
            <ReactMarkdown>{activeNote.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
