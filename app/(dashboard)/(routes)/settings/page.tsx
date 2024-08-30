import React from "react";
import { Settings } from "lucide-react";

import Heading from "@/components/heading";
import { checkSubscription } from "@/lib/subscription";
import SubscriptionButton from "@/components/subscription-button";

export default async function SettingsPage() {
  const isPro = await checkSubscription();

  return (
    <div>
      <Heading
        title="Configurações"
        description="Gerenciar configurações da conta."
        icon={Settings}
        iconColor="text-gray-700"
        bgColor="bg-gray-700/10"
      />
      <div className="px-4 lg:px-8 space-y-4">
        <div className="text-muted-foreground text-sm">
          {isPro
            ? "Você é atualmente um plano pro."
            : "Você é atualmente um plano gratuíto."}
        </div>
        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
  );
}
