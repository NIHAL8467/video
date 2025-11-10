
import React from 'react';

interface ApiKeySelectorProps {
  onSelectKey: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSelectKey }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-2xl shadow-lg text-center">
        <h2 className="text-3xl font-bold text-white">Welcome to Veo Video Generator</h2>
        <p className="text-gray-300">
          To generate videos, you need to select an API key associated with a Google Cloud project with billing enabled.
        </p>
        <p className="text-sm text-gray-400">
          For more information on setting up billing, please visit the{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            official documentation
          </a>.
        </p>
        <button
          onClick={onSelectKey}
          className="w-full px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
};
