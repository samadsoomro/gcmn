import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="gradient-dark text-white mt-auto">
      <div className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">GCMN Library</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Gov. College For Men Nazimabad Library is committed to providing
                quality educational resources and fostering a culture of learning
                and academic excellence.
              </p>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://www.facebook.com/GCNKARACHI/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-accent hover:-translate-y-1 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-accent hover:-translate-y-1 transition-all"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-accent hover:-translate-y-1 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-accent hover:-translate-y-1 transition-all"
                  aria-label="Youtube"
                >
                  <Youtube size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/books', label: 'Browse Books' },
                  { to: '/notes', label: 'Study Materials' },
                  { to: '/rare-books', label: 'Rare Books' },
                  { to: '/about', label: 'About Us' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-white/80 hover:text-accent hover:translate-x-1 inline-block transition-all text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Resources</h3>
              <ul className="space-y-2">
                {[
                  { to: '/login', label: 'Student Login' },
                  { to: '/register', label: 'Register' },
                  { to: '/notes', label: 'Download Notes' },
                  { to: '/books', label: 'Book Catalog' },
                  { to: '/contact', label: 'Contact Us' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-white/80 hover:text-accent hover:translate-x-1 inline-block transition-all text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-white/80 text-sm">
                  <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                  <span>Nazimabad, Karachi, Pakistan</span>
                </li>
                <li className="flex items-center gap-3 text-white/80 text-sm">
                  <Phone size={18} className="flex-shrink-0" />
                  <span>+92 21 XXXX XXXX</span>
                </li>
                <li className="flex items-center gap-3 text-white/80 text-sm">
                  <Mail size={18} className="flex-shrink-0" />
                  <span>library@gcmn.edu.pk</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm text-center md:text-left">
              © {currentYear} GCMN Library. All rights reserved.
            </p>
            <p className="text-white/70 text-sm text-center md:text-right">
              Empowering Education Since 1953
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
