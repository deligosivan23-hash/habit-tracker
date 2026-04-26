import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { TimerTray } from '../timer/TimerTray';

interface LayoutProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-dvh flex">
      <Navbar />

      {/* Main content */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-8">
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

      {/* Global timer tray — sits above mobile nav */}
      <TimerTray />
    </div>
  );
}
