'use client';

import Chat from '@/components/chat';
import React, { useState } from 'react';
import { Fab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

export default function ChatbotButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => setIsChatOpen(v => !v);
  const closeChat = () => setIsChatOpen(false);

  return (
    <>
      {/* Page content */}
      <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden pb-10 flex-col">
        {/* Floating chat window */}
        {isChatOpen && (
          <div
            className="
              fixed bottom-20 right-4 z-[1300]
              flex bg-background
              shadow-2xl rounded-lg 
              h-[500px] w-[400px]
            "
          >
            <Chat onClose={closeChat} />
          </div>
        )}
      </div>

      {/* FAB – only visible when chat is closed */}
      {!isChatOpen && (
        <Fab
          color="primary"
          aria-label="open chat"
          onClick={toggleChat}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1300,
          }}
        >
          <ChatIcon />
        </Fab>
      )}
    </>
  );
}