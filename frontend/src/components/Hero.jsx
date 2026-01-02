import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-slate-900 text-white overflow-hidden rounded-3xl mx-4 mt-4 shadow-2xl">
      {/* Image de fond sombre et tech */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1468495244123-6c6c733ee20d?q=80&w=2070&auto=format&fit=crop" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 flex flex-col justify-center h-full">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-2xl">
          Le Futur de la Tech <br/>
          <span className="text-blue-500">Entre Vos Mains.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
          Découvrez notre sélection exclusive de gadgets premium. Performance, design et innovation réunis au même endroit.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
          >
            Voir la Collection <ArrowRight size={20} />
          </button>
          <button className="px-8 py-4 rounded-xl font-bold text-lg border border-slate-600 hover:bg-white/10 transition-all backdrop-blur-sm">
            Notre Histoire
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;