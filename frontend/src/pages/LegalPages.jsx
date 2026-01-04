import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ScrollText, FileText, Shield, Truck, ChevronRight } from 'lucide-react';

// --- LAYOUT MODERNE & CLEAN ---
const LegalLayout = ({ title, date, icon: Icon, children }) => {
  // Hook pour détecter le changement de page
  const { pathname } = useLocation();

  // Effet pour remonter en haut de page à chaque changement de route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900 flex flex-col">
      {/* Header Flottant */}
      <nav className="sticky top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors group"
          >
            <div className="p-2 bg-gray-100 rounded-full group-hover:bg-black group-hover:text-white transition-all">
              <ArrowLeft size={16} />
            </div>
            <span className="hidden sm:inline">Retour Boutique</span>
          </Link>
          <span className="font-black text-xl tracking-tighter">EMPIRE.</span>
          <div className="w-32 hidden sm:block"></div>
        </div>
      </nav>
      
      <div className="flex-grow container mx-auto px-4 sm:px-6 py-12 max-w-5xl">
        {/* Fil d'Ariane */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-medium uppercase tracking-wider">
          <Link to="/" className="hover:text-black transition-colors">Accueil</Link>
          <ChevronRight size={12} />
          <span>Légal</span>
          <ChevronRight size={12} />
          <span className="text-black">{title}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* En-tête de Document */}
          <div className="bg-black text-white p-12 md:p-20 text-center relative overflow-hidden">
              {/* Formes décoratives subtiles */}
              <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl opacity-50"></div>

              <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 text-white border border-white/20 shadow-inner">
                      <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
                      {title}
                  </h1>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
                      Mise à jour : {date}
                  </p>
              </div>
          </div>
          
          {/* Contenu Éditorial Structuré */}
          <div className="p-8 md:p-20 space-y-16 text-gray-600 leading-loose text-lg">
            {children}
          </div>
        </div>
      </div>

      {/* FOOTER PRINCIPAL (Le même que sur la HomePage) */}
      <footer className="bg-black text-gray-400 py-16 border-t border-gray-800 mt-auto">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="text-2xl font-black text-white tracking-widest mb-6">EMPIRE.</div>
              <p className="text-sm leading-relaxed max-w-xs">
                L'excellence à portée de main. Découvrez une sélection exclusive de produits qui redéfinissent les standards du luxe et de la technologie.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Boutique</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
                <li><Link to="/#shop" className="hover:text-white transition-colors">Nouveautés</Link></li>
                <li><Link to="/#shop" className="hover:text-white transition-colors">Best-sellers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Support</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/shipping" className="hover:text-white transition-colors">Livraison & Retours</Link></li>
                <li><a href="mailto:contact@empire.com" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors text-blue-500">Espace Admin</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Légal</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/legal" className="hover:text-white transition-colors">Mentions Légales</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">CGV</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2025 Empire Inc. Tous droits réservés.</p>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
              <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
              <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- COMPOSANTS DE STYLE POUR LE CONTENU ---
const Section = ({ title, children }) => (
    <section className="border-b border-gray-100 pb-16 last:border-0 last:pb-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-4">
            <span className="flex-shrink-0 w-12 h-1 bg-black rounded-full"></span>
            {title}
        </h2>
        <div className="space-y-6 text-justify">
            {children}
        </div>
    </section>
);

// --- CONTENU DES PAGES ---

export const LegalNotice = () => (
  <LegalLayout title="Mentions Légales" date="Janvier 2025" icon={ScrollText}>
    <Section title="1. Éditeur du site">
      <p>
        Le site <strong>Empire</strong> est une œuvre de l'esprit protégée par la loi. Il est édité par l'entreprise <strong>[VOTRE NOM]</strong>, société dédiée à l'excellence, immatriculée au Registre du Commerce et des Sociétés sous le numéro <strong>[SIRET]</strong>.
      </p>
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 mt-6 text-sm grid md:grid-cols-2 gap-6">
        <div>
            <p className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-xs">Siège Social</p>
            <p>[VOTRE ADRESSE COMPLETE]</p>
            <p>[CODE POSTAL] [VILLE]</p>
            <p>France</p>
        </div>
        <div>
            <p className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-xs">Contact</p>
            <p>Email : <a href="mailto:contact@empire.com" className="text-blue-600 hover:underline">contact@empire.com</a></p>
            <p>Téléphone : +33 1 23 45 67 89</p>
        </div>
      </div>
    </Section>

    <Section title="2. Hébergement">
      <p>
        Nos infrastructures sont hébergées sur les serveurs haute performance de <strong>Google Cloud Platform</strong> (Europe-West), garantissant une sécurité et une disponibilité optimales pour nos clients.
      </p>
      <p className="text-sm text-gray-400 mt-2">Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.</p>
    </Section>

    <Section title="3. Propriété Intellectuelle">
        <p>Tous les éléments du site Empire (textes, images, sons, logiciels, architecture) sont et restent la propriété intellectuelle et exclusive de l'entreprise. Nul n'est autorisé à reproduire, exploiter, rediffuser, ou utiliser à quelque titre que ce soit, même partiellement, des éléments du site sans accord écrit préalable.</p>
    </Section>
  </LegalLayout>
);

export const TermsOfSales = () => (
  <LegalLayout title="Conditions Générales" date="Janvier 2025" icon={FileText}>
    <Section title="1. Préambule">
      <p>
        Les présentes Conditions Générales de Vente (CGV) définissent le cadre contractuel des relations entre Empire et ses clients distingués. En validant une commande sur notre site, vous acceptez sans réserve ces conditions, qui prévalent sur tout autre document.
      </p>
    </Section>

    <Section title="2. Produits & Disponibilité">
      <p>
        Nos produits sont des pièces d'exception, proposées dans la limite des stocks disponibles. Empire se réserve le droit de modifier l'assortiment à tout moment. Les photographies du catalogue sont les plus fidèles possibles mais ne peuvent assurer une similitude parfaite avec le produit offert, notamment en ce qui concerne les couleurs.
      </p>
    </Section>

    <Section title="3. Prix & Paiement">
      <p>
        Les prix sont indiqués en euros (€) toutes taxes comprises (TTC). Le paiement est exigible immédiatement à la commande.
      </p>
      <div className="flex items-center gap-4 mt-6 p-6 bg-blue-50 text-blue-900 rounded-2xl text-sm font-medium border border-blue-100">
        <Shield size={24} className="flex-shrink-0" />
        <p>Nous utilisons le protocole sécurisé SSL via notre partenaire <strong>Stripe</strong> pour garantir la confidentialité totale et l'intégrité de vos informations bancaires lors de la transaction.</p>
      </div>
    </Section>
  </LegalLayout>
);

export const PrivacyPolicy = () => (
  <LegalLayout title="Confidentialité" date="Janvier 2025" icon={Shield}>
    <Section title="1. Collecte des données">
      <p>
        Chez Empire, la discrétion est une valeur fondamentale. Nous collectons uniquement les données strictement nécessaires au bon traitement de votre commande : Nom, Prénom, Adresse de livraison, Email. Ces données ne sont jamais revendues à des tiers.
      </p>
    </Section>

    <Section title="2. Sécurité & Protection">
      <p>
        Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles de pointe pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction. Vos informations de paiement ne transitent jamais en clair sur nos serveurs.
      </p>
    </Section>
    
    <Section title="3. Cookies">
      <p>
        Nous utilisons des cookies uniquement pour fluidifier votre navigation (maintien de votre session panier) et améliorer nos services. Vous gardez le contrôle total de vos préférences via les paramètres de votre navigateur.
      </p>
    </Section>
  </LegalLayout>
);

export const ShippingPolicy = () => (
  <LegalLayout title="Livraison & Retours" date="Janvier 2025" icon={Truck}>
    <Section title="Expédition Premium">
      <p>
        Toute commande passée avant 14h est expédiée le jour même. Nous collaborons avec des transporteurs de confiance pour vous livrer sous <strong>24 à 48h</strong> en France Métropolitaine. Chaque colis est préparé avec le plus grand soin.
      </p>
      <ul className="list-disc pl-5 mt-6 space-y-3 marker:text-black">
        <li><strong>Livraison Standard (3-5 jours) :</strong> Gratuite sans minimum d'achat.</li>
        <li><strong>Livraison Express (24h) :</strong> 9.90€ (Offerte dès 200€ d'achat).</li>
      </ul>
    </Section>
    
    <Section title="Politique de Retour">
      <p>
        Votre satisfaction est notre priorité absolue. Si une pièce ne comble pas entièrement vos attentes, vous disposez de <strong>30 jours</strong> pour nous la retourner dans son état d'origine.
      </p>
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center">
        <p className="font-bold text-gray-900 text-lg mb-2">Procédure de retour simplifiée</p>
        <p className="text-sm text-gray-500 mb-4">Contactez simplement notre support pour obtenir votre étiquette de retour prépayée.</p>
        <a href="mailto:support@empire.com" className="inline-block bg-black text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Contacter le support</a>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Le remboursement est déclenché immédiatement après réception et contrôle qualité de la pièce retournée (sous 48h maximum).
      </p>
    </Section>
  </LegalLayout>
);