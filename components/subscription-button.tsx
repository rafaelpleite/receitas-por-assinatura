"use client";

import React, { useState } from "react";
import { Zap } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";

export default function SubscriptionButton({
  isPro = false
}: {
  isPro: boolean;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  const onClick = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");

      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={loading}
      variant={isPro ? "default" : "premium"}
      onClick={onClick}
    >
      {isPro ? "Gerenciar inscrição" : "Receitas sem limites"}
      {!isPro && <Zap className="w-4 h-4 ml-2 fill-white" />}
    </Button>
  );
}
