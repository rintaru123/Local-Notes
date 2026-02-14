import { X, Check, Moon, Sun, Monitor, Terminal, Type } from 'lucide-react';
import { Settings } from '../types';
import { cn } from '../utils/cn';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (newSettings: Settings) => void;
}

const PRESET_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Slate', value: '#475569' },
];

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-2xl transition-colors duration-200 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-secondary text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Mode */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => onSave({ ...settings, themeMode: 'light' })}
                    className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-all",
                        settings.themeMode === 'light' 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Sun className="h-6 w-6" />
                    <span className="text-xs font-medium">Light</span>
                </button>
                <button
                    onClick={() => onSave({ ...settings, themeMode: 'dark' })}
                    className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-all",
                        settings.themeMode === 'dark' 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Moon className="h-6 w-6" />
                    <span className="text-xs font-medium">Dark</span>
                </button>
                <button
                    onClick={() => onSave({ ...settings, themeMode: 'matrix' })}
                    className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-all",
                        settings.themeMode === 'matrix' 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Terminal className="h-6 w-6" />
                    <span className="text-xs font-medium">Matrix</span>
                </button>
            </div>
          </div>

          <hr className="border-border" />

          {/* Theme Color */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Accent Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => onSave({ ...settings, primaryColor: color.value })}
                  className={cn(
                    "group relative h-10 w-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-background",
                    settings.primaryColor === color.value ? "ring-2 ring-border scale-110" : ""
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {settings.primaryColor === color.value && (
                    <Check className="h-5 w-5 text-white" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Typography */}
          <div className="space-y-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                   <Monitor className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm font-medium text-foreground">Interface Size ({settings.fontSize}px)</span>
                </div>
                <input 
                   type="range"
                   min="12"
                   max="20"
                   step="1"
                   value={settings.fontSize}
                   onChange={(e) => onSave({ ...settings, fontSize: parseInt(e.target.value) })}
                   className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                   style={{ accentColor: settings.primaryColor }}
                />
            </div>
            
            <div>
                <div className="flex items-center gap-3 mb-2">
                   <Type className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm font-medium text-foreground">Editor Font Size ({settings.editorFontSize}px)</span>
                </div>
                <input 
                   type="range"
                   min="12"
                   max="32"
                   step="1"
                   value={settings.editorFontSize}
                   onChange={(e) => onSave({ ...settings, editorFontSize: parseInt(e.target.value) })}
                   className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                   style={{ accentColor: settings.primaryColor }}
                />
            </div>
          </div>

          <hr className="border-border" />

          {/* About / Authors */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">About</h3>
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Developed by:</p>
                <div className="flex flex-col gap-1">
                    <a href="https://github.com/rintaru123" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-2">
                        rintaru123
                    </a>
                    <span className="text-sm text-foreground/80">AI Assistant</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border/50">
                    Local Notes App v1.0.0
                </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
