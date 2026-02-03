import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { Section, SectionHeader } from '@/components/shared/Section';
import { FeatureCard, ProgramCard, TestimonialCard } from '@/components/shared/Cards';
import { Heart, BookOpen, Users, Shield, Award, GraduationCap, Calendar, Phone, Star } from 'lucide-react';

import heroImage from '@/assets/hero-classroom.jpg';
import kinderImage from '@/assets/kinder-hero.jpg';
import primariaImage from '@/assets/primaria-hero.jpg';
import logo from '@/assets/logo.png';

const features = [
  {
    icon: Heart,
    title: 'Valores Cristianos',
    description: 'Formamos niños con amor, respeto y principios que guiarán su vida.',
    color: 'pink' as const,
  },
  {
    icon: BookOpen,
    title: 'Excelencia Académica',
    description: 'Currículo actualizado y metodologías innovadoras para un aprendizaje significativo.',
    color: 'blue' as const,
  },
  {
    icon: Users,
    title: 'Atención Personalizada',
    description: 'Grupos reducidos que permiten acompañar el desarrollo único de cada estudiante.',
    color: 'green' as const,
  },
  {
    icon: Shield,
    title: 'Ambiente Seguro',
    description: 'Instalaciones protegidas y supervisión constante para tu tranquilidad.',
    color: 'yellow' as const,
  },
];

const programs = [
  {
    image: kinderImage,
    // Título grande
    title: 'Pre-kínder 4 años',
    // Badge superior
    subtitle: 'Pre-kínder',
    description: 'Desarrollo integral para los más pequeños a través del juego y el descubrimiento.',
    href: '/academico#kinder',
    color: 'pink' as const,
  },
  {
    image: kinderImage,
    title: 'Kínder 5 años',
    subtitle: 'Kínder',
    description: 'Preparación sólida para el ingreso exitoso a la educación primaria.',
    href: '/academico#kinder-plus',
    color: 'blue' as const,
  },
  {
    image: primariaImage,
    title: 'Primaria',
    subtitle: '1° a 6° Grado',
    description: 'Educación de calidad con énfasis en lectura, matemáticas y valores.',
    href: '/academico#primaria',
    color: 'green' as const,
  },
];

const testimonials = [
  {
    quote:
      'Mi hijo ha crecido tanto académica como personalmente. Los maestros son dedicados y realmente se preocupan por cada estudiante.',
    author: 'María González',
    role: 'Madre de estudiante de 3° grado',
  },
  {
    quote:
      'El ambiente familiar y los valores que enseñan hacen la diferencia. Estamos muy agradecidos de ser parte de esta comunidad.',
    author: 'Carlos Pérez',
    role: 'Padre de estudiante de Kínder',
  },
  {
    quote:
      'Excelente institución. La comunicación con los padres es constante y el portal nos permite seguir el progreso de nuestros hijos.',
    author: 'Ana Rodríguez',
    role: 'Madre de estudiantes de 2° y 5° grado',
  },
];

const stats = [
  { value: '15+', label: 'Años de experiencia' },
  { value: 'Muchas', label: 'Familias confían en nosotros' },
  { value: '98%', label: 'Satisfacción de padres' },
  { value: '100%', label: 'Compromiso con tu hijo' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Ambiente educativo" className="w-full h-full object-cover" />
          {/* NO TOCAR: se deja EXACTO como lo tenías */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/20 to-background/10" />
        </div>

        <div className="container relative z-10 py-16 lg:py-24">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Marca arriba (solo “Golden Heaven”) */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-soft">
                  <img src={logo} alt="Logo" className="w-10 h-10" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm text-foreground/80 font-medium drop-shadow-sm">
                    Centro Educativo El Buen Pastor
                  </p>
                  <p className="font-heading font-bold text-lg">
                    <span translate="no" className="notranslate text-golden font-extrabold drop-shadow-sm">
                      Golden Heaven
                    </span>
                  </p>
                </div>
              </div>

              <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6 leading-tight drop-shadow-sm">
                Formando niños con <span className="text-primary">valores</span>, amor y{' '}
                <span className="text-golden font-extrabold drop-shadow-sm">excelencia</span>
                <span className="text-primary">.</span>
              </h1>

              <p className="text-lg text-foreground font-semibold mb-8 leading-relaxed drop-shadow-sm">
                En el Centro Educativo El Buen Pastor Golden Heaven, cada niño es único. Ofrecemos educación de calidad
                desde preescolar hasta primaria, en un ambiente seguro y lleno de amor.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="cta" size="xl" asChild>
                  <Link to="/admisiones">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    ¡Inscríbete Ahora!
                  </Link>
                </Button>

                <Button variant="outline" size="xl" asChild>
                  <a href="tel:+50764616826">
                    <Phone className="h-5 w-5 mr-2" />
                    Llámanos
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="mt-12 flex items-center gap-6 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-bold text-primary"
                    >
                      {['M', 'P', 'A', 'C'][i - 1]}
                    </div>
                  ))}
                </div>

                {/* MÁS GRANDE (similar al texto de arriba) */}
                <span className="text-base sm:text-lg text-foreground font-semibold drop-shadow-sm">
                  Muchas familias confían en nosotros
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* ESTRELLAS MÁS GRANDES + MÁS “PRESENTES” */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 sm:h-6 sm:w-6 fill-golden text-golden drop-shadow-sm" />
                ))}
                <span className="text-base sm:text-lg text-foreground font-semibold ml-2 drop-shadow-sm">
                  Recomendado por padres
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Why Choose Us Section */}
      <Section className="section-gradient">
        <SectionHeader
          badge="¿Por qué elegirnos?"
          title="Una educación que marca la diferencia"
          subtitle="Combinamos excelencia académica con formación en valores para preparar a los líderes del mañana."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Programs Section */}
      <Section>
        <SectionHeader
          badge="Oferta Académica"
          title="Programas diseñados para cada etapa"
          subtitle="Desde los primeros pasos en preescolar hasta la culminación de primaria, acompañamos el crecimiento de tu hijo."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={`${program.subtitle}-${program.title}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <ProgramCard {...program} />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button variant="outline" size="lg" asChild>
            <Link to="/academico">Ver todos los programas</Link>
          </Button>
        </motion.div>
      </Section>

      {/* Stats Section */}
      <section className="py-16 bg-primary">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="font-heading font-bold text-4xl lg:text-5xl text-primary-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-primary-foreground/80 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Section className="section-gradient">
        <SectionHeader
          badge="Testimonios"
          title="Lo que dicen nuestras familias"
          subtitle="La satisfacción de nuestras familias es nuestra mayor recompensa."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img src={logo} alt="Logo" className="h-24 w-24 mx-auto mb-6" />

            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-4">
              ¿Listo para ser parte de nuestra familia?
            </h2>

            <p className="text-muted-foreground text-lg mb-8">
              Las matrículas para el año escolar 2026 están abiertas. No pierdas la oportunidad de brindarle a tu hijo
              la mejor educación.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="cta" size="xl" asChild>
                <Link to="/admisiones">
                  <Calendar className="h-5 w-5 mr-2" />
                  Iniciar Proceso de Matrícula
                </Link>
              </Button>

              <Button variant="outline" size="xl" asChild>
                <Link to="/contacto">Solicitar Información</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <Award className="h-8 w-8 text-golden mb-3" />
                <h3 className="font-heading font-bold text-lg mb-2">Educación de calidad</h3>
                <p className="text-muted-foreground text-sm">Currículo actualizado y enfoque integral</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <Heart className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-heading font-bold text-lg mb-2">Ambiente familiar</h3>
                <p className="text-muted-foreground text-sm">Valores y amor en cada aprendizaje</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <Shield className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-heading font-bold text-lg mb-2">Seguridad y confianza</h3>
                <p className="text-muted-foreground text-sm">Instalaciones seguras y supervisión constante</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
