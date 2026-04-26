import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Today',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/habits',
    label: 'Habits',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export function Navbar() {
  const location = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-surface border-r border-border z-30 py-8 px-4">
        {/* Logo */}
        <div className="mb-10 px-2">
          <h1 className="font-display text-2xl text-text-primary leading-none">
            Obsidian
          </h1>
          <p className="text-text-muted text-xs mt-1 tracking-wider uppercase font-mono">Habit Tracker</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);

            return (
              <NavLink key={item.to} to={item.to}>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className={[
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-transparent',
                  ].join(' ')}
                >
                  {item.icon}
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator-desktop"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500"
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom accent */}
        <div className="mt-auto px-2">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-4" />
          <p className="text-text-muted text-xs text-center font-mono opacity-50">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);

            return (
              <NavLink key={item.to} to={item.to} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={[
                    'relative flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all',
                    isActive ? 'text-amber-400' : 'text-text-muted',
                  ].join(' ')}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator-mobile"
                      className="absolute -top-2 w-8 h-0.5 bg-amber-500 rounded-full"
                    />
                  )}
                  {item.icon}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
