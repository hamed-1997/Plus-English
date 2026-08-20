import React from 'react';
import { Flame, Globe, Sparkles, WifiOff } from 'lucide-react';
import { LearnerProfile, AppSettings } from '../types';
import { translations } from '../core/i18n';

interface HeaderProps {
  profile: LearnerProfile;
  settings: AppSettings;
  onToggleLanguage: () => void;
  onOpenSettings?: () => void;
  isOffline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  settings,
  onToggleLanguage,
  onOpenSettings,
  isOffline = false,
}) => {
  const t = translations[settings.language];

  return (
    <header className="sticky top-0 z-40 bg-bgLight/90 dark:bg-bgDark/90 backdrop-blur-md border-b border-borderLight dark:border-borderDark transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-sm text-white font-black text-xl tracking-tight select-none relative overflow-hidden group">
            <span className="font-display">E</span>
            <span className="text-accent text-sm -mt-2 -ml-0.5 font-bold">+</span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-textPrimaryLight dark:text-textPrimaryDark">
                English<span className="text-brand dark:text-accent font-extrabold">+</span>
              </span>
              {isOffline && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </span>
              )}
            </div>
            <p className="text-[11px] text-textSecondaryLight dark:text-textSecondaryDark leading-none">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Chips */}
        <div className="flex items-center gap-2">
          {/* Day Streak Chip */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-bold"
            title={`${profile.streakDays} ${t.streak}`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{profile.streakDays}</span>
          </div>

          {/* Language Toggle Button (EN / FA) */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surfaceLight dark:bg-surfaceDark border border-borderLight dark:border-borderDark hover:border-brand/40 text-textPrimaryLight dark:text-textPrimaryDark text-xs font-semibold shadow-2xs transition-all active:scale-95"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-brand dark:text-accent" />
            <span>{settings.language === 'fa' ? 'English' : 'فارسی'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
