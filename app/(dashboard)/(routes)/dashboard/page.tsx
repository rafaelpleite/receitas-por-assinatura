"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  MessageSquare,
  Salad,
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const tools = [
  {
    label: "Receitas",
    icon: MessageSquare,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/conversation"
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [recipeOfTheDay, setRecipeOfTheDay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);  // State to manage loading state

  useEffect(() => {
    const fetchRecipeOfTheDay = async () => {
      setIsLoading(true);  // Set loading to true before fetching data
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
          ]).flat();
          
          // Filter for recipes from the assistant
          const recipes = formattedHistory.filter((msg: { role: string; }) => msg.role === 'assistant');
          if (recipes.length > 0) {
            const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
            setRecipeOfTheDay(randomRecipe.content);
          } else {
            setRecipeOfTheDay('Sem receita do dia hoje.');
          }
        } else {
          console.error('Failed to fetch conversation history');
          setRecipeOfTheDay('Failed to load recipe of the day.');
        }
      } catch (error) {
        console.error('Error fetching recipe of the day:', error);
        setRecipeOfTheDay('Failed to load recipe of the day.');
      }
      setIsLoading(false);  // Set loading to false after fetching data
    };

    fetchRecipeOfTheDay();
  }, []);

  return (
    <div>
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          Explore o Receitas por Assinatura
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          Converse com nossa Chef AI - Descubra o Sabor da Tecnologia
        </p>
      </div>

      <div className="px-4 md:px-20 lg:px-32 space-y-4">
        {tools.map((tool) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-x-4">
              <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8", tool.color)} />
              </div>
              <div className="font-semibold">{tool.label}</div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Card>
        ))}
        {isLoading ? (
          <Skeleton />
        ) : (
          <Card
              className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start gap-x-4 mb-2">
                <div className={cn("p-2 w-fit rounded-md", "bg-teal-500/10",)}>
                  <Salad className={cn("w-8 h-8", "text-teal-500")} />
                </div>
                <div className="font-semibold">Receita do dia</div>
                <div className="text-sm md:text-base w-full">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {recipeOfTheDay}
                  </ReactMarkdown>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Card>
        )}
      </div>
    </div>
  );
}
