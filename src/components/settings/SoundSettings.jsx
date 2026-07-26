import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Music, Sparkles } from 'lucide-react';

const SOUNDS = [
  { id: 'rain', name: 'Rainfall', desc: 'Soothing rain drops', url: 'https://assets.mixkit.co/active_storage/sfx/2513/2513-84.wav' },
  { id: 'forest', name: 'Forest Birds', desc: 'Nature chirping loops', url: 'https://assets.mixkit.co/active_storage/sfx/1233/1233-84.wav' },
  { id: 'ocean', name: 'Ocean Waves', desc: 'Rhythmic coastal waves', url: 'https://assets.mixkit.co/active_storage/sfx/1653/1653-84.wav' },
  { id: 'cafe', name: 'Café Ambient', desc: 'Muffled chatter & coffee mugs', url: 'https://assets.mixkit.co/active_storage/sfx/1853/1853-84.wav' },
  { id: 'white-noise', name: 'White Noise', desc: 'Steady static hum frequency', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav' },
];

export default function SoundSettings() {
  const audioRef = useRef(null);
  const [activeTrack, setActiveTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    // Load previously selected sound settings if any
    const savedSound = localStorage.getItem('focusflow_sound_settings');
    if (savedSound) {
      try {
        const data = JSON.parse(savedSound);
        if (data.volume !== undefined) setVolume(Number(data.volume));
      } catch (e) {
        console.warn("Failed to load sound configurations:", e);
      }
    }

    return () => {
      // Pause track when unmounting
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem('focusflow_sound_settings', JSON.stringify({ volume }));
  }, [volume]);

  const handlePlayTrack = (soundId) => {
    const sound = SOUNDS.find(s => s.id === soundId);
    if (!sound) return;

    if (activeTrack === soundId) {
      // Toggle play/pause on current active track
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(e => console.warn(e));
      }
      return;
    }

    // Stop and pause old audio elements
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(sound.url);
    audio.loop = true;
    audio.volume = volume;

    audio.play().then(() => {
      audioRef.current = audio;
      setActiveTrack(soundId);
      setIsPlaying(true);
    }).catch(err => {
      console.warn("Failed to play ambient track, utilizing UI-only state:", err);
      // Fallback: update state even if file fails to fetch, so UI responds
      setActiveTrack(soundId);
      setIsPlaying(true);
    });
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setActiveTrack(null);
  };

  const currentPlayingTrack = SOUNDS.find(s => s.id === activeTrack);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Ambient Sound Player
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Play background soundscapes to mask distracting noises and trigger flow state
        </p>
      </div>

      {/* Main Player Hub */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isPlaying ? 'bg-indigo-500 text-white animate-spin-slow' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'} transition-all`}>
              <Music className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Currently Playing
              </span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {isPlaying && currentPlayingTrack ? currentPlayingTrack.name : 'None (Select a track below)'}
              </span>
            </div>
          </div>

          {/* Quick Playback controls */}
          <div className="flex items-center gap-3">
            {activeTrack && (
              <>
                <button
                  onClick={() => handlePlayTrack(activeTrack)}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
                </button>
                <button
                  onClick={handleStop}
                  className="p-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all"
                  title="Stop Audio"
                >
                  <Square className="h-4.5 w-4.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Volume controls */}
        <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 accent-indigo-500 h-1.5 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-800"
          />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Tracks Selection Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Select Background Loops
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SOUNDS.map((sound) => {
            const isCurrent = activeTrack === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => handlePlayTrack(sound.id)}
                className={`group flex items-center justify-between p-4 rounded-xl border text-left hover:scale-[1.01] transition-all duration-200 ${
                  isCurrent 
                    ? 'border-indigo-500 bg-indigo-500/5 dark:border-indigo-500/30' 
                    : 'border-slate-100 bg-slate-50/20 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950/10 dark:hover:border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {sound.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight">
                    {sound.desc}
                  </span>
                </div>

                <div className={`p-2 rounded-lg transition-colors ${
                  isCurrent 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:text-indigo-500'
                }`}>
                  {isCurrent && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
