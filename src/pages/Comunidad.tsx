import { motion } from 'framer-motion';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { Section, SectionHeader } from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Newspaper, 
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  Clock
} from 'lucide-react';

// Placeholder news data
const news = [
  {
    id: 1,
    title: 'Matrículas 2026 Abiertas',
    excerpt: 'Inicia el proceso de inscripción para el próximo año escolar. ¡Cupos limitados!',
    date: '[FECHA_PLACEHOLDER]',
    category: 'Admisiones',
    color: 'bg-pastel-pink',
  },
  {
    id: 2,
    title: 'Día del Estudiante',
    excerpt: 'Celebramos a nuestros estudiantes con actividades especiales y mucha diversión.',
    date: '[FECHA_PLACEHOLDER]',
    category: 'Eventos',
    color: 'bg-pastel-blue',
  },
  {
    id: 3,
    title: 'Feria de Ciencias',
    excerpt: 'Nuestros estudiantes presentaron proyectos innovadores en la feria anual de ciencias.',
    date: '[FECHA_PLACEHOLDER]',
    category: 'Académico',
    color: 'bg-pastel-green',
  },
];

const events = [
  {
    id: 1,
    title: 'Reunión de Padres',
    date: '[FECHA_PLACEHOLDER]',
    time: '[HORA_PLACEHOLDER]',
  },
  {
    id: 2,
    title: 'Festival de Navidad',
    date: '[FECHA_PLACEHOLDER]',
    time: '[HORA_PLACEHOLDER]',
  },
  {
    id: 3,
    title: 'Clausura del Año Escolar',
    date: '[FECHA_PLACEHOLDER]',
    time: '[HORA_PLACEHOLDER]',
  },
];

// Placeholder gallery images
const galleryImages = [
  { id: 1, alt: 'Actividad escolar' },
  { id: 2, alt: 'Clase de arte' },
  { id: 3, alt: 'Recreo' },
  { id: 4, alt: 'Evento especial' },
  { id: 5, alt: 'Graduación' },
  { id: 6, alt: 'Deportes' },
];

export default function Comunidad() {
  const [activeTab, setActiveTab] = useState<'noticias' | 'eventos' | 'galeria'>('noticias');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 hero-gradient">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading font-bold text-4xl lg:text-5xl text-foreground mb-6">
              Nuestra Comunidad
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Mantente al día con las últimas noticias, eventos y momentos especiales 
              de nuestra familia Golden Heaven.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <Section>
        <div className="flex justify-center gap-4 mb-12">
          {[
            { id: 'noticias', label: 'Noticias', icon: Newspaper },
            { id: 'eventos', label: 'Eventos', icon: Calendar },
            { id: 'galeria', label: 'Galería', icon: ImageIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* News Tab */}
        {activeTab === 'noticias' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item, index) => (
                <motion.article
                  key={item.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-soft border border-border/50 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className={`h-32 ${item.color} flex items-center justify-center`}>
                    <Newspaper className="h-12 w-12 text-foreground/30" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.color} text-foreground/80`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">{item.excerpt}</p>
                    <span className="inline-flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all cursor-pointer">
                      Leer más <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground text-sm">
                Próximamente más noticias y actualizaciones...
              </p>
            </div>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'eventos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="space-y-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  className="bg-card rounded-xl p-6 shadow-soft border border-border/50 flex items-center gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg text-foreground mb-1">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {event.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground text-sm mb-4">
                Mantente informado sobre próximos eventos
              </p>
              <Button variant="outline" asChild>
                <Link to="/contacto">Contáctanos para más información</Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'galeria' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  className="aspect-square bg-secondary rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-center p-4">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2 group-hover:text-primary transition-colors" />
                    <p className="text-xs text-muted-foreground">{image.alt}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground text-sm mb-4">
                Visita nuestra página de Facebook para ver más fotos
              </p>
              <Button variant="outline" asChild>
                <a 
                  href="https://www.facebook.com/profile.php?id=100063931126975" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en Facebook
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </Section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container text-center">
          <h2 className="font-heading font-bold text-2xl lg:text-3xl text-primary-foreground mb-4">
            ¿Quieres ser parte de nuestra comunidad?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            Inscribe a tu hijo y únete a las familias que confían en nosotros.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/admisiones">Comenzar Inscripción</Link>
          </Button>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
