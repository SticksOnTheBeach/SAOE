import React from 'react';

export const FooterBandeau: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#B51621] ">
      <p className="text-white text-left py-3 px-5 z-50">Droits réservés © {new Date().getFullYear()} SAOE</p>
    </footer>
  );
};