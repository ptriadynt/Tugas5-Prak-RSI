import React from 'react';
import { UtensilsCrossed, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <UtensilsCrossed size={20} color="#C9A24B" />
          <span style={{ fontWeight: 600, color: '#ffffff' }}>Sistem Review Kantin</span>
          <span>&mdash; Praktikum Rekayasa Sistem Informasi</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
          <span>Dibuat dengan</span>
          <Heart size={14} color="#C9A24B" fill="#C9A24B" />
          <span>menggunakan React + Express.js</span>
        </div>
      </div>
    </footer>
  );
};

