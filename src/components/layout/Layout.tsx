import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { TimerTray } from '../timer/TimerTray';
import { useTimerStore } from '../../store/timerStore';

interface LayoutProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function Layout({ children }: LayoutProps) {
  // Know if tray is visible so we can add extra bottom padding on mobile
  const hasTray = useTimerStore(
    (s) => Object.values(s.timers).some((t) => t.state === 'running' || t.state === 'paused'),
  );

  return (
    <div className="min-h-dvh flex">
      <Navbar />

      {/* Main content
          Mobile:  pb-20 (nav)  →  pb-52 (nav + tray)
          Desktop: pb-8 always — tray positioned separately, doesn't overlap scroll area
      */}
      <main
        className={[
          'flex-1 md:ml-56 md:pb-8 transition-[padding] duration-300',
          hasTray ? 'pb-52' : 'pb-24',
        ].join(' ')}
      >
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto px-4 pt-6"
        >
          {children}
        </motion.div>
      </main>

      {/* Timer tray — fixed above mobile nav */}
      <TimerTray />
    </div>
  );
}
