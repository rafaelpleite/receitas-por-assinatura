"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useChat } from 'ai/react';
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

export default function ConversationPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [history, setHistory] = useState([]);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  useEffect(() => {
    // Fetch conversation history on component mount
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
          const formattedHistory = data.map((entry: { prompt: any; response: any; }) => [
            { role: 'user', content: entry.prompt },
            { role: 'assistant', content: entry.response }
          ]).flat(); // Flatten the array to get a list of messages
          setHistory(formattedHistory);
        } else {
          console.error('Failed to fetch conversation history');
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    // Check if loading has just finished
    if (!isLoading && messages.length > previousMessageCount) {
      const lastUserMessage = messages
        .filter(msg => msg.role === "user")
        .slice(-1)[0]?.content || "";
      const lastAssistantMessage = messages
        .filter(msg => msg.role === "assistant")
        .slice(-1)[0]?.content || "";

      if (lastUserMessage && lastAssistantMessage) {
        fetch('/api/writehistory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: lastUserMessage, response: lastAssistantMessage }),
        }).catch(error => console.error('Error saving conversation:', error));
      }

      setPreviousMessageCount(messages.length); // Update the message count
    }
  }, [isLoading, messages]);

  const allMessages = [...history, ...messages];

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
        <form onSubmit={handleSubmit} className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Como fazer um bolo de fubá?"
            disabled={isLoading}
            className="col-span-10 pl-2 border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
          />
          <Button
            disabled={isLoading}
            className="col-span-2 w-full"
          >
            Enviar
          </Button>
        </form>
        <div className="space-y-4 mt-4">
          {isLoading && <Loader />}
          {!allMessages.length && !isLoading && <Empty label="Nenhuma receita ainda." />}
          <div className="flex flex-col-reverse gap-y-4">
            {allMessages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg",
                  message.role === "user" ? "bg-white border border-black/10" : "bg-muted"
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
