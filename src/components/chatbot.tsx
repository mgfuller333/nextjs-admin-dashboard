// components/ChatbotButton.tsx
'use client';

import Chat from '@/components/chat';
import React, { useState } from 'react';
import { Fab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

type Props = {
   latestData?: any;
   weeklyData?: Partial<Record<string, { x: string; y: number }[]>>;
  // This is exactly what computeWeeklyFromRaw() returns
  monthlyData?: Partial<Record<string, { x: string; y: number }[]>>;
};

export default function ChatbotButton({ latestData = {}, weeklyData = {}, monthlyData = {} }: Props) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => setIsChatOpen(v => !v);
  const closeChat = () => setIsChatOpen(false);

  return (
    <>
      <div className="relative flex h-[calc(100vh-theme(spacing.16))] flex-col overflow-hidden pb-10">
        {/* Floating Chat Window - Mobile-First Responsive */}
        {isChatOpen && (
          <div
            className={`
              fixed inset-x-0 bottom-20 z-[1300] mx-4 
              sm:inset-x-auto sm:right-4 sm:left-auto sm:mx-0
              max-w-full sm:max-w-lg
              h-[400px]
              shadow-2xl rounded-2xl
              overflow-hidden
              border border-white/10
              bg-background backdrop-blur-sm
            `}
          >
            <Chat onClose={closeChat} latestDataProp={latestData} weeklyDataProp={weeklyData} monthlyDataProp={monthlyData} />
          </div>
        )}
      </div>

      {/* FAB */}
      {!isChatOpen && (
        <Fab
          color="primary"
          aria-label="open chat"
          onClick={toggleChat}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1300,
          }}
        >
          <ChatIcon />
        </Fab>
      )}
    </>
  );
}