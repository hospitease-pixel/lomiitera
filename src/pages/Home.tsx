import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  Zap, 
  Smartphone, 
  ShieldCheck, 
  BarChart3, 
  Share2, 
  ArrowRight,
  ChevronRight,
  Linkedin,
  Globe,
  MapPin,
  Wifi,
  Signal,
  Battery,
  Mail,
  Briefcase,
  Key,
  RefreshCw,
  Palette,
  Lightbulb,
  DollarSign,
  QrCode,
  Files,
  Cpu,
  Target,
  Users,
  Utensils,
  Home as HomeIcon,
  MousePointer2,
  CheckCircle2,
  Stethoscope,
  Sun,
  Moon
} from 'lucide-react';

const TechWeb: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 60;
    const connectionDistance = 150;
    const mouse = { x: -100, y: -100 };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        // Theme aware colors
        this.color = Math.random() > 0.5 ? '#facc15' : (isDarkMode ? '#ffffff' : '#3f3f46'); 
      }

      update(width: number, height: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Interaction with mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          this.x -= dx * 0.01;
          this.y -= dy * 0.01;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.update(canvas.width, canvas.height);
        p.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const opacity = 1 - dist / connectionDistance;
            ctx.strokeStyle = isDarkMode ? `rgba(250, 204, 21, ${opacity * 0.2})` : `rgba(63, 63, 70, ${opacity * 0.4})`; 
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      init();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDarkMode]);

  return (
    <canvas 
      ref={canvasRef} 
      className={cn(
        "absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000",
        isDarkMode ? "opacity-40" : "opacity-70"
      )}
    />
  );
};

const Home: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [showTapAnim, setShowTapAnim] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setShowTapAnim(prev => !prev);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-700 font-sans selection:bg-yellow-400 selection:text-black",
      isDarkMode ? "bg-black text-white" : "bg-white text-zinc-900"
    )}>
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 w-full z-50 backdrop-blur-md border-b transition-colors duration-500",
        isDarkMode ? "bg-black/50 border-white/10" : "bg-white/80 border-black/5"
      )}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link 
            to="/" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2"
          >
            <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="TapNix Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold tracking-tighter">Tap<span className="text-yellow-400">Nix</span></span>
          </Link>
          <div className={cn(
            "hidden md:flex items-center gap-8 text-sm font-medium transition-colors",
            isDarkMode ? "text-white/70" : "text-zinc-600"
          )}>
            <a href="#features" className="hover:text-yellow-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-yellow-400 transition-colors">Process</a>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2 rounded-full transition-all hover:scale-110",
                isDarkMode ? "bg-white/5 text-yellow-400 hover:bg-white/10" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              )}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link to="/auth" className={cn(
              "px-5 py-2.5 rounded-full transition-all font-bold",
              isDarkMode ? "bg-white text-black hover:bg-yellow-400" : "bg-zinc-900 text-white hover:bg-yellow-400 hover:text-black"
            )}>
              Create your Digital Card here
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2 rounded-full",
                isDarkMode ? "text-yellow-400" : "text-zinc-900"
              )}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/auth" className="text-yellow-400">
               <Smartphone />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Tech Web Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <TechWeb isDarkMode={isDarkMode} />
        </motion.div>
        
        {/* Background Logo with overlay for visibility */}
        <div className="absolute inset-x-0 inset-y-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
            <img 
               src="https://i.ibb.co/vv4pCsm7/Tap-Nix-Business-Card-1.png" 
               alt="TapNix Logo Background" 
               className={cn(
                 "w-screen min-w-full h-auto scale-110 object-contain transition-all translate-y-24",
                 isDarkMode ? "opacity-5 grayscale brightness-125" : "opacity-[0.03] grayscale invert brightness-0"
               )} 
            />
         </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-bold mb-6">
              Networking 2.0 is here
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1] mb-8 drop-shadow-2xl overflow-hidden">
              <motion.span 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="block"
              >
                Business networking
              </motion.span>
              <motion.span 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="block"
              >
                meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">innovation.</span>
              </motion.span>
            </h1>
            <div className={cn(
              "backdrop-blur-sm p-6 rounded-3xl max-w-2xl mx-auto mb-10 border transition-all",
              isDarkMode ? "bg-black/40 border-white/5" : "bg-zinc-50 border-zinc-200"
            )}>
              <p className={cn(
                "text-lg md:text-xl leading-relaxed font-medium transition-colors",
                isDarkMode ? "text-white/70" : "text-zinc-600"
              )}>
                Ditch the paper legacy. Tap<span className="text-yellow-400">Nix</span> empowers professionals with NFC technology to share expertise, track engagement, and build lasting connections in one tap.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link to="/auth" className="group flex items-center gap-2 w-full sm:w-auto px-8 py-5 bg-yellow-400 text-black text-lg font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-400/20">
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className={cn(
                "w-full sm:w-auto px-8 py-5 border rounded-2xl transition-all font-bold flex items-center justify-center gap-2",
                isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 text-zinc-900 hover:bg-zinc-200"
              )}>
                Learn More
              </a>
            </div>

            {/* iPhone 16 Pro Mockup Showcase */}
            <motion.div 
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4, duration: 0.8 }}
               className="relative max-w-[280px] mx-auto mt-20"
            >
               {/* Floating Container */}
               <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
               >
                  {/* Grab Yours Ribbon - Outside Top Right */}
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ delay: 1 }}
                    className="absolute -top-8 -right-16 z-50 rotate-12 hidden md:block"
                  >
                    <div className="bg-yellow-400 text-black text-xs font-black px-4 py-2 rounded-xl shadow-2xl border-2 border-black/5 uppercase tracking-tighter flex items-center gap-2 whitespace-nowrap">
                      <Zap size={14} className="fill-current" />
                      Grab yours
                    </div>
                  </motion.div>

                  {/* Mobile version of ribbon */}
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute -top-4 -right-4 z-50 rotate-12 md:hidden"
                  >
                    <div className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-tighter flex items-center gap-1 whitespace-nowrap">
                      <Zap size={10} className="fill-current" />
                      Grab yours
                    </div>
                  </motion.div>

                  {/* Glow effect behind the phone */}
                  <div className="absolute -inset-4 bg-yellow-400/20 blur-3xl opacity-50 rounded-full animate-pulse"></div>
                  
                  {/* iPhone 16 Pro Frame */}
                  <div className="relative z-10 w-full aspect-[9/19.5] bg-zinc-950 rounded-[3rem] p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_0_0_4px_rgba(255,255,255,0.05),0_20px_50px_-10px_rgba(0,0,0,0.8)] border-[1.5px] border-zinc-800 ring-1 ring-white/10">
                     {/* Dynamic Island */}
                     <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-30 flex items-center justify-around px-2 shadow-inner border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20"></div>
                        <div className="w-8 h-px bg-zinc-800 rounded-full"></div>
                     </div>
                     
                     {/* Screen Content */}
                     <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col relative text-gray-900 border-[6px] border-zinc-950">
                        {/* iPhone Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-10 z-40 flex items-center justify-between px-8 text-black pointer-events-none">
                           <span className="text-[10px] font-bold">9:41</span>
                           <div className="flex items-center gap-1">
                              <Signal size={10} strokeWidth={3} />
                              <Wifi size={10} strokeWidth={3} />
                              <div className="relative w-5 h-2.5 border-[1.5px] border-black rounded-[3px] flex items-center px-[1px]">
                                 <div className="h-full w-[80%] bg-black rounded-[1px]"></div>
                                 <div className="absolute -right-[3px] w-[2px] h-[3px] bg-black rounded-r-full"></div>
                              </div>
                           </div>
                        </div>
   
                        {/* Inner Card Content - Pixel perfect replica of user-provided HTML */}
                        <div className="w-full h-full overflow-hidden bg-white relative">
                           {/* Graph Pattern Background (from HTML snippet) */}
                           <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px]"></div>
   
                           {/* Top Logo Area (absolute to be behind) */}
                           <div className="absolute top-7 left-0 right-0 h-36 bg-white z-10 overflow-hidden border-b border-gray-50">
                              <img 
                                 src="https://i.ibb.co/4ZdXW4dG/Tap-Nix-Business-Card-2.png" 
                                 alt="Company Logo" 
                                 className="w-full h-full object-cover"
                              />
                           </div>
   
                           {/* Centered Watermark Logo (Tap-Nix-Business-Card-2.png from HTML) */}
                           <div className="absolute inset-0 z-10 pointer-events-none flex justify-center items-center" style={{ top: '25%' }}>
                               <img 
                                   src="https://i.ibb.co/4ZdXW4dG/Tap-Nix-Business-Card-2.png" 
                                   alt="Watermark" 
                                   className="w-full h-auto object-contain opacity-[0.005] grayscale" 
                               />
                           </div>
   
                               {/* Relative Content z-20 - Scaled for screen size */}
                               <div className="relative z-20 pt-24 sm:pt-32 px-2 sm:px-3 pb-8 text-center flex-1">
                                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full border-4 border-white shadow-xl overflow-hidden bg-white mb-2">
                                     <img 
                                        src="https://i.ibb.co/YFBz7qtt/Tap-Nix-Logo.png" 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                     />
                                  </div>
                                  
                                  <h4 className="text-sm sm:text-base font-extrabold text-gray-900 mb-0.5">Sofonias Genanaw</h4>
                                  
                                  <div className="flex items-center justify-center gap-1 flex-wrap mb-1">
                                     <span className="text-black font-bold text-[8px] sm:text-[9px]">Tap<span className="text-yellow-500">Nix</span></span>
                                     <span className="text-gray-300 font-bold">•</span>
                                     <span className="text-gray-600 font-semibold text-[7px] sm:text-[8px]">Sales Manager</span>
                                  </div>
    
                                  <p className="text-gray-400 text-[6px] sm:text-[7px] font-medium leading-tight mb-3 px-2">One Tap. Done. Networking reinvented.</p>
    
                                  {/* Social Links (Bubbles) */}
                                  <div className="flex justify-center gap-1 sm:gap-1.5 mb-3">
                                     <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center shadow-sm text-gray-700">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 sm:w-3 sm:h-3"><path d="m7 19 1.1-3.2A7 7 0 1 1 12 19a7 7 0 0 1-2.7-.5L7 19Z"></path><path d="M10.4 9.7c.2-.3.6-.3.8-.1l.9 1c.2.2.2.5.1.8l-.5.6c.5 1 1.2 1.7 2.2 2.2l.6-.5c.3-.1.6-.1.8.1l1 .9c.2.2.2.6-.1.8-.7.6-1.7.8-2.5.5-2.4-.8-4.3-2.7-5.1-5.1-.3-.8-.1-1.8.5-2.5Z"></path></svg>
                                     </div>
                                     <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center shadow-sm text-gray-700">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 sm:w-3 sm:h-3"><path d="M21 3 10 14"></path><path d="m21 3-7 18-4.5-6.5L3 10l18-7Z"></path></svg>
                                     </div>
                                     <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center shadow-sm text-gray-700">
                                        <Linkedin size={10} className="sm:w-3 sm:h-3" />
                                     </div>
                                  </div>
    
                                  {/* Phone Button */}
                                  <div className="bg-black text-white py-1.5 rounded-lg text-[7px] sm:text-[8px] font-bold flex items-center justify-center gap-1 mb-2 shadow-md">
                                     <Smartphone size={8} /> Call: +251920508303
                                  </div>
    
                                  {/* Email Buttons */}
                                  <div className="space-y-1 mb-2 sm:mb-3">
                                     <a href="mailto:info@tapnix.com" className="bg-black text-white py-1 rounded-lg text-[6px] sm:text-[7px] font-bold flex items-center justify-center gap-1 shadow-md">
                                        <Mail size={8} /> info@tapnix.com
                                     </a>
                                     <a href="mailto:Sofoniasgenanaw12@gmail.com" className="bg-black text-white py-1 rounded-lg text-[6px] sm:text-[7px] font-bold flex items-center justify-center gap-1 shadow-md">
                                        <Mail size={8} /> Sofoniasgenanaw12@gmail.com
                                     </a>
                                  </div>
    
                                  {/* Grid Buttons */}
                                  <div className="grid grid-cols-2 gap-1 mb-1">
                                     <div className="bg-gray-100 text-gray-800 p-1.5 sm:p-2 rounded-lg text-[6px] sm:text-[7px] font-bold flex items-center justify-center gap-1 shadow-sm">
                                        <Globe size={8} /> Website
                                     </div>
                                     <div className="bg-gray-100 text-gray-800 p-1.5 sm:p-2 rounded-lg text-[6px] sm:text-[7px] font-bold flex items-center justify-center gap-1 shadow-sm">
                                        <MapPin size={8} /> Location
                                     </div>
                                  </div>
                                  <div className="w-full bg-gray-100 text-gray-800 p-1.5 sm:p-2 rounded-lg text-[6px] sm:text-[7px] font-bold flex items-center justify-center gap-1 shadow-sm mb-3 sm:mb-4">
                                      <Briefcase size={8} /> Portfolio
                                  </div>
    
                                  {/* Action Buttons */}
                                  <div className="space-y-1 sm:space-y-1.5">
                                     <div className="w-full py-1.5 sm:py-2 bg-black text-white font-bold rounded-lg text-[6px] sm:text-[7px] uppercase tracking-widest shadow-md">
                                        Save Image
                                     </div>
                                     <div className="w-full py-1.5 sm:py-2 bg-black text-white font-bold rounded-lg text-[6px] sm:text-[7px] uppercase tracking-widest shadow-md">
                                        Save Contact
                                     </div>
                                     <div className="w-full py-1.5 sm:py-2 bg-gray-100 text-gray-800 font-bold rounded-lg text-[6px] sm:text-[7px] uppercase tracking-widest">
                                        View QR Code
                                     </div>
                                  </div>
                               </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Side Buttons Decor */}
                  <div className="absolute top-24 -right-1 w-1 h-8 bg-zinc-800 rounded-l-sm border-r border-white/5"></div>
                  <div className="absolute top-36 -right-1 w-1 h-6 bg-zinc-800 rounded-l-sm border-r border-white/5"></div>
                  <div className="absolute top-24 -left-1 w-1 h-12 bg-zinc-800 rounded-r-sm border-l border-white/5"></div>
               </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className={cn(
        "py-24 px-6 border-t transition-colors",
        isDarkMode ? "border-white/5 bg-black/50" : "border-zinc-200 bg-zinc-50/50"
      )}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black mb-6"
            >
              The <span className="text-yellow-400">Process</span>
            </motion.h2>
            <p className={cn(
              "text-lg font-medium transition-colors",
              isDarkMode ? "text-white/40" : "text-zinc-500"
            )}>Three simple steps to revolutionize your networking.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Lines for Desktop */}
            <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
            
            <ProcessStep 
              isDarkMode={isDarkMode}
              number="01"
              icon={<Users className="w-8 h-8" />}
              title="Sign Up Account"
              description="Create your secure profile in seconds. Your journey to digital connectivity begins with a single tap."
              delay={0.1}
            />
            <ProcessStep 
              isDarkMode={isDarkMode}
              number="02"
              icon={<Palette className="w-8 h-8" />}
              title="Create Digital Card"
              description="Design your professional identity. Add links, social media, and portfolio to your personalized landing page."
              delay={0.2}
            />
            <ProcessStep 
              isDarkMode={isDarkMode}
              number="03"
              icon={<img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="TapNix" className="w-8 h-8 object-contain" />}
              title="Share & Order"
              description={<>Share your link instantly, or order your laser-etched physical Tap<span className="text-yellow-400">Nix</span> NFC card for the premium experience.</>}
              delay={0.3}
              isLast
            />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className={cn("py-24 px-6 border-t transition-colors", isDarkMode ? "border-white/5" : "border-zinc-200")}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              isDarkMode={isDarkMode}
              icon={<Smartphone className="w-8 h-8"/>}
              title="Touch-to-Connect"
              description="NFC technology ensures your digital card is instantly delivered to any smartphone. No app required."
            />
            <FeatureCard 
              isDarkMode={isDarkMode}
              icon={<ShieldCheck className="w-8 h-8"/>}
              title="Secure & Reliable"
              description="Your professional data is protected with enterprise-grade security. You control what you share."
            />
            <FeatureCard 
              isDarkMode={isDarkMode}
              icon={<BarChart3 className="w-8 h-8"/>}
              title="Real-time Analytics"
              description="Track views, button clicks, and social engagement. Understand your networking impact like never before."
            />
          </div>
        </div>
      </section>

      {/* NFC Explanation Section */}
      <section className={cn("py-24 px-6 transition-colors", isDarkMode ? "bg-zinc-950" : "bg-zinc-50")}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black mb-6"
            >
              What is an <span className="text-yellow-400">NFC Card?</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={cn(
                "text-lg md:text-xl max-w-3xl mx-auto leading-relaxed transition-colors",
                isDarkMode ? "text-white/60" : "text-zinc-500"
              )}
            >
              An NFC card (Near Field Communication card) is essentially a smart business or marketing card that can instantly share digital content when tapped on a smartphone.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CategoryCard 
              isDarkMode={isDarkMode}
              icon={<Key className="w-6 h-6 text-yellow-400" />}
              title="Core Features"
              items={[
                { label: "Tap-to-share technology", detail: "Just tap the card on a phone and it opens a link (no app needed)." },
                { label: "No battery required", detail: "Works using NFC chips powered by the phone itself." },
                { label: "Universal compatibility", detail: "Works with most modern Android and iPhone devices." }
              ]}
            />
            
            <CategoryCard 
              isDarkMode={isDarkMode}
              icon={<Briefcase className="w-6 h-6 text-yellow-400" />}
              title="Business & Marketing"
              items={[
                { label: "Digital business card", detail: "Share contact details, company profile, social media, and links instantly." },
                { label: "Custom landing page", detail: "Direct users to a personalized page (portfolio, website, offer page, etc.)." },
                { label: "Lead generation", detail: "Capture customer info (name, phone, email) directly." },
                { label: "Analytics tracking", detail: "Track how many taps, location insights, and engagement." }
              ]}
            />

            <CategoryCard 
              isDarkMode={isDarkMode}
              icon={<RefreshCw className="w-6 h-6 text-yellow-400" />}
              title="Editable & Dynamic"
              items={[
                { label: "Update anytime", detail: "Change the link/content without changing the physical card." },
                { label: "Multi-link support", detail: "One tap can show multiple links (like Linktree-style pages)." }
              ]}
            />

            <CategoryCard 
              isDarkMode={isDarkMode}
              icon={<Palette className="w-6 h-6 text-yellow-400" />}
              title="Branding & Design"
              items={[
                { label: "Fully customizable design", detail: "Logo, colors, QR code, and premium finishes." },
                { label: "QR code backup", detail: "Works even if NFC is off—scan instead." }
              ]}
            />

            <CategoryCard 
              isDarkMode={isDarkMode}
              icon={<Lightbulb className="w-6 h-6 text-yellow-400" />}
              title="Advanced Features"
              items={[
                { label: "Integration with CRM tools", detail: "Sync leads with systems like HubSpot or others." },
                { label: "File sharing", detail: "Share PDFs, videos, catalogs, or presentations." },
                { label: "Social media integration", detail: "Direct links to Instagram, LinkedIn, etc." }
              ]}
            />

            <CategoryCard 
              isDarkMode={isDarkMode}
              icon={<DollarSign className="w-6 h-6 text-yellow-400" />}
              title="Efficiency"
              items={[
                { label: "One-time purchase", detail: "No need to reprint cards." },
                { label: "Eco-friendly", detail: "Reduces paper waste." }
              ]}
            />
          </div>

          <div className={cn(
            "mt-20 p-10 rounded-[3rem] border transition-all",
            isDarkMode ? "bg-zinc-900 border-white/5" : "bg-white border-zinc-200 shadow-xl"
          )}>
            <h3 className="text-3xl font-black mb-10 flex items-center gap-4">
              <Zap className="text-yellow-400 fill-current" size={32} />
              Use Cases
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { label: "Sales Teams", icon: <Target className="opacity-50" size={20} /> },
                { label: "Networking", icon: <Share2 className="opacity-50" size={20} /> },
                { label: "Restaurants (Menu, Rating, Feedback)", icon: <Utensils className="opacity-50" size={20} /> },
                { label: "Real Estate", icon: <HomeIcon className="opacity-50" size={20} /> },
                { label: "Dental Clinics & Hospitals", icon: <Stethoscope className="opacity-50" size={20} /> },
                { label: "Marketers", icon: <MousePointer2 className="opacity-50" size={20} /> }
              ].map((useCase, idx) => (
                <a href="#order-section" key={idx}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "p-6 h-full rounded-2xl border flex flex-col items-center gap-3 text-center transition-all hover:border-yellow-400/30 cursor-pointer",
                      isDarkMode ? "bg-black/40 border-white/5" : "bg-zinc-50 border-zinc-200"
                    )}
                  >
                    <div className="text-yellow-400 mb-2">{useCase.icon}</div>
                    <span className="font-bold text-sm">{useCase.label}</span>
                  </motion.div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NFC Ordering CTA */}
      <section id="order-section" className={cn(
        "py-24 px-6 border-y transition-colors",
        isDarkMode ? "bg-gradient-to-b from-black to-zinc-900 border-white/5" : "bg-gradient-to-b from-zinc-50 to-white border-zinc-200"
      )}>
        <div className={cn(
          "max-w-5xl mx-auto rounded-[3rem] p-8 md:p-16 border flex flex-col md:flex-row items-center gap-12 text-center md:text-left transition-all",
          isDarkMode ? "bg-zinc-800/50 border-white/10" : "bg-white border-zinc-200 shadow-2xl shadow-zinc-200"
        )}>
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Order your custom <br /> premium NFC card.</h2>
            <p className={cn(
              "text-lg mb-8 leading-relaxed transition-colors",
              isDarkMode ? "text-white/60" : "text-zinc-500"
            )}>
              Elevate your presence with a physical card crafted for excellence. Custom branding options available to match your unique professional identity.
            </p>
            <a 
              href="https://wa.me/251920508303?text=Hello TapNix, I want to order my custom NFC business card."
              target="_blank"
              className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-yellow-400/20"
            >
              Order via WhatsApp
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
          <div className="w-full md:w-[380px] h-[750px] relative group flex items-center justify-center">
            <div className="absolute inset-x-0 inset-y-10 bg-yellow-400 rounded-[3.5rem] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            
            {/* Phone Frame */}
            <motion.div 
              className={cn(
                "w-full h-full rounded-[3.5rem] border-[10px] overflow-hidden flex flex-col p-6 shadow-2xl relative transition-all z-10",
                isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-100"
              )}
            >
              {/* Phone Status Bar Mockup */}
              <div className="flex justify-between items-center mb-8 opacity-40 px-4">
                <div className="text-xs font-bold">9:41</div>
                <div className="flex gap-1.5 items-center">
                   <Signal size={12} />
                   <Wifi size={12} />
                   <Battery size={14} />
                </div>
              </div>

              {/* Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-7 bg-zinc-900 rounded-full z-50 flex items-center justify-around px-2 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20"></div>
                <div className="w-10 h-px bg-zinc-800 rounded-full"></div>
              </div>

              {/* TapNix Logo Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                 <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="Logo" className="w-64 h-64 object-contain grayscale" />
              </div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                   <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>

                {/* Animated Pop-up (Sofonias Genanaw) */}
                <AnimatePresence>
                  {showTapAnim && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0, y: 30 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 30 }}
                      transition={{ type: "spring", damping: 15, delay: 0.5 }}
                      className="mt-4 p-8 bg-black rounded-[2.5rem] shadow-2xl border border-white/10 text-white flex flex-col items-center text-center"
                    >
                      {/* Avatar */}
                      <div className="w-24 h-24 rounded-full bg-black border border-white/10 flex items-center justify-center mb-6 shadow-2xl p-5">
                        <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="TapNix" className="w-full h-full object-contain" />
                      </div>
                      
                      <div className="mb-8">
                        <h3 className="font-black text-2xl tracking-tighter mb-1">Sofonias Genanaw</h3>
                        <p className="text-xs font-bold text-yellow-400 uppercase tracking-[0.2em]">Founder @ TapNix</p>
                      </div>

                      <div className="w-full space-y-3">
                        {/* Phone Button */}
                        <div className="h-14 bg-zinc-900 border border-white/5 rounded-2xl flex items-center px-4 gap-4">
                          <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                             <Smartphone size={16} />
                          </div>
                          <div className="flex flex-col items-start">
                             <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Call</span>
                             <span className="text-sm font-bold opacity-90">+251 920 508 303</span>
                          </div>
                        </div>

                        {/* Email Button */}
                        <div className="h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center px-4 gap-4">
                          <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                             <Mail size={16} />
                          </div>
                          <div className="flex flex-col items-start truncate overflow-hidden">
                             <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Email</span>
                             <span className="text-xs font-bold opacity-90 truncate">sofoniasgenanaw12@gmail.com</span>
                          </div>
                        </div>

                        {/* Save Contact Button */}
                        <div className="h-16 bg-white text-black hover:bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-widest mt-4 transition-colors">
                          Save Contact
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-auto pb-10 flex flex-col items-center gap-6">
                   <div className="w-32 h-1.5 bg-zinc-800 rounded-full"></div>
                   <div className="flex gap-10 opacity-20">
                      <div className="w-12 h-12 bg-current rounded-2xl"></div>
                      <div className="w-12 h-12 bg-current rounded-2xl"></div>
                      <div className="w-12 h-12 bg-current rounded-2xl"></div>
                   </div>
                </div>
              </div>

              {/* Tap Indicator Ripple */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                 <AnimatePresence>
                    {!showTapAnim && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-24 h-24 rounded-full border-4 border-yellow-400/40 flex items-center justify-center animate-ping"
                      >
                         <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)]"></div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
            </motion.div>

            {/* Physical Black NFC Card with Hand simulation */}
            <motion.div
              animate={showTapAnim ? { 
                y: -650, 
                x: 0,
                rotate: -15,
                scale: 1.1,
                opacity: 1
              } : { 
                y: 100,
                x: -50,
                rotate: 20,
                scale: 1,
                opacity: 0
              }}
              transition={{ 
                duration: 0.6, 
                type: "spring",
                stiffness: 100 
              }}
              className="absolute bottom-[-50px] right-[-20px] z-20 w-56 h-36 bg-black rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center p-6"
            >
               <img src="https://i.ibb.co/zWKnJsFS/Tap-Nix-Logo-2.png" alt="Logo" className="w-12 h-12 object-contain" />
               <div className="absolute bottom-4 right-6 w-12 h-12 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/40 rounded-full flex items-center justify-center text-[8px] font-black italic">NFC</div>
               </div>
               
               {/* Hand Grip Visual */}
               <div className="absolute -bottom-10 -right-10 w-32 h-40 bg-zinc-800/80 rounded-[2rem] blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn("py-12 px-6 border-t transition-colors", isDarkMode ? "border-white/5 opacity-50" : "border-zinc-200")}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-1">
            <p className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-zinc-900")}>© 2026 Tap<span className="text-yellow-400">Nix</span>. All rights reserved.</p>
            <p className={cn("text-[10px] font-bold opacity-60 tracking-[0.2em] flex items-center justify-center md:justify-start gap-2", isDarkMode ? "text-white" : "text-zinc-600")}>
              SUPPORT: +251 920 508 303
            </p>
          </div>
          <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-yellow-400">
             <Link to="/terms" className="hover:underline">Terms</Link>
             <Link to="/privacy" className="hover:underline">Privacy</Link>
             <span className={cn("px-2 cursor-default font-black", isDarkMode ? "text-white/20" : "text-zinc-300")}>Ethiopia</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string, description: string; isDarkMode: boolean }> = ({ icon, title, description, isDarkMode }) => (
  <div className={cn(
    "p-10 rounded-[2.5rem] border transition-all group",
    isDarkMode ? "bg-zinc-900/50 border-white/5 hover:border-yellow-400/30" : "bg-white border-zinc-200 hover:border-yellow-400/30 shadow-lg shadow-zinc-100"
  )}>
    <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-8 group-hover:scale-110 group-hover:bg-yellow-400/20 transition-all">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4">{title}</h3>
    <p className={cn(
      "leading-relaxed font-medium transition-colors",
      isDarkMode ? "text-white/40" : "text-zinc-500"
    )}>{description}</p>
  </div>
);

const ProcessStep: React.FC<{ number: string; icon: React.ReactNode; title: string; description: React.ReactNode; delay: number; isLast?: boolean; isDarkMode: boolean }> = ({ number, icon, title, description, delay, isLast, isDarkMode }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="relative flex flex-col items-center text-center group"
  >
    <div className="relative mb-8">
      <div className={cn(
        "w-20 h-20 border rounded-3xl flex items-center justify-center text-yellow-400 relative z-10 duration-500 transition-all group-hover:border-yellow-400/50",
        isDarkMode ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200 shadow-lg shadow-zinc-100"
      )}>
        {icon}
      </div>
      <div className="absolute -top-4 -right-4 w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center font-black text-xs z-20 shadow-xl">
        {number}
      </div>
      <div className="absolute inset-0 bg-yellow-400/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
    </div>
    <h3 className="text-2xl font-black mb-4 group-hover:text-yellow-400 transition-colors">{title}</h3>
    <p className={cn(
      "font-medium leading-relaxed max-w-xs transition-colors",
      isDarkMode ? "text-white/40" : "text-zinc-500"
    )}>{description}</p>
    
    {!isLast && (
      <div className={cn(
        "md:hidden mt-8 transition-colors",
        isDarkMode ? "text-yellow-400/20" : "text-yellow-400/40"
      )}>
        <ChevronRight className="w-8 h-8 rotate-90" />
      </div>
    )}
  </motion.div>
);

const CategoryCard: React.FC<{ icon: React.ReactNode; title: string; items: { label: string; detail: string }[]; isDarkMode: boolean }> = ({ icon, title, items, isDarkMode }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={cn(
      "p-8 rounded-[2.5rem] border transition-colors",
      isDarkMode ? "bg-zinc-900/40 border-white/5 hover:bg-zinc-800/40" : "bg-white border-zinc-200 hover:bg-zinc-100 shadow-xl shadow-zinc-100"
    )}
  >
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
    </div>
    <ul className="space-y-6">
      {items.map((item, i) => (
        <li key={i} className="group">
          <div className="flex items-start gap-3">
            <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-yellow-400" />
            <div>
              <p className="font-bold text-sm mb-1 group-hover:text-yellow-400 transition-colors">{item.label}</p>
              <p className={cn(
                "text-xs leading-relaxed transition-colors",
                isDarkMode ? "text-white/40" : "text-zinc-500"
              )}>{item.detail}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </motion.div>
);

export default Home;
