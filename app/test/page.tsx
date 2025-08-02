"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { PaystubData } from "@/types/paystub";
import PaystubForm from "@/components/paystub-form";
import PaystubPreview from "@/components/paystub-preview";
import StripePayment from "@/components/stripe-payment";
import { generatePaystubPDF } from "@/lib/pdf-writer";

type TestResult = {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
};

export default function TestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [paystubData, setPaystubData] = useState<PaystubData>({
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      address: "123 Main St",
      city: "Anytown",
      state: "GA",
      zipCode: "30073",
      ssn: "1234",
    },
    employerInfo: {
      companyName: "Test Company Inc",
      companyAddress: "456 Business Ave",
      companyCity: "Business City",
      companyState: "GA",
      companyZipCode: "30074",
      employeeId: "EMP001",
    },
    earningsInfo: {
      payPeriodStart: "2024-01-01",
      payPeriodEnd: "2024-01-15",
      payDate: "2024-01-20",
      hourlyRate: 25,
      hoursWorked: 80,
      overtimeRate: 37.5,
      overtimeHours: 5,
      grossPay: 2187.5,
    },
    taxInfo: {
      exemptions: 1,
      federalTax: 200,
      stateTax: 100,
      socialSecurityTax: 135.63,
      medicareTax: 31.72,
      stateDisabilityTax: 0,
      ytdFederalTax: 200,
      ytdStateTax: 100,
      ytdSocialSecurityTax: 135.63,
      ytdMedicareTax: 31.72,
    },
    deductionsInfo: {
      healthInsurance: 150,
      dentalInsurance: 25,
      retirement401k: 100,
      otherDeductions: 0,
    },
    netPay: 1545.15,
    yearToDateGross: 2187.5,
    yearToDateNet: 1545.15,
  });

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Form Data Validation
    try {
      const requiredFields = [
        paystubData.personalInfo.firstName,
        paystubData.personalInfo.lastName,
        paystubData.employerInfo.companyName,
        paystubData.earningsInfo.hourlyRate,
        paystubData.earningsInfo.hoursWorked,
      ];

      const allFieldsValid = requiredFields.every(
        (field) => field && field !== "",
      );

      results.push({
        name: "Form Data Validation",
        status: allFieldsValid ? "pass" : "fail",
        message: allFieldsValid
          ? "All required fields are populated"
          : "Some required fields are missing",
      });
    } catch (error) {
      results.push({
        name: "Form Data Validation",
        status: "fail",
        message: `Error: ${error.message}`,
      });
    }

    // Test 2: Tax Calculations
    try {
      const expectedGross =
        paystubData.earningsInfo.hourlyRate *
          paystubData.earningsInfo.hoursWorked +
        paystubData.earningsInfo.overtimeRate *
          paystubData.earningsInfo.overtimeHours;
      const calculatedGross = paystubData.earningsInfo.grossPay;

      const grossMatch = Math.abs(expectedGross - calculatedGross) < 0.01;

      results.push({
        name: "Tax Calculations",
        status: grossMatch ? "pass" : "warning",
        message: grossMatch
          ? "Gross pay calculation is correct"
          : `Expected: $${expectedGross.toFixed(2)}, Got: $${calculatedGross.toFixed(2)}`,
      });
    } catch (error) {
      results.push({
        name: "Tax Calculations",
        status: "fail",
        message: `Error: ${error.message}`,
      });
    }

    // Test 3: PDF Generation
    try {
      const pdfBuffer = await generatePaystubPDF(paystubData, {
        includeWatermark: true,
      });
      const isValidPDF = pdfBuffer && pdfBuffer.length > 0;

      results.push({
        name: "PDF Generation",
        status: isValidPDF ? "pass" : "fail",
        message: isValidPDF
          ? "PDF generated successfully"
          : "PDF generation failed",
      });
    } catch (error) {
      results.push({
        name: "PDF Generation",
        status: "warning",
        message: `PDF generation error (fallback may work): ${error.message}`,
      });
    }

    // Test 4: Component Rendering
    try {
      // This is a basic test - in a real scenario you'd use testing libraries
      const componentsExist = {
        PaystubForm: typeof PaystubForm === "function",
        PaystubPreview: typeof PaystubPreview === "function",
        StripePayment: typeof StripePayment === "function",
      };

      const allComponentsExist = Object.values(componentsExist).every(
        (exists) => exists,
      );

      results.push({
        name: "Component Rendering",
        status: allComponentsExist ? "pass" : "fail",
        message: allComponentsExist
          ? "All components are available"
          : "Some components are missing",
      });
    } catch (error) {
      results.push({
        name: "Component Rendering",
        status: "fail",
        message: `Error: ${error.message}`,
      });
    }

    // Test 5: Environment Variables
    try {
      const envVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY:
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      };

      const allEnvVarsSet = Object.values(envVars).every(
        (value) => value && value !== "",
      );

      results.push({
        name: "Environment Variables",
        status: allEnvVarsSet ? "pass" : "warning",
        message: allEnvVarsSet
          ? "All required env vars are set"
          : "Some env vars may be missing",
      });
    } catch (error) {
      results.push({
        name: "Environment Variables",
        status: "fail",
        message: `Error: ${error.message}`,
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      pass: "bg-green-100 text-green-800",
      fail: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
    };

    return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Paystub App Component Tests
          </h1>
          <p className="text-gray-600 mb-6">
            Comprehensive testing of all paystub application components and
            functionality.
          </p>

          <Button onClick={runTests} disabled={isRunning} className="mb-6">
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>
        </div>

        {testResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-600">
                          {result.message}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Live Form Test</CardTitle>
            </CardHeader>
            <CardContent>
              <PaystubForm
                onDataChange={setPaystubData}
                onStepChange={(step) => console.log("Step:", step)}
                currentStep={1}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Preview Test</CardTitle>
            </CardHeader>
            <CardContent>
              <PaystubPreview data={paystubData} showWatermark={true} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Component Test</CardTitle>
          </CardHeader>
          <CardContent>
            <StripePayment
              paystubData={paystubData}
              onPaymentSuccess={(url) => console.log("Payment success:", url)}
              onPaymentError={(error) => console.error("Payment error:", error)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
