'use server';

import { createStreamableValue, createStreamableUI } from '@ai-sdk/rsc';
import { generateObject, CoreMessage, streamText } from 'ai';
import { xai, createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { ReactNode } from 'react';
import { z } from 'zod';
import { getOldSensorData } from '@/services/charts.services';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  display?: ReactNode;
}


const xai_keyed = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

// Streaming Chat 
export async function continueTextConversation(messages: any[]) {
  try {
    const { text } = await generateText({
      model: xai('grok-4-fast-reasoning'), // or 'grok-4-fast-reasoning' if you prefer
      messages,
      temperature: 0.6,
      providerOptions: {
        xai: {
          searchParameters: {
            mode: 'auto',
          },
        },
      },
    });

    return text.trim() || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error('Grok API error:', error);
    return "Sorry, I'm having trouble connecting right now. Please try again.";
  }
}

// Gen UIs 
export async function continueConversation(history: Message[]) {
  const stream = createStreamableUI();

  const { text, toolResults } = await generateText({
    model: xai_keyed('grok-4-fast-reasoning'),
    system: 'You are a friendly weather assistant!',
    messages: history,
   
  });

  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content:
          text || (toolResults ?? []).map(toolResult => String((toolResult as any).result ?? (toolResult as any).output ?? (toolResult as any).text ?? toolResult)).join(', '),
        display: stream.value,
      },
    ],
  };
}

// Utils
export async function checkAIAvailability() {
  const envVarExists = !!process.env.OPENAI_API_KEY;
  return envVarExists;
}



export async function dataNarrative(dailyReadings: any): Promise<string> {
  // Handle empty or invalid input early
  if (!dailyReadings || dailyReadings.length === 0) {
    return "No data available.";
  }

  try {
    const { text } = await generateText({
      model: xai_keyed('grok-4-fast-reasoning'),
      providerOptions: {
        xai: {
          searchParameters: {
            mode: 'auto', // Fixed typo: 'of' → 'off' (or use 'on'/'auto' if needed)
            returnCitations: true,
            maxSearchResults: 5,
            sources: [
              { type: 'web' },
              { type: 'news', country: 'US' },
              { type: 'x' },
            ],
          },
        },
      },
      prompt: `Provide a concise 5-word summary of the following data: ${JSON.stringify(dailyReadings)}`,
    });

    console.log("Data Narrative Text:", text);
    return text || "No summary generated.";
  } catch (error) {
    console.error("Error generating data narrative:", error);
    return "Failed to generate summary.";
  }
}

type KPIProps = {
  weekly: Partial<Record<string, { x: string; y: number }[]>>;
  latest: Partial<Record<string, { x: string; y: number }>>;
};
export async function generateActionInsight(  weekly: Partial<Record<string, { x: string; y: number }[]>>,
  latest: Partial<Record<string, { x: string; y: number }>>) {


//console.log("Old Sensor Data for Narrative:", data);
  const { object } = await generateObject({
  model: xai_keyed('grok-4-fast-reasoning'),
  output: 'array',
     providerOptions: {
    xai: {
      searchParameters: {
        mode: 'auto', // 'auto', 'on', or 'off'
        returnCitations: true,
        maxSearchResults: 5,
         sources: [
          {
            type: 'web',
          
          },
          {
            type: 'news',
            country: 'US',
          },
          {
            type: 'x',
           
          },
        ],
      },
    },
  },
  schema: z.object({
    inisghtObj: z.object({
      insightName: z.string().describe('Sensor metric providing insight. It should be readable so provide a space inbetween 2 words if necessary'),
      insightCategory: z.string().describe('Category of the insight based on NIST Smart City Framework up . Please respond up to 2 word'),
      insightSummary: z.string().describe('Please provide a summary and justify with data. Response should be of length 150 characters or less.'),
    }),
  }),
  prompt: 'Generate 3 actionable insight objects for a municipal planning team to make to improve sustainability based on strategic city plan in the XAI collection. Please note all power is in Watts and batP is energy used by sensor. solP is energy generated. the battery is a sodium ion 31wH Sodium Ion Battery 33140 3.1V 10Ah 31Wh (12C) Cylindrical Battery ' + 'weekly Data' + JSON.stringify(weekly) + ' and latest data ' + JSON.stringify(latest),

});

for await (const hero of object) {
  console.log(hero);
}
return object
}
