
import { delay } from './utils.ts';

export async function callOpenAI(systemPrompt: string, message: string, openAIApiKey: string, retryCount = 0): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorData);
      
      // Handle rate limiting with exponential backoff
      if (response.status === 429 && retryCount < 3) {
        const waitTime = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${waitTime}ms (attempt ${retryCount + 1}/3)`);
        await delay(waitTime);
        return callOpenAI(systemPrompt, message, openAIApiKey, retryCount + 1);
      }
      
      // Handle different error types
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      } else if (response.status === 401) {
        throw new Error('INVALID_API_KEY');
      } else if (response.status >= 500) {
        throw new Error('OPENAI_SERVER_ERROR');
      } else {
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
      }
    }

    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    if (retryCount < 2 && !error.message.includes('RATE_LIMIT_EXCEEDED')) {
      console.log(`Retrying OpenAI call due to error: ${error.message} (attempt ${retryCount + 1}/3)`);
      await delay(1000);
      return callOpenAI(systemPrompt, message, openAIApiKey, retryCount + 1);
    }
    throw error;
  }
}
