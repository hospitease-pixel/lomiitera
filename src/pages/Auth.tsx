import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, User, Chrome, X } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        await sendEmailVerification(res.user);
        toast.success("Welcome! Account created. Verification email sent.");
        
        // Initial user setup in Firestore
        try {
          await setDoc(doc(db, 'users', res.user.uid), {
            uid: res.user.uid,
            email: res.user.email,
            displayName: name,
            createdAt: Date.now()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${res.user.uid}`);
        }
      }
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Firebase Error: Please enable "Email/Password" in your Firebase Auth Console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Firebase Error: Please add this domain to "Authorized Domains" in your Firebase Auth Settings.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const res = await signInWithPopup(auth, provider);
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', res.user.uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${res.user.uid}`);
      }
      
      if (!userDoc?.exists()) {
        try {
          await setDoc(doc(db, 'users', res.user.uid), {
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName,
            createdAt: Date.now()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${res.user.uid}`);
        }
      }
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        setError('Sign-in failed: Browser blocked the popup. Please allow popups for this site.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Firebase Error: Please add this domain to "Authorized Domains" in your Firebase Auth Settings.');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
        
        <div className="flex flex-col items-center mb-10 relative">
          <Link 
            to="/" 
            className="absolute -top-4 -left-4 p-2 text-white/20 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center mb-6">
            <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="TapNix Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-black">{isLogin ? 'Welcome Back' : 'Join TapNix'}</h1>
          <p className="text-white/40 font-medium mt-2">Professional NFC Networking.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/[0.08] transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/[0.08] transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/[0.08] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center px-4">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-yellow-400 text-black font-black rounded-2xl hover:bg-yellow-300 active:scale-95 transition-all shadow-lg shadow-yellow-400/10 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : <>Join TapNix</>)}
          </button>
        </form>

        <div className="mt-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Or continue with</span>
                <div className="flex-1 h-px bg-white/10"></div>
            </div>
            <button 
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black hover:bg-gray-50 active:scale-[0.98] transition-all font-bold rounded-2xl shadow-xl shadow-black/20"
            >
                <div className="w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                </div>
                <span className="text-sm">Continue with Google</span>
            </button>
        </div>

        <p className="mt-10 text-center text-sm font-medium text-white/40">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-yellow-400 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
