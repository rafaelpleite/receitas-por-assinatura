"use client";

import React from "react";
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
          {!messages.length && !isLoading && <Empty label="Nenhuma receita ainda." />}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
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
