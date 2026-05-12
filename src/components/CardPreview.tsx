import React from 'react';
import { motion } from 'motion/react';
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  ShoppingCart, 
  Linkedin, 
  Send, 
  Instagram, 
  Facebook, 
  ExternalLink, 
  FolderIcon,
  QrCode,
  Twitter,
  Github,
  Youtube,
  Music2,
  Download,
  CheckCircle2
} from 'lucide-react';
import { BusinessCard } from '../types';
import { cn } from '../lib/utils';

interface CardPreviewProps {
  card: BusinessCard;
  isPreview?: boolean;
  onViewQr?: () => void;
  onViewPortfolio?: () => void;
  onAction?: (action: string) => void;
  onDownload?: () => void;
}

const BRAND_COLORS: Record<string, { bg: string, text: string }> = {
  instagram: { bg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', text: '#ffffff' },
  facebook: { bg: '#1877F2', text: '#ffffff' },
  linkedin: { bg: '#0077B5', text: '#ffffff' },
  whatsapp: { bg: '#25D366', text: '#ffffff' },
  telegram: { bg: '#229ED9', text: '#ffffff' },
  twitter: { bg: '#000000', text: '#ffffff' },
  tiktok: { bg: '#000000', text: '#ffffff' },
  github: { bg: '#181717', text: '#ffffff' },
  youtube: { bg: '#FF0000', text: '#ffffff' },
  link: { bg: '#f3f4f6', text: '#374151' }
};

export const CardPreview: React.FC<CardPreviewProps> = ({ 
  card, 
  isPreview = false,
  onViewQr,
  onViewPortfolio,
  onAction,
  onDownload
}) => {
  const { colors, layout = 'standard' } = card;

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'telegram': return <Send className="w-5 h-5" />;
      case 'whatsapp': return <Phone className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'github': return <Github className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'tiktok': return <Music2 className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  const [imgLoaded, setImgLoaded] = React.useState(false);
  const isGlass = layout === 'glass';
  const isMinimal = layout === 'minimal';
  const isModern = layout === 'modern';

  return (
    <div 
      id="card-preview-container"
      className={cn(
        "max-w-sm w-full mx-auto p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border-2 shadow-2xl relative overflow-hidden transition-all duration-500",
        isPreview && "border-yellow-400/20",
        isGlass && "backdrop-blur-xl bg-opacity-80 border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
      )}
      style={{ 
        backgroundColor: isGlass ? undefined : colors.cardBg, 
        borderColor: isGlass ? undefined : colors.separator,
        backgroundImage: isGlass 
          ? `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%), radial-gradient(circle at top right, ${colors.coverBg}44, transparent), radial-gradient(circle at bottom left, ${colors.coverBg}22, transparent)` 
          : undefined
      }}
    >
      {/* Welcome Banner Header (Download Only - Reference Style) */}
      <div className="absolute top-0 left-0 right-0 h-56 sm:h-64 z-0 overflow-hidden download-only">
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-start pt-10 text-center">
            {/* Background design elements */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:15px_15px]" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/10 blur-[80px]" />
            
            <div className="relative z-10 w-14 h-14 mb-4 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            
            <h2 className="relative z-10 text-4xl font-black tracking-tighter text-white uppercase" style={{ fontStyle: 'italic' }}>
              WELCOME
            </h2>
            <div className="relative z-10 w-16 h-1 bg-yellow-400 my-3" />
            <p className="relative z-10 text-[11px] font-black tracking-[0.4em] text-yellow-400 uppercase">
              Digital Identity
            </p>
        </div>
      </div>

      {/* Background/Header Area */}
      {layout === 'standard' && (
        <div 
          className="absolute top-0 left-0 right-0 h-60 sm:h-64 -mt-2 -mx-1 rounded-t-[1.5rem] overflow-hidden"
          style={{ backgroundColor: card.logoType === 'color' ? card.logoColor : colors.coverBg }}
        >
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center p-4">
            {card.logoType === 'color' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex items-center justify-center"
              >
                 <div className="w-32 h-32 rounded-full bg-white/10 blur-3xl" />
              </motion.div>
            ) : card.logo && (
              <img 
                src={card.logo} 
                alt="Logo" 
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain" 
              />
            )}
          </div>
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" style={{ fill: colors.cardBg }}>
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      )}

      {isModern && (
        <div className="absolute top-0 left-0 right-0 h-48 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:10px_10px]" />
          <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${colors.coverBg}, ${colors.mainBtn})` }} />
          <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t" style={{ backgroundImage: `linear-gradient(to top, ${colors.cardBg}, transparent)` }} />
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "relative z-10 transition-all duration-700",
        layout === 'standard' ? "pt-44 sm:pt-40" : isMinimal ? "pt-6 sm:pt-10" : "pt-16 sm:pt-24"
      )}>
        
        {/* Profile Image & Header Selection */}
        <div className={cn(
          "mb-6 transition-all",
          isModern ? "flex flex-col min-[450px]:flex-row items-center min-[450px]:items-end gap-4 min-[450px]:gap-6 text-center min-[450px]:text-left px-2" : "text-center"
        )}>
          <div 
            className={cn(
              "relative border-4 shadow-xl overflow-hidden transition-all duration-500",
              isModern ? "w-24 h-24 sm:w-28 sm:h-28 mx-auto min-[450px]:ml-0 rounded-3xl min-[450px]:-mb-4 z-20" : "w-32 h-32 rounded-full mx-auto",
              isMinimal && "border-none shadow-none w-20 h-20 sm:w-24 sm:h-24"
            )}
            style={{ 
              borderColor: colors.cardBg, 
              backgroundColor: colors.separator + (isGlass ? '44' : '') 
            }}
          >
            {!imgLoaded && card.image && (
              <div className="absolute inset-0 animate-pulse bg-zinc-800" />
            )}
            {card.image ? (
              <img 
                src={card.image} 
                alt="Profile" 
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onLoad={() => setImgLoaded(true)}
                className={cn("w-full h-full object-cover transition-opacity duration-300", imgLoaded ? "opacity-100" : "opacity-0")} 
              />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Phone className="w-12 h-12" />
                </div>
            )}
          </div>
          
          <div className={cn(isModern && "flex-1 w-full")}>
            <h1 
              className={cn(
                "font-extrabold flex items-center gap-1.5 transition-colors",
                isModern ? "text-lg sm:text-xl justify-center min-[450px]:justify-start" : "text-2xl justify-center mt-4",
                isMinimal && "text-2xl sm:text-3xl tracking-tight"
              )}
              style={{ color: colors.name }}
            >
              {card.name || 'Your Name'}
              {card.verified && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500/20 shrink-0" />}
            </h1>
            
            <div className={cn(
              "mt-1 flex items-center gap-2 flex-wrap transition-all",
              isModern ? "justify-center min-[450px]:justify-start" : "justify-center"
            )}>
              {card.organization && (
                <p className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" style={{ color: colors.org, fontSize: isMinimal ? '0.875rem' : '1rem' }}>
                  {card.organization === 'TapNix' ? <>Tap<span className="text-yellow-400">Nix</span></> : card.organization}
                </p>
              )}
              {card.organization && card.title && <span className="opacity-40" style={{ color: colors.separator }}>•</span>}
              {card.title && <p className="font-semibold text-xs sm:text-sm" style={{ color: colors.title }}>{card.title}</p>}
            </div>
          </div>
        </div>

        {card.bio && (
          <p 
            className={cn(
              "text-sm font-medium italic mb-6 px-4 transition-all",
              isModern ? "text-left border-l-2" : "text-center"
            )} 
            style={{ color: colors.bio, borderLeftColor: isModern ? colors.org : 'transparent' }}
          >
            {card.bio}
          </p>
        )}

        {/* Minimal/Modern Logo Placement */}
        {(isMinimal || isModern || isGlass) && card.logo && (
          <div className={cn("mb-8 flex", isModern ? "justify-start" : "justify-center")}>
            <img 
              src={card.logo} 
              alt="Logo" 
              className={cn(
                "h-12 sm:h-8 object-contain transition-all",
                isGlass && "opacity-80"
              )} 
            />
          </div>
        )}

        {/* Social Links */}
        <div className="mt-4 border-t pt-4 sm:pt-6" style={{ borderColor: isGlass ? 'rgba(255,255,255,0.1)' : colors.separator }}>
          <div className={cn("flex flex-wrap gap-2 sm:gap-3", isModern ? "justify-start px-2" : "justify-center")}>
            {card.socialLinks.filter(s => s.url.trim() !== '').map((social, idx) => (
              <motion.a
                key={idx}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center rounded-xl sm:rounded-2xl shadow-sm border transition-all",
                  isMinimal ? "w-9 h-9 sm:w-10 sm:h-10 rounded-full" : "w-10 h-10 sm:w-12 sm:h-12"
                )}
                style={{ 
                  backgroundColor: isGlass ? 'rgba(255,255,255,0.1)' : colors.utilBtn, 
                  color: isGlass ? '#ffffff' : colors.utilBtnText,
                  borderColor: isGlass ? 'rgba(255,255,255,0.1)' : colors.separator
                }}
              >
                {/* Scale icons down on smaller screens */}
                <div className="transform scale-90 sm:scale-100">
                  {getSocialIcon(social.platform)}
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Action Grid */}
        <div className="space-y-4 mt-8 px-2">
          {(card.phones || []).filter(p => p.value.trim() !== '').map((phone, idx) => (
            <motion.a
              key={`phone-${idx}`}
              whileTap={{ scale: 0.98 }}
              href={`tel:${phone.value}`}
              className={cn(
                "flex items-center justify-center w-full px-6 py-4 rounded-full shadow-xl transition-all border-b-2 active:border-b-0 translate-y-0 active:translate-y-[2px]",
                isGlass && "backdrop-blur-md bg-opacity-20 border border-white/10"
              )}
              style={{ 
                backgroundColor: isGlass ? 'rgba(255,255,255,0.05)' : (colors.contactBtn || colors.mainBtn), 
                color: isGlass ? '#ffffff' : (colors.contactBtnText || colors.mainBtnText),
                borderColor: isGlass ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }}
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-3 shrink-0" />
              <div className="flex items-center text-[10px] sm:text-xs font-bold uppercase">
                Call: <span className="ml-2 font-bold normal-case tracking-normal opacity-90">{phone.value}</span>
              </div>
            </motion.a>
          ))}
          
          {(card.emails || []).filter(e => e.value.trim() !== '').map((email, idx) => (
            <motion.a
              key={`email-${idx}`}
              whileTap={{ scale: 0.98 }}
              href={`mailto:${email.value}`}
              className={cn(
                "flex items-center justify-center w-full px-6 py-4 rounded-full shadow-xl transition-all border-b-2 active:border-b-0 translate-y-0 active:translate-y-[2px]",
                isGlass && "backdrop-blur-md bg-opacity-20 border border-white/10"
              )}
              style={{ 
                backgroundColor: isGlass ? 'rgba(255,255,255,0.05)' : (colors.contactBtn || colors.mainBtn), 
                color: isGlass ? '#ffffff' : (colors.contactBtnText || colors.mainBtnText),
                borderColor: isGlass ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }}
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-3 shrink-0" />
              <div className="flex items-center text-[10px] sm:text-xs font-bold uppercase">
                Email: <span className="ml-2 font-bold normal-case tracking-normal opacity-90 truncate max-w-[180px]">{email.value}</span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Watermark in Download - Moved here to be included in crop */}
        <div className="mt-8 text-center opacity-40 download-only">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 mb-1" style={{ color: colors.title }}>
             TAP<span className="text-yellow-400">NIX</span> DIGITAL
           </p>
           <p className="text-[8px] font-bold tracking-[0.1em] text-zinc-500">
             ORDER: 0920508303 • ETHIOPIA
           </p>
        </div>

        {/* Custom Links */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 download-exclude">
          {card.customLinks.filter(l => l.url.trim() !== '').map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase shadow-sm border transition-all"
              style={{ 
                backgroundColor: isGlass ? 'rgba(255,255,255,0.05)' : colors.utilBtn, 
                color: isGlass ? '#ffffff' : colors.utilBtnText, 
                borderColor: isGlass ? 'rgba(255,255,255,0.1)' : colors.separator 
              }}
            >
              <ExternalLink className="w-3 h-3 mr-2 text-yellow-400" />
              {link.tag}
            </a>
          ))}
        </div>

        {/* Secondary Services */}
        <div className="mt-8 grid grid-cols-2 gap-3 px-2 download-exclude">
          {(card.website || isPreview) && (
            <a
              href={card.website || '#'}
              className="flex items-center justify-center px-4 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-b-2 active:border-b-0 translate-y-0 active:translate-y-[2px]"
              style={{ 
                backgroundColor: isGlass ? 'rgba(255,255,255,0.05)' : colors.utilBtn, 
                color: isGlass ? '#ffffff' : colors.utilBtnText, 
                borderColor: isGlass ? 'rgba(255,255,255,0.1)' : colors.separator 
              }}
            >
              <Globe className="w-4 h-4 mr-2 shrink-0" />
              Site
            </a>
          )}
          {(card.location || isPreview) && (
            <a
              href={card.location || '#'}
              className="flex items-center justify-center px-4 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-b-2 active:border-b-0 translate-y-0 active:translate-y-[2px]"
              style={{ 
                backgroundColor: isGlass ? 'rgba(255,255,255,0.05)' : colors.utilBtn, 
                color: isGlass ? '#ffffff' : colors.utilBtnText, 
                borderColor: isGlass ? 'rgba(255,255,255,0.1)' : colors.separator 
              }}
            >
              <MapPin className="w-4 h-4 mr-2 shrink-0" />
              Map
            </a>
          )}
          {(card.paymentUrl || isPreview) && (
            <a
              href={card.paymentUrl || '#'}
              className="flex items-center justify-center px-5 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-b-2 active:border-b-0 translate-y-0 active:translate-y-[2px] col-span-2"
              style={{ 
                backgroundColor: isGlass ? 'rgba(255,255,255,0.05)' : colors.utilBtn, 
                color: isGlass ? '#ffffff' : colors.utilBtnText, 
                borderColor: isGlass ? 'rgba(255,255,255,0.1)' : colors.separator 
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2 shrink-0" />
              Pay
            </a>
          )}
        </div>

        {/* Portfolio & Extra Buttons */}
        {card.portfolios && card.portfolios.length > 0 && (
          <button
            onClick={onViewPortfolio}
            className="w-full mt-4 flex items-center justify-center p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all download-exclude border border-yellow-400/30"
            style={{ 
              backgroundColor: isGlass ? 'rgba(255,200,0,0.1)' : colors.utilBtn, 
              color: isGlass ? '#eab308' : colors.utilBtnText 
            }}
          >
            <FolderIcon className="w-4 h-4 mr-2" />
            SHOWCASE ({card.portfolios.length})
          </button>
        )}

        {/* Utilities */}
        <div className="mt-8 sm:mt-12 space-y-3 sm:space-y-4 download-exclude">
          <button 
            className="w-full py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] text-xs sm:text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 border-b-4 border-black/20"
            style={{ backgroundColor: colors.mainBtn, color: colors.mainBtnText }}
            onClick={() => onAction?.('add_to_contacts')}
          >
            Save Contact
          </button>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
             <button 
               className="py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border"
               style={{ 
                 backgroundColor: isGlass ? 'rgba(255,255,255,0.05)' : colors.utilBtn, 
                 color: isGlass ? '#ffffff' : colors.utilBtnText,
                 borderColor: isGlass ? 'rgba(255,255,255,0.1)' : colors.separator
               }}
               onClick={onDownload}
             >
               <Download size={14} />
               Save
             </button>
             
             <button 
               className="py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border border-dashed"
               style={{ color: colors.qrBtnText, borderColor: colors.separator }}
               onClick={onViewQr}
             >
               <QrCode size={14} className="inline mr-2" />
               QR
             </button>
          </div>
          
          <motion.a
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            href={`https://wa.me/251920508303?text=Hello TapNix, I'm interested in ordering a custom NFC card.`}
            className="w-full flex items-center justify-center py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm mt-6 sm:mt-8 transition-all"
            style={{ 
              color: colors.orderBtnText, 
              backgroundColor: isGlass ? 'rgba(255,255,255,0.02)' : colors.utilBtn, 
              borderColor: isGlass ? 'rgba(255,255,255,0.1)' : colors.separator 
            }}
          >
            <ShoppingCart size={14} className="mr-2" />
            Get NFC Card
          </motion.a>
        </div>
      </div>
    </div>
  );
};
