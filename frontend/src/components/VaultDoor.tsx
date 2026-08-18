import { motion } from 'framer-motion';

interface VaultDoorProps {
  status: 'locked' | 'released' | 'pending' | 'reclaimed';
  size?: 'sm' | 'lg';
}

// The signature element: a literal vault door whose visual state is tied
// directly to the milestone's real on-chain status, not a decorative icon.
// Locked = sealed, bolted. Pending = the dial mid-turn during a live
// submit_attempt call. Released = open, the seal broken, criterion
// genuinely met. Reclaimed = also open (the grantor did open it), but
// drawn in a colder, greyed register rather than copper's warm "success"
// tone -- this is the grantor pulling funds back after a deadline passed
// unmet, not a completed milestone, and the door shouldn't read as a win
// for either party.
export function VaultDoor({ status, size = 'sm' }: VaultDoorProps) {
  const dim = size === 'lg' ? 96 : 40;
  const isOpen = status === 'released' || status === 'reclaimed';
  const accent = status === 'released' ? '#B87333' : status === 'reclaimed' ? '#8A8172' : '#3D2B1F';

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
          stroke={isOpen ? accent : '#3D2B1F'}
          strokeWidth="3"
        />
        {/* Door plate */}
        <motion.rect
          x="14"
          y="14"
          width="72"
          height="72"
          rx="3"
          fill={isOpen ? '#F0EAE0' : '#3D2B1F'}
          stroke={isOpen ? accent : 'none'}
          strokeWidth="2"
          animate={
            isOpen
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
          animate={status === 'pending' ? { rotate: 360 } : { rotate: isOpen ? 45 : 0 }}
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
            stroke={isOpen ? accent : '#F0EAE0'}
            strokeWidth="2.5"
          />
          <line x1="50" y1="36" x2="50" y2="44" stroke={isOpen ? accent : '#F0EAE0'} strokeWidth="2.5" />
        </motion.g>
        {/* Bolts, visible only when locked or pending */}
        {!isOpen && (
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
