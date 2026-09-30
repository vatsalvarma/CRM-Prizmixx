import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, Upload, Send, FileText, Link as LinkIcon, Phone, User, LifeBuoy, CheckCircle, Loader2, Check } from 'lucide-react';

export const ClientPortal = () => {
  const navigate = useNavigate();
  const [projectForm, setProjectForm] = useState({ projectName: '', referenceLinks: '', description: '' });
  const [ticketForm, setTicketForm] = useState({ name: '', phone: '', description: '', attachmentLink: '' });
  const [isProjectSubmitting, setIsProjectSubmitting] = useState(false);
  const [isProjectSuccess, setIsProjectSuccess] = useState(false);
  const [isTicketSubmitting, setIsTicketSubmitting] = useState(false);
  const [isTicketSuccess, setIsTicketSuccess] = useState(false);

  const submitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProjectSubmitting(true);
    setIsProjectSuccess(false);
    try {
      const res = await fetch('http://localhost:8080/api/public/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm)
      });
      if (res.ok) {
        setIsProjectSuccess(true);
        setProjectForm({ projectName: '', referenceLinks: '', description: '' });
        setTimeout(() => setIsProjectSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
    setIsProjectSubmitting(false);
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTicketSubmitting(true);
    setIsTicketSuccess(false);
    try {
      const res = await fetch('http://localhost:8080/api/public/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      });
      if (res.ok) {
        setIsTicketSuccess(true);
        setTicketForm({ name: '', phone: '', description: '', attachmentLink: '' });
        setTimeout(() => setIsTicketSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
    setIsTicketSubmitting(false);
  };

  return (
    <div className="h-screen w-full bg-[#f0f3f6] overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth">

      
      {/* Hero Section */}
      <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center snap-start">
      {/* Mindblowing UI: Human/Organic Neural Core (Top Left) */}
      <div className="absolute -top-[300px] -left-[300px] w-[700px] h-[700px] pointer-events-none z-0 flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[80px]" />
        
        {/* Base Neumorphic Core */}
        <motion.div 
          className="absolute w-[400px] h-[400px] rounded-full bg-[#f0f3f6] shadow-[30px_30px_60px_#c8cbce,-30px_-30px_60px_#ffffff]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Orbiting Organic Rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={`organic-ring-${ring}`}
            className="absolute rounded-full border border-pink-300/30"
            style={{ 
              width: `${400 + ring * 80}px`, 
              height: `${400 + ring * 80}px`,
              borderStyle: ring % 2 === 0 ? 'dashed' : 'solid'
            }}
            animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 40 + ring * 10, ease: "linear", repeat: Infinity }}
          >
            {/* Energy Particle on ring */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-pink-400 rounded-full shadow-[0_0_15px_rgba(244,114,182,0.8)]" />
          </motion.div>
        ))}

        {/* Inner Synapse Core */}
        <motion.div 
          className="absolute w-[200px] h-[200px] rounded-full bg-[#f0f3f6] shadow-[inset_15px_15px_30px_#c8cbce,inset_-15px_-15px_30px_#ffffff] flex items-center justify-center"
          animate={{ scale: [1, 0.95, 1] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
        >
          <motion.div 
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-400 to-orange-300 shadow-[0_0_40px_rgba(244,114,182,0.5)]"
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Mindblowing UI: AI/Digital Gyroscope (Bottom Right) */}
      <div className="absolute -bottom-[300px] -right-[300px] w-[700px] h-[700px] pointer-events-none z-0 flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px]" />
        
        {/* Base Neumorphic Core */}
        <motion.div 
          className="absolute w-[450px] h-[450px] rounded-full bg-[#f0f3f6] shadow-[30px_30px_60px_#c8cbce,-30px_-30px_60px_#ffffff]"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 120, ease: "linear", repeat: Infinity }}
        >
          {/* Tech cutouts (simulated with inner shadows) */}
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full shadow-[inset_10px_10px_20px_#c8cbce,inset_-10px_-10px_20px_#ffffff]" />
          <div className="absolute bottom-20 right-10 w-12 h-12 rounded-full shadow-[inset_5px_5px_10px_#c8cbce,inset_-5px_-5px_10px_#ffffff]" />
        </motion.div>

        {/* Precision Tech Rings */}
        {[1, 2, 3, 4].map((ring) => (
          <motion.div
            key={`tech-ring-${ring}`}
            className="absolute rounded-full"
            style={{ 
              width: `${300 + ring * 60}px`, 
              height: `${300 + ring * 60}px`,
              border: `${ring === 3 ? '2px' : '1px'} ${ring % 2 === 0 ? 'dotted' : 'dashed'} rgba(59,130,246,0.4)`
            }}
            animate={{ rotate: ring % 2 === 0 ? -360 : 360, scale: [1, 1.02, 1] }}
            transition={{ 
              rotate: { duration: 30 + ring * 15, ease: "linear", repeat: Infinity },
              scale: { duration: 5 + ring, ease: "easeInOut", repeat: Infinity }
            }}
          >
            {/* Data Node on ring */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-blue-500 rounded-sm shadow-[0_0_20px_rgba(59,130,246,0.9)] rotate-45" />
          </motion.div>
        ))}

        {/* AI Processing Core */}
        <div className="absolute w-[250px] h-[250px] rounded-full bg-[#f0f3f6] shadow-[inset_20px_20px_40px_#c8cbce,inset_-20px_-20px_40px_#ffffff] flex items-center justify-center">
          <motion.div 
            className="w-16 h-16 bg-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.8)] rounded-lg rotate-45"
            animate={{ rotate: [45, 225, 405], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          >
            <div className="w-full h-full border-[4px] border-white/50 rounded-lg" />
          </motion.div>
        </div>
      </div>
      {/* Top Center Neumorphic Navbar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-4 p-3 bg-[#f0f3f6] rounded-full shadow-[8px_8px_16px_#c8cbce,-8px_-8px_16px_#ffffff]"
      >
        <motion.button
          whileHover={{ boxShadow: "inset 4px 4px 8px #c8cbce, inset -4px -4px 8px #ffffff" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            document.getElementById('book-project')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 transition-all shadow-[4px_4px_8px_#c8cbce,-4px_-4px_8px_#ffffff]"
        >
          Project
        </motion.button>
        
        <motion.button
          whileHover={{ boxShadow: "inset 4px 4px 8px #c8cbce, inset -4px -4px 8px #ffffff" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 transition-all flex items-center gap-2 shadow-[4px_4px_8px_#c8cbce,-4px_-4px_8px_#ffffff]"
        >
          Login
        </motion.button>
        
        <motion.button
          whileHover={{ boxShadow: "inset 4px 4px 8px #c8cbce, inset -4px -4px 8px #ffffff" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 transition-all shadow-[4px_4px_8px_#c8cbce,-4px_-4px_8px_#ffffff]"
        >
          Support
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="z-10 text-center relative">
        <motion.h1 
          className="text-7xl font-black tracking-[0.2em] mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 text-transparent bg-clip-text"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 6, ease: "linear", repeat: Infinity }}
          style={{ backgroundSize: '200% auto', fontFamily: "'Orbitron', sans-serif", WebkitBackgroundClip: 'text' }}
        >
          PRIZMABRIXX
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-sm font-light tracking-widest text-gray-400 uppercase"
        >
          a software for your business
        </motion.p>
      </div>

      {/* Hand Animations */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Robot Hand - Bottom Left */}
        <motion.img 
          src={`${import.meta.env.BASE_URL}rbo-hnd.png`}
          alt="Robot Hand"
          initial={{ x: "-100%", y: "100%", rotate: -20 }}
          animate={{ 
            x: ["-100%", "-5%", "-5%", "-100%"], 
            y: ["100%", "5%", "5%", "100%"], 
            rotate: [-20, 0, 0, -20] 
          }}
          transition={{ 
            duration: 4,
            times: [0, 0.4, 0.7, 1], // Slide in takes 40% of time, holds for 30%, slides out fast in 30%
            ease: ["easeOut", "linear", "easeIn"],
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="absolute bottom-0 left-0 w-[52vw] max-w-[700px] object-contain origin-bottom-left will-change-transform transform-gpu antialiased"
          style={{ filter: 'drop-shadow(20px -20px 30px rgba(59, 130, 246, 0.15))' }}
        />

        {/* Human Hand - Top Right */}
        <motion.img 
          src={`${import.meta.env.BASE_URL}hmn-hnd.png`}
          alt="Human Hand"
          initial={{ x: "100%", y: "-100%", rotate: 20 }}
          animate={{ 
            x: ["100%", "5%", "5%", "100%"], 
            y: ["-100%", "-10%", "-10%", "-100%"], 
            rotate: [20, 0, 0, 20] 
          }}
          transition={{ 
            duration: 4,
            times: [0, 0.4, 0.7, 1],
            ease: ["easeOut", "linear", "easeIn"],
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="absolute top-0 right-0 w-[55vw] max-w-[750px] object-contain origin-top-right will-change-transform transform-gpu antialiased"
          style={{ filter: 'drop-shadow(-20px 20px 30px rgba(0, 0, 0, 0.05))' }}
        />

        {/* Sparkle effect when they "touch" (in the center) */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 0, 1.5, 1.2, 0], 
            opacity: [0, 0, 1, 0.8, 0] 
          }}
          transition={{ 
            duration: 4,
            times: [0, 0.4, 0.45, 0.7, 0.75],
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400 rounded-full blur-[60px] will-change-transform transform-gpu"
        />
      </div>
      {/* End of Hero Section */}
      </div>

      {/* Booking Section */}
      <div id="book-project" className="min-h-screen w-full relative flex items-center justify-center p-12 snap-start">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Instructions */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-8"
          >
            <div>
              <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                Ready to <span className="text-blue-600">Transform</span><br/> Your Business?
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                Our client portal makes it incredibly simple to kick off a new project. Follow these quick steps to get started with our AI-powered development team.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { title: "Fill in Details", desc: "Provide your basic project information and core objectives." },
                { title: "Add References", desc: "Share any reference links, competitors, or inspiration." },
                { title: "Attach Documents", desc: "Upload PDFs or specific requirement documents." },
                { title: "Submit", desc: "Our AI systems will immediately process your request and connect you with a team." }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#f0f3f6] shadow-[inset_3px_3px_6px_#c8cbce,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{step.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Neumorphic Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="bg-[#f0f3f6] p-6 md:p-8 rounded-[2rem] shadow-[20px_20px_60px_#c8cbce,-20px_-20px_60px_#ffffff]">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Book a Project</h3>
              
              <form className="flex flex-col gap-4" onSubmit={submitProject}>
                
                {/* Details */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">Project Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Next-Gen E-Commerce"
                    value={projectForm.projectName}
                    onChange={e => setProjectForm({...projectForm, projectName: e.target.value})}
                    required
                    className="w-full px-5 py-2.5 rounded-2xl bg-[#f0f3f6] text-gray-700 placeholder:text-gray-400 outline-none shadow-[inset_5px_5px_10px_#c8cbce,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#c8cbce,inset_-2px_-2px_5px_#ffffff] transition-shadow"
                  />
                </div>

                {/* References */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">Reference Links</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="url" 
                      placeholder="https://example.com"
                      value={projectForm.referenceLinks}
                      onChange={e => setProjectForm({...projectForm, referenceLinks: e.target.value})}
                      className="w-full pl-11 pr-5 py-2.5 rounded-2xl bg-[#f0f3f6] text-gray-700 placeholder:text-gray-400 outline-none shadow-[inset_5px_5px_10px_#c8cbce,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#c8cbce,inset_-2px_-2px_5px_#ffffff] transition-shadow"
                    />
                  </div>
                </div>

                {/* Document Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">Description & Requirements</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                    <textarea 
                      rows={3}
                      placeholder="Describe your project goals..."
                      value={projectForm.description}
                      onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                      required
                      className="w-full pl-11 pr-5 py-2.5 rounded-2xl bg-[#f0f3f6] text-gray-700 placeholder:text-gray-400 outline-none shadow-[inset_5px_5px_10px_#c8cbce,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#c8cbce,inset_-2px_-2px_5px_#ffffff] transition-shadow resize-none"
                    />
                  </div>
                </div>

                {/* File Upload (PDF) */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">Upload PDF</label>
                  <div className="w-full relative h-14 rounded-2xl bg-[#f0f3f6] shadow-[inset_5px_5px_10px_#c8cbce,inset_-5px_-5px_10px_#ffffff] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
                    <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-500 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Browse Files...</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isProjectSubmitting || isProjectSuccess}
                  whileHover={!isProjectSuccess ? { boxShadow: "inset 4px 4px 8px #2563eb, inset -4px -4px 8px #60a5fa" } : undefined}
                  whileTap={!isProjectSuccess ? { scale: 0.95 } : undefined}
                  className={`mt-4 w-full py-4 rounded-2xl text-white font-bold tracking-wide flex items-center justify-center gap-2 transition-all ${
                    isProjectSuccess 
                      ? 'bg-green-500 shadow-[inset_5px_5px_10px_rgba(34,197,94,0.8),inset_-5px_-5px_10px_rgba(74,222,128,0.8)]' 
                      : 'bg-blue-500 shadow-[5px_5px_15px_rgba(59,130,246,0.3),-5px_-5px_15px_#ffffff] disabled:opacity-70'
                  }`}
                >
                  {isProjectSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isProjectSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      Project Submitted
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Project Request
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Support Section */}
      <div id="support" className="min-h-screen w-full relative flex items-center justify-center p-12 snap-start">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Support Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            <div className="bg-[#f0f3f6] p-6 md:p-8 rounded-[2rem] shadow-[20px_20px_60px_#c8cbce,-20px_-20px_60px_#ffffff]">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <LifeBuoy className="w-6 h-6 text-blue-500" />
                Support Ticket
              </h3>
              
              <form className="flex flex-col gap-4" onSubmit={submitTicket}>
                
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={ticketForm.name}
                      onChange={e => setTicketForm({...ticketForm, name: e.target.value})}
                      required
                      className="w-full pl-11 pr-5 py-2.5 rounded-2xl bg-[#f0f3f6] text-gray-700 placeholder:text-gray-400 outline-none shadow-[inset_5px_5px_10px_#c8cbce,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#c8cbce,inset_-2px_-2px_5px_#ffffff] transition-shadow"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 000-0000"
                      value={ticketForm.phone}
                      onChange={e => setTicketForm({...ticketForm, phone: e.target.value})}
                      required
                      className="w-full pl-11 pr-5 py-2.5 rounded-2xl bg-[#f0f3f6] text-gray-700 placeholder:text-gray-400 outline-none shadow-[inset_5px_5px_10px_#c8cbce,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#c8cbce,inset_-2px_-2px_5px_#ffffff] transition-shadow"
                    />
                  </div>
                </div>

                {/* Problem Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">Problem Description</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                    <textarea 
                      rows={3}
                      placeholder="Please describe the issue..."
                      value={ticketForm.description}
                      onChange={e => setTicketForm({...ticketForm, description: e.target.value})}
                      required
                      className="w-full pl-11 pr-5 py-2.5 rounded-2xl bg-[#f0f3f6] text-gray-700 placeholder:text-gray-400 outline-none shadow-[inset_5px_5px_10px_#c8cbce,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#c8cbce,inset_-2px_-2px_5px_#ffffff] transition-shadow resize-none"
                    />
                  </div>
                </div>

                {/* Document / Link */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">Attach Document or Link</label>
                  <div className="flex gap-4">
                    <div className="flex-1 relative h-14 rounded-2xl bg-[#f0f3f6] shadow-[inset_5px_5px_10px_#c8cbce,inset_-5px_-5px_10px_#ffffff] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-500 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">File</span>
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="url" 
                        placeholder="Link"
                        value={ticketForm.attachmentLink}
                        onChange={e => setTicketForm({...ticketForm, attachmentLink: e.target.value})}
                        className="w-full h-14 pl-11 pr-5 rounded-2xl bg-[#f0f3f6] text-gray-700 placeholder:text-gray-400 outline-none shadow-[inset_5px_5px_10px_#c8cbce,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#c8cbce,inset_-2px_-2px_5px_#ffffff] transition-shadow"
                      />
                    </div>
                  </div>
                </div>

                {/* Raise Ticket Button */}
                <motion.button
                  type="submit"
                  disabled={isTicketSubmitting || isTicketSuccess}
                  whileHover={!isTicketSuccess ? { boxShadow: "inset 4px 4px 8px #2563eb, inset -4px -4px 8px #60a5fa" } : undefined}
                  whileTap={!isTicketSuccess ? { scale: 0.95 } : undefined}
                  className={`mt-4 w-full py-4 rounded-2xl text-white font-bold tracking-wide flex items-center justify-center gap-2 transition-all ${
                    isTicketSuccess 
                      ? 'bg-green-500 shadow-[inset_5px_5px_10px_rgba(34,197,94,0.8),inset_-5px_-5px_10px_rgba(74,222,128,0.8)]' 
                      : 'bg-blue-500 shadow-[5px_5px_15px_rgba(59,130,246,0.3),-5px_-5px_15px_#ffffff] disabled:opacity-70'
                  }`}
                >
                  {isTicketSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isTicketSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      Ticket Raised
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Raise a Ticket
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Right Side: Text & Description */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-8 order-1 lg:order-2"
          >
            <div>
              <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                24/7 <span className="text-blue-600">Support</span><br/> Team
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                Our dedicated team provides round-the-clock support for you and your business. Whether it's a minor bug or a critical system issue, we are always here to help you get back on track instantly.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { title: "Priority Resolution", desc: "Critical issues are routed directly to our senior engineers." },
                { title: "Constant Communication", desc: "You'll be updated at every step of the resolution process." },
                { title: "Global Availability", desc: "No matter what timezone you are in, our team is awake." }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#f0f3f6] shadow-[2px_2px_5px_#c8cbce,-2px_-2px_5px_#ffffff] flex items-center justify-center flex-shrink-0 text-blue-500">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{feature.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
