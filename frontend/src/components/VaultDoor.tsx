import { motion } from 'framer-motion';

interface VaultDoorProps {
  status: 'locked' | 'released' | 'pending';
  size?: 'sm' | 'lg';
}

// The signature element: a literal vault door whose visual state is tied
// directly to the milestone's real on-chain status, not a decorative icon.
// Locked = sealed, bolted. Pending = the dial mid-turn during a live
// submit_attempt call. Released = open, the seal broken.
export function VaultDoor({ status, size = 'sm' }: VaultDoorProps) {
  const dim = size === 'lg' ? 96 : 40;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
      <svg viewBox="0 0 100 100" width={dim} height={dim} className="overflow-visible">
        {/* Outer frame */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="6"
          fill="none"
          stroke={status === 'released' ? '#B87333' : '#3D2B1F'}
          strokeWidth="3"
        />
        {/* Door plate */}
        <motion.rect
          x="14"
          y="14"
          width="72"
          height="72"
          rx="3"
          fill={status === 'released' ? '#F0EAE0' : '#3D2B1F'}
          stroke={status === 'released' ? '#B87333' : 'none'}
          strokeWidth="2"
          animate={
            status === 'released'
              ? { opacity: [0.4, 1] }
              : status === 'pending'
                ? { opacity: [1, 0.7, 1] }
                : { opacity: 1 }
          }
          transition={
            status === 'pending'
              ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.6 }
          }
        />
        {/* Dial */}
        <motion.g
          animate={status === 'pending' ? { rotate: 360 } : { rotate: status === 'released' ? 45 : 0 }}
          transition={
            status === 'pending'
              ? { duration: 3, repeat: Infinity, ease: 'linear' }
              : { duration: 0.8, ease: 'easeOut' }
          }
          style={{ originX: '50px', originY: '50px' }}
        >
          <circle
            cx="50"
            cy="50"
            r="16"
            fill="none"
            stroke={status === 'released' ? '#B87333' : '#F0EAE0'}
            strokeWidth="2.5"
          />
          <line x1="50" y1="36" x2="50" y2="44" stroke={status === 'released' ? '#B87333' : '#F0EAE0'} strokeWidth="2.5" />
        </motion.g>
        {/* Bolts, visible only when locked or pending */}
        {status !== 'released' && (
          <>
            <circle cx="22" cy="22" r="2.5" fill="#F0EAE0" opacity="0.6" />
            <circle cx="78" cy="22" r="2.5" fill="#F0EAE0" opacity="0.6" />
            <circle cx="22" cy="78" r="2.5" fill="#F0EAE0" opacity="0.6" />
            <circle cx="78" cy="78" r="2.5" fill="#F0EAE0" opacity="0.6" />
          </>
        )}
      </svg>
    </div>
  );
}
