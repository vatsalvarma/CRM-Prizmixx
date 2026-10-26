import React from 'react';
import { motion } from 'framer-motion';

// --- Normal Project Animated Logo ---
export const NormalProjectLogo: React.FC<{ size?: number; className?: string }> = ({ size = 64, className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="normalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        {/* Background rounded rect */}
        <motion.rect
          x="10"
          y="10"
          width="44"
          height="48"
          rx="8"
          fill="rgba(56, 189, 248, 0.08)"
          stroke="url(#normalGrad)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        {/* Clipboard Top Clip */}
        <motion.rect
          x="22"
          y="6"
          width="20"
          height="8"
          rx="3"
          fill="#1e293b"
          stroke="url(#normalGrad)"
          strokeWidth="2"
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
        {/* Checklist Line 1 */}
        <motion.line
          x1="22"
          y1="24"
          x2="44"
          y2="24"
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />
        {/* Checklist Line 2 */}
        <motion.line
          x1="22"
          y1="34"
          x2="38"
          y2="34"
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        />
        {/* Checkmark */}
        <motion.path
          d="M18 43 L23 48 L32 38"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        />
      </svg>
    </div>
  );
};

// --- Advanced Project Animated Logo ---
export const AdvancedProjectLogo: React.FC<{ size?: number; className?: string }> = ({ size = 64, className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="advGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <radialGradient id="advGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Glowing Halo */}
        <circle cx="32" cy="32" r="26" fill="url(#advGlow)" />

        {/* Orbit Ring */}
        <motion.circle
          cx="32"
          cy="32"
          r="24"
          stroke="url(#advGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        {/* Multi-Node Stepper Diamond */}
        <motion.path
          d="M32 10 L50 28 L32 46 L14 28 Z"
          stroke="url(#advGrad)"
          strokeWidth="2"
          fill="rgba(129, 140, 248, 0.08)"
          initial={{ pathLength: 0, scale: 0.8 }}
          animate={{ pathLength: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* 4 Pipeline Nodes */}
        <motion.circle cx="32" cy="10" r="3" fill="#38bdf8" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0 }} />
        <motion.circle cx="50" cy="28" r="3" fill="#818cf8" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} />
        <motion.circle cx="32" cy="46" r="3" fill="#c084fc" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} />
        <motion.circle cx="14" cy="28" r="3" fill="#ec4899" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1.5 }} />

        {/* Center Pulsing Star / Rocket Core */}
        <motion.circle
          cx="32"
          cy="28"
          r="6"
          fill="url(#advGrad)"
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        />
        <motion.path
          d="M32 20 L35 26 L41 28 L35 30 L32 36 L29 30 L23 28 L29 26 Z"
          fill="#ffffff"
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        />
      </svg>
    </div>
  );
};

// --- 4 Individual Stage Animated Logos ---

export interface StageLogoProps {
  stage: 'DESIGN' | 'RESOURCES' | 'DEVELOP_TEST' | 'DEPLOY' | string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  size?: number;
  className?: string;
  isInteractive?: boolean;
  shape?: 'rounded' | 'circle';
}

export const StageLogo: React.FC<StageLogoProps> = ({
  stage,
  status = 'PENDING',
  size = 54,
  className = "",
  shape = 'rounded'
}) => {
  const isCompleted = status === 'COMPLETED';
  const isActive = status === 'IN_PROGRESS';

  // Base colors depending on status
  const mainColor = isCompleted
    ? '#10b981' // Green
    : isActive
    ? '#38bdf8' // Cyan / Sky Blue
    : '#64748b'; // Muted Slate

  const glowColor = isCompleted
    ? 'rgba(16, 185, 129, 0.25)'
    : isActive
    ? 'rgba(56, 189, 248, 0.35)'
    : 'transparent';

  const renderContent = () => {
    switch (stage.toUpperCase()) {
      case 'DESIGN':
        // Figma Pen / Palette Logo
        return (
          <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
            {/* Palette Board */}
            <motion.path
              d="M27 8C16.5 8 8 16.5 8 27C8 37.5 16.5 46 27 46C29.5 46 31.5 44 31.5 41.5C31.5 40.3 31 39.3 30.2 38.5C29.5 37.7 29 36.7 29 35.5C29 33 31 31 33.5 31H38C42.4 31 46 27.4 46 23C46 14.7 37.5 8 27 8Z"
              stroke={mainColor}
              strokeWidth="2.5"
              fill={isActive || isCompleted ? "rgba(56, 189, 248, 0.1)" : "rgba(100, 116, 139, 0.05)"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {/* Paint Dots */}
            <motion.circle cx="18" cy="19" r="3" fill="#f43f5e" animate={isActive ? { scale: [1, 1.3, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }} />
            <motion.circle cx="28" cy="16" r="3" fill="#fbbf24" animate={isActive ? { scale: [1, 1.3, 1] } : {}} transition={{ repeat: Infinity, duration: 2, delay: 0.3 }} />
            <motion.circle cx="37" cy="21" r="3" fill="#38bdf8" animate={isActive ? { scale: [1, 1.3, 1] } : {}} transition={{ repeat: Infinity, duration: 2, delay: 0.6 }} />
            <motion.circle cx="18" cy="31" r="3" fill="#a855f7" animate={isActive ? { scale: [1, 1.3, 1] } : {}} transition={{ repeat: Infinity, duration: 2, delay: 0.9 }} />
          </svg>
        );

      case 'RESOURCES':
        // 3D Diamond Stack / Isometric Layers Logo
        return (
          <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
            {/* Top Layer */}
            <motion.path
              d="M27 10 L44 19 L27 28 L10 19 Z"
              stroke={mainColor}
              strokeWidth="2"
              fill={isActive || isCompleted ? "rgba(129, 140, 248, 0.2)" : "rgba(100, 116, 139, 0.05)"}
              animate={isActive ? { y: [0, -3, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />
            {/* Middle Layer */}
            <motion.path
              d="M10 26 L27 35 L44 26"
              stroke={mainColor}
              strokeWidth="2"
              strokeLinecap="round"
              animate={isActive ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.3 }}
            />
            {/* Bottom Layer */}
            <motion.path
              d="M10 33 L27 42 L44 33"
              stroke={mainColor}
              strokeWidth="2"
              strokeLinecap="round"
              animate={isActive ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.6 }}
            />
            {/* Center Core Spark */}
            <motion.circle
              cx="27"
              cy="19"
              r="3"
              fill="#fbbf24"
              animate={isActive ? { scale: [0.8, 1.4, 0.8] } : {}}
              transition={{ repeat: Infinity, duration: 1.8 }}
            />
          </svg>
        );

      case 'DEVELOP_TEST':
        // Code Brackets & Testing Terminal Logo
        return (
          <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
            {/* Terminal Window frame */}
            <motion.rect
              x="9"
              y="11"
              width="36"
              height="32"
              rx="6"
              stroke={mainColor}
              strokeWidth="2"
              fill={isActive || isCompleted ? "rgba(56, 189, 248, 0.1)" : "rgba(100, 116, 139, 0.05)"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
            {/* Left Bracket < */}
            <motion.path
              d="M20 22 L15 27 L20 32"
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={isActive ? { x: [-1, 1, -1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            {/* Slash / */}
            <motion.line
              x1="29"
              y1="21"
              x2="25"
              y2="33"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Right Bracket > */}
            <motion.path
              d="M34 22 L39 27 L34 32"
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={isActive ? { x: [1, -1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            {/* Test Beaker or Dot Indicator */}
            <motion.circle cx="15" cy="16" r="1.5" fill="#f43f5e" />
            <motion.circle cx="20" cy="16" r="1.5" fill="#fbbf24" />
            <motion.circle cx="25" cy="16" r="1.5" fill="#10b981" />
          </svg>
        );

      case 'DEPLOY':
      default:
        // Rocket Launch Logo
        return (
          <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
            {/* Rocket Body */}
            <motion.path
              d="M27 9 C33 13 36 21 34 30 L27 34 L20 30 C18 21 21 13 27 9 Z"
              stroke={mainColor}
              strokeWidth="2"
              fill={isActive || isCompleted ? "rgba(236, 72, 153, 0.15)" : "rgba(100, 116, 139, 0.05)"}
              animate={isActive ? { y: [0, -3, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            />
            {/* Rocket Fins */}
            <motion.path
              d="M20 28 L14 33 L20 34 Z"
              fill={mainColor}
              animate={isActive ? { y: [0, -3, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            />
            <motion.path
              d="M34 28 L40 33 L34 34 Z"
              fill={mainColor}
              animate={isActive ? { y: [0, -3, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            />
            {/* Rocket Window */}
            <circle cx="27" cy="20" r="3" fill="#38bdf8" />
            {/* Thruster Flames */}
            <motion.path
              d="M24 35 L27 45 L30 35 Z"
              fill="#f59e0b"
              animate={isActive ? { scaleY: [0.8, 1.4, 0.8], opacity: [0.8, 1, 0.8] } : { opacity: 0.3 }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            />
            <motion.path
              d="M25 35 L27 41 L29 35 Z"
              fill="#ef4444"
              animate={isActive ? { scaleY: [0.7, 1.3, 0.7] } : { opacity: 0.3 }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            />
          </svg>
        );
    }
  };

  const isCircle = shape === 'circle';
  const radiusClass = isCircle ? 'rounded-full' : 'rounded-2xl';

  return (
    <div
      className={`relative ${radiusClass} flex items-center justify-center p-1.5 transition-all duration-300 ${className}`}
      style={{
        boxShadow: isActive ? `0 0 24px ${glowColor}` : isCompleted ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none'
      }}
    >
      {renderContent()}
      {/* Active Pulse Ring */}
      {isActive && (
        <motion.div
          className={`absolute inset-0 ${radiusClass} border-2 border-cyan-400`}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
        />
      )}
    </div>
  );
};
