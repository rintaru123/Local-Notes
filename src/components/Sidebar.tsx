import React from 'react';
import { Plus, FolderOpen, Save, FilePlus, Trash2, Search, FileText, Settings as SettingsIcon, FileDown } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Note } from '../types';
import { cn } from '../utils/cn';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (id: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onCreateFile: () => void;
  onOpenSettings: () => void;
  fileName: string | null;
  isDirty: boolean;
}

export function Sidebar({
  notes,
  activeNoteId,
  onNoteSelect,
  onAddNote,
  onDeleteNote,
  onOpenFile,
  onSaveFile,
  onCreateFile,
  onOpenSettings,
  fileName,
  isDirty,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredNotes = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-secondary md:w-80 transition-colors duration-200">
      <div className="flex flex-col gap-4 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Local Notes
          </h1>
          <button
            onClick={onAddNote}
            className="rounded-full bg-primary p-2 text-primary-foreground hover:opacity-90 transition-colors"
            title="Create new note"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        {/* File Operations */}
        <div className="flex flex-col gap-2 rounded-md bg-card p-3 shadow-sm border border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="truncate max-w-[200px] font-medium" title={fileName || "No file open"}>
                    {fileName ? fileName : "No file open"}
                </span>
                {isDirty && <span className="text-destructive font-bold text-[10px] uppercase tracking-wider">● Unsaved</span>}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={onOpenFile}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded bg-secondary py-2 text-xs font-medium hover:bg-accent text-foreground transition-colors"
                    title="Open JSON file"
                >
                    <FolderOpen className="h-3.5 w-3.5" /> Open
                </button>
                <button
                    onClick={onCreateFile}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded bg-secondary py-2 text-xs font-medium hover:bg-accent text-foreground transition-colors"
                    title="Create new JSON file"
                >
                    <FilePlus className="h-3.5 w-3.5" /> New
                </button>
                <button
                    onClick={onSaveFile}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 rounded py-2 text-xs font-medium transition-colors",
                        isDirty 
                            ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm" 
                            : "bg-secondary text-foreground hover:bg-accent"
                    )}
                    title="Save to file"
                >
                    <Save className="h-3.5 w-3.5" /> Save
                </button>
            </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-input bg-card py-2 pl-9 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredNotes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <p className="text-sm">No notes found</p>
            {!fileName && <p className="text-xs mt-1 opacity-70">Open a file to start</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onNoteSelect(note.id)}
                className={cn(
                  "group relative cursor-pointer rounded-lg p-3 transition-all hover:bg-card hover:shadow-sm border border-transparent",
                  activeNoteId === note.id ? "bg-card shadow-md border-border ring-1 ring-primary/20" : ""
                )}
              >
                <h3 className={cn("mb-1 truncate font-medium", activeNoteId === note.id ? "text-primary" : "text-foreground")}>
                  {note.title || 'Untitled Note'}
                </h3>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {note.content || 'No content'}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    title="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t border-border p-3 bg-secondary flex flex-col gap-1">
        <button
            onClick={() => {
                const zip = new JSZip();
                notes.forEach((note) => {
                    // Sanitize filename: remove characters illegal in Windows/Unix filenames
                    // but allow Cyrillic and other unicode characters.
                    const title = note.title 
                        ? note.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() 
                        : 'untitled';
                    const safeTitle = title.length > 0 ? title : 'untitled';
                    zip.file(`${safeTitle}.md`, note.content || '');
                });
                zip.generateAsync({ type: 'blob' }).then((content) => {
                    saveAs(content, 'notes_export.zip');
                });
            }}
            className="flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Download all notes as Markdown (ZIP)"
        >
            <FileDown className="h-4 w-4" />
            Export All
        </button>
        <button
            onClick={onOpenSettings}
            className="flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
            <SettingsIcon className="h-4 w-4" />
            Settings
        </button>
      </div>
    </div>
  );
}
