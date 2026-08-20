import React from 'react';
import { Home, BookOpen, Sparkles, BookMarked, MoreHorizontal } from 'lucide-react';
import { translations } from '../core/i18n';
import { Language } from '../core/i18n';

export type NavTab = 'home' | 'learn' | 'create' | 'vocabulary' | 'more';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language: Language;
  dueVocabCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  language,
  dueVocabCount = 0,
}) => {
  const t = translations[language];

  const tabs = [
    { id: 'home' as NavTab, label: t.navHome, icon: Home },
    { id: 'learn' as NavTab, label: t.navLearn, icon: BookOpen },
    { id: 'create' as NavTab, label: t.navCreate, icon: Sparkles, isCenter: true },
    { id: 'vocabulary' as NavTab, label: t.navVocabulary, icon: BookMarked, badge: dueVocabCount },
    { id: 'more' as NavTab, label: t.navMore, icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surfaceLight/95 dark:bg-surfaceDark/95 backdrop-blur-lg border-t border-borderLight dark:border-borderDark safe-bottom shadow-lg transition-colors">
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative -top-3 flex flex-col items-center group focus:outline-hidden"
                aria-label={tab.label}
              >
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-md transition-all transform active:scale-90 ${
                    isActive
                      ? 'bg-brand text-white ring-4 ring-brand-soft dark:ring-brand-darkSoft scale-105'
                      : 'bg-brand text-white hover:bg-brand-hover shadow-brand/20'
                  }`}
                >
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition-colors ${
                    isActive ? 'text-brand dark:text-accent' : 'text-textSecondaryLight dark:text-textSecondaryDark'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-brand dark:text-accent font-bold'
                  : 'text-textSecondaryLight dark:text-textSecondaryDark hover:text-textPrimaryLight dark:hover:text-textPrimaryDark'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-4 text-center shadow-xs animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-16">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-brand dark:bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
