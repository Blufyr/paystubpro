"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaystubData } from "@/types/paystub";
import { Loader2, CreditCard, Shield, Check } from "lucide-react";

interface StripePaymentProps {
  paystubData: PaystubData;
  onPaymentSuccess: (pdfUrl: string) => void;
  onPaymentError: (error: string) => void;
}

export default function StripePayment({
  paystubData,
  onPaymentSuccess,
  onPaymentError,
}: StripePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "ready" | "processing" | "success" | "error"
  >("ready");

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      // Create checkout session
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paystubData,
          amount: 1999, // $19.99 in cents
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      setPaymentStep("error");
      onPaymentError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="w-6 h-6" />
            Secure Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Professional Paystub
              </span>
              <span className="font-semibold">$19.99</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>$19.99</span>
            </div>
          </div>

          {/* Security Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>Secure payment processing by Stripe</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>Instant PDF download after payment</span>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay $19.99 & Download PDF
              </>
            )}
          </Button>

          {/* Payment Status */}
          {paymentStep === "processing" && (
            <div className="text-center text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to secure payment...
              </div>
            </div>
          )}

          {paymentStep === "error" && (
            <div className="text-center text-sm text-red-600">
              Payment failed. Please try again.
            </div>
          )}

          {/* Trust Indicators */}
          <div className="text-center text-xs text-gray-500">
            <div>Powered by Stripe</div>
            <div className="mt-1">
              Your payment information is secure and encrypted
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
