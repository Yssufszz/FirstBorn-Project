import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguageContext } from '../../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguageContext();

  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 p-2 text-gray-700 hover:text-primary-600 transition-colors">
        <Globe size={20} />
        <span className="text-sm font-medium uppercase">{currentLanguage}</span>
      </button>

      <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="py-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100 ${
                currentLanguage === language.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
              }`}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;