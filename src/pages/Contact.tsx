import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { LIBRARY_LOCATION } from '@/utils/constants';

const Contact: React.FC = () => {
  return (
    <motion.div className="min-h-screen pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="py-12 lg:py-16 gradient-dark text-white text-center">
        <div className="container">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-white/90">Get in touch with GCMN Library</p>
        </div>
      </div>
      <div className="py-12 lg:py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <MapPin />, title: 'Address', content: 'Nazimabad, Karachi, Pakistan' },
              { icon: <Phone />, title: 'Phone', content: '+92 21 XXXX XXXX' },
              { icon: <Mail />, title: 'Email', content: 'library@gcmn.edu.pk' },
              { icon: <Clock />, title: 'Hours', content: 'Mon-Fri: 8AM - 5PM' },
            ].map((item, i) => (
              <motion.div key={item.title} className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-lg transition-all" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-primary/10 rounded-full text-primary">{item.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.content}</p>
              </motion.div>
            ))}
          </div>
          <div className="rounded-xl overflow-hidden h-80 border border-border">
            <iframe src={LIBRARY_LOCATION.embedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="GCMN Location" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
