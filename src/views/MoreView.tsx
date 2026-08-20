import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Gauge,
  Key,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileJson,
  User,
  Target,
  Award,
  Sparkles,
} from 'lucide-react';
import { AppSettings, LearnerProfile, CefrLevel } from '../types';
import { CEFRBadge } from '../components/CEFRBadge';
import { storage } from '../core/storage';
import { translations, Language } from '../core/i18n';

interface MoreViewProps {
  settings: AppSettings;
  profile: LearnerProfile;
  language: Language;
  onSettingsUpdated: (newSettings: AppSettings) => void;
  onProfileUpdated: (newProfile: LearnerProfile) => void;
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  settings,
  profile,
  language,
  onSettingsUpdated,
  onProfileUpdated,
  onToast,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.theme);
  const [currentLang, setCurrentLang] = useState<Language>(settings.language);
  const [audioSpeed, setAudioSpeed] = useState<number>(settings.audioSpeed || 1.0);
  const [customApiKey, setCustomApiKey] = useState<string>(settings.customApiKey || '');
  const [dailyGoal, setDailyGoal] = useState<number>(profile.dailyGoalMinutes || 15);
  const [currentCefr, setCurrentCefr] = useState<CefrLevel>(profile.currentCefr);
  const [targetCefr, setTargetCefr] = useState<CefrLevel>(profile.targetCefr);
  const [saving, setSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const updatedSettings = await storage.updateSettings({
        theme,
        language: currentLang,
        audioSpeed,
        customApiKey: customApiKey.trim() || undefined,
      });

      const updatedProfile = await storage.updateProfile({
        dailyGoalMinutes: dailyGoal,
        currentCefr,
        targetCefr,
      });

      onSettingsUpdated(updatedSettings);
      onProfileUpdated(updatedProfile);
      onToast(t.saveSettings + ' ✓', 'success');
    } catch (e: any) {
      onToast('Error saving settings: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const json = await storage.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `english-plus-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast(t.backupSuccess, 'success');
    } catch (e: any) {
      onToast('Backup export failed: ' + e.message, 'error');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await storage.importBackup(content);
      if (res.success) {
        onToast(t.restoreSuccess, 'success');
        const [freshProfile, freshSettings] = await Promise.all([
          storage.getProfile(),
          storage.getSettings(),
        ]);
        onProfileUpdated(freshProfile);
        onSettingsUpdated(freshSettings);
      } else {
        onToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-1">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-brand dark:text-accent" />
          <h1 className="text-xl font-black text-textPrimaryLight dark:text-textPrimaryDark tracking-tight">
            {t.settings}
          </h1>
        </div>
        <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark">
          {language === 'fa' ? 'مدیریت اهداف یادگیری، ظاهر برنامه، کلید جمینای و پشتیبان‌گیری' : 'Configure learning goals, interface appearance, AI keys, and backups'}
        </p>
      </div>

      {/* 1. CEFR Goals & Profile Settings */}
      <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-textPrimaryLight dark:text-textPrimaryDark">
          <Target className="w-4 h-4 text-brand dark:text-accent" />
          <span>{language === 'fa' ? 'اهداف و سطح یادگیری' : 'Learning Goals & CEFR'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block mb-1.5">
              {language === 'fa' ? 'سطح فعلی شما (CEFR)' : 'Current CEFR Level'}
            </label>
            <select
              value={currentCefr}
              onChange={(e) => setCurrentCefr(e.target.value as CefrLevel)}
              className="w-full px-3.5 py-2 rounded-xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border border-borderLight dark:border-borderDark text-xs font-bold focus:outline-hidden focus:border-brand"
            >
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block mb-1.5">
              {language === 'fa' ? 'سطح هدف (Target CEFR)' : 'Target CEFR Level'}
            </label>
            <select
              value={targetCefr}
              onChange={(e) => setTargetCefr(e.target.value as CefrLevel)}
              className="w-full px-3.5 py-2 rounded-xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border border-borderLight dark:border-borderDark text-xs font-bold focus:outline-hidden focus:border-brand"
            >
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block mb-1.5">
            {language === 'fa' ? 'هدف مطالعه روزانه (دقیقه)' : 'Daily Study Goal (Minutes)'}
          </label>
          <div className="flex items-center gap-2">
            {[10, 15, 20, 30].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDailyGoal(m)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  dailyGoal === m
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-textSecondaryLight dark:text-textSecondaryDark border border-borderLight dark:border-borderDark hover:border-brand/40'
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Theme & Interface Language */}
      <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-textPrimaryLight dark:text-textPrimaryDark">
          <Globe className="w-4 h-4 text-brand dark:text-accent" />
          <span>{language === 'fa' ? 'ظاهر و زبان رابط کاربری' : 'Appearance & Language'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block mb-1.5">
              {t.theme}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'light'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-textSecondaryLight dark:text-textSecondaryDark border border-borderLight dark:border-borderDark'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? 'روشن' : 'Light'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'dark'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-textSecondaryLight dark:text-textSecondaryDark border border-borderLight dark:border-borderDark'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? 'تیره' : 'Dark'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block mb-1.5">
              {t.languageSetting}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCurrentLang('fa')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  currentLang === 'fa'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-textSecondaryLight dark:text-textSecondaryDark border border-borderLight dark:border-borderDark'
                }`}
              >
                فارسی (RTL)
              </button>

              <button
                type="button"
                onClick={() => setCurrentLang('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  currentLang === 'en'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-surfaceElevatedLight dark:bg-surfaceElevatedDark text-textSecondaryLight dark:text-textSecondaryDark border border-borderLight dark:border-borderDark'
                }`}
              >
                English (LTR)
              </button>
            </div>
          </div>
        </div>

        {/* Custom API Key Input */}
        <div className="pt-2">
          <label className="text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark block mb-1.5">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-brand dark:text-accent" />
              {t.customApiKey}
            </span>
          </label>
          <input
            type="password"
            value={customApiKey}
            onChange={(e) => setCustomApiKey(e.target.value)}
            placeholder="AI Studio manages Gemini key automatically. Provide only if using personal quota."
            className="w-full px-3.5 py-2 rounded-xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border border-borderLight dark:border-borderDark text-xs focus:outline-hidden focus:border-brand font-mono"
          />
        </div>

        {/* Save Action Button */}
        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-md transition-all active:scale-98"
        >
          {t.saveSettings}
        </button>
      </div>

      {/* 3. Data Backup & Restore */}
      <div className="rounded-3xl bg-surfaceLight dark:bg-surfaceDark p-6 shadow-xs border border-borderLight dark:border-borderDark space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-textPrimaryLight dark:text-textPrimaryDark">
          <FileJson className="w-4 h-4 text-brand dark:text-accent" />
          <span>{t.backupAndData}</span>
        </div>

        <p className="text-xs text-textSecondaryLight dark:text-textSecondaryDark leading-relaxed">
          {language === 'fa'
            ? 'تمامی اطلاعات واژگان، وضعیت لایتنر، درس‌های تولید شده و تاریخچه مطالعه درون حافظه آفلاین مرورگر شما ذخیره شده است. می‌توانید نسخه کامل را دانلود کنید یا در دستگاه دیگر بازیابی نمایید.'
            : 'Export or restore your full offline study records, Leitner boxes, and generated lessons.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExportBackup}
            className="py-3 px-4 rounded-xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border border-borderLight dark:border-borderDark hover:border-brand/40 text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark flex items-center justify-center gap-2 shadow-2xs active:scale-98 transition-all"
          >
            <Download className="w-4 h-4 text-brand dark:text-accent" />
            <span>{t.exportBackup}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-4 rounded-xl bg-surfaceElevatedLight dark:bg-surfaceElevatedDark border border-borderLight dark:border-borderDark hover:border-brand/40 text-xs font-bold text-textPrimaryLight dark:text-textPrimaryDark flex items-center justify-center gap-2 shadow-2xs active:scale-98 transition-all"
          >
            <Upload className="w-4 h-4 text-brand dark:text-accent" />
            <span>{t.importBackup}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
