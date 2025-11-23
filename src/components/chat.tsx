// components/Chat/Chat.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconArrowUp } from '@/components/ui/icons';
import Close from '@mui/icons-material/Close';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CoreMessage } from 'ai';
import { continueTextConversation } from '@/app/actions';
import AboutCard from '@/components/cards/aboutcard';
import { useSensorStore } from '@/services/store';

interface ChatProps {
  onClose: () => void;
}

export default function Chat({ onClose }: ChatProps) {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const state = useSensorStore.getState();
  const { rawData, monthlyAggregates } = state;

  const systemPrompt = `You are an AI assistant with the wisdom of Darwi Odrade from Dune, monitoring smart city environmental sensors.

Key instructions:
- Respond concisely under 48 words.
- Be direct and factual.
- Use the sensor data below to answer accurately.

Sensor Data:
Raw: ${JSON.stringify(rawData, null, 2)}
Monthly: ${JSON.stringify(monthlyAggregates, null, 2)}
  `.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: CoreMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await continueTextConversation([
        { role: 'system', content: systemPrompt },
        ...messages,
        userMessage,
      ]);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const Markdown = ({ children }: { children: string }) => (
    <ReactMarkdown
      components={{
        p: ({ node, ...props }) => (
          <p className="text-sm leading-relaxed text-black dark:text-white" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-semibold text-black dark:text-white" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic text-black/90 dark:text-white/90" {...props} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );

  const renderContent = (content: CoreMessage['content']) =>
    typeof content === 'string' ? (
      <Markdown>{content}</Markdown>
    ) : (
      content
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p, i) => <Markdown key={i}>{p.text}</Markdown>)
    );

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/70 backdrop-blur-xl px-5 py-3">
        <h3 className="text-base font-semibold tracking-tight text-black dark:text-white">
          Odrade AI
        </h3>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Close chat"
        >
          <Close className="h-6 w-6 text-black/70 dark:text-white/70" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-safe pb-safe pt-4 bg-white/40 dark:bg-black/40 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-full px-4 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-sm">
                <AboutCard />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[84%] rounded-2xl px-4 py-3 text-sm
                      border border-black/10 dark:border-white/10
                      shadow-lg
                      ${m.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-400/20 dark:to-purple-400/20'
                        : 'bg-white/85 dark:bg-black/75'
                      }
                      backdrop-blur-xl
                      text-black dark:text-white
                    `}
                  >
                    {renderContent(m.content)}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[84%] rounded-2xl bg-white/85 dark:bg-black/75 backdrop-blur-xl border border-black/10 dark:border-white/10 px-4 py-3 text-sm shadow-lg">
                    <span className="animate-pulse text-black/80 dark:text-white/80">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/70 backdrop-blur-xl px-safe py-4">
        <div className="mx-auto w-full max-w-full px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about air quality, power, sensors..."
              className="flex-1 bg-white/90 dark:bg-black/70 backdrop-blur-md border-black/20 dark:border-white/20 
                       text-black dark:text-white 
                       placeholder:text-black/60 dark:placeholder:text-white/60
                       focus-visible:ring-2 focus-visible:ring-blue-500/50
                       shadow-lg"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-blue-500/20 hover:bg-blue-500/30 dark:bg-blue-400/30 dark:hover:bg-blue-400/40 
                       text-blue-700 dark:text-blue-300 border border-blue-500/30 dark:border-blue-400/40 
                       h-11 w-11 shrink-0 backdrop-blur-md shadow-lg"
            >
              <IconArrowUp className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}