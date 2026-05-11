import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Trash2, 
  Plus, 
  Layout, 
  User, 
  Globe, 
  Palette,
  Phone,
  Mail,
  Share2,
  Trash,
  Upload,
  FileText,
  MapPin,
  Link as LinkIcon,
  Download
} from 'lucide-react';
import { auth, db, storage } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { BusinessCard, SocialLink, CustomLink } from '../types';
import { INITIAL_CARD_DATA, DEFAULT_COLORS, ADMIN_EMAIL, COLOR_PRESETS, CARD_TEMPLATES } from '../constants';
import { CardPreview } from '../components/CardPreview';
import { checkIsAdmin } from '../lib/auth-utils';
import { toast } from 'sonner';
import { cn, normalizeContactInfo } from '../lib/utils';
import { toJpeg } from 'html-to-image';
import download from 'downloadjs';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';

const Editor: React.FC = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'social' | 'templates'>('content');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  
  // Use a more robust ID generation for new cards
  const [card, setCard] = useState<BusinessCard>(() => ({
    ...INITIAL_CARD_DATA,
    id: cardId || Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
    userId: auth.currentUser?.uid || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as BusinessCard));

  useEffect(() => {
    const init = async () => {
      const admin = await checkIsAdmin();
      setIsAdmin(admin);
    };
    init();
    if (cardId) {
      fetchCard();
    }
  }, [cardId]);

  const fetchCard = async () => {
    if (!cardId) return;
    try {
      const docRef = doc(db, 'cards', cardId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const raw = snap.data();
        setCard({ 
          id: snap.id, 
          ...INITIAL_CARD_DATA,
          ...raw,
          phones: normalizeContactInfo(raw.phones, 'PHONE'),
          emails: normalizeContactInfo(raw.emails, 'EMAIL')
        } as BusinessCard);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `cards/${cardId}`);
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast.success('Verification email resent!');
      } catch (err: any) {
        if (err.code === 'auth/too-many-requests') {
          toast.error('Too many requests. Please wait.');
        } else {
          toast.error('Failed to send verification email.');
        }
      }
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      alert('You must be signed in to save');
      return;
    }

    // Security Rule Alignment: Check for email verification (Warning only for saving drafts)
    if (!auth.currentUser.emailVerified && !isAdmin) {
      console.warn('User not verified. Saving as unverified card.');
    }

    // Required fields validation
    const hasPhoneOrEmail = (card.phones && card.phones.some(p => p.value.trim() !== '')) || (card.emails && card.emails.some(e => e.value.trim() !== ''));
    const hasImage = card.image && card.image.trim() !== '' && !card.image.includes('f97ad8c3-a99e-449e-8c0e-f4fcd3d6b112.png'); 
    const hasName = card.name && card.name.trim() !== '' && card.name !== 'New Profile';

    if (!hasName || !hasPhoneOrEmail || !hasImage) {
      toast.error('Missing Required Information: Name, Phone/Email, and Profile Picture are mandatory.');
      return;
    }

    setSaving(true);
    try {
      // Limit check for new cards
      if (!cardId && !isAdmin) {
        const q = query(collection(db, 'cards'), where('userId', '==', auth.currentUser?.uid));
        const snap = await getDocs(q);
        if (snap.size >= 1) {
          toast.error('Deployment Limit Reached: Basic accounts are restricted to 1 card.');
          navigate('/dashboard');
          setSaving(false);
          return;
        }
      }

      const docRef = doc(db, 'cards', card.id);
      const dataToSave = {
        ...card,
        userId: card.userId || auth.currentUser.uid,
        ownerEmailVerified: card.userId === auth.currentUser.uid ? auth.currentUser.emailVerified : (card.ownerEmailVerified ?? false),
        updatedAt: Date.now()
      };
      
      await setDoc(docRef, dataToSave);
      
      setSaving(false);
      
      // Post-save share option check
      if (!cardId) {
        toast.success("Card Published Successfully!");
        navigate(`/dashboard?share=${card.id}`);
        return;
      }
      toast.success("Changes Saved");
      navigate('/dashboard');
    } catch (err: any) {
      console.warn('Save failed:', err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `cards/${card.id}`);
      } catch (finalErr: any) {
        let displayError = err.message || 'Check connection';
        try {
          const parsed = JSON.parse(finalErr.message);
          displayError = parsed.error || displayError;
        } catch (e) {}
        alert(`Failed to save card: ${displayError}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    const node = document.getElementById('card-preview-container');
    if (node) {
      try {
        node.classList.add('downloading');
        const dataUrl = await toJpeg(node, { 
          quality: 1, 
          pixelRatio: 4,
          backgroundColor: card.colors.cardBg,
          style: {
            transform: 'scale(1)',
            margin: '0',
            padding: '24px',
            width: '400px',
            borderRadius: '24px'
          }
        });
        node.classList.remove('downloading');
        download(dataUrl, `${card.name.replace(/\s+/g, '_')}_DigitalCard.jpg`);
      } catch (err) {
        node?.classList.remove('downloading');
        console.warn('Download failed:', err);
      }
    }
  };

  const updateField = (field: keyof BusinessCard, value: any) => {
    setCard(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'logo' | 'portfolio') => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    // 1. Specific Validation
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedPortfolioTypes = [...allowedImageTypes, 'application/pdf'];
    const currentAllowed = field === 'portfolio' ? allowedPortfolioTypes : allowedImageTypes;

    if (!currentAllowed.includes(file.type)) {
      toast.error(`Invalid format: ${file.type.split('/')[1].toUpperCase()}`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setUploading(field);
    setUploadProgress(0);
    setUploadStatus('Preparing...');

    const performUpload = async (fileToUpload: Blob | File, attempt: number = 1): Promise<void> => {
      const maxAttempts = 3;
      const fileExt = file.name.split('.').pop() || 'bin';
      const fileName = `${field}_${Date.now()}.${fileExt}`;
      const storageRef = ref(storage, `user_uploads/${auth.currentUser!.uid}/${fileName}`);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'uploader': auth.currentUser!.uid,
          'originalName': file.name,
          'version': 'tapnix_v3',
          'attempt': attempt.toString()
        }
      };
      
      setUploadStatus(attempt > 1 ? `Retrying (${attempt}/${maxAttempts})...` : 'Uploading...');
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload, metadata);

      return new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            if (attempt < maxAttempts) {
              console.warn(`[TapNix] Upload attempt ${attempt} failed:`, error.code);
              setTimeout(() => resolve(performUpload(fileToUpload, attempt + 1)), 2000);
            } else {
              reject(error);
            }
          },
          async () => {
            try {
              setUploadStatus('Finalizing...');
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              if (field === 'portfolio') {
                setCard(prev => ({ ...prev, portfolios: [...(prev.portfolios || []), url] }));
              } else {
                updateField(field as any, url);
              }
              resolve();
            } catch (urlErr) {
              reject(urlErr);
            }
          }
        );
      });
    };

    try {
      let fileToUpload: File | Blob = file;

      // 2. Intelligent Compression
      if (file.type.startsWith('image/')) {
        setUploadStatus('Optimizing...');
        const isLogo = field === 'logo';
        const compressionOptions = {
          maxSizeMB: isLogo ? 0.02 : 0.04, 
          maxWidthOrHeight: isLogo ? 300 : 480,
          useWebWorker: true,
          initialQuality: 0.5,
        };

        try {
          fileToUpload = await imageCompression(file, compressionOptions);
          console.log(`[TapNix Optimizer] Optimized to ${Math.round(fileToUpload.size / 1024)}KB`);
        } catch (error) {
          console.warn('Compression skipped.', error);
        }
      }

      await performUpload(fileToUpload);

    } catch (err: any) {
      console.warn('Critical Upload Failure:', err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(null);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  const updateColor = (field: keyof typeof DEFAULT_COLORS, value: string) => {
    setCard(prev => ({
      ...prev,
      colors: { ...prev.colors, [field]: value }
    }));
  };

  const addPhone = () => updateField('phones', [...(card.phones || []), { tag: 'PHONE', value: '' }]);
  const updatePhone = (index: number, val: string, field: 'tag' | 'value' = 'value') => {
     const newPhones = [...card.phones];
     newPhones[index] = { ...newPhones[index], [field]: val };
     updateField('phones', newPhones);
  };
  const removePhone = (index: number) => updateField('phones', card.phones.filter((_, i) => i !== index));

  const removePortfolio = (index: number) => {
    updateField('portfolios', card.portfolios.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row overflow-x-hidden relative">
      {/* Floating Preview Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
         <button 
            onClick={() => {
               const el = document.getElementById('preview-section');
               el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-6 py-4 bg-yellow-400 text-black rounded-full font-black uppercase tracking-widest text-[10px] shadow-[0_10px_40px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all"
         >
            <Layout size={16} />
            View Preview
         </button>
      </div>

      {/* Sidebar Form */}
      <div className="w-full md:w-1/2 lg:w-[450px] bg-zinc-900/50 border-r border-white/5 flex flex-col h-auto md:h-screen shrink-0">
        <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-40">
           <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <ChevronLeft className="w-5 h-5" />
           </button>
           <h2 className="font-black uppercase tracking-[0.2em] text-xs">Card Terminal</h2>
           <div className="flex items-center gap-2">
              <button 
                 onClick={handleDownload}
                 title="Download Preview"
                 className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white/60"
              >
                 <Download className="w-4 h-4" />
              </button>
              <button 
                 onClick={handleSave} 
                 disabled={saving}
                 className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-black font-black rounded-xl hover:bg-yellow-300 transition-all text-sm disabled:opacity-50"
              >
                 <Save className="w-4 h-4" />
                 {saving ? '...' : 'Publish'}
              </button>
           </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-3 sm:p-4 gap-1.5 sm:gap-2 border-b border-white/5 overflow-x-auto scrollbar-hide sticky top-0 bg-zinc-900/90 backdrop-blur-xl z-30">
            <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<Layout size={14}/>} label="Templates" />
            <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<FileText size={14}/>} label="Content" />
            <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon={<Share2 size={14}/>} label="Social" />
            <TabButton active={activeTab === 'design'} onClick={() => setActiveTab('design')} icon={<Palette size={14}/>} label="Design" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
           {activeTab === 'templates' && (
              <div className="space-y-6">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center text-yellow-400">
                       <Layout size={18} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black uppercase tracking-widest">Select a Vibe</h3>
                       <p className="text-[10px] text-white/30 font-medium tracking-tight">Professional blueprints for your identity</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                    {CARD_TEMPLATES.map((tpl) => (
                       <button
                          key={tpl.id}
                          onClick={() => {
                             setCard(prev => ({
                                ...prev,
                                layout: tpl.layout as any,
                                colors: { ...tpl.colors }
                             }));
                             // Auto-scroll on mobile to show result
                             if (window.innerWidth < 768) {
                                document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
                             }
                          }}
                          className={cn(
                             "w-full p-4 rounded-3xl border transition-all text-left flex items-start gap-4 group relative overflow-hidden",
                             (card.layout || 'standard') === tpl.layout ? "bg-yellow-400 border-yellow-400 shadow-lg shadow-yellow-400/10" : "bg-white/5 border-white/10 hover:border-white/20"
                          )}
                       >
                          <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                             (card.layout || 'standard') === tpl.layout ? "bg-black text-yellow-400" : "bg-white/5 text-white/40"
                          )}>
                             <Palette size={18} />
                          </div>
                          <div className="min-w-0">
                             <h4 className={cn("text-[10px] font-black uppercase tracking-widest transition-colors line-clamp-1", (card.layout || 'standard') === tpl.layout ? "text-black" : "text-white")}>{tpl.name}</h4>
                             <p className={cn("text-[8px] font-medium leading-tight mt-1 line-clamp-2", (card.layout || 'standard') === tpl.layout ? "text-black/60" : "text-white/30")}>{tpl.description}</p>
                          </div>
                          {(card.layout || 'standard') === tpl.layout && (
                            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-black animate-pulse" />
                          )}
                       </button>
                    ))}
                 </div>

                 <div className="mt-8 p-6 bg-yellow-400/5 rounded-3xl border border-yellow-400/10">
                    <p className="text-[10px] text-yellow-400/60 font-medium leading-relaxed italic">
                       Professional Tip: Choose a template that matches your industry. You can always fine-tune individual colors in the "Design" tab.
                    </p>
                 </div>
              </div>
           )}

           {activeTab === 'content' && (
              <>
                 <InputGroup label="Identity">
                    <InputField label="Full Name" value={card.name} onChange={v => updateField('name', v)} required />
                    <InputField label="Title / Role" value={card.title} onChange={v => updateField('title', v)} />
                    <InputField label="Organization" value={card.organization} onChange={v => updateField('organization', v)} />
                 </InputGroup>

                 <InputGroup label="Media">
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">
                             Profile Picture <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {card.image ? <img src={card.image} className="w-full h-full object-cover" /> : <User className="text-white/20" />}
                             </div>
                             <div className="flex-1 space-y-2">
                                <div className="relative">
                                   <button className="w-full py-2 bg-white/5 border border-dashed border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all flex items-center justify-center gap-2 relative overflow-hidden">
                                      {uploading === 'image' ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                                          <span>{uploadStatus ? uploadStatus : `${uploadProgress}%`}</span>
                                        </div>
                                      ) : <><Upload size={12} /> Select Image</>}
                                      {uploading === 'image' && (
                                        <div 
                                          className="absolute bottom-0 left-0 h-0.5 bg-yellow-400 transition-all duration-300" 
                                          style={{ width: `${uploadProgress}%` }}
                                        />
                                      )}
                                   </button>
                                   <input 
                                      type="file" 
                                      className="absolute inset-0 opacity-0 cursor-pointer" 
                                      accept="image/*" 
                                      onChange={(e) => handleFileUpload(e, 'image')}
                                      disabled={!!uploading} 
                                   />
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                             <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Company Logo</label>
                             <div className="flex bg-white/5 p-1 rounded-lg">
                                <button 
                                   onClick={() => updateField('logoType', 'image')}
                                   className={cn(
                                      "px-3 py-1 text-[9px] font-bold rounded-md transition-all",
                                      card.logoType === 'image' ? "bg-yellow-400 text-black shadow-lg" : "text-white/40 hover:text-white"
                                   )}
                                >
                                   IMAGE
                                </button>
                                <button 
                                   onClick={() => updateField('logoType', 'color')}
                                   className={cn(
                                      "px-3 py-1 text-[9px] font-bold rounded-md transition-all",
                                      card.logoType === 'color' ? "bg-yellow-400 text-black shadow-lg" : "text-white/40 hover:text-white"
                                   )}
                                >
                                   COLOR
                                </button>
                             </div>
                          </div>

                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0" style={{ backgroundColor: card.logoType === 'color' ? card.logoColor : 'rgba(255,255,255,0.05)' }}>
                                {card.logoType === 'color' ? (
                                   <div className="w-8 h-8 rounded-full bg-white/20 blur-sm animate-pulse" />
                                ) : (
                                   card.logo ? <img src={card.logo} className="w-full h-full object-contain" /> : <Globe className="text-white/20" />
                                )}
                             </div>
                             <div className="flex-1 space-y-2">
                                {card.logoType === 'color' ? (
                                   <ColorPicker label="Select Logo Color" value={card.logoColor || '#eab308'} onChange={v => updateField('logoColor', v)} />
                                ) : (
                                   <div className="relative">
                                      <button className="w-full py-2 bg-white/5 border border-dashed border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all flex items-center justify-center gap-2 relative overflow-hidden">
                                         {uploading === 'logo' ? (
                                           <div className="flex items-center gap-2">
                                             <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                                             <span>{uploadStatus ? uploadStatus : `${uploadProgress}%`}</span>
                                           </div>
                                         ) : <><Upload size={12} /> Upload Logo</>}
                                         {uploading === 'logo' && (
                                           <div 
                                             className="absolute bottom-0 left-0 h-0.5 bg-yellow-400 transition-all duration-300" 
                                             style={{ width: `${uploadProgress}%` }}
                                           />
                                         )}
                                      </button>
                                      <input 
                                         type="file" 
                                         className="absolute inset-0 opacity-0 cursor-pointer" 
                                         accept="image/*" 
                                         onChange={(e) => handleFileUpload(e, 'logo')}
                                         disabled={!!uploading}
                                      />
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                 </InputGroup>

                 <InputGroup label="Professional Portfolio">
                    <div className="space-y-4">
                       <p className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Upload PDF or Images to showcase your work</p>
                       
                       {/* Upload Button */}
                       <div className="relative">
                          <button className="w-full py-4 bg-yellow-400/10 border border-dashed border-yellow-400/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:bg-yellow-400/20 transition-all flex items-center justify-center gap-2 relative overflow-hidden">
                             {uploading === 'portfolio' ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                                  <span>{uploadStatus ? uploadStatus : `${uploadProgress}%`}</span>
                                </div>
                              ) : <><Upload size={14} /> Add Portfolio Item</>}
                              {uploading === 'portfolio' && (
                                <div 
                                  className="absolute bottom-0 left-0 h-0.5 bg-yellow-400 transition-all duration-300" 
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              )}
                          </button>
                          <input 
                             type="file" 
                             className="absolute inset-0 opacity-0 cursor-pointer" 
                             accept=".pdf,image/*" 
                             onChange={(e) => handleFileUpload(e, 'portfolio')}
                             disabled={!!uploading}
                          />
                       </div>

                       {/* List of Portfolios */}
                       {card.portfolios && card.portfolios.length > 0 && (
                         <div className="grid grid-cols-1 gap-2 mt-4">
                           {card.portfolios.map((url, idx) => (
                             <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl relative group">
                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                   <FileText className="w-6 h-6 text-yellow-400/60" />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-[10px] text-white/60 truncate font-mono uppercase">Portfolio Item {idx + 1}</p>
                                </div>
                                <button 
                                  onClick={() => removePortfolio(idx)}
                                  className="p-2 text-white/20 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2 text-white/20 hover:text-yellow-400 transition-colors"
                                >
                                  <Globe size={16} />
                                </a>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                 </InputGroup>

                 <InputGroup label="Biography">
                    <textarea 
                        value={card.bio} 
                        onChange={e => updateField('bio', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-yellow-400/50 min-h-[120px] text-sm"
                        placeholder="Tell your professional story..."
                    />
                 </InputGroup>

                 <InputGroup label="Networking Hub">
                    <InputField label="Official Website" value={card.website || ''} onChange={v => updateField('website', v)} />
                    <InputField label="Location (Map Link)" value={card.location || ''} onChange={v => updateField('location', v)} />
                    <InputField label="Payment Link (PayPal, BuyMeACoffee, etc.)" value={card.paymentUrl || ''} onChange={v => updateField('paymentUrl', v)} />
                 </InputGroup>

                  <InputGroup label="Direct Contact">
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-yellow-400/50 uppercase tracking-widest px-1">At least one contact method required <span className="text-red-500">*</span></p>
                       <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase text-white/20 ml-1">Phone Numbers</p>
                          {card.phones.map((phone, idx) => (
                             <div key={`phone-${idx}`} className="space-y-2 p-3 bg-white/5 border border-white/10 rounded-2xl relative group">
                                <div className="flex gap-2">
                                   <input 
                                      type="text" 
                                      value={phone.tag} 
                                      onChange={e => updatePhone(idx, e.target.value.toUpperCase(), 'tag')}
                                      className="w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-yellow-400/50 transition-all text-yellow-400/70"
                                      placeholder="TAG"
                                   />
                                   <input 
                                      type="text" 
                                      value={phone.value} 
                                      onChange={e => updatePhone(idx, e.target.value, 'value')}
                                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-yellow-400/50 transition-all font-mono"
                                      placeholder="Phone Number"
                                   />
                                </div>
                                <button 
                                  onClick={() => removePhone(idx)} 
                                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                   <Trash size={12} />
                                </button>
                             </div>
                          ))}
                          <button onClick={addPhone} className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-dashed border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest text-white/40">
                             <Plus size={14} /> Add Phone
                          </button>
                       </div>

                       <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase text-white/20 ml-1">Email Addresses</p>
                          {(card.emails || []).map((email, idx) => (
                             <div key={`email-${idx}`} className="space-y-2 p-3 bg-white/5 border border-white/10 rounded-2xl relative group">
                                <div className="flex gap-2">
                                   <input 
                                      type="text" 
                                      value={email.tag} 
                                      onChange={e => {
                                         const newEmails = [...(card.emails || [])];
                                         newEmails[idx] = { ...newEmails[idx], tag: e.target.value.toUpperCase() };
                                         updateField('emails', newEmails);
                                      }}
                                      className="w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-yellow-400/50 transition-all text-yellow-400/70"
                                      placeholder="TAG"
                                   />
                                   <input 
                                      type="email" 
                                      value={email.value} 
                                      onChange={e => {
                                         const newEmails = [...(card.emails || [])];
                                         newEmails[idx] = { ...newEmails[idx], value: e.target.value };
                                         updateField('emails', newEmails);
                                      }}
                                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-yellow-400/50 transition-all font-mono"
                                      placeholder="Email Address"
                                   />
                                </div>
                                <button 
                                  onClick={() => updateField('emails', card.emails.filter((_, i) => i !== idx))} 
                                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                   <Trash size={12} />
                                </button>
                             </div>
                          ))}
                          <button 
                             onClick={() => updateField('emails', [...(card.emails || []), { tag: 'EMAIL', value: '' }])}
                             className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-dashed border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest text-white/40"
                          >
                             <Plus size={14} /> Add Email
                          </button>
                       </div>
                    </div>
                 </InputGroup>
              </>
           )}

            {activeTab === 'social' && (
              <div className="space-y-8">
                 <div className="space-y-6">
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5 pb-2">Social Ecosystem</p>
                    <div className="grid grid-cols-1 gap-4">
                       {card.socialLinks.map((social, idx) => (
                          <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl relative">
                             <select 
                               value={social.platform}
                               onChange={(e) => {
                                  const newSocials = [...card.socialLinks];
                                  newSocials[idx].platform = e.target.value as any;
                                  updateField('socialLinks', newSocials);
                               }}
                               className="w-full bg-black border border-white/10 rounded-xl p-2 text-xs font-bold mb-3 focus:outline-none text-yellow-400"
                             >
                                <option value="instagram">Instagram</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="facebook">Facebook</option>
                                <option value="telegram">Telegram</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="tiktok">TikTok</option>
                                <option value="twitter">X / Twitter</option>
                                <option value="github">GitHub</option>
                                <option value="youtube">YouTube</option>
                             </select>
                             <input 
                               type="text"
                               value={social.url}
                               onChange={(e) => {
                                  const newSocials = [...card.socialLinks];
                                  newSocials[idx].url = e.target.value;
                                  updateField('socialLinks', newSocials);
                               }}
                               placeholder="https://..."
                               className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] focus:outline-none focus:border-yellow-400/50"
                             />
                             <button 
                               onClick={() => updateField('socialLinks', card.socialLinks.filter((_, i) => i !== idx))}
                               className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg"
                              >
                               <Trash size={12} />
                             </button>
                          </div>
                       ))}
                       <button 
                          onClick={() => updateField('socialLinks', [...card.socialLinks, { platform: 'link', url: '' }])}
                          className="w-full py-4 bg-white/5 border border-white/10 text-white/60 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                       >
                          <Plus size={14} /> Add Social Link
                       </button>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5 pb-2">Custom Links</p>
                    <div className="grid grid-cols-1 gap-4">
                       {card.customLinks.map((link, idx) => (
                          <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl relative space-y-3">
                             <div className="flex gap-2">
                                <LinkIcon size={12} className="text-yellow-400" />
                                <input 
                                   className="flex-1 bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:outline-none text-white/80"
                                   placeholder="LINK TAG (e.g. PORTFOLIO)"
                                   value={link.tag}
                                   onChange={e => {
                                      const newLinks = [...card.customLinks];
                                      newLinks[idx].tag = e.target.value;
                                      updateField('customLinks', newLinks);
                                   }}
                                />
                             </div>
                             <input 
                               type="text"
                               value={link.url}
                               onChange={(e) => {
                                  const newLinks = [...card.customLinks];
                                  newLinks[idx].url = e.target.value;
                                  updateField('customLinks', newLinks);
                               }}
                               placeholder="https://..."
                               className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] focus:outline-none focus:border-yellow-400/50"
                             />
                             <button 
                               onClick={() => updateField('customLinks', card.customLinks.filter((_, i) => i !== idx))}
                               className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg"
                              >
                               <Trash size={12} />
                             </button>
                          </div>
                       ))}
                       <button 
                          onClick={() => updateField('customLinks', [...card.customLinks, { tag: '', url: '' }])}
                          className="w-full py-4 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-yellow-400/20 transition-all flex items-center justify-center gap-2"
                       >
                          <Plus size={14} /> Add Custom Link
                       </button>
                    </div>
                 </div>
              </div>
           )}

            {activeTab === 'design' && (
              <div className="space-y-6">
                 <div className="space-y-4">
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5 pb-2">Style Presets</p>
                    <div className="flex flex-wrap gap-2">
                       {COLOR_PRESETS.map((preset) => (
                          <button
                             key={preset.name}
                             onClick={() => updateField('colors', preset.colors)}
                             className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all hover:border-yellow-400/30"
                          >
                             {preset.name}
                          </button>
                       ))}
                    </div>
                 </div>

                 <p className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5 pb-2">Visual Architecture</p>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                    <ColorPicker label="Page Background" value={card.colors.cardBg} onChange={v => updateColor('cardBg', v)} />
                    <ColorPicker label="Header Surface" value={card.colors.coverBg} onChange={v => updateColor('coverBg', v)} />
                    
                    <div className="col-span-2 border-t border-white/5 pt-4">
                       <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-4">Typography</p>
                       <div className="grid grid-cols-3 gap-2">
                          <ColorPicker label="Name" value={card.colors.name} onChange={v => updateColor('name', v)} />
                          <ColorPicker label="Organization" value={card.colors.org} onChange={v => updateColor('org', v)} />
                          <ColorPicker label="Job Title" value={card.colors.title} onChange={v => updateColor('title', v)} />
                          <ColorPicker label="Bio Text" value={card.colors.bio} onChange={v => updateColor('bio', v)} />
                          <ColorPicker label="Separators" value={card.colors.separator} onChange={v => updateColor('separator', v)} />
                       </div>
                    </div>

                    <div className="col-span-2 border-t border-white/5 pt-4">
                       <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-4">Action Elements</p>
                       <div className="grid grid-cols-2 gap-4">
                          <ColorPicker label="Primary Button" value={card.colors.mainBtn} onChange={v => updateColor('mainBtn', v)} />
                          <ColorPicker label="Primary Text" value={card.colors.mainBtnText} onChange={v => updateColor('mainBtnText', v)} />
                          <ColorPicker label="Contact Button" value={card.colors.contactBtn} onChange={v => updateColor('contactBtn', v)} />
                          <ColorPicker label="Contact Text" value={card.colors.contactBtnText} onChange={v => updateColor('contactBtnText', v)} />
                          <ColorPicker label="Utility Button" value={card.colors.utilBtn} onChange={v => updateColor('utilBtn', v)} />
                          <ColorPicker label="Utility Text" value={card.colors.utilBtnText} onChange={v => updateColor('utilBtnText', v)} />
                          <ColorPicker label="QR CTA Text" value={card.colors.qrBtnText} onChange={v => updateColor('qrBtnText', v)} />
                          <ColorPicker label="Order CTA Text" value={card.colors.orderBtnText} onChange={v => updateColor('orderBtnText', v)} />
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* Live Preview */}
      <div id="preview-section" className="flex-1 bg-black p-6 md:p-12 flex flex-col items-center justify-start overflow-y-auto">
         <div className="mb-12 text-center shrink-0">
            <span className="inline-block py-1 px-3 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">Live Preview</span>
            <h3 className="text-2xl font-black text-white/20">How your network sees you</h3>
         </div>
         
         <div className="w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
            <CardPreview card={card} isPreview onDownload={handleDownload} />
         </div>

         {/* Mobile Toggle Info */}
         <div className="mt-12 md:hidden text-white/30 text-xs font-medium bg-zinc-900 rounded-full px-6 py-2">
            Scroll down to view editor tabs
         </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl transition-all shrink-0 min-w-0",
      active ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10" : "bg-white/5 text-white/40 hover:bg-white/10"
    )}
  >
    <div className={cn(active ? "scale-110" : "scale-100", "transition-transform")}>
       {icon}
    </div>
    <span className="text-[8px] sm:text-xs font-black uppercase tracking-widest truncate w-full text-center sm:text-left">{label}</span>
  </button>
);

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-4">
     <p className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5 pb-2">{label}</p>
     {children}
  </div>
);

const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void; required?: boolean }> = ({ label, value, onChange, required }) => (
  <div className="space-y-1.5">
     <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
     <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400/50 transition-all font-medium"
        placeholder={label}
     />
  </div>
);

const ColorPicker: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
     <label className="block text-[10px] font-bold text-white/20 uppercase tracking-widest">{label}</label>
     <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
        <input 
           type="color" 
           value={value} 
           onChange={e => onChange(e.target.value)}
           className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer bg-transparent"
        />
        <span className="text-[10px] font-mono text-white/40 uppercase">{value}</span>
     </div>
  </div>
);

export default Editor;
