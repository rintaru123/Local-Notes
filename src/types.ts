export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface ElectronAPI {
  openFile: () => Promise<{ canceled: boolean; filePath?: string; content?: string }>;
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean }>;
  saveAsFile: (content: string) => Promise<{ canceled: boolean; filePath?: string }>;
  getSettings: () => Promise<Settings | null>;
  saveSettings: (settings: Settings) => Promise<{ success: boolean }>;
}

export interface Settings {
  primaryColor: string; // Hex code or predefined name
  themeMode: 'light' | 'dark' | 'matrix';
  fontSize: number; // UI Font Size
  editorFontSize: number; // Editor Font Size
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
