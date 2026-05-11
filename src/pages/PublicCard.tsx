import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';
import { BusinessCard } from '../types';
import { INITIAL_CARD_DATA } from '../constants';
import { CardPreview } from '../components/CardPreview';
import { cn, normalizeContactInfo } from '../lib/utils';
import { 
  Zap, 
  Share2, 
  Download, 
  Info, 
  X,
  Smartphone,
  ChevronRight,
  MapPin,
  Globe,
  UserPlus,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { toJpeg } from 'html-to-image';
import download from 'downloadjs';

const PublicCard: React.FC = () => {
  const { cardId } = useParams();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [showPortfolios, setShowPortfolios] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const [theme, setTheme] = useState<'default' | 'light' | 'dark'>('default');

  useEffect(() => {
    if (cardId) {
      fetchCard();
    }
  }, [cardId]);

  useEffect(() => {
    if (card) {
      // Update metadata for social sharing
      document.title = `${card.name} | TapNix Digital Card`;
      
      const meta = {
        'description': card.bio || `Professional digital business card for ${card.name}`,
        'og:title': `${card.name} - ${card.title} at ${card.organization}`,
        'og:description': card.bio || `Connect with ${card.name} on TapNix.`,
        'og:image': card.image,
        'og:type': 'website',
        'twitter:card': 'summary_large_image',
      };

      Object.entries(meta).forEach(([name, content]) => {
        if (!content) return;
        let el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          if (name.startsWith('og:')) el.setAttribute('property', name);
          else el.setAttribute('name', name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      });
    }
  }, [card]);

  const fetchCard = async () => {
    if (!cardId) return;
    try {
      const docRef = doc(db, 'cards', cardId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const raw = snap.data();
        const data = { 
          id: snap.id, 
          ...INITIAL_CARD_DATA,
          ...raw,
          phones: normalizeContactInfo(raw.phones, 'PHONE'),
          emails: normalizeContactInfo(raw.emails, 'EMAIL')
        } as BusinessCard;
        setCard(data);
        
        // Track view
        if (!viewTracked) {
          try {
            await updateDoc(docRef, {
              'stats.views': increment(1),
              updatedAt: Date.now()
            });
            
            // Detailed Analytics
            await addDoc(collection(db, 'analytics'), {
               cardId,
               ownerId: data.userId,
               type: 'view',
               timestamp: Date.now()
            });

            setViewTracked(true);
          } catch (trackErr) {
            console.info('View tracking info (handled):', trackErr);
            // Background tracking failure is silent for user but logged
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `cards/${cardId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    trackEngagement('share_clicked');
    if (navigator.share) {
      navigator.share({
        title: `${card?.name} - Digital Business Card`,
        text: `Check out ${card?.name}'s professional profile on TapNix.`,
        url: window.location.href,
      });
    } else {
      setShowQr(true);
    }
  };

  const trackEngagement = async (action: string) => {
    if (!cardId || !card) return;
    try {
      const docRef = doc(db, 'cards', cardId);
      await updateDoc(docRef, {
        [`stats.clicks.${action}`]: increment(1),
        updatedAt: Date.now()
      });

      // Detailed Analytics
      await addDoc(collection(db, 'analytics'), {
         cardId,
         ownerId: card.userId,
         type: action.includes('click') ? 'link_click' : 'save',
         target: action,
         timestamp: Date.now()
      });
    } catch (err) {
      console.warn('Tracking failed:', err);
      // Quietly handle tracking errors to not disrupt user experience
    }
  };

  const handleDownload = async () => {
    trackEngagement('download_clicked');
    const node = document.getElementById('card-preview-container');
    if (node) {
      try {
        node.classList.add('downloading');
        const dataUrl = await toJpeg(node, { 
          quality: 0.95, 
          pixelRatio: 3,
          backgroundColor: displayedCard?.colors.cardBg,
          style: {
            transform: 'scale(1)',
            margin: '0',
            padding: '40px 20px',
            width: '450px',
            height: 'auto',
            borderRadius: '0',
            boxShadow: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }
        });
        node.classList.remove('downloading');
        download(dataUrl, `${card?.name.replace(/\s+/g, '_')}_DigitalCard.jpg`);
      } catch (err) {
        node?.classList.remove('downloading');
        console.warn('Download failed:', err);
      }
    }
  };

  const handleSaveContact = async () => {
    if (!card) return;
    trackEngagement('add_to_contacts');

    // Helper to get Base64 from URL
    const getBase64FromUrl = async (url: string): Promise<string | null> => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Could not convert image to base64 (CORS policy likely)', e);
        return null;
      }
    };

    let photoVcf = '';
    if (card.image) {
      const base64 = await getBase64FromUrl(card.image);
      if (base64) {
        const base64Data = base64.split(',')[1];
        const mimeType = base64.split(';')[0].split(':')[1];
        const format = mimeType.split('/')[1].toUpperCase();
        photoVcf = `PHOTO;ENCODING=b;TYPE=${format}:${base64Data}`;
      }
    }

    const socialUrls = (card.socialLinks || [])
      .filter(s => s.url)
      .map(s => `X-SOCIALPROFILE;TYPE=${s.platform.toUpperCase()}:${s.url}`)
      .join('\n');

    const nameParts = card.name.trim().split(/\s+/);
    const lastName = nameParts.length > 1 ? nameParts.pop() : '';
    const firstName = nameParts.join(' ');

    const vcf = `BEGIN:VCARD
VERSION:3.0
N:${lastName || ''};${firstName || ''};;;
FN:${card.name}
ORG:${card.organization || ''}
TITLE:${card.title || ''}
NOTE:${card.bio?.replace(/\n/g, '\\n') || ''}
${(card.phones || []).map(p => `TEL;TYPE=${p.tag ? p.tag.toUpperCase() : 'CELL'}:${p.value}`).join('\n')}
${(card.emails || []).map(e => `EMAIL;TYPE=${e.tag ? e.tag.toUpperCase() : 'INTERNET'}:${e.value}`).join('\n')}
${card.website ? `URL;TYPE=WORK:${card.website}` : ''}
${socialUrls}
${photoVcf}
REV:${new Date().toISOString()}
END:VCARD`;

    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${card.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getEffectiveColors = () => {
    if (!card) return null;
    if (theme === 'default') return card.colors;
    
    if (theme === 'light') {
      return {
        ...card.colors,
        cardBg: "#ffffff",
        name: "#111827",
        org: "#374151",
        title: "#4b5563",
        bio: "#6b7280",
        utilBtn: "#f9fafb",
        utilBtnText: "#1f2937",
        separator: "#e5e7eb",
        qrBtnText: "#6b7280"
      };
    }

    return {
      ...card.colors,
      cardBg: "#0a0a0a",
      name: "#ffffff",
      org: "#9ca3af",
      title: "#9ca3af",
      bio: "#6b7280",
      utilBtn: "#1f2937",
      utilBtnText: "#ffffff",
      separator: "#1f2937",
      qrBtnText: "#9ca3af"
    };
  };

  const displayedCard = card ? { ...card, colors: getEffectiveColors() || card.colors } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 mb-6 opacity-20">
    <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="TapNix Logo" crossOrigin="anonymous" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
  </div>
        <h1 className="text-3xl font-black mb-4">404: Terminal Offline</h1>
        <p className="text-white/40 mb-8 max-w-sm">This digital profile does not exist or has been deactivated by the user.</p>
        <Link to="/" className="px-8 py-4 bg-yellow-400 text-black font-black rounded-2xl">Return to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 transition-colors duration-500" style={{ backgroundColor: displayedCard.colors.cardBg }}>
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/10 backdrop-blur-xl border border-white/5 p-2 rounded-full shadow-2xl">
         <button 
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            title="Toggle Theme"
            className="p-4 bg-white/5 text-white rounded-full hover:bg-yellow-400 hover:text-black transition-all"
         >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
         </button>
         <button 
            onClick={handleSaveContact}
            title="Save Contact"
            className="p-4 bg-yellow-400 text-black rounded-full hover:scale-110 transition-all shadow-lg"
         >
            <UserPlus className="w-5 h-5" />
         </button>
         <button 
            onClick={handleShare}
            title="Share Profile"
            className="p-4 bg-black text-white rounded-full hover:bg-yellow-400 hover:text-black transition-all"
         >
            <Share2 className="w-5 h-5" />
         </button>
         <button 
            onClick={handleDownload}
            title="Download as Image"
            className="p-4 bg-black text-white rounded-full hover:bg-yellow-400 hover:text-black transition-all"
         >
            <Download className="w-5 h-5" />
         </button>
         <button 
            onClick={() => setShowQr(true)}
            title="View QR Code"
            className="p-4 bg-black text-white rounded-full hover:bg-yellow-400 hover:text-black transition-all"
         >
            <QRCodeSVG value={window.location.href} size={20} includeMargin={false} />
         </button>
         <Link 
            to="/" 
            className="flex items-center gap-2 px-6 py-4 bg-yellow-400 text-black font-bold rounded-full hover:scale-105 transition-all text-sm"
         >
            Create Your Card
            <ChevronRight className="w-4 h-4" />
         </Link>
      </div>

      {/* Main Card View */}
      <div className="flex justify-center p-4 pt-10 min-h-screen">
         <CardPreview 
            card={displayedCard} 
            onViewQr={() => {
              trackEngagement('qr_viewed');
              setShowQr(true);
            }} 
            onViewPortfolio={() => {
              trackEngagement('portfolio_viewed');
              setShowPortfolios(true);
            }}
            onAction={trackEngagement}
            onDownload={handleDownload}
         />
      </div>

      {/* QR Modal Overlay */}
      <AnimatePresence>
        {showQr && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm"
            style={{ backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.9)' }}
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className={cn(
                 "p-10 rounded-[3rem] max-w-sm w-full text-center relative border",
                 theme === 'light' ? "bg-white border-zinc-200" : "bg-zinc-900 border-white/10"
               )}
            >
               <button 
                  onClick={() => setShowQr(false)} 
                  className={cn("absolute top-6 right-6 p-2", theme === 'light' ? "text-zinc-400 hover:text-zinc-800" : "text-white/40 hover:text-white")}
               >
                  <X />
               </button>
               <h3 className={cn("text-2xl font-black mb-2", theme === 'light' ? "text-zinc-900" : "text-white")}>Scan & Connect</h3>
               <p className={cn("text-sm mb-8", theme === 'light' ? "text-zinc-400" : "text-white/40")}>Share this profile instantly with any smartphone.</p>
               
               <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl shadow-yellow-400/10">
                  <QRCodeSVG 
                    value={card.qrLink || window.location.href} 
                    size={200} 
                    includeMargin={false}
                    level="H"
                  />
               </div>
               
               <p className="mt-8 text-xs font-black uppercase tracking-widest text-yellow-400">Scan code with camera</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

       {/* Portfolios Modal */}
      <AnimatePresence>
        {showPortfolios && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm"
            style={{ backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.9)' }}
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className={cn(
                  "p-8 rounded-[3rem] max-w-sm w-full relative border",
                  theme === 'light' ? "bg-white border-zinc-200" : "bg-zinc-900 border-white/10"
               )}
            >
               <button 
                  onClick={() => setShowPortfolios(false)} 
                  className={cn("absolute top-6 right-6 p-2", theme === 'light' ? "text-zinc-400 hover:text-zinc-800" : "text-white/40 hover:text-white")}
               >
                  <X />
               </button>
               <h3 className={cn("text-2xl font-black mb-2 text-center uppercase tracking-tighter italic", theme === 'light' ? "text-zinc-900" : "text-white")}>Portfolio Deck</h3>
               <p className={cn("text-sm mb-8 text-center", theme === 'light' ? "text-zinc-400" : "text-white/40")}>Selected works and presentations.</p>
               
               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {card.portfolios?.map((url, idx) => (
                    <a 
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                         "flex items-center gap-4 p-4 border rounded-2xl hover:bg-white/5 transition-all group",
                         theme === 'light' ? "bg-zinc-50 border-zinc-200" : "bg-white/5 border-white/10"
                      )}
                    >
                      <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all">
                        <Globe size={24} className="text-yellow-400 group-hover:text-inherit" />
                      </div>
                      <div className="flex-1">
                        <p className={cn("text-xs font-black uppercase tracking-widest group-hover:text-yellow-400 transition-colors", theme === 'light' ? "text-zinc-800" : "text-white/80")}>Portfolio {idx + 1}</p>
                        <p className={cn("text-[10px] font-mono", theme === 'light' ? "text-zinc-400" : "text-white/40")}>View online asset</p>
                      </div>
                      <ChevronRight size={16} className={cn("transition-colors group-hover:text-yellow-400", theme === 'light' ? "text-zinc-300" : "text-white/20")} />
                    </a>
                  ))}
               </div>
               
               <p className="mt-8 text-center text-xs font-black uppercase tracking-widest text-yellow-400/40">Tap Nix Media Vault</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 text-center opacity-20">
         <div className="flex items-center justify-center gap-2 mb-2">
            <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="TapNix Logo" crossOrigin="anonymous" referrerPolicy="no-referrer" className="w-4 h-4 object-contain" />
            <span className="text-sm font-black tracking-tighter text-white">Tap<span className="text-yellow-400">Nix</span></span>
         </div>
         <p className="text-[10px] font-bold uppercase tracking-widest text-white">digital инновация • ethiopia</p>
      </div>
    </div>
  );
};

export default PublicCard;
