// components/Chat/Chat.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconArrowUp } from '@/components/ui/icons';
import Close from '@mui/icons-material/Close';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CoreMessage, streamText } from 'ai';
import { continueTextConversation } from '@/app/actions';
import { readStreamableValue } from '@ai-sdk/rsc';
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

  // Build system prompt once (expensive JSON stringify)
  const systemPrompt = `
You are an AI assistant with the wisdom of Darwi Odrade from Dune.

You monitor environmental sensors in a smart city. Use the data below to answer questions.

Keep responses **under 48 words**. Do not Use markdown for clarity.

Reference:
- Coral Gables Collection (collection_4596033a-4422-4a49-b7ba-c24e3eda17c1)
- Real-time sensor data
- Recent X posts & news for public sentiment

**Raw Data:**
\`\`\`json
${JSON.stringify(rawData, null, 2)}
\`\`\`

**Monthly Aggregates:**
\`\`\`json
${JSON.stringify(monthlyAggregates, null, 2)}
\`\`\`
  `.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: CoreMessage = { role: 'user', content: input };
    const updatedMessages: CoreMessage[] = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await continueTextConversation([
        { role: 'system', content: systemPrompt },
        ...messages,
        userMessage,
      ]);

      let assistantContent = '';
      for await (const chunk of readStreamableValue(result)) {
        if (typeof chunk === 'string') {
          assistantContent += chunk;
          setMessages([
            ...updatedMessages,
            { role: 'assistant', content: assistantContent },
          ]);
        }
      }

      // Final update
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: assistantContent },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background p-3">
        <h3 className="text-lg font-medium">City Intelligence</h3>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-muted transition-colors"
          aria-label="Close chat"
        >
          <Close className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <AboutCard />
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-3 text-sm
                    ${m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                    }
                  `}
                >
                {m.content as string}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background p-4">
        <div className="mx-auto max-w-2xl">
          <Card className="overflow-hidden rounded-xl shadow-sm">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about air quality, power, sensors..."
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="rounded-full"
              >
                <IconArrowUp className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}