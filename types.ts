export type AspectRatio = '16:9' | '9:16';

// This is a global declaration to extend the Window interface
declare global {
  // Fix: Define a named interface for aistudio to resolve declaration conflicts.
  // The error message "Property 'aistudio' must be of type 'AIStudio'" indicates
  // that another global type declaration expects this named interface.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}
