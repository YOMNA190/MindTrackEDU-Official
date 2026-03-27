import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Phone } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      {/* Emergency Banner */}
      <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30">
        <div className="container py-3 flex items-center justify-center gap-2 text-sm text-red-700 dark:text-red-400">
          <Phone className="h-4 w-4" />
          <span>{t('footer.emergency')}</span>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MT</span>
              </div>
              <span className="font-semibold text-lg">{t('appName')}</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              {t('appDescription')}. {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('nav.home')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/screening"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('nav.screening')}
                </Link>
              </li>
              <li>
                <Link
                  to="/therapy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('nav.therapy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {t('appName')} <Heart className="h-3 w-3 text-red-500 fill-red-500" />{' '}
            {t('appDescription')}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
