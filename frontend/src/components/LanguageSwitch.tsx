import { useI18n } from '../i18n';
import './LanguageSwitch.css';

export function LanguageSwitch() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="language-switch">
      <button
        className={`lang-btn ${language === 'zh' ? 'active' : ''}`}
        onClick={() => setLanguage('zh')}
        title="中文"
      >
        中
      </button>
      <button
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
