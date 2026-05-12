import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  BarChart3, 
  LogOut,
  Zap,
  MoreVertical,
  Share2,
  Copy,
  Check,
  Smartphone,
  ChevronRight,
  TrendingUp,
  MousePointer2,
  X,
  MessageCircle,
  QrCode,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Download
} from 'lucide-react';
import { auth, db } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';
import { BusinessCard } from '../types';
import { INITIAL_CARD_DATA } from '../constants';
import { checkIsAdmin } from '../lib/auth-utils';
import { toast } from 'sonner';
import { cn, normalizeContactInfo } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { CardPreview } from '../components/CardPreview';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { AnalyticsEvent } from '../types';
import { orderBy, limit } from 'firebase/firestore';

const Dashboard: React.FC = () => {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareCard, setShareCard] = useState<BusinessCard | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dateRange, setDateRange] = useState<number>(7); // Days
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkVerifying, setIsBulkVerifying] = useState(false);
  
  const [viewMode, setViewMode] = useState<'personal' | 'global'>('personal');
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  const isLimitReached = !isAdmin && cards.length >= 1;

  useEffect(() => {
    const init = async () => {
      setIsAdminLoading(true);
      try {
        const admin = await checkIsAdmin();
        console.log('[Dashboard] Admin Status Check:', admin);
        setIsAdmin(admin);
        // Fetch cards immediately after admin check
        await fetchCards(admin, viewMode);
      } catch (err) {
        console.error('[Dashboard] Init failed:', err);
      } finally {
        setIsAdminLoading(false);
      }
    };
    init();
    syncUserVerification();
  }, [viewMode]);

  useEffect(() => {
    // Fetch analytics after admin check is complete
    if (!isAdminLoading) {
      const cardIds = cards.map(c => c.id);
      fetchAnalytics(cardIds, isAdmin, viewMode).catch(e => {
        console.warn('Analytics background fetch failed:', e);
      });
    }
  }, [dateRange, isAdmin, viewMode, isAdminLoading]);

  const syncUserVerification = async () => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) return;
    try {
      const q = query(collection(db, 'cards'), where('userId', '==', auth.currentUser.uid), where('ownerEmailVerified', '==', false));
      const snap = await getDocs(q);
      const updates = snap.docs.map(d => updateDoc(doc(db, 'cards', d.id), { ownerEmailVerified: true }));
      await Promise.all(updates);
    } catch (err) {
      console.warn('Silent sync failed:', err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shareId = params.get('share');
    if (shareId && cards.length > 0) {
      const card = cards.find(c => c.id === shareId);
      if (card) {
        setShareCard(card);
        // Clean up URL without reload
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.search, cards, navigate]);

  const fetchCards = async (adminOverride?: boolean, currentViewMode?: 'personal' | 'global') => {
    if (!auth.currentUser) return;
    const adminCheck = adminOverride ?? isAdmin;
    const activeViewMode = currentViewMode ?? viewMode;
    
    try {
      const q = (adminCheck && activeViewMode === 'global')
        ? query(collection(db, 'cards'), limit(500))
        : query(collection(db, 'cards'), where('userId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => {
        const raw = d.data();
        return { 
          id: d.id, 
          ...INITIAL_CARD_DATA,
          ...raw,
          phones: normalizeContactInfo(raw.phones, 'PHONE'),
          emails: normalizeContactInfo(raw.emails, 'EMAIL'),
          stats: {
            views: 0,
            clicks: {},
            ...raw.stats
          }
        } as BusinessCard;
      });
      setCards(data);
      if (data.length > 0) {
        fetchAnalytics(data.map(c => c.id), adminCheck, activeViewMode);
      }
    } catch (err: any) {
      console.warn('Dashboard cards fetch error:', err.message || err);
      let errorMsg = 'Access denied or network error.';
      if (err.message?.includes('permission')) {
        errorMsg = 'Insufficient permissions. Please check your account.';
      }
      // If we have a handleFirestoreError formatted JSON
      try {
        const parsed = JSON.parse(err.message);
        errorMsg = parsed.error || errorMsg;
      } catch (e) {}
      
      console.info('UI Error Message:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-[2rem] shadow-2xl flex flex-col gap-4">
        <p className="text-sm font-bold">Are you sure you want to permanently delete this card?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t);
              await executeDelete(id);
            }}
            className="flex-1 py-2 bg-red-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest"
          >
            Delete
          </button>
          <button 
            onClick={() => toast.dismiss(t)}
            className="flex-1 py-2 bg-white/5 text-white/40 font-black rounded-xl text-[10px] uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const executeDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'cards', id));
      setCards(prev => prev.filter(c => c.id !== id));
      toast.success("Card deleted successfully");
    } catch (err: any) {
      console.warn('Delete operation failed:', err);
      toast.error("Failed to delete card");
    } finally {
      setLoading(false);
    }
  };

  const toggleVerified = async (id: string, current: boolean) => {
    if (!isAdmin) return;
    const card = cards.find(c => c.id === id);
    
    if (!current && card && !card.ownerEmailVerified) {
      toast.error('Account owner has not verified their email address.');
      return;
    }

    try {
      await updateDoc(doc(db, 'cards', id), {
        verified: !current,
        updatedAt: Date.now()
      });
      setCards(cards.map(c => c.id === id ? { ...c, verified: !current } : c));
      toast.success(current ? "Unverified" : "Verified");
    } catch (err: any) {
      console.error('[Dashboard] toggleVerified error:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `cards/${id}`);
      } catch (finalErr: any) {
        toast.error('Failed to update status: ' + (finalErr.message || 'Permission denied'));
      }
    }
  };

  const fetchAnalytics = async (cardIds: string[], forceAdmin?: boolean, forceViewMode?: 'personal' | 'global') => {
    if (!auth.currentUser) return;
    setAnalyticsLoading(true);
    const timeLimit = Date.now() - (dateRange * 24 * 60 * 60 * 1000);
    const adminCheck = forceAdmin ?? isAdmin;
    const activeViewMode = forceViewMode ?? viewMode;
    console.log('[Dashboard] fetchAnalytics internal state:', { adminCheck, forceAdmin, isAdmin, activeViewMode, dateRange });

    try {
      let q;
      if (adminCheck && activeViewMode === 'global') {
        q = query(
          collection(db, 'analytics'), 
          limit(2000)
        );
      } else {
        q = query(
          collection(db, 'analytics'), 
          where('ownerId', '==', auth.currentUser.uid),
          limit(2000)
        );
      }
      const snap = await getDocs(q);
      const allDocs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as AnalyticsEvent));
      
      // Filter and sort client-side
      const filtered = allDocs
        .filter(e => e.timestamp >= timeLimit)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      setEvents(filtered);
    } catch (err: any) {
      console.warn('[Analytics] Primary fetch failed, trying fallback:', err.message || err);
      
      try {
        if (auth.currentUser) {
          // Fallback query MUST include ownerId unless user is admin to pass security rules
          let qFallback;
          if (adminCheck && activeViewMode === 'global') {
            qFallback = query(collection(db, 'analytics'), limit(1000));
          } else {
            qFallback = query(
              collection(db, 'analytics'), 
              where('ownerId', '==', auth.currentUser.uid),
              limit(1000)
            );
          }
          
          const snapBasic = await getDocs(qFallback);
          const allDocs = snapBasic.docs
            .map(d => ({ id: d.id, ...(d.data() as any) } as AnalyticsEvent))
            .sort((a, b) => b.timestamp - a.timestamp);
          setEvents(allDocs);
        }
      } catch (innerErr: any) {
        console.error('[Analytics] Final fallback failed:', innerErr);
        handleFirestoreError(innerErr, OperationType.LIST, 'analytics');
      }
    }
 finally {
      setAnalyticsLoading(false);
    }
  };

  const processChartData = () => {
    const end = startOfDay(new Date());
    const start = subDays(end, dateRange - 1);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayStr = format(day, 'MMM dd');
      const dayStart = day.getTime();
      const dayEnd = day.getTime() + 24 * 60 * 60 * 1000;

      const dayEvents = events.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd);
      
      return {
        name: dayStr,
        views: dayEvents.filter(e => e.type === 'view').length,
        interactions: dayEvents.filter(e => e.type !== 'view').length
      };
    });
  };

  const chartData = processChartData();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      setResending(true);
      try {
        await sendEmailVerification(auth.currentUser);
        toast.success('Verification email sent!');
      } catch (err) {
        toast.error('Error sending email. Try again later.');
      } finally {
        setResending(false);
      }
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/c/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectCard = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === cards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cards.map(c => c.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    toast.custom((t) => (
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-[2rem] shadow-2xl flex flex-col gap-4">
        <p className="text-sm font-bold">Are you sure you want to permanently delete {selectedIds.length} cards?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t);
              setIsBulkDeleting(true);
              setLoading(true);
              try {
                await Promise.all(selectedIds.map(id => deleteDoc(doc(db, 'cards', id))));
                setCards(prev => prev.filter(c => !selectedIds.includes(c.id)));
                setSelectedIds([]);
                toast.success(`${selectedIds.length} cards deleted`);
              } catch (err) {
                toast.error("Bulk delete failed");
              } finally {
                setIsBulkDeleting(false);
                setLoading(false);
              }
            }}
            className="flex-1 py-2 bg-red-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest"
          >
            Delete All
          </button>
          <button 
            onClick={() => toast.dismiss(t)}
            className="flex-1 py-2 bg-white/5 text-white/40 font-black rounded-xl text-[10px] uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const handleBulkVerify = async (verify: boolean) => {
    if (selectedIds.length === 0) return;
    
    setIsBulkVerifying(true);
    setLoading(true);
    const updatedCards = [...cards];
    try {
      // Process in batches or one by one to avoid total failure if one fails
      const results = await Promise.allSettled(selectedIds.map(async (id) => {
        await updateDoc(doc(db, 'cards', id), { 
          verified: verify,
          updatedAt: Date.now()
        });
        return id;
      }));
      
      const successfulIds: string[] = [];
      results.forEach(res => {
        if (res.status === 'fulfilled') {
          successfulIds.push(res.value);
          const idx = updatedCards.findIndex(c => c.id === res.value);
          if (idx !== -1) updatedCards[idx].verified = verify;
        } else {
          console.error(`Verification failed for card:`, res.reason);
          try {
            handleFirestoreError(res.reason, OperationType.UPDATE, 'cards');
          } catch (err) {
            // Error already logged by handleFirestoreError
          }
        }
      });
      
      setCards(updatedCards);
      setSelectedIds([]);
      
      if (successfulIds.length === selectedIds.length) {
        toast.success(`${successfulIds.length} cards ${verify ? 'verified' : 'unverified'}`);
      } else {
        toast.warning(`Updated ${successfulIds.length}/${selectedIds.length} cards. Some failed.`);
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, 'cards');
    } finally {
      setIsBulkVerifying(false);
      setLoading(false);
    }
  };

  const totalViews = cards.reduce((acc, curr) => acc + (curr.stats?.views || 0), 0);
  const totalClicksTotal = cards.reduce((acc, curr) => {
    const clicks = curr.stats?.clicks || {};
    const cardClicks = Object.values(clicks).reduce((a: number, b: number) => a + (b || 0), 0);
    return acc + cardClicks;
  }, 0);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-yellow-400 selection:text-black">
      <div className="max-w-7xl mx-auto">
        {/* Verification Banner */}
        {auth.currentUser && !auth.currentUser.emailVerified && !isAdmin && (
          <div className="mb-12 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">Email Not Verified</h3>
                <p className="text-white/40 text-sm">Verify your identity to unlock publishing capabilities.</p>
              </div>
            </div>
            <button 
              onClick={handleResendVerification}
              disabled={resending}
              className="px-6 py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-400 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Link'}
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
             <Link to="/" className="w-14 h-14 bg-transparent rounded-2xl flex items-center justify-center hover:scale-105 transition-transform">
                <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="TapNix Logo" className="w-14 h-14 object-contain" />
             </Link>
             <div>
                <div className="flex items-center gap-3">
                   <h1 className="text-3xl font-black tracking-tight">Tap<span className="text-yellow-400">Nix</span> Terminal</h1>
                   {isAdmin && (
                      <div className="flex items-center bg-white/5 p-1 rounded-lg">
                        <button 
                          onClick={() => setViewMode('personal')}
                          className={cn(
                            "px-3 py-1 text-[8px] font-black uppercase rounded-md tracking-widest transition-all",
                            viewMode === 'personal' ? "bg-yellow-400 text-black shadow-lg" : "text-white/40"
                          )}
                        >
                          Personal
                        </button>
                        <button 
                          onClick={() => setViewMode('global')}
                          className={cn(
                            "px-3 py-1 text-[8px] font-black uppercase rounded-md tracking-widest transition-all",
                            viewMode === 'global' ? "bg-red-500 text-white shadow-lg" : "text-white/40"
                          )}
                        >
                          Global
                        </button>
                      </div>
                   )}
                </div>
                <p className="text-white/40 text-sm font-medium">
                  {viewMode === 'global' ? "Administrative control over all nodes" : "Command center for your professional identity"}
                </p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             {isLimitReached ? (
               <div className="flex flex-col items-end">
                 <button 
                    disabled
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-zinc-800 text-white/20 font-black rounded-2xl cursor-not-allowed border border-white/5"
                 >
                    <Plus className="w-5 h-5" />
                    Limit Reached
                 </button>
                 <p className="text-[10px] font-bold text-yellow-400 mt-2 uppercase tracking-widest animate-pulse">Upgrade for extra cards</p>
               </div>
             ) : (
               <Link 
                  to="/edit" 
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-400/10"
               >
                  <Plus className="w-5 h-5" />
                  Initialize Card
               </Link>
             )}
             <button 
                onClick={handleLogout}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all group"
             >
                <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
             </button>
          </div>
        </div>

        {/* Order Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-gradient-to-r from-zinc-900 to-zinc-800 border border-white/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-yellow-400 shrink-0">
                <Smartphone className="w-8 h-8" />
             </div>
             <div>
                <h2 className="text-xl font-black mb-1">Upgrade to Physical NFC</h2>
                <p className="text-white/40 text-sm font-medium">Order your premium laser-etched Tap<span className="text-yellow-400">Nix</span> card today.</p>
             </div>
          </div>
          <a 
            href={`https://wa.me/251920508303?text=Hello TapNix, I want to order a physical card for my profile ${window.location.host}`}
            target="_blank"
            className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-yellow-400 transition-all text-sm uppercase tracking-widest grow sm:grow-0"
          >
             Order via WhatsApp
             <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Statistics or Skeletons */}
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
             <StatBox title="Card Impressions" value={totalViews} icon={<BarChart3 />} subtitle="Total profile views" />
             <StatBox title="Engagement" value={totalClicksTotal} icon={<MousePointer2 />} subtitle="Total interactions" />
             <StatBox title="Digital Cards" value={cards.length} icon={<Zap />} subtitle="Active deployments" />
             <StatBox 
                title="Growth Status" 
                value="Optimum" 
                icon={<TrendingUp />} 
                subtitle="Network health: Good" 
                color="text-green-400" 
             />
          </div>
        )}

        {/* Detailed Trends */}
        {cards.length > 0 && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-12 bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden"
           >
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-xl font-black mb-1">Network Activity</h2>
                    <p className="text-white/40 text-sm font-medium">Performance over the last 7 days</p>
                 </div>
                 <div className="flex bg-white/5 p-1 rounded-xl">
                    {[7, 30, 90].map(range => (
                      <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={cn(
                          "px-4 py-1.5 text-[9px] font-black rounded-lg transition-all",
                          dateRange === range ? "bg-yellow-400 text-black shadow-lg" : "text-white/40 hover:text-white"
                        )}
                      >
                        {range}D
                      </button>
                    ))}
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-yellow-400" />
                       <span className="text-[10px] font-black uppercase text-white/40">Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-white/20" />
                       <span className="text-[10px] font-black uppercase text-white/40">Interactions</span>
                    </div>
                 </div>
              </div>

              <div className="h-[300px] w-full min-h-[300px] relative">
                 {(analyticsLoading || isAdminLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm z-10 rounded-2xl">
                       <div className="animate-pulse flex flex-col items-center">
                          <BarChart3 className="w-12 h-12 mb-4 text-yellow-400" />
                          <p className="text-xs font-black uppercase tracking-widest text-yellow-400">Calibrating Analytics...</p>
                       </div>
                    </div>
                 )}
                 
                 <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height={300} minHeight={0}>
                       <AreaChart 
                          data={chartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                       >
                          <defs>
                             <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis 
                             dataKey="name" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 700 }}
                             dy={10}
                          />
                          <YAxis hide />
                          <Tooltip 
                             contentStyle={{ 
                                backgroundColor: '#18181b', 
                                border: '1px solid #ffffff10', 
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: 900,
                                color: '#fff'
                             }}
                             itemStyle={{ color: '#eab308' }}
                             cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                          />
                          <Area 
                             type="monotone" 
                             dataKey="views" 
                             stroke="#eab308" 
                             strokeWidth={4}
                             fillOpacity={1} 
                             fill="url(#colorViews)" 
                             animationDuration={2000}
                          />
                          <Area 
                             type="monotone" 
                             dataKey="interactions" 
                             stroke="#ffffff20" 
                             strokeWidth={2}
                             fill="transparent"
                             animationDuration={2500}
                          />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </motion.div>
        )}

        {/* Cards Management */}
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
           <div className="flex items-center gap-4">
              <h2 className="text-xl font-black uppercase tracking-widest text-white/40">Active Deployments</h2>
              {isAdmin && cards.length > 0 && (
                <button 
                  onClick={handleSelectAll}
                  className="text-[10px] font-black uppercase bg-white/5 px-3 py-1 rounded-lg text-white/40 hover:bg-white/10 transition-colors"
                >
                  {selectedIds.length === cards.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
           </div>
           <span className="text-[10px] font-black uppercase bg-zinc-800 px-3 py-1 rounded-full text-white/40">{cards.length} Node(s) Online</span>
        </div>
        
        {loading ? (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2].map(i => (
                <div key={i} className="bg-zinc-900/50 h-64 rounded-[3rem] animate-pulse border border-white/5" />
              ))}
           </div>
        ) : cards.length > 0 ? (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {cards.map((card, idx) => {
                // @ts-ignore
                const cardClicksMap = card.stats?.clicks || {};
                const cardClicks = Object.values(cardClicksMap).reduce((a: any, b: any) => a + (b || 0), 0);
                
                return (
                 <motion.div 
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={card.id}
                    onClick={() => isAdmin && handleSelectCard(card.id)}
                    className={cn(
                      "bg-zinc-900 border rounded-[3rem] p-8 flex flex-col md:flex-row gap-8 items-start group transition-all relative overflow-hidden",
                      isAdmin && "cursor-pointer",
                      selectedIds.includes(card.id) ? "border-yellow-400 bg-yellow-400/5" : "border-white/5 hover:border-white/10"
                    )}
                 >
                    {isAdmin && (
                      <div className={cn(
                        "absolute top-8 left-8 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        selectedIds.includes(card.id) ? "bg-yellow-400 border-yellow-400" : "border-white/10 bg-black/50"
                      )}>
                        {selectedIds.includes(card.id) && <Check className="w-4 h-4 text-black" />}
                      </div>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-yellow-400/10 transition-colors"></div>
                    
                    <div className={cn(
                      "w-40 h-40 rounded-3xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/5 shadow-2xl",
                      isAdmin && "ml-10 md:ml-0"
                    )}>
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="flex-1 w-full">
                       <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-2xl font-black mb-1 leading-none flex items-center gap-2">
                               {card.name}
                               {card.verified && <CheckCircle2 className="w-4 h-4 text-yellow-500 fill-yellow-500/10" />}
                               {isAdmin && !card.ownerEmailVerified && (
                                  <span className="text-[8px] px-2 py-0.5 bg-red-500/20 text-red-500 font-bold rounded uppercase tracking-widest border border-red-500/20">Unverified Account</span>
                               )}
                               {isAdmin && card.ownerEmailVerified && !card.verified && (
                                  <span className="text-[8px] px-2 py-0.5 bg-green-500/20 text-green-500 font-bold rounded uppercase tracking-widest border border-green-500/20">Email Verified</span>
                               )}
                            </h3>
                            <div className="flex items-center gap-2">
                               <p className="text-yellow-400 font-black uppercase tracking-widest text-[10px]">{card.title} • {card.organization}</p>
                               {isAdmin && card.userId !== auth.currentUser?.uid && (
                                  <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md uppercase tracking-widest">Global Card</span>
                               )}
                            </div>
                            {isAdmin && (
                               <p className="text-[9.5px] text-white/30 mt-1.5 font-mono flex items-center gap-1.5 bg-white/5 py-1 px-2 rounded-lg w-fit">
                                  <UserCheck size={10} className="text-blue-400" />
                                  Owner ID: {card.userId}
                               </p>
                            )}
                          </div>
                          <div className="flex gap-1 items-center">
                             {isAdmin && (
                                <button 
                                   onClick={() => toggleVerified(card.id, !!card.verified)}
                                   className={cn(
                                     "p-2 transition-colors rounded-lg",
                                     card.verified ? "text-yellow-500 hover:bg-yellow-500/10" : "text-white/20 hover:text-yellow-500 hover:bg-white/5"
                                   )}
                                   title={card.verified ? "Remove Verified Status" : "Mark as Verified"}
                                >
                                   <CheckCircle2 className="w-4 h-4" />
                                </button>
                             )}
                             <button 
                                onClick={() => handleDelete(card.id)}
                                className={cn(
                                   "p-2 transition-colors rounded-lg",
                                   isAdmin && card.userId !== auth.currentUser?.uid ? "text-red-400/40 hover:text-red-500 hover:bg-red-500/10" : "text-white/20 hover:text-red-500"
                                )}
                                title="Delete Card"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3 mb-6 mt-4">
                          <MiniStat label="Impressions" value={card.stats?.views || 0} />
                          <MiniStat 
                             label="Total Clicks" 
                             // @ts-ignore
                             value={cardClicks} 
                          />
                       </div>
                       
                       <div className="flex flex-col sm:flex-row items-center gap-3">
                          <button 
                             onClick={() => copyLink(card.id)}
                             className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white text-black rounded-2xl hover:bg-yellow-400 transition-all font-black text-xs uppercase tracking-widest shadow-lg"
                          >
                             {copiedId === card.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                             {copiedId === card.id ? 'Copied' : 'Copy URL'}
                          </button>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Link 
                                to={`/edit/${card.id}`}
                                className="flex-1 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                <Edit3 className="w-5 h-5 text-white/60" />
                            </Link>
                            <button 
                                onClick={() => setShareCard(card)}
                                className="flex-1 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                <Share2 className="w-5 h-5 text-white/60" />
                            </button>
                            <Link 
                                target="_blank"
                                to={`/c/${card.id}`} 
                                className="flex-1 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                <ExternalLink className="w-5 h-5 text-white/60" />
                            </Link>
                          </div>
                       </div>
                    </div>
                 </motion.div>
                );
              })}
           </div>
        ) : (
           <div className="bg-zinc-900 border border-dashed border-white/10 rounded-[3rem] py-32 text-center">
              <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 opacity-20 p-4">
                 <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="TapNix Logo" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-3xl font-black mb-3">No Nodes Active</h3>
              <p className="text-white/40 mb-10 max-w-sm mx-auto font-medium leading-relaxed font-sans">Your digital connectivity hub is offline. Deploy your first professional business card to begin networking.</p>
              {isLimitReached ? (
                <div className="inline-flex flex-col items-center">
                  <button disabled className="px-12 py-5 bg-zinc-800 text-white/20 font-black rounded-2xl cursor-not-allowed border border-white/5">
                     Limit Reached
                  </button>
                  <p className="text-xs font-bold text-yellow-400 mt-4 uppercase tracking-widest">Connect with support to unlock more nodes</p>
                </div>
              ) : (
                <Link to="/edit" className="inline-flex items-center gap-3 px-12 py-5 bg-yellow-400 text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-yellow-400/20">
                   Deploy First Card
                   <Plus className="w-6 h-6" />
                </Link>
              )}
           </div>
        )}

        {/* Share Modal */}
        <AnimatePresence>
           {shareCard && (
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
              >
                 <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] max-w-md w-full text-center relative"
                 >
                    <button 
                       onClick={() => setShareCard(null)} 
                       className="absolute top-8 right-8 p-2 text-white/20 hover:text-white transition-colors"
                    >
                       <X />
                    </button>
                    
                    <h3 className="text-3xl font-black text-white mb-2">Share Identity</h3>
                    <p className="text-white/40 text-sm mb-10 font-medium tracking-tight">Your digital handshake is ready for transmission.</p>
                    
                    <div className="bg-white p-8 rounded-[2rem] inline-block shadow-2xl shadow-yellow-400/10 mb-10">
                       <QRCodeSVG 
                         value={`${window.location.origin}/c/${shareCard.id}`}
                         size={220} 
                         level="H"
                       />
                    </div>
                    
                    <div className="flex flex-col gap-3">
                       <button 
                          onClick={() => copyLink(shareCard.id)}
                          className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                       >
                          <Copy size={18} />
                          Copy Profile Link
                       </button>

                       <div className="grid grid-cols-2 gap-3">
                          <button 
                             onClick={async () => {
                                const id = `card-capture-${shareCard.id}`;
                                const node = document.getElementById(id);
                                if (node) {
                                   try {
                                      toast.loading("Processing high-res capture...");
                                      node.classList.add('downloading');
                                      // @ts-ignore
                                      const { toJpeg } = await import('html-to-image');
                                      const { default: download } = await import('downloadjs');
                                      
                                      const dataUrl = await toJpeg(node, {
                                         quality: 0.95,
                                         pixelRatio: 3,
                                         backgroundColor: shareCard.colors.cardBg,
                                         style: {
                                            transform: 'scale(1)',
                                            margin: '0',
                                            padding: '40px 20px',
                                            width: '450px',
                                            height: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column'
                                         }
                                      });
                                      node.classList.remove('downloading');
                                      download(dataUrl, `${shareCard.name.replace(/\s+/g, '_')}_Card.jpg`);
                                      toast.dismiss();
                                      toast.success("Card saved to gallery");
                                   } catch (err) {
                                      console.error(err);
                                      toast.error("Capture failed");
                                   }
                                }
                             }}
                             className="py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-105 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                             <Download size={18} />
                             JPG
                          </button>
                          <a 
                             href={`https://wa.me/?text=Check out my digital business card: ${window.location.origin}/c/${shareCard.id}`}
                             target="_blank"
                             className="py-4 bg-zinc-800 text-white font-black rounded-2xl hover:bg-[#25D366] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                             <MessageCircle size={18} />
                             WA
                          </a>
                       </div>
                    </div>

                    {/* Hidden Capture Element */}
                    <div className="fixed -left-[2000px] top-0 pointer-events-none opacity-0">
                       <div id={`card-capture-${shareCard.id}`}>
                          <CardPreview card={shareCard} />
                       </div>
                    </div>
                 </motion.div>
              </motion.div>
           )}
        </AnimatePresence>

        {/* Admin Bulk Actions Bar */}
        <AnimatePresence>
          {isAdmin && selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] w-full max-w-2xl px-6"
            >
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl shadow-black">
                <div className="px-6">
                  <p className="text-sm font-black tracking-tight">{selectedIds.length} Selected</p>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Bulk Management Mode</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleBulkVerify(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all"
                  >
                    Verify
                  </button>
                  <button 
                    onClick={() => handleBulkVerify(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Unverify
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-20 border-t border-white/5 pt-12 pb-20 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/10">
              Terminal Infrastructure • Ethiopia
            </p>
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string; subtitle: string }> = ({ title, value, icon, color, subtitle }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
    className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] flex flex-col items-start gap-6 group hover:border-yellow-400/20 transition-all shadow-xl"
  >
     <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform shadow-inner">
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
     </div>
     <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">{title}</p>
        <p className={cn("text-4xl font-black tracking-tighter", color || "text-white")}>{value}</p>
        <p className="text-[10px] font-bold text-white/20 mt-1 uppercase tracking-tight">{subtitle}</p>
     </div>
  </motion.div>
);

const MiniStat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="px-5 py-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
     <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-1">{label}</p>
     <p className="text-xl font-black">{value}</p>
  </div>
);

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] h-[180px] animate-pulse flex flex-col gap-6">
        <div className="w-14 h-14 bg-white/5 rounded-2xl" />
        <div className="space-y-3">
          <div className="h-2 w-16 bg-white/5 rounded" />
          <div className="h-8 w-24 bg-white/5 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default Dashboard;
