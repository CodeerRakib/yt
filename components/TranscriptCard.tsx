import React, { useState } from 'react';
import { TranscriptData } from '../types.ts';
import { Button } from './Button.tsx';
import { TranslateIcon } from '../constants.tsx';

interface TranscriptCardProps {
  data: TranscriptData;
  onTranslate: () => Promise<void>;
  isTranslating: boolean;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({ data, onTranslate, isTranslating }) => {
  const [view, setView] = useState<'english' | 'bangla' | 'both'>('english');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="glass rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{data.title}</h2>
            <p className="text-slate-400">Channel: <span className="text-red-400">{data.author}</span></p>
          </div>
          
          <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg">
            <button 
              onClick={() => setView('english')}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${view === 'english' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              English
            </button>
            <button 
              onClick={() => setView('bangla')}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${view === 'bangla' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
              disabled={!data.translation}
            >
              বাংলা
            </button>
            <button 
              onClick={() => setView('both')}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${view === 'both' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
              disabled={!data.translation}
            >
              Side by Side
            </button>
          </div>
        </div>

        <div className="aspect-video w-full rounded-xl overflow-hidden mb-8 border border-slate-700 bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${data.videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {!data.translation && (
          <div className="flex justify-center mb-8">
            <Button 
              onClick={onTranslate} 
              isLoading={isTranslating}
              variant="secondary"
              className="bg-indigo-600 hover:bg-indigo-700 border-none shadow-indigo-900/20"
            >
              <TranslateIcon />
              Translate to Bangla
            </Button>
          </div>
        )}

        <div className={`grid gap-6 ${view === 'both' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {(view === 'english' || view === 'both') && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-700 pb-2">
                <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                Original Transcript
              </h3>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700">
                {data.transcript}
              </div>
            </div>
          )}

          {(view === 'bangla' || view === 'both') && data.translation && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-700 pb-2 bangla-font">
                <span className="w-2 h-6 bg-green-600 rounded-full"></span>
                বাংলা অনুবাদ
              </h3>
              <div className="bangla-font text-xl text-slate-200 leading-loose whitespace-pre-wrap max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700">
                {data.translation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};