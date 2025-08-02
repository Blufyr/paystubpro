"use client";

import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import PaystubForm from "@/components/paystub-form";
import PaystubPreview from "@/components/paystub-preview";
import StripePayment from "@/components/stripe-payment";
import { PaystubData } from "@/types/paystub";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, CreditCard, Download, ArrowLeft } from "lucide-react";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/components/error-boundary";

type DashboardStep = "form" | "preview" | "payment" | "success";

export default function Dashboard() {
  const [currentStep, setCurrentStep] = useState<DashboardStep>("form");
  const [formStep, setFormStep] = useState(1);
  const [paystubData, setPaystubData] = useState<PaystubData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleFormDataChange = (data: PaystubData) => {
    setPaystubData(data);
  };

  const handleFormStepChange = (step: number) => {
    setFormStep(step);
    if (step > 5) {
      setCurrentStep("preview");
    }
  };

  const handlePreviewToPayment = () => {
    if (!validatePaystubData(paystubData)) {
      alert(
        "Please complete all required fields before proceeding to payment.",
      );
      return;
    }
    setCurrentStep("payment");
  };

  const handlePaymentSuccess = (url: string) => {
    setPdfUrl(url);
    setCurrentStep("success");
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    alert(`Payment failed: ${error}. Please try again.`);
  };

  const validatePaystubData = (data: PaystubData | null): boolean => {
    if (!data) return false;

    const { personalInfo, employerInfo, earningsInfo } = data;

    // Check required personal info
    if (
      !personalInfo.firstName ||
      !personalInfo.lastName ||
      !personalInfo.address ||
      !personalInfo.city ||
      !personalInfo.state ||
      !personalInfo.zipCode
    ) {
      return false;
    }

    // Check required employer info
    if (
      !employerInfo.companyName ||
      !employerInfo.companyAddress ||
      !employerInfo.companyCity ||
      !employerInfo.companyState ||
      !employerInfo.companyZipCode
    ) {
      return false;
    }

    // Check required earnings info
    if (
      !earningsInfo.payPeriodStart ||
      !earningsInfo.payPeriodEnd ||
      !earningsInfo.payDate ||
      earningsInfo.hourlyRate <= 0 ||
      earningsInfo.hoursWorked <= 0
    ) {
      return false;
    }

    return true;
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
  };

  const handleBackToPreview = () => {
    setCurrentStep("preview");
  };

  const handleStartOver = () => {
    setCurrentStep("form");
    setFormStep(1);
    setPaystubData(null);
    setPdfUrl(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Your Paystub</h1>
            <p className="text-gray-600">
              Generate a professional paystub in just a few simple steps
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div
                className={`flex items-center space-x-2 ${
                  currentStep === "form"
                    ? "text-blue-600"
                    : ["preview", "payment", "success"].includes(currentStep)
                      ? "text-green-600"
                      : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "form"
                      ? "bg-blue-600 text-white"
                      : ["preview", "payment", "success"].includes(currentStep)
                        ? "bg-green-600 text-white"
                        : "bg-gray-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <span className="font-medium">Fill Form</span>
              </div>

              <div
                className={`w-16 h-0.5 ${
                  ["preview", "payment", "success"].includes(currentStep)
                    ? "bg-green-600"
                    : "bg-gray-200"
                }`}
              />

              <div
                className={`flex items-center space-x-2 ${
                  currentStep === "preview"
                    ? "text-blue-600"
                    : ["payment", "success"].includes(currentStep)
                      ? "text-green-600"
                      : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "preview"
                      ? "bg-blue-600 text-white"
                      : ["payment", "success"].includes(currentStep)
                        ? "bg-green-600 text-white"
                        : "bg-gray-200"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </div>
                <span className="font-medium">Preview</span>
              </div>

              <div
                className={`w-16 h-0.5 ${
                  ["payment", "success"].includes(currentStep)
                    ? "bg-green-600"
                    : "bg-gray-200"
                }`}
              />

              <div
                className={`flex items-center space-x-2 ${
                  currentStep === "payment"
                    ? "text-blue-600"
                    : currentStep === "success"
                      ? "text-green-600"
                      : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "payment"
                      ? "bg-blue-600 text-white"
                      : currentStep === "success"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="font-medium">Payment</span>
              </div>

              <div
                className={`w-16 h-0.5 ${
                  currentStep === "success" ? "bg-green-600" : "bg-gray-200"
                }`}
              />

              <div
                className={`flex items-center space-x-2 ${
                  currentStep === "success" ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "success"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  <Download className="w-4 h-4" />
                </div>
                <span className="font-medium">Download</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form/Payment */}
            <div>
              {currentStep === "form" && (
                <PaystubForm
                  onDataChange={handleFormDataChange}
                  onStepChange={handleFormStepChange}
                  currentStep={formStep}
                />
              )}

              {currentStep === "preview" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Paystub</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Please review your paystub information. You can go back to
                      edit any section if needed.
                    </p>
                    <div className="flex space-x-4">
                      <Button variant="outline" onClick={handleBackToForm}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Edit Form
                      </Button>
                      <Button onClick={handlePreviewToPayment}>
                        Proceed to Payment
                        <CreditCard className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === "payment" && paystubData && (
                <div className="space-y-4">
                  <Button variant="outline" onClick={handleBackToPreview}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Preview
                  </Button>
                  <StripePayment
                    paystubData={paystubData}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </div>
              )}

              {currentStep === "success" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">
                      Payment Successful!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Your payment has been processed successfully. Your paystub
                      PDF is ready for download.
                    </p>
                    {pdfUrl && (
                      <Button asChild>
                        <a href={pdfUrl} download="paystub.pdf">
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleStartOver}>
                      Create Another Paystub
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Preview */}
            <div>
              {paystubData && (
                <div className="sticky top-8">
                  <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                  <PaystubPreview
                    data={paystubData}
                    showWatermark={currentStep !== "success"}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
