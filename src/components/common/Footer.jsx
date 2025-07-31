import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">FirstBorn</h3>
            <p className="text-gray-400">
              Platform podcast dengan merchandise eksklusif untuk para firstborn.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  {t('navigation.home')}
                </Link>
              </li>
              <li>
                <Link to="/content" className="text-gray-400 hover:text-white transition-colors">
                  {t('navigation.content')}
                </Link>
              </li>
              <li>
                <Link to="/merchandise" className="text-gray-400 hover:text-white transition-colors">
                  {t('navigation.merchandise')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/talk-to-us" className="text-gray-400 hover:text-white transition-colors">
                  {t('navigation.talkToUs')}
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Kebijakan Privasi
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: hello@firstborn.com</li>
              <li>Phone: +62 812 3456 7890</li>
              <li>Instagram: @firstborn_id</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 FirstBorn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;