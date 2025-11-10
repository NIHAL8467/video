
import React, { useState, useEffect, useCallback } from 'react';
import { generateVideo } from './services/geminiService';
import { AspectRatio } from './types';
import { ApiKeySelector } from './components/ApiKeySelector';
import { LoadingState } from './components/LoadingState';
import { LandscapeIcon, PortraitIcon, DownloadIcon } from './components/icons';

const VideoGenerator: React.FC<{
  onGenerate: (prompt: string, aspectRatio: AspectRatio) => void;
}> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, aspectRatio);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Video Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A neon hologram of a cat driving at top speed"
          className="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</span>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setAspectRatio('16:9')}
            className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg transition ${
              aspectRatio === '16:9' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
            }`}
          >
            <LandscapeIcon className="w-6 h-6 mr-2" /> 16:9 Landscape
          </button>
          <button
            type="button"
            onClick={() => setAspectRatio('9:16')}
            className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg transition ${
              aspectRatio === '9:16' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
            }`}
          >
            <PortraitIcon className="w-6 h-6 mr-2" /> 9:16 Portrait
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-3 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
        disabled={!prompt.trim()}
      >
        Generate Video
      </button>
    </form>
  );
};


const App: React.FC = () => {
  const [isKeySelected, setIsKeySelected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true to check key
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const checkApiKey = useCallback(async () => {
    try {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setIsKeySelected(true);
      } else {
        setIsKeySelected(false);
      }
    } catch (e) {
      console.error("Error checking for API key:", e);
      setIsKeySelected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Optimistically assume key selection is successful to avoid race conditions
      setIsKeySelected(true);
      setIsLoading(false);
    } catch (e) {
      console.error("Error opening key selector:", e);
      setError("Could not open the API key selector. Please try again.");
    }
  };

  const handleGenerate = async (prompt: string, aspectRatio: AspectRatio) => {
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    try {
      const url = await generateVideo(prompt, aspectRatio);
      setVideoUrl(url);
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message || "An unknown error occurred during video generation.";
      setError(errorMessage);
      // If error suggests API key issue, prompt user to select again.
      if (errorMessage.includes("Requested entity was not found")) {
        setError("Your API key is invalid or not found. Please select a valid key.");
        setIsKeySelected(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><LoadingState /></div>;
    }
    
    if (!isKeySelected) {
      return <ApiKeySelector onSelectKey={handleSelectKey} />;
    }

    if (isGenerating) {
        return <LoadingState />;
    }

    if (videoUrl) {
      return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center">Your Video is Ready!</h3>
            <video src={videoUrl} controls className="w-full rounded-lg shadow-lg" />
            <div className="flex flex-col sm:flex-row gap-4">
                <a 
                    href={videoUrl} 
                    download={`veo-video-${Date.now()}.mp4`}
                    className="flex-1 flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                >
                    <DownloadIcon className="w-6 h-6 mr-2" /> Download Video
                </a>
                <button
                    onClick={() => setVideoUrl(null)}
                    className="flex-1 px-6 py-3 text-lg font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                >
                    Create Another
                </button>
            </div>
        </div>
      )
    }

    return (
        <>
            {error && (
                <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <VideoGenerator onGenerate={handleGenerate} />
        </>
    );
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Veo Video Generator
          </h1>
          <p className="mt-3 text-lg text-gray-400">Bring your creative ideas to life with AI-powered video.</p>
        </header>
        <main className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
