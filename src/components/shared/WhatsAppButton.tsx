import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WHATSAPP_NUMBER = '5076461-6826';
const WHATSAPP_MESSAGE = 'Hola, me gustaría obtener más información sobre las matrículas del Centro Educativo El Buen Pastor Golden Heaven.';

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/-/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="pl-4 pr-1 py-3 text-sm font-medium hidden sm:group-hover:block transition-all">
        ¿Necesitas ayuda?
      </span>
      <div className="p-3">
        <MessageCircle className="h-6 w-6" />
      </div>
    </motion.a>
  );
}
