import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { Section, SectionHeader } from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Target, 
  Eye,
  Award,
  Users,
  Star,
  BookOpen,
  Shield
} from 'lucide-react';

import logo from '@/assets/logo.png';
import heroImage from '@/assets/hero-classroom.jpg';

const values = [
  {
    icon: Heart,
    title: 'Amor',
    description: 'El amor es la base de nuestra enseñanza. Cada niño es tratado con cariño y respeto.',
    color: 'bg-pastel-pink',
  },
  {
    icon: BookOpen,
    title: 'Excelencia',
    description: 'Buscamos la excelencia en todo lo que hacemos, inspirando a nuestros estudiantes a dar lo mejor.',
    color: 'bg-pastel-blue',
  },
  {
    icon: Users,
    title: 'Comunidad',
    description: 'Fomentamos un sentido de familia y pertenencia entre estudiantes, padres y docentes.',
    color: 'bg-pastel-green',
  },
  {
    icon: Shield,
    title: 'Integridad',
    description: 'Enseñamos con el ejemplo, promoviendo la honestidad y la responsabilidad.',
    color: 'bg-pastel-yellow',
  },
];

const timeline = [
  { year: '[AÑO]', event: 'Fundación del Centro Educativo El Buen Pastor Golden Heaven' },
  { year: '[AÑO]', event: 'Apertura del programa de Primaria' },
  { year: '[AÑO]', event: 'Ampliación de instalaciones' },
  { year: '2024', event: 'Más de 500 familias confían en nosotros' },
];

export default function Nosotros() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Nuestra escuela" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        
        <div className="container relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img src={logo} alt="Logo" className="h-28 w-28 mx-auto mb-6" />
            
            <h1 className="font-heading font-bold text-4xl lg:text-5xl text-foreground mb-6">
              Centro Educativo El Buen Pastor <span className="text-golden">Golden Heaven</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Somos una institución educativa panameña comprometida con la formación integral 
              de niños desde preescolar hasta primaria, combinando excelencia académica con 
              valores cristianos en un ambiente de amor y seguridad.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <Section className="bg-secondary/30">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            className="bg-card rounded-2xl p-8 shadow-card border border-border/50"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground">Nuestra Misión</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Brindar una educación de calidad fundamentada en valores cristianos, 
              desarrollando las capacidades intelectuales, emocionales y sociales de cada estudiante, 
              preparándolos para enfrentar los retos del futuro con éxito y responsabilidad.
            </p>
          </motion.div>

          <motion.div
            className="bg-card rounded-2xl p-8 shadow-card border border-border/50"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-golden">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground">Nuestra Visión</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Ser reconocidos como una institución educativa líder en Panamá, 
              formando líderes íntegros con sólidas bases académicas y valores que 
              contribuyan positivamente a la sociedad.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Values */}
      <Section>
        <SectionHeader
          badge="Nuestros Valores"
          title="Los pilares que nos guían"
          subtitle="Cada día trabajamos para inculcar estos valores en nuestros estudiantes."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={`w-16 h-16 rounded-2xl ${value.color} flex items-center justify-center mx-auto mb-4`}>
                <value.icon className="h-8 w-8 text-foreground/80" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">{value.title}</h3>
              <p className="text-muted-foreground text-sm">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* History Timeline */}
      <Section className="bg-primary">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-semibold mb-4">
              Nuestra Historia
            </span>
            <h2 className="font-heading font-bold text-3xl text-primary-foreground">
              Un camino de crecimiento y dedicación
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-foreground/20 -translate-x-1/2" />
            
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                className={`relative flex items-center gap-6 mb-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className="bg-primary-foreground/10 backdrop-blur rounded-xl p-4 inline-block">
                    <p className="font-bold text-golden-light text-lg mb-1">{item.year}</p>
                    <p className="text-primary-foreground/80 text-sm">{item.event}</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full bg-golden border-4 border-primary z-10" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section>
        <SectionHeader
          badge="¿Por qué elegirnos?"
          title="Lo que nos hace diferentes"
        />

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Award className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Trayectoria</h3>
            <p className="text-muted-foreground">
              Años de experiencia formando generaciones de estudiantes exitosos.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Comunidad</h3>
            <p className="text-muted-foreground">
              Más de 500 familias forman parte de nuestra comunidad educativa.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Star className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Excelencia</h3>
            <p className="text-muted-foreground">
              Compromiso constante con la mejora continua y la calidad educativa.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* CTA */}
      <section className="py-16 hero-gradient">
        <div className="container text-center">
          <h2 className="font-heading font-bold text-2xl lg:text-3xl text-foreground mb-4">
            Sé parte de nuestra familia
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Te invitamos a conocernos y descubrir por qué somos la mejor opción para la educación de tu hijo.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="cta" size="lg" asChild>
              <Link to="/admisiones">Comenzar Inscripción</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contacto">Agendar Visita</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
