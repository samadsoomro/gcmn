import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, Calendar } from 'lucide-react';
import FAQ from '@/components/FAQ';

const About: React.FC = () => {
  const stats = [
    { icon: <Calendar size={32} />, number: '1953', label: 'Established' },
    { icon: <BookOpen size={32} />, number: '25,000+', label: 'Books' },
    { icon: <Users size={32} />, number: '2,000+', label: 'Students' },
    { icon: <Award size={32} />, number: '70+', label: 'Years of Excellence' },
  ];

  return (
    <motion.div className="min-h-screen pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="py-12 lg:py-16 gradient-dark text-white text-center">
        <div className="container">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">About GCMN Library</h1>
          <p className="text-lg text-white/90">Gov. College For Men Nazimabad - Empowering Education Since 1953</p>
        </div>
      </div>
      <div className="py-12 lg:py-16">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} className="bg-card p-6 rounded-xl border border-border text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="text-primary mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="prose max-w-3xl mx-auto text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our History</h2>
            <p className="mb-4">Government College for Men Nazimabad was established in 1953 and has been a pillar of higher education in Karachi for over seven decades.</p>
            <p>Our library houses over 25,000 books covering various subjects including science, humanities, literature, and Islamic studies, serving thousands of students annually.</p>
          </div>
        </div>
      </div>
      <FAQ />
    </motion.div>
  );
};

export default About;
