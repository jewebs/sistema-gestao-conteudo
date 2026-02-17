
import React from 'react';

const HeaderIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 12 2.25c.287 0 .56.044.824.124M6.75 15v.75c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125v-.75a3.375 3.375 0 0 0-3.375-3.375H10.125a3.375 3.375 0 0 0-3.375 3.375Z" />
    </svg>
);


const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center gap-3">
        <HeaderIcon className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">
            Sistema de Gestão de Conteúdo e Portfólio
        </h1>
      </div>
    </header>
  );
};

export default Header;
