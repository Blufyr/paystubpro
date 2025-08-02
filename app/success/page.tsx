"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, ArrowLeft } from "lucide-react";
import Navbar from "@/components/navbar";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId) {
        setError("No session ID found");
        setIsLoading(false);
        return;
      }

      try {
        // In a real implementation, you would:
        // 1. Verify the Stripe session
        // 2. Retrieve the paystub data from the session metadata
        // 3. Generate the PDF
        // 4. Provide download link

        // For now, we'll simulate a successful payment
        setTimeout(() => {
          setPdfUrl("/api/generate-pdf?session_id=" + sessionId);
          setIsLoading(false);
        }, 2000);
      } catch (err) {
        setError("Failed to process payment");
        setIsLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [sessionId]);

  const handleDownload = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/generate-pdf?session_id=${sessionId}`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "paystub.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">
                  Processing Your Payment
                </h2>
                <p className="text-gray-600">
                  Please wait while we generate your paystub...
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-red-500 mb-4">
                  <CheckCircle className="w-12 h-12 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-red-600">
                  Payment Error
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={handleBackToDashboard}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <div className="text-green-500 mb-4">
                  <CheckCircle className="w-16 h-16 mx-auto" />
                </div>
                <CardTitle className="text-2xl text-green-600">
                  Payment Successful!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Thank you for your payment. Your professional paystub has
                    been generated and is ready for download.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="text-sm text-green-800">
                      <div className="font-semibold">Order Summary</div>
                      <div className="mt-1">Professional Paystub - $19.99</div>
                      <div className="text-xs mt-2">
                        Session ID: {sessionId}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleDownload} className="w-full" size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    Download Your Paystub PDF
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleBackToDashboard}
                    className="w-full"
                  >
                    Create Another Paystub
                  </Button>
                </div>

                <div className="text-center text-xs text-gray-500">
                  <p>Need help? Contact our support team.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
