import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../../supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paystubData, amount } = await request.json();

    if (!paystubData || !amount) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 },
      );
    }

    // Validate paystub data
    if (
      !paystubData.personalInfo?.firstName ||
      !paystubData.personalInfo?.lastName
    ) {
      return NextResponse.json(
        { error: "Invalid paystub data - missing personal information" },
        { status: 400 },
      );
    }

    // Create Stripe checkout session with enhanced error handling
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Professional Paystub",
              description:
                "Generate and download your professional paystub PDF",
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/dashboard`,
      metadata: {
        user_id: user.id,
        paystub_data: JSON.stringify(paystubData).substring(0, 500), // Limit metadata size
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
