import React, { useState } from 'react';
import { AppStatus, TranscriptData } from './types.ts';
import { getTranscriptFromLink, translateToBangla } from './services/geminiService.ts';
import { Button } from './components/Button.tsx';
import { TranscriptCard } from './components/TranscriptCard.tsx';
import { YoutubeIcon, SearchIcon } from './constants.tsx';

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
      console.error(err);
      setError(err.message || "ট্রান্সক্রিপ্ট সংগ্রহ করতে সমস্যা হয়েছে। দয়া করে সঠিক লিঙ্ক দিন।");
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
      alert("অনুবাদ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
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
            <YoutubeIcon />
          </div>
          <h1 className="text-xl font-bold tracking-tight">TubeTrans<span className="text-red-500">.</span></h1>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Github Repo</a>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="primary" className="text-sm px-4 py-1.5">Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            YouTube Transcript & <br />
            <span className="gradient-text">Bangla Translator.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Paste any YouTube video link below to generate a detailed transcript and translate it into Bangla instantly.
          </p>

          <form onSubmit={handleGenerate} className="max-w-3xl mx-auto relative">
            <div className="glass flex p-2 rounded-2xl border border-slate-700 focus-within:border-red-500/50 transition-all shadow-2xl">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube link (e.g. https://youtu.be/...)"
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-lg placeholder:text-slate-500"
              />
              <Button 
                type="submit"
                isLoading={status === AppStatus.LOADING}
                className="hidden md:flex min-w-[160px]"
              >
                <SearchIcon />
                Generate
              </Button>
            </div>
            <div className="md:hidden mt-4">
               <Button 
                type="submit"
                isLoading={status === AppStatus.LOADING}
                className="w-full"
              >
                <SearchIcon />
                Generate
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
              icon="🚀" 
              title="Fast Extraction" 
              description="Extract transcripts in seconds using advanced AI search grounding."
            />
            <FeatureCard 
              icon="🇧🇩" 
              title="Bangla Support" 
              description="High-quality translation into Bangla with native accuracy and natural tone."
            />
            <FeatureCard 
              icon="📦" 
              title="GitHub Deploy" 
              description="Optimized for direct deployment on GitHub Pages or other static platforms."
            />
          </div>
        )}
      </main>

      <footer className="mt-32 border-t border-slate-800 pt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} TubeTrans AI. All rights reserved.</p>
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