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
        p: ({ node, ...props }) => <p className="text-sm leading-relaxed opacity-95" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold opacity-100" {...props} />,
        em: ({ node, ...props }) => <em className="italic opacity-90" {...props} />,
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
      <div className="flex items-center justify-between bg-white/8 backdrop-blur-2xl p-3">
        <h3 className="text-sm font-semibold text-white/95">City Intelligence</h3>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 hover:bg-white/15 transition-colors"
          aria-label="Close"
        >
          <Close className="h-4 w-4 text-white/95" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <AboutCard />
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[82%] rounded-2xl px-4 py-3 text-sm
                    backdrop-blur-xl border border-white/25
                    ${m.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white/95'
                      : 'bg-white/15 text-white/95'
                    }
                  `}
                >
                  {renderContent(m.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white/15 backdrop-blur-xl px-4 py-3 text-sm">
                  <span className="animate-pulse text-white/95">Thinking...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/20 bg-white/8 backdrop-blur-2xl p-4">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about air quality, power, sensors..."
              className="flex-1 bg-white/15 border-white/30 text-white placeholder:text-white/95 focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:border-white/50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              <IconArrowUp className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}