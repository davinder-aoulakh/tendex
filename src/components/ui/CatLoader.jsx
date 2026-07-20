import { motion } from 'framer-motion';

/**
 * Animated black cat mascot loader.
 * The cat sits at a tiny desk typing/writing with a blinking cursor.
 */
export default function CatLoader({ message = 'Loading...', subMessage = null, size = 'md' }) {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.3 : 1;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Cat SVG animation */}
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}>
        <svg width="120" height="110" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Desk */}
          <rect x="10" y="85" width="100" height="6" rx="2" fill="#2a2a2a" />
          <rect x="18" y="91" width="6" height="14" rx="1" fill="#222" />
          <rect x="96" y="91" width="6" height="14" rx="1" fill="#222" />

          {/* Paper on desk */}
          <rect x="35" y="70" width="50" height="16" rx="2" fill="#e8e8e8" />
          {/* Paper lines */}
          <line x1="40" y1="75" x2="80" y2="75" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="40" y1="79" x2="72" y2="79" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="40" y1="83" x2="76" y2="83" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" />

          {/* Pen / cursor blinking on paper */}
          <motion.rect
            x="72" y="74" width="1.5" height="10" rx="0.5" fill="#C81E3A"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'steps(1)' }}
          />

          {/* Cat body */}
          <ellipse cx="60" cy="60" rx="22" ry="20" fill="#1a1a1a" />

          {/* Cat head */}
          <ellipse cx="60" cy="38" rx="18" ry="16" fill="#1a1a1a" />

          {/* Ears */}
          <polygon points="44,26 40,14 52,22" fill="#1a1a1a" />
          <polygon points="76,26 80,14 68,22" fill="#1a1a1a" />
          {/* Inner ears */}
          <polygon points="44,25 42,18 50,23" fill="#3d1a1a" />
          <polygon points="76,25 78,18 70,23" fill="#3d1a1a" />

          {/* Eyes */}
          <ellipse cx="53" cy="37" rx="4" ry="3.5" fill="#f5f5f5" />
          <ellipse cx="67" cy="37" rx="4" ry="3.5" fill="#f5f5f5" />
          {/* Pupils */}
          <motion.ellipse
            cx="53" cy="37" rx="2" ry="2.5" fill="#111"
            animate={{ scaleY: [1, 0.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.ellipse
            cx="67" cy="37" rx="2" ry="2.5" fill="#111"
            animate={{ scaleY: [1, 0.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          {/* Eye shine */}
          <circle cx="54.5" cy="36" r="0.7" fill="white" />
          <circle cx="68.5" cy="36" r="0.7" fill="white" />

          {/* Nose */}
          <ellipse cx="60" cy="43" rx="2" ry="1.2" fill="#cc3366" />

          {/* Whiskers */}
          <line x1="38" y1="42" x2="56" y2="44" stroke="#555" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="38" y1="45" x2="56" y2="45" stroke="#555" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="64" y1="44" x2="82" y2="42" stroke="#555" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="64" y1="45" x2="82" y2="45" stroke="#555" strokeWidth="0.8" strokeLinecap="round" />

          {/* Arms / paws on desk - animated typing */}
          <motion.g
            animate={{ y: [0, -2, 0, -3, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ellipse cx="42" cy="78" rx="7" ry="5" fill="#1a1a1a" />
            <ellipse cx="42" cy="80" rx="5" ry="3" fill="#2a2a2a" />
          </motion.g>
          <motion.g
            animate={{ y: [0, -3, 0, -2, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
          >
            <ellipse cx="78" cy="78" rx="7" ry="5" fill="#1a1a1a" />
            <ellipse cx="78" cy="80" rx="5" ry="3" fill="#2a2a2a" />
          </motion.g>

          {/* Tail */}
          <motion.path
            d="M 82 72 Q 100 65 98 80 Q 96 90 88 86"
            stroke="#1a1a1a" strokeWidth="5" fill="none" strokeLinecap="round"
            animate={{ d: ['M 82 72 Q 100 65 98 80 Q 96 90 88 86', 'M 82 72 Q 105 60 102 78 Q 100 92 90 88', 'M 82 72 Q 100 65 98 80 Q 96 90 88 86'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      {/* Messages */}
      <div className="text-center">
        <motion.p
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
        {subMessage && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subMessage}</p>
        )}
      </div>
    </div>
  );
}