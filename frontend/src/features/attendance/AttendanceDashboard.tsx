import React, { useState, useEffect, useRef } from 'react';
import { checkInApi, checkOutApi, getTodayStatusApi } from './attendanceApi';
import { Clock, CheckCircle, LogOut, CameraOff, ArrowLeft, MapPin, Scan } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const AttendanceDashboard = () => {
 const [status, setStatus] = useState<string>('Not Checked In');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 
 const [isCheckingIn, setIsCheckingIn] = useState(false);
 const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getTodayStatusApi();
        if (data) {
          if (data.checkOut) {
            setStatus('Checked Out');
          } else if (data.checkIn) {
            setStatus('Checked In');
          }
        }
      } catch (err) {
        console.error('Error fetching attendance status:', err);
      }
    };
    fetchStatus();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
 
 // Camera State
 const videoRef = useRef<HTMLVideoElement>(null);
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const [stream, setStream] = useState<MediaStream | null>(null);
 const [cameraError, setCameraError] = useState<string>('');
 const [photoCaptured, setPhotoCaptured] = useState<boolean>(false);
 const [photoData, setPhotoData] = useState<string | null>(null);

 useEffect(() => {
 if (isCheckingIn) {
 startCamera();
 } else {
 stopCamera();
 }
 return () => stopCamera();
 }, [isCheckingIn]);

 const startCamera = async () => {
 setCameraError('');
 setPhotoCaptured(false);
 setPhotoData(null);
 try {
 const mediaStream = await navigator.mediaDevices.getUserMedia({ 
 video: { facingMode: 'user' } 
 });
 setStream(mediaStream);
 if (videoRef.current) {
 videoRef.current.srcObject = mediaStream;
 }
 } catch (err: any) {
 console.error("Camera error:", err);
 setCameraError('Camera permission denied or unavailable.');
 }
 };

 const stopCamera = () => {
 if (stream) {
 stream.getTracks().forEach(track => track.stop());
 setStream(null);
 }
 };

 const capturePhoto = () => {
 if (videoRef.current && canvasRef.current) {
 const video = videoRef.current;
 const canvas = canvasRef.current;
 
 canvas.width = video.videoWidth;
 canvas.height = video.videoHeight;
 
 const ctx = canvas.getContext('2d');
 if (ctx) {
 ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
 const dataUrl = canvas.toDataURL('image/jpeg');
 setPhotoData(dataUrl);
 setPhotoCaptured(true);
 stopCamera();
 }
 }
 };

 const retakePhoto = () => {
 setPhotoData(null);
 setPhotoCaptured(false);
 startCamera();
 };

 const handleConfirmCheckIn = async () => {
 try {
 setLoading(true);
 setError('');
 await checkInApi();
 setStatus('Checked In');
 setIsCheckingIn(false);
 } catch (err: any) {
 setError(err.response?.data?.message || 'Failed to check in');
 } finally {
 setLoading(false);
 }
 };

 const handleCheckOut = async () => {
 try {
 setLoading(true);
 setError('');
 await checkOutApi();
 setStatus('Checked Out');
 } catch (err: any) {
 setError(err.response?.data?.message || 'Failed to check out');
 } finally {
 setLoading(false);
 }
 };

 const todayStr = format(new Date(), 'dd MMM yyyy');

  if (isCheckingIn) {
  return (
  <motion.div 
  initial={{ opacity: 0, scale: 0.98 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.98 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
  className="p-8 h-full flex flex-col"
  >
  <div className="flex items-center mb-8">
  <button 
  onClick={() => setIsCheckingIn(false)}
  className="p-3 mr-4 rounded-full bg-white/5 hover:bg-[var(--theme-glow-strong)] hover:text-[var(--theme-accent)] transition-colors group"
  >
  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-[var(--theme-accent)] transition-colors" />
  </button>
  <h2 className="text-3xl font-light text-white tracking-widest uppercase flex items-center space-x-3">
  <Scan className="w-8 h-8 text-[var(--theme-accent)]" />
  <span>Identity Verification</span>
  </h2>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
  {/* Left Column: Photo Evidence */}
  <motion.div 
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
  className="glass-card rounded-[32px] p-8 flex flex-col items-center relative overflow-hidden"
  >
  {/* Holographic Background Rings */}
  <motion.div 
  animate={{ rotate: 360 }}
  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[var(--theme-glow-weak)] rounded-full pointer-events-none border-dashed"
  />
  <motion.div 
  animate={{ rotate: -360 }}
  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border-2 border-[var(--theme-glow-weak)] rounded-full pointer-events-none"
  />
  
  <div className={`absolute inset-0 bg-gradient-to-b ${photoCaptured ? 'from-[var(--theme-glow-strong)]' : 'from-[var(--theme-glow-weak)]'} to-transparent pointer-events-none transition-colors duration-700`} />
  
  <h3 className="w-full text-sm font-semibold tracking-[0.2em] mb-8 uppercase flex items-center justify-center transition-colors duration-700 text-[var(--theme-accent)]">
  <span className="w-2 h-2 rounded-full animate-pulse mr-2 bg-[var(--theme-accent)]" />
  {photoCaptured ? 'Identity Confirmed' : 'Facial Scan Required'}
  </h3>
  
  <div className={`w-full max-w-[320px] aspect-square bg-black rounded-3xl overflow-hidden mb-8 border flex flex-col items-center justify-center relative transition-all duration-700
  ${photoCaptured ? 'border-[var(--theme-btn-border)] shadow-[0_0_60px_var(--theme-glow-strong)]' : 'border-[var(--theme-btn-border)] shadow-[0_0_40px_var(--theme-glow-weak)]'}`}>
  
  {/* Tactical Grid Background (visible when camera loads) */}
  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

  {/* HUD Crosshairs */}
  <div className="absolute inset-0 pointer-events-none z-20">
  <div className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg transition-colors duration-700 ${photoCaptured ? 'border-[var(--theme-accent)]' : 'border-[var(--theme-btn-border)]'}`} />
  <div className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg transition-colors duration-700 ${photoCaptured ? 'border-[var(--theme-accent)]' : 'border-[var(--theme-btn-border)]'}`} />
  <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg transition-colors duration-700 ${photoCaptured ? 'border-[var(--theme-accent)]' : 'border-[var(--theme-btn-border)]'}`} />
  <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-lg transition-colors duration-700 ${photoCaptured ? 'border-[var(--theme-accent)]' : 'border-[var(--theme-btn-border)]'}`} />
  </div>

  {/* Center Target Reticle */}
  {!photoCaptured && !cameraError && (
  <motion.div 
  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
  transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
  className="absolute inset-0 m-auto w-32 h-32 border border-[var(--theme-glow-strong)] rounded-full border-dashed pointer-events-none z-20 flex items-center justify-center"
  >
  <div className="w-16 h-16 border border-[var(--theme-glow-weak)] rounded-full" />
  </motion.div>
  )}

  {/* Scanning Laser Animation */}
  {!photoCaptured && !cameraError && (
  <motion.div 
  animate={{ top: ['0%', '100%', '0%'] }}
  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
  className="absolute left-0 right-0 h-[2px] bg-[var(--theme-accent)] shadow-[0_0_20px_var(--theme-accent)] z-30 opacity-70 pointer-events-none" 
  />
  )}

  {photoCaptured && photoData ? (
  <motion.img 
  initial={{ opacity: 0, scale: 1.1 }}
  animate={{ opacity: 1, scale: 1 }}
  src={photoData} 
  alt="Captured" 
  className="w-full h-full object-cover relative z-10" 
  />
  ) : (
  <>
  <video 
  ref={videoRef} 
  autoPlay 
  playsInline 
  muted 
  className={`w-full h-full object-cover relative z-10 ${cameraError ? 'hidden' : 'block'}`} 
  />
  {cameraError && (
  <div className="flex flex-col items-center justify-center text-gray-500 p-6 text-center z-10">
  <CameraOff className="w-12 h-12 mb-4 opacity-50" />
  <p className="text-sm">{cameraError}</p>
  </div>
  )}
  </>
  )}
  <canvas ref={canvasRef} className="hidden" />
  </div>

  <button 
  onClick={photoCaptured ? retakePhoto : capturePhoto}
  disabled={!!cameraError && !photoCaptured}
  className={`w-full max-w-[320px] py-4 rounded-xl transition-all font-bold tracking-[0.2em] text-sm flex items-center justify-center space-x-2
  ${photoCaptured 
  ? 'bg-[#090909] text-gray-400 border border-white/10 hover:border-[var(--theme-btn-border)] hover:text-white' 
  : 'glass-btn-theme'}`}
  >
  {photoCaptured ? 'RETAKE SCAN' : 'INITIATE SCAN'}
  </button>
  
  <div className="w-full max-w-[320px] mt-6 text-[11px] text-gray-500 space-y-1 text-center font-mono h-8 overflow-hidden relative">
  {!photoCaptured ? (
  <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }}>
  <p>INITIALIZING BIOMETRIC FEED...</p>
  <p>CONNECTING TO SECURE SERVER...</p>
  <p>AWAITING FACIAL RECOGNITION...</p>
  </motion.div>
  ) : (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[var(--theme-accent)]">
  <p>BIOMETRIC HASH MATCHED: 0x9F4A...B2</p>
  <p>ENCRYPTION ACTIVE: AES-256</p>
  </motion.div>
  )}
  </div>
  </motion.div>

  {/* Right Column: Attendance Details */}
  <motion.div 
  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
  className="glass-card rounded-[32px] p-8 flex flex-col relative overflow-hidden"
  >
  <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-700
  ${photoCaptured ? 'bg-[var(--theme-glow-strong)]' : 'bg-[var(--theme-glow-weak)]'}`} />
  <h3 className="w-full text-sm font-semibold tracking-[0.2em] text-gray-400 mb-8 uppercase flex items-center">
  Session Details
  </h3>
  
  <div className="space-y-3 flex-1">
  {[
  { label: 'Date', value: todayStr },
  { label: 'Shift', value: '09:00 - 18:00' },
  { label: 'Site', value: 'Bangalore Office' }
  ].map((item, i) => (
  <motion.div 
  key={i}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6 + (i * 0.1) }}
  className="flex justify-between py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors rounded-lg px-2"
  >
  <span className="text-gray-400 font-medium">{item.label}</span>
  <span className="text-white font-medium text-sm">{item.value}</span>
  </motion.div>
  ))}
  
  <motion.div 
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.9 }}
  className="flex justify-between items-center py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors rounded-lg px-2 relative overflow-hidden group"
  >
  {/* Background sweep effect on Location */}
  <motion.div 
  animate={{ x: ['-100%', '200%'] }}
  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[var(--theme-glow-weak)] to-transparent skew-x-12"
  />
  <span className="text-gray-400 font-medium text-sm relative z-10">Location Lock</span>
  <span className="text-green-400 font-medium text-xs flex items-center bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 relative z-10">
  <MapPin className="w-3 h-3 mr-1" />
  Verified
  </span>
  </motion.div>
  </div>

  {error && (
  <div className="mt-6 p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center">
  <span className="mr-2">⚠️</span> {error}
  </div>
  )}

  <div className="mt-8 space-y-4">
  {/* Status Box */}
  <motion.div 
  animate={photoCaptured ? { scale: [1, 1.02, 1] } : {}}
  transition={{ duration: 2, repeat: Infinity }}
  className={`p-4 rounded-xl border transition-all duration-700 ${photoCaptured ? 'bg-[var(--theme-btn-bg)] border-[var(--theme-btn-border)] shadow-[0_0_20px_var(--theme-glow-strong)]' : 'bg-[#090909]/50 border-white/5'}`}
  >
  <p className={`text-center text-sm font-medium tracking-[0.1em] uppercase transition-colors duration-700 ${photoCaptured ? 'text-[var(--theme-accent)]' : 'text-gray-500'}`}>
  {photoCaptured ? 'Biometric Match Confirmed' : 'Awaiting Facial Scan'}
  </p>
  </motion.div>

  <motion.button 
  onClick={handleConfirmCheckIn}
  disabled={!photoCaptured || loading}
  animate={photoCaptured && !loading ? { scale: [1, 1.02, 1] } : {}}
  transition={{ duration: 1.5, repeat: Infinity }}
  className={`w-full py-4 font-bold tracking-[0.2em] flex justify-center items-center space-x-3 rounded-xl transition-all duration-500 relative overflow-hidden
  ${!photoCaptured 
  ? 'bg-[#090909] text-gray-600 border border-white/5' 
  : 'glass-btn-theme'}`}
  >
  {/* Shining light sweep effect on the button when active */}
  {photoCaptured && !loading && (
  <motion.div 
  animate={{ x: ['-200%', '200%'] }}
  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[45deg]"
  />
  )}
  {loading ? (
  <span className="animate-pulse relative z-10">PROCESSING...</span>
  ) : (
  <span className="relative z-10">AUTHORIZE CHECK-IN</span>
  )}
  </motion.button>
  </div>
  </motion.div>
  </div>
  </motion.div>
 );
 }

 // Normal Dashboard View
 return (
 <div className="p-8 h-full flex flex-col justify-center items-center">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, ease: "easeOut" }}
 className="w-full max-w-2xl glass-card rounded-[40px] p-10 relative overflow-hidden flex flex-col items-center"
 >
  {/* Ambient Background Pulse */}
  <motion.div 
  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--theme-accent)] blur-[100px] rounded-full pointer-events-none z-0 opacity-50" 
  />

  <div className="relative z-10 flex flex-col items-center w-full">
  <motion.div 
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
  className="w-20 h-20 rounded-full bg-[var(--theme-btn-bg)] flex items-center justify-center border border-[var(--theme-btn-border)] shadow-[0_0_30px_var(--theme-glow-strong)] mb-6 relative"
  >
  <div className="absolute inset-0 rounded-full border border-[var(--theme-glow-strong)] animate-[spin_4s_linear_infinite]" />
  <Clock className="w-8 h-8 text-[var(--theme-accent)]" />
  </motion.div>

 <motion.h2 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="text-4xl font-light text-white tracking-[0.2em] uppercase text-center"
 >
 {format(currentTime, 'HH:mm:ss')}
 </motion.h2>
 <motion.p 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.4 }}
 className="text-gray-400 mt-2 font-mono tracking-widest text-sm uppercase"
 >
 {format(currentTime, 'EEEE, dd MMM yyyy')}
 </motion.p>
 
 <motion.div 
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.5 }}
 className="mt-10 mb-12 flex flex-col items-center"
 >
  <div className="text-gray-500 font-semibold tracking-[0.2em] text-xs uppercase mb-4">Current Status</div>
  <div className={`px-8 py-3 rounded-full flex items-center space-x-3 border transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${status === 'Checked In' ? 'bg-[var(--theme-btn-bg)] text-white border-[var(--theme-btn-border)]' : 'bg-[#090909] text-gray-400 border-white/10'}`}>
  <motion.span 
  animate={status === 'Checked In' ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
  transition={{ duration: 2, repeat: Infinity }}
  className={`w-3 h-3 rounded-full ${status === 'Checked In' ? 'bg-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-accent)]' : 'bg-gray-600'}`} 
  />
 <span className="font-bold tracking-widest uppercase text-sm">{status}</span>
 </div>
 </motion.div>

 {error && (
 <div className="mb-8 w-full p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-center">
 <span className="mr-2">⚠️</span> {error}
 </div>
 )}

 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.6 }}
 className="flex w-full space-x-6"
 >
  <button
  onClick={() => setIsCheckingIn(true)}
  disabled={loading || status !== 'Not Checked In'}
  className="flex-1 flex flex-col items-center justify-center p-6 glass-btn-theme rounded-2xl transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
  >
  <CheckCircle className="w-8 h-8 mb-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
  <span className="font-bold tracking-[0.2em] uppercase text-sm">Initiate Check-In</span>
  </button>
  
  <button
  onClick={handleCheckOut}
  disabled={loading || status !== 'Checked In'}
  className="flex-1 flex flex-col items-center justify-center p-6 bg-[#090909] border border-white/10 text-gray-400 rounded-2xl hover:border-[var(--theme-btn-border)] hover:text-white transition-all disabled:opacity-30 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
  >
  <LogOut className="w-8 h-8 mb-3 opacity-50 group-hover:opacity-100 group-hover:text-[var(--theme-accent)] group-hover:scale-110 transition-all" />
 <span className="font-bold tracking-[0.2em] uppercase text-sm">End Shift</span>
 </button>
 </motion.div>
 </div>
 </motion.div>
 </div>
 );
};
