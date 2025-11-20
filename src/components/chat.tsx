'use client';

import { Card } from '@/components/ui/card';
import { UserModelMessage, type CoreMessage } from 'ai';
import { xai } from '@ai-sdk/xai';
import { useState } from 'react';
import { continueTextConversation } from '@/app/actions';
import { readStreamableValue } from '@ai-sdk/rsc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconArrowUp } from '@/components/ui/icons';
import Close from '@mui/icons-material/Close';
import Link from 'next/link';
import AboutCard from '@/components/cards/aboutcard';
import ReactMarkdown from 'react-markdown';
import { useSensorStore } from '@/services/store';

export const maxDuration = 30;

interface ChatProps {
  onClose: () => void;
}

export default function Chat({ onClose }: ChatProps) {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

     const state = useSensorStore.getState();

    const supportData = state.rawData;
     const supportData2 = state.monthlyAggregates;

     const SupportData = 
     `
     You are an AI chatbot assitant with the intelligence of Darwi Odrade from Dune.

    Please be mindful of your responses to try and first ask the user for references before listing them so that the UX is bettery for a chatbot assitant
     You are tasked with monitoring and analyzing environmental sensor data from a smart city network to guide its development and public health strategies.


     Use the data below to help answer the user's question. 
    
    keep text responses limited to 48 words or less (dont show word count in response). 
    
    Please leverage markdown to provide a good UX when responding.

    Please reference files in the Coral Gables Collection collection_4596033a-4422-4a49-b7ba-c24e3eda17c1
    
    Please also reference sensor data

    and recent posts on X and news articles to provide accurate and relevant information as well as public sentiment where applicable in real time.

    Here is the sensor raw data:
      ${JSON.stringify(supportData)}. 
      Here are the monthly aggregates: ${JSON.stringify(supportData2)}. 
      
 `;



//console.log("Support Data:", SupportData);
    const userMsg: CoreMessage = { role: 'user', content: input };
    const apiMessages = [{ role: 'system', content: SupportData }, ...messages, userMsg];
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    

   // console.log("Sensor Store State in Chat:", state);

    const result = await continueTextConversation(apiMessages);
    for await (const chunk of readStreamableValue(result)) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: chunk as string }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-background">
        <h3 className="font-medium text-lg">Chat</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <Close className="h-5 w-5" />
        </button>
      </div>

      {/* ── Scrollable messages ── */}
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
                    max-w-[75%] rounded-2xl px-4 py-2
                    ${m.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-black'
                    }
                  `}
                >
                  <ReactMarkdown>{m.content as string}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Input (pinned) ── */}
      <div className="border-t border-border bg-background p-4">
        <div className="max-w-xl mx-auto">
          <Card className="p-2 rounded-xl shadow-sm">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:outline-none"
              />
              <Button
                type="submit"
                disabled={!input.trim()}
                size="icon"
                className="rounded-full"
              >
                <IconArrowUp className="h-4 w-4 " />
              </Button>
            </form>

            {messages.length > 1 && (
              <div className="mt-2 text-center">
               
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}