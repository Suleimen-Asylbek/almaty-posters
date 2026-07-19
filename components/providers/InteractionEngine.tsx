'use client';

import React, { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { springs } from '@/lib/motion/tokens';
import { CursorProvider } from '@/lib/engines/cursor';
import { ScrollProvider } from '@/lib/engines/scroll';

// Note: Performance and Device engines are hooks, not necessarily providers, 
// unless they need shared state.

export const InteractionEngine = ({ children }: { children: ReactNode }) => {
  return (
    <MotionConfig transition={springs.normal} reducedMotion="user">
      <CursorProvider>
        <ScrollProvider>
          {children}
        </ScrollProvider>
      </CursorProvider>
    </MotionConfig>
  );
};
