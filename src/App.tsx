import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { SettingsModal } from './components/SettingsModal';
import { Note, Settings } from './types';
import { cn } from './utils/cn';

const DEFAULT_SETTINGS: Settings = {
  primaryColor: '#4f46e5', // Indigo-600
  themeMode: 'light',
  fontSize: 16,
  editorFontSize: 16,
};

export function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
  // File System State
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null); // For Electron
  const [webFileHandle, setWebFileHandle] = useState<any>(null); // For Web (FileSystemFileHandle)
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load Settings
  useEffect(() => {
    const loadSettings = async () => {
      let loadedSettings: any = null;
      
      if (window.electronAPI) {
        try {
          loadedSettings = await window.electronAPI.getSettings();
        } catch (e) {
          console.error("Failed to load settings from Electron:", e);
        }
      } 
      
      if (!loadedSettings) {
        // Fallback to localStorage
        const stored = localStorage.getItem('app_settings');
        if (stored) {
          try {
            loadedSettings = JSON.parse(stored);
          } catch (e) {
            console.error("Failed to parse settings from localStorage", e);
          }
        }
      }

      if (loadedSettings) {
        // Migration: darkMode (boolean) -> themeMode (string)
        if (typeof loadedSettings.darkMode === 'boolean') {
            loadedSettings.themeMode = loadedSettings.darkMode ? 'dark' : 'light';
            delete loadedSettings.darkMode;
        }
        // Migration: ensure editorFontSize exists
        if (!loadedSettings.editorFontSize) {
            loadedSettings.editorFontSize = loadedSettings.fontSize || 16;
        }
        
        setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings });
      }
    };
    
    loadSettings();
  }, []);

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    
    // Color
    if (settings.primaryColor) {
      root.style.setProperty('--color-primary', settings.primaryColor);
    }
    
    // Theme Mode
    root.classList.remove('dark', 'matrix');
    if (settings.themeMode === 'dark') {
      root.classList.add('dark');
    } else if (settings.themeMode === 'matrix') {
      root.classList.add('dark', 'matrix');
    }

    // UI Font Size
    root.style.fontSize = `${settings.fontSize}px`;
  }, [settings]);

  const handleSaveAs = useCallback(async () => {
      const content = JSON.stringify(notes, null, 2);

      if (window.electronAPI) {
          try {
           const result = await window.electronAPI.saveAsFile(content);
           if (!result.canceled && result.filePath) {
             setCurrentFilePath(result.filePath);
             setWebFileHandle(null);
             const name = result.filePath.split(/[/\\]/).pop() || result.filePath;
             setFileName(name);
             setIsDirty(false);
           }
         } catch (err) {
            console.error("Failed to save as:", err);
            alert("Failed to save file.");
         }
      } else {
          // Web Save As
          try {
              // @ts-ignore
              const handle = await window.showSaveFilePicker({
                  types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
              });
              
              const writable = await handle.createWritable();
              await writable.write(content);
              await writable.close();
              
              setWebFileHandle(handle);
              setCurrentFilePath(null);
              const file = await handle.getFile();
              setFileName(file.name);
              setIsDirty(false);
          } catch (err: any) {
              if (err.name !== 'AbortError') {
                  console.error("Failed to save as (Web):", err);
                  alert("Failed to save file.");
              }
          }
      }
  }, [notes]);

  const handleSaveFile = useCallback(async () => {
    const content = JSON.stringify(notes, null, 2);

    if (window.electronAPI) {
       // Electron Save
       if (currentFilePath) {
         try {
           await window.electronAPI.saveFile(currentFilePath, content);
           setIsDirty(false);
         } catch (err) {
           console.error("Failed to save:", err);
           alert("Failed to save file.");
         }
       } else {
         handleSaveAs();
       }
    } else {
       // Web Save
       if (webFileHandle) {
         try {
           const writable = await webFileHandle.createWritable();
           await writable.write(content);
           await writable.close();
           setIsDirty(false);
         } catch (err) {
            console.error("Failed to save (Web):", err);
            alert("Failed to save file.");
         }
       } else {
         handleSaveAs();
       }
    }
  }, [notes, currentFilePath, webFileHandle, handleSaveAs]);

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFile]);

  const onAddNote = () => {
    if (!currentFilePath && !webFileHandle) {
      alert("Please Open or Create a file first to start adding notes.");
      return;
    }

    const newNote: Note = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setIsDirty(true);
  };

  const onDeleteNote = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
    setIsDirty(true);
  };

  const onUpdateNote = (key: keyof Note, value: string) => {
    if (!activeNoteId) return;

    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === activeNoteId) {
          return {
            ...note,
            [key]: value,
            updatedAt: Date.now(),
          };
        }
        return note;
      })
    );
    setIsDirty(true);
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    
    if (window.electronAPI) {
      await window.electronAPI.saveSettings(newSettings);
    } else {
      localStorage.setItem('app_settings', JSON.stringify(newSettings));
    }
  };

  const getActiveNote = () => {
    return notes.find((note) => note.id === activeNoteId);
  };

  const handleOpenFile = async () => {
    if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) return;

    if (window.electronAPI) {
      // Electron Mode
      try {
        const result = await window.electronAPI.openFile();
        if (result.canceled || !result.content || !result.filePath) return;

        const loadedNotes = JSON.parse(result.content);
        if (!Array.isArray(loadedNotes)) {
          alert("Invalid file format: Not an array of notes.");
          return;
        }

        setNotes(loadedNotes);
        setCurrentFilePath(result.filePath);
        setWebFileHandle(null);
        
        const name = result.filePath.split(/[/\\]/).pop() || result.filePath;
        setFileName(name);
        setIsDirty(false);
        setActiveNoteId(null);
      } catch (err) {
        console.error('Error opening file:', err);
        alert('Failed to open file.');
      }
    } else {
      // Web Mode (File System Access API)
      try {
        // @ts-ignore - window.showOpenFilePicker might not be in all TS definitions yet
        const [handle] = await window.showOpenFilePicker({
          types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
          multiple: false,
        });
        
        const file = await handle.getFile();
        const text = await file.text();
        const loadedNotes = JSON.parse(text);
        
        if (!Array.isArray(loadedNotes)) {
            alert("Invalid file format: Not an array of notes.");
            return;
        }

        setNotes(loadedNotes);
        setWebFileHandle(handle);
        setCurrentFilePath(null);
        setFileName(file.name);
        setIsDirty(false);
        setActiveNoteId(null);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
            console.error('Error opening file (Web):', err);
            alert('Failed to open file. Your browser might not support the File System Access API.');
        }
      }
    }
  };

  const handleCreateFile = async () => {
    // If there are notes and they are unsaved, or even if they are saved but user is working,
    // "New File" means "New Workspace". We should warn if the current workspace has content.
    if (notes.length > 0) {
        if (isDirty) {
             if (!window.confirm("You have unsaved changes. These will be lost if you create a new file without saving. Continue?")) return;
        } else {
             if (!window.confirm("This will close the current file and start a new empty one. Continue?")) return;
        }
    }
    
    if (window.electronAPI) {
        try {
            const result = await window.electronAPI.saveAsFile('[]');
            if (!result.canceled && result.filePath) {
                setNotes([]);
                setActiveNoteId(null);
                setCurrentFilePath(result.filePath);
                setWebFileHandle(null);
                const name = result.filePath.split(/[/\\]/).pop() || result.filePath;
                setFileName(name);
                setIsDirty(false);
            }
        } catch (err) {
             console.error("New file creation cancelled or failed", err);
        }
    } else {
        try {
            // @ts-ignore
            const handle = await window.showSaveFilePicker({
                types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
            });
             const writable = await handle.createWritable();
             await writable.write('[]');
             await writable.close();
             
             setNotes([]);
             setActiveNoteId(null);
             setWebFileHandle(handle);
             setCurrentFilePath(null);
             const file = await handle.getFile();
             setFileName(file.name);
             setIsDirty(false);
        } catch (err) {
            console.error("New file creation cancelled or failed", err);
        }
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-200">
      <div className={cn("flex h-full w-full flex-col md:w-80 shrink-0", activeNoteId ? "hidden md:flex" : "flex")}>
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onNoteSelect={setActiveNoteId}
          onAddNote={onAddNote}
          onDeleteNote={onDeleteNote}
          onOpenFile={handleOpenFile}
          onSaveFile={handleSaveFile}
          onCreateFile={handleCreateFile}
          onOpenSettings={() => setIsSettingsOpen(true)}
          fileName={fileName}
          isDirty={isDirty}
        />
      </div>
      <main className={cn("flex-1 overflow-hidden bg-card transition-colors duration-200", activeNoteId ? "flex" : "hidden md:flex")}>
        {activeNoteId ? (
             <Editor
                activeNote={getActiveNote()}
                onUpdateNote={onUpdateNote}
                onBack={() => setActiveNoteId(null)}
                editorFontSize={settings.editorFontSize}
             />
        ) : (
            <div className="flex w-full flex-col items-center justify-center h-full text-muted-foreground p-8 text-center transition-colors duration-200">
                <p className="text-lg font-medium text-foreground mb-2">Local Notes App</p>
                <p className="text-muted-foreground/80">Select a note from the sidebar or create a new one.</p>
                <div className="mt-8 text-sm text-muted-foreground max-w-md bg-secondary p-4 rounded-lg border border-border transition-colors duration-200">
                    <p className="font-semibold mb-2 text-foreground">How it works:</p>
                    <ul className="list-disc text-left pl-5 space-y-1 text-muted-foreground">
                        <li>Click <strong>Open</strong> to load a JSON file.</li>
                        <li>Click <strong>New</strong> to create a new file.</li>
                        <li>Click <strong>Save</strong> (or Ctrl+S) to save changes.</li>
                    </ul>
                </div>
            </div>
        )}
      </main>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
