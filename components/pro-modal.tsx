"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Check,
  Zap
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useProModal } from "@/hooks/use-pro-modal";
import { cn } from "@/lib/utils";

const tools = [
  {
    label: "Receitas",
    icon: MessageSquare,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10"
  }
];

export default function PorModal() {
  const proModal = useProModal();
  const [loading, setLoading] = useState<boolean>(false);

  const onSubscribeCC = async () => {
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

  const onSubscribePIX = async () => {
    try {
      setLoading(true);
  
      // Fetch payment link
      const response = await axios.get("/api/mercadopago");
      console.log("Passed here response", response);
  
      const ticketUrl = response.data.point_of_interaction.transaction_data.ticket_url;
  
      console.log("Ticket URL:", ticketUrl);
  
      // Open in new tab
      const newWindow = window.open(ticketUrl, "_blank");
  
      // Fallback for browsers that block `window.open`
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert("Habilite popup para este site.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
            <div className="flex items-center gap-x-2 font-bold py-1">
              Atualize para Chefely
              <Badge variant="premium" className="uppercase text-sm py-1">
                pro
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
            {tools.map((tool) => (
              <Card
                key={tool.label}
                className="p-3 border-black/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-x-4">
                  <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                    <tool.icon className={cn("w-6 h-6", tool.color)} />
                  </div>
                  <div className="font-semibold text-sm">{tool.label}</div>
                </div>
                <Check className="text-primary w-5 h-5" />
              </Card>
            ))}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={onSubscribeCC}
            size="lg"
            variant="premium"
            className="w-full"
            disabled={loading}
          >
            Pagar com Cartão de Crédito
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </DialogFooter>
        <DialogFooter>
          <Button
            onClick={onSubscribePIX}
            size="lg"
            variant="premium"
            className="w-full"
            disabled={loading}
          >
            Pagar com PIX
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  );
}
