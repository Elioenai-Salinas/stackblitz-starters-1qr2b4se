import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Clock, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

const quickLinks = [
  { name: 'Admisiones', href: '/admisiones' },
  { name: 'Académico', href: '/academico' },
  { name: 'Comunidad', href: '/comunidad' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Contacto', href: '/contacto' },
];

const academicLinks = [
  { name: 'Pre-kínder', href: '/academico#kinder' },
  { name: 'Kínder', href: '/academico#kinder-plus' },
  { name: 'Primaria (1°-6°)', href: '/academico#primaria' },
];

// ✅ Teléfono fijo (ícono teléfono)
const LANDLINE_DISPLAY = '397-2426';
const LANDLINE_TEL = 'tel:+5073972426';

// ✅ WhatsApp (móvil)
const WHATSAPP_DISPLAY = '+507 6461-6826';
const WHATSAPP_URL = 'https://wa.me/50764616826';

// ✅ Email
const EMAIL = 'cebuenpastor.goldenheaven@gmail.com';
const EMAIL_MAILTO = `mailto:${EMAIL}`;

// ✅ Redes
const INSTAGRAM_URL = 'https://www.instagram.com/buenpastorgoldenheaven/';
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100063931126975';

// ✅ Maps exacto (link correcto que tú confirmaste)
const MAPS_URL = 'https://maps.app.goo.gl/rRsSd5mWLKbWiVRx8';

// ✅ Texto visible de la dirección (no afecta el link)
const ADDRESS_DISPLAY_LINE1 = 'Rio Abajo calle 9, Edif. 26-27D';
const ADDRESS_DISPLAY_LINE2 = 'Panamá';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="Logo"
                className="h-16 w-16 object-contain bg-white rounded-full p-1"
              />
            </div>

            <h3 className="font-heading font-bold text-lg mb-2">
              Centro Educativo El Buen Pastor{' '}
              <span className="text-golden-light">Golden Heaven</span>
            </h3>

            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Formando niños con valores, amor y excelencia académica desde preescolar hasta primaria.
            </p>

            <div className="flex gap-3 mt-4">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-primary-foreground/20 transition-colors"
                aria-label="Facebook"
                title="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-primary-foreground/20 transition-colors"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/portal"
                  className="text-golden-light hover:text-golden transition-colors text-sm font-medium"
                >
                  Portal para Padres
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Programs */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Programas</h4>
            <ul className="space-y-2">
              {academicLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Contacto</h4>
            <ul className="space-y-3">
              {/* Teléfono fijo */}
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-golden-light" />
                <a
                  href={LANDLINE_TEL}
                  className="text-primary-foreground/80 hover:text-primary-foreground text-sm"
                  title="Llamar al teléfono fijo"
                >
                  {LANDLINE_DISPLAY}
                </a>
              </li>

              {/* WhatsApp (móvil) */}
              <li className="flex items-start gap-3">
                <MessageCircle className="h-4 w-4 mt-0.5 text-golden-light" />
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground text-sm"
                  title="Abrir WhatsApp"
                >
                  WhatsApp: {WHATSAPP_DISPLAY}
                </a>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-golden-light" />
                <a
                  href={EMAIL_MAILTO}
                  className="text-primary-foreground/80 hover:text-primary-foreground text-sm break-all"
                  title="Enviar correo"
                >
                  {EMAIL}
                </a>
              </li>

              {/* Dirección (texto visible) + Link exacto a Maps */}
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-golden-light" />
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground text-sm"
                  title="Abrir ubicación en Google Maps"
                >
                  {ADDRESS_DISPLAY_LINE1}
                  <br />
                  {ADDRESS_DISPLAY_LINE2}
                </a>
              </li>

              {/* Horario */}
              <li className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 text-golden-light" />
                <span className="text-primary-foreground/80 text-sm">
                  Atención únicamente con cita previa.
                  <br />
                  No se recibe a nadie sin previa coordinación.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Centro Educativo El Buen Pastor Golden Heaven. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-sm text-primary-foreground/60">
            <Link to="/privacidad" className="hover:text-primary-foreground transition-colors">
              Política de Privacidad
            </Link>
            <span>|</span>
            <Link to="/terminos" className="hover:text-primary-foreground transition-colors">
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
