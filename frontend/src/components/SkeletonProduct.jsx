import React from 'react';

const SkeletonProduct = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Zone Image pulsante */}
      <div className="aspect-[4/3] bg-slate-200 animate-pulse relative">
        <div className="absolute top-4 left-4 w-12 h-6 bg-slate-300 rounded-md"></div>
      </div>
      
      {/* Zone Contenu */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Catégorie */}
        <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
        
        {/* Titre (2 lignes) */}
        <div className="space-y-2">
            <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-5 w-1/2 bg-slate-200 rounded animate-pulse"></div>
        </div>
        
        {/* Étoiles */}
        <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mt-2"></div>

        {/* Prix et Bouton */}
        <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50">
            <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonProduct;