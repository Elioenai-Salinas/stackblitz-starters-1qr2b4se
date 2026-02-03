import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { Section, SectionHeader } from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Palette, 
  Music, 
  Calculator,
  Globe,
  Heart,
  Users,
  GraduationCap,
  CheckCircle
} from 'lucide-react';

import kinderImage from '@/assets/kinder-hero.jpg';
import primariaImage from '@/assets/primaria-hero.jpg';

const programs = [
  {
    id: 'kinder',
    title: 'Kínder',
    subtitle: '3-4 años',
    description: 'Primera experiencia escolar donde el aprendizaje se da a través del juego, la exploración y el descubrimiento.',
    image: kinderImage,
    color: 'bg-pastel-pink',
    features: [
      'Desarrollo de motricidad fina y gruesa',
      'Estimulación del lenguaje',
      'Iniciación a la lectoescritura',
      'Socialización y valores',
      'Arte y expresión creativa',
      'Inglés básico',
    ],
  },
  {
    id: 'kinder-plus',
    title: 'Kínder+',
    subtitle: '5 años',
    description: 'Programa de transición que prepara a los niños para el éxito en la educación primaria con bases sólidas.',
    image: kinderImage,
    color: 'bg-pastel-blue',
    features: [
      'Lectoescritura avanzada',
      'Matemáticas básicas',
      'Preparación para primer grado',
      'Desarrollo de hábitos de estudio',
      'Inglés interactivo',
      'Valores y convivencia',
    ],
  },
  {
    id: 'primaria',
    title: 'Primaria',
    subtitle: '1° a 6° Grado',
    description: 'Formación integral con énfasis en el desarrollo académico, valores cristianos y habilidades para la vida.',
    image: primariaImage,
    color: 'bg-pastel-green',
    features: [
      'Currículo MEDUCA actualizado',
      'Inglés intensivo',
      'Matemáticas y ciencias',
      'Español y literatura',
      'Formación en valores',
      'Arte, música y educación física',
    ],
  },
];

const subjects = [
  { icon: BookOpen, name: 'Español', color: 'text-red-500' },
  { icon: Calculator, name: 'Matemáticas', color: 'text-blue-500' },
  { icon: Globe, name: 'Ciencias Sociales', color: 'text-green-500' },
  { icon: Palette, name: 'Arte', color: 'text-purple-500' },
  { icon: Music, name: 'Música', color: 'text-pink-500' },
  { icon: Heart, name: 'Valores', color: 'text-golden' },
];

export default function Academico() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 hero-gradient">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold mb-6">
              <GraduationCap className="h-4 w-4" />
              Oferta Académica
            </span>
            
            <h1 className="font-heading font-bold text-4xl lg:text-5xl text-foreground mb-6">
              Educación de calidad para cada etapa
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Desde preescolar hasta primaria, ofrecemos programas diseñados para desarrollar 
              el potencial único de cada niño en un ambiente de amor y excelencia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      {programs.map((program, index) => (
        <Section 
          key={program.id} 
          id={program.id}
          className={index % 2 === 1 ? 'bg-secondary/30' : ''}
        >
          <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
            <motion.div
              className={index % 2 === 1 ? 'lg:order-2' : ''}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className={`absolute -inset-4 ${program.color} rounded-3xl -z-10 rotate-3`} />
                <img 
                  src={program.image} 
                  alt={program.title}
                  className="rounded-2xl shadow-elevated w-full object-cover aspect-[4/3]"
                />
              </div>
            </motion.div>

            <motion.div
              className={index % 2 === 1 ? 'lg:order-1' : ''}
              initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${program.color} text-foreground`}>
                {program.subtitle}
              </span>
              <h2 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-4">
                {program.title}
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                {program.description}
              </p>

              <ul className="space-y-3 mb-8">
                {program.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <Button variant="cta" size="lg" asChild>
                <Link to="/admisiones">Inscribir en {program.title}</Link>
              </Button>
            </motion.div>
          </div>
        </Section>
      ))}

      {/* Subjects Grid */}
      <Section className="bg-primary">
        <SectionHeader
          title="Áreas de aprendizaje"
          subtitle="Currículo integral que desarrolla todas las dimensiones del estudiante."
        />
        <div className="mt-8">
          <p className="text-center text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Nuestro currículo está alineado con los estándares del MEDUCA y enriquecido con 
            programas complementarios de inglés, arte y formación en valores.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.name}
              className="bg-primary-foreground/10 backdrop-blur rounded-xl p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <subject.icon className={`h-8 w-8 mx-auto mb-3 ${subject.color}`} />
              <p className="font-semibold text-primary-foreground text-sm">{subject.name}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Our Approach */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            badge="Nuestra Metodología"
            title="Aprendizaje significativo y personalizado"
            subtitle="Cada niño aprende de manera diferente. Nuestro enfoque pedagógico se adapta a las necesidades individuales."
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-2xl bg-pastel-pink flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Ambiente de Amor</h3>
              <p className="text-muted-foreground text-sm">
                Creamos un espacio seguro donde cada niño se siente valorado y motivado a aprender.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-pastel-blue flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Grupos Reducidos</h3>
              <p className="text-muted-foreground text-sm">
                Atención personalizada con grupos pequeños que permiten seguir el progreso de cada estudiante.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-pastel-green flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Docentes Capacitados</h3>
              <p className="text-muted-foreground text-sm">
                Equipo de profesionales comprometidos con la excelencia educativa y el desarrollo integral.
              </p>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="py-16 bg-secondary/50">
        <div className="container text-center">
          <h2 className="font-heading font-bold text-2xl lg:text-3xl text-foreground mb-4">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Agenda una visita a nuestras instalaciones y conoce de cerca cómo trabajamos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="cta" size="lg" asChild>
              <Link to="/admisiones">Iniciar Inscripción</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contacto">Contáctanos</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
