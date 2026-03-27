import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import {
  ClipboardCheck,
  Users,
  MessageSquare,
  Heart,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: ClipboardCheck,
      title: t('home.features.screening.title'),
      description: t('home.features.screening.description'),
    },
    {
      icon: Users,
      title: t('home.features.matching.title'),
      description: t('home.features.matching.description'),
    },
    {
      icon: MessageSquare,
      title: t('home.features.support.title'),
      description: t('home.features.support.description'),
    },
  ];

  const benefits = [
    { icon: Shield, text: '100% Confidential & Secure' },
    { icon: Clock, text: '24/7 Access to Support' },
    { icon: Heart, text: 'Designed for Students' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-4"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  {t('home.heroTitle')}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  {t('home.heroSubtitle')}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="gap-1">
                      {t('nav.dashboard')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="gap-1">
                        {t('home.getStarted')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/screening">
                      <Button size="lg" variant="outline">
                        {t('home.learnMore')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <benefit.icon className="h-4 w-4 text-primary" />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto lg:ml-auto flex items-center justify-center"
            >
              <div className="relative w-full max-w-[500px] aspect-square">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl transform rotate-3" />
                <div className="absolute inset-0 bg-card border rounded-3xl shadow-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">
                      {t('appName')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('appDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              {t('home.featuresTitle')}
            </h2>
            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-lg">
              Our platform provides comprehensive mental health support tailored for students.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl transform group-hover:scale-[1.02] transition-transform" />
                <div className="relative p-8 border rounded-2xl bg-card">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-muted-foreground md:text-lg mb-8">
              {t('home.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/screening">
                  <Button size="lg">{t('screening.title')}</Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg">{t('home.getStarted')}</Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline">
                      {t('login')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
