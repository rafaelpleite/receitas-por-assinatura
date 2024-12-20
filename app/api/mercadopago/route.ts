import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';

import prismadb from "@/lib/prismadb";
import { absoluteUrl } from "@/lib/utils";

import { MercadoPagoConfig, Payment } from 'mercadopago';

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Initialize the Mercado Pago client as per documentation
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: {
        timeout: 5000,
        idempotencyKey: `payment-${userId}-${Date.now()}`,
      },
    });

    const payment = new Payment(client);

    // Check if user already has a subscription (if that logic still applies in your system)
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    if (userSubscription) {
      // If a subscription already exists, handle this case as needed.
      // Mercado Pago Pix doesn't have a direct "portal" like Stripe,
      // so just return a message or redirect.
      return NextResponse.json({
        message: "You already have an active subscription.",
      });
    }

    // Create a Pix payment request body as shown in the documentation:
    const body = {
      transaction_amount: 9.90,
      description: "Chefely Pro - Pagamento Único",
      payment_method_id: "pix",
      payer: {
        email: user.emailAddresses[0].emailAddress,
      },
      // Optionally, you can define expiration date for Pix payment code:
      // date_of_expiration: "2024-12-31T23:59:59Z"
    };

    // Create the payment
    const response = await payment.create({ body });


    // The response contains all necessary info, including ticket_url, qr_code_base64, and qr_code
    return NextResponse.json(response);
  } catch (error) {
    console.error("MERCADO_PAGO_PIX_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
