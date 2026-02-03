import { motion } from 'framer-motion';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { Section } from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle
} from 'lucide-react';

const MAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=2F8X%2BJ7M%2C%20C.%209%20Oeste%2C%20Panam%C3%A1%2C%20Provincia%20de%20Panam%C3%A1';

const ADDRESS_TEXT = '2F8X+J7M, C. 9 Oeste, Panamá, Provincia de Panamá';

const contactInfo = [
  {
    icon: Phone,
    title: 'Teléfono',
    content: '+507 6461-6826',
    action: 'tel:+5076461-6826',
    color: 'bg-pastel-blue',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    content: '+507 6461-6826',
    action: 'https://wa.me/50764616826',
    color: 'bg-pastel-green',
  },
  {
    icon: Mail,
    title: 'Correo Electrónico',
    content: 'cebuenpastor.goldenheaven@gmail.com',
    action: 'mailto:cebuenpastor.goldenheaven@gmail.com',
    color: 'bg-pastel-pink',
  },
  {
    icon: Clock,
    title: 'Horario de Atención',
    content: 'Atención únicamente con cita previa. No se recibe a nadie sin previa coordinación.',
    color: 'bg-pastel-yellow',
  },
];

export default function Contacto() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // MVP: aquí luego se conecta a backend/Bubble/Email si se decide.
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-br from-secondary via-background to-pastel-blue/20">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold mb-6">
              <MessageCircle className="h-4 w-4" />
              Contáctanos
            </span>

            <h1 className="font-heading font-bold text-4xl lg:text-5xl text-foreground mb-6">
              Estamos aquí para ayudarte
            </h1>

            <p className="text-lg text-muted-foreground">
              Escríbenos por WhatsApp o envíanos tu mensaje. La atención es únicamente con cita previa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {info.action ? (
                <a
                  href={info.action}
                  target={info.action.startsWith('http') ? '_blank' : undefined}
                  rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center hover:shadow-card transition-shadow"
                >
                  <div className={`w-14 h-14 rounded-xl ${info.color} flex items-center justify-center mx-auto mb-4`}>
                    <info.icon className="h-6 w-6 text-foreground/80" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-1">{info.title}</h3>
                  <p className="text-primary font-medium break-all">{info.content}</p>
                </a>
              ) : (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center">
                  <div className={`w-14 h-14 rounded-xl ${info.color} flex items-center justify-center mx-auto mb-4`}>
                    <info.icon className="h-6 w-6 text-foreground/80" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-1">{info.title}</h3>
                  <p className="text-muted-foreground text-sm">{info.content}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Form and Map */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
              Envíanos un mensaje
            </h2>

            {submitted ? (
              <div className="bg-pastel-green rounded-2xl p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  ¡Mensaje enviado!
                </h3>
                <p className="text-muted-foreground">
                  Gracias por contactarnos. Nos pondremos en contacto contigo a la brevedad.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSubmitted(false)}
                >
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-card rounded-2xl p-6 lg:p-8 shadow-card border border-border/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del acudiente</Label>
                    <Input id="name" placeholder="[Nombre del acudiente]" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" type="tel" placeholder="+507 6XXX-XXXX" required />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" placeholder="correo@ejemplo.com" required />
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="subject">Asunto</Label>
                  <select
                    id="subject"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="admisiones">Información de Admisiones</option>
                    <option value="visita">Agendar una Visita</option>
                    <option value="academico">Consulta Académica</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-2 mb-6">
                  <Label htmlFor="message">Mensaje</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    placeholder="Indícanos el grado de interés y tu consulta."
                    required
                  />
                </div>

                <Button type="submit" variant="cta" size="lg" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </form>
            )}
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
              Nuestra Ubicación
            </h2>

            <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50">
              <div className="h-64 bg-secondary flex items-center justify-center">
                <div className="text-center p-6">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {ADDRESS_TEXT}
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
                      Ver en Google Maps
                    </a>
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-heading font-bold text-lg text-foreground mb-3">
                  Centro Educativo El Buen Pastor Golden Heaven
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <a
                      href={MAPS_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      {ADDRESS_TEXT}
                    </a>
                  </p>
                  <p className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    Atención únicamente con cita previa. No se recibe a nadie sin previa coordinación.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button variant="default" size="lg" className="w-full" asChild>
                <a href="tel:+5076461-6826">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </a>
              </Button>
              <Button variant="whatsapp" size="lg" className="w-full" asChild>
                <a
                  href="https://wa.me/50764616826"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
