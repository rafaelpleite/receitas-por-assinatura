"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Heading from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

import { cn } from "@/lib/utils";

import { generate } from "@/app/actions";
import { readStreamableValue } from 'ai/rsc';

export const maxDuration = 30;

export default function ConversationPage() {
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // We'll store chat messages: user or assistant
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);

  // Optional: load conversation history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedHistory = data
            .map((entry: { prompt: string; response: string }) => [
              { role: 'user', content: entry.prompt },
              { role: 'assistant', content: entry.response }
            ])
            .flat();

          setMessages(formattedHistory);
        } else {
          console.error('Failed to fetch conversation history');
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      }
    };

    fetchHistory();
  }, []);

  /**
   * Submit form via our own handler
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input) return;

    setIsLoading(true);

    try {
      // 1) Add user's message to local state
      const userMsg = { role: 'user' as const, content: input };
      setMessages((prev) => [...prev, userMsg]);

      // 2) Call our server action to get the streaming response
      const { output } = await generate(input);

      // 3) We'll track partial content in a variable, then finalize it
      let partialAssistantContent = '';

      // 4) Create a placeholder assistant message (so user sees it as it types out)
      //    We'll update this same message as chunks arrive
      const placeholderAssistantMsg = { role: 'assistant' as const, content: '' };

      // Add placeholder assistant message to the list
      setMessages((prev) => [...prev, placeholderAssistantMsg]);

      // 5) Stream the chunks
      if (output) {
        for await (const chunk of readStreamableValue(output)) {
          partialAssistantContent += chunk;
      
          // Update the last message in the list with partial content
          setMessages((prev) => {
            // The last item should be the placeholder assistant message
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: partialAssistantContent,
              };
            }
            return updated;
          });
        }
      } else {
        // Handle the undefined case appropriately
        console.error('Output is undefined. Cannot read streamable value.');
        // Optionally, you can update the UI to reflect the error
      }
      

      // 6) Optionally save final conversation to DB
      fetch('/api/writehistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input, response: partialAssistantContent }),
      }).catch(error => console.error('Error saving conversation:', error));

      // 7) Clear input
      setInput('');
    } catch (error) {
      console.error('Error generating:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Heading
        title="Receitas"
        description="Gere receitas sem limites"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />

      <div className="px-4 lg:px-8">
        {/* --- FORM that calls handleSubmit --- */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Como fazer um bolo de fubá?"
            disabled={isLoading}
            className="col-span-10 pl-2 border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
          />
          <Button disabled={isLoading} className="col-span-2 w-full">
            Enviar
          </Button>
        </form>

        <div className="space-y-4 mt-4">
          {isLoading && <Loader />}
          {!messages.length && !isLoading && <Empty label="Nenhuma receita ainda." />}

          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg",
                  message.role === "user"
                    ? "bg-white border border-black/10"
                    : "bg-muted"
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <div className="text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
