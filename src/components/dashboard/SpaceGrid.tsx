'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { SpaceCard } from './SpaceCard';
import { motion } from 'framer-motion';

export const SpaceGrid = React.memo(({ onSpaceSelect }: { onSpaceSelect: (id: string) => void }) => {
  const { state } = useFinance();

  return (
    <div className="px-6 pb-6 lg:pb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {state.spaces.filter(s => s.id !== '5').map((space, index) => (
          <motion.div
            key={space.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <SpaceCard space={space} onClick={() => onSpaceSelect(space.id)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
});
