
import React, { useState, useCallback } from 'react';
import { AppStatus, TranscriptData } from './types';
import { getTranscriptFromLink, translateToBangla } from './services/geminiService';
import { Button } from './components/Button';
import { TranscriptCard } from './components/TranscriptCard';
import { YOUTUBE_ICON, SEARCH_ICON } from './constants';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [data, setData] = useState<TranscriptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    setData(null);

    try {
      const result = await getTranscriptFromLink(url);
      setData(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve transcript. Please ensure it's a valid YouTube link.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleTranslate = async () => {
    if (!data || isTranslating) return;

    setIsTranslating(true);
    try {
      const translated = await translateToBangla(data.transcript);
      setData(prev => prev ? { ...prev, translation: translated } : null);
    } catch (err) {
      console.error("Translation error:", err);
      alert("Failed to translate. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8">
      {/* Header */}
      <nav className="py-6 flex items-center justify-between max-w-7xl mx-auto mb-12 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-2 rounded-lg text-white">
            {YOUTUBE_ICON}
          </div>
          <h1 className="text-xl font-bold tracking-tight">TubeTrans<span className="text-red-500">.</span></h1>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium hover:text-white text-slate-400">Sign In</button>
          <Button variant="primary" className="text-sm px-4 py-1.5">Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Unlock Video Knowledge <br />
            <span className="gradient-text">Translated to Bangla.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Instantly extract transcripts from any YouTube video and translate them into fluent Bangla. 
            Perfect for students, researchers, and creators.
          </p>

          <form onSubmit={handleGenerate} className="max-w-3xl mx-auto relative">
            <div className="glass flex p-2 rounded-2xl border border-slate-700 focus-within:border-red-500/50 transition-all shadow-2xl">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube video link here (e.g., https://youtube.com/watch?v=...)"
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-lg placeholder:text-slate-500"
              />
              <Button 
                type="submit"
                isLoading={status === AppStatus.LOADING}
                className="hidden md:flex min-w-[160px]"
              >
                {SEARCH_ICON}
                Generate
              </Button>
            </div>
            <div className="md:hidden mt-4">
               <Button 
                type="submit"
                isLoading={status === AppStatus.LOADING}
                className="w-full"
              >
                {SEARCH_ICON}
                Generate Transcript
              </Button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl inline-block">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {status === AppStatus.SUCCESS && data && (
          <TranscriptCard 
            data={data} 
            onTranslate={handleTranslate} 
            isTranslating={isTranslating} 
          />
        )}

        {/* Features / Placeholder */}
        {status === AppStatus.IDLE && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <FeatureCard 
              icon="⚡" 
              title="Lightning Fast" 
              description="AI-powered extraction means you get your transcript in seconds, not minutes."
            />
            <FeatureCard 
              icon="🇧🇩" 
              title="Native Bangla" 
              description="High-quality translation that understands context, technical terms, and nuances."
            />
            <FeatureCard 
              icon="📱" 
              title="Responsive Design" 
              description="Access your transcripts anywhere - on mobile, tablet, or desktop with ease."
            />
          </div>
        )}
      </main>

      <footer className="mt-32 border-t border-slate-800 pt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} TubeTrans AI. Powered by Gemini Pro. Deployable via GitHub.</p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="hover:text-red-500 transition-colors">Terms</a>
          <a href="#" className="hover:text-red-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-red-500 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="glass p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export default App;
