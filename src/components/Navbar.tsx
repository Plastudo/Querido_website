import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'pt' ? 'en' : 'pt');
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex items-center justify-between">
      <div className="flex gap-6">
        <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
          {t('nav.home')}
        </Link>
        <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">
          {t('nav.about')}
        </Link>
        <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium">
          {t('nav.contact')}
        </Link>
      </div>
      <button
        onClick={toggleLang}
        className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-100"
      >
        {i18n.language === 'pt' ? 'EN' : 'PT'}
      </button>
    </nav>
  );
}
