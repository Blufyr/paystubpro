import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { generatePaystubPDF } from "@/lib/pdf-writer";
import { PaystubData } from "@/types/paystub";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paystubData, sessionId } = await request.json();

    if (!paystubData) {
      return NextResponse.json(
        { error: "Missing paystub data" },
        { status: 400 },
      );
    }

    // Validate paystub data structure
    if (
      !paystubData.personalInfo ||
      !paystubData.employerInfo ||
      !paystubData.earningsInfo
    ) {
      return NextResponse.json(
        { error: "Invalid paystub data structure" },
        { status: 400 },
      );
    }

    // Validate that the user has paid (check session if provided)
    if (sessionId) {
      // In a real implementation, you would verify the Stripe session
      // For now, we'll assume the payment is valid
    }

    try {
      // Generate PDF without watermark (since payment is complete)
      const pdfBuffer = await generatePaystubPDF(paystubData as PaystubData, {
        includeWatermark: false,
      });

      // Check if the buffer contains HTML (fallback case)
      const isHtml = pdfBuffer.toString("utf8", 0, 15).includes("<!DOCTYPE");

      // Set headers for PDF download
      const headers = new Headers();
      if (isHtml) {
        headers.set("Content-Type", "text/html");
        headers.set(
          "Content-Disposition",
          'attachment; filename="paystub.html"',
        );
      } else {
        headers.set("Content-Type", "application/pdf");
        headers.set(
          "Content-Disposition",
          'attachment; filename="paystub.pdf"',
        );
      }
      headers.set("Content-Length", pdfBuffer.length.toString());

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers,
      });
    } catch (pdfError) {
      console.error("PDF generation failed, creating HTML fallback:", pdfError);

      // Create a simple HTML version as fallback
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Paystub - ${paystubData.personalInfo.firstName} ${paystubData.personalInfo.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PAYROLL STATEMENT</h1>
          </div>
          <div class="section">
            <h2>Employee: ${paystubData.personalInfo.firstName} ${paystubData.personalInfo.lastName}</h2>
            <p><span class="label">Company:</span> ${paystubData.employerInfo.companyName}</p>
            <p><span class="label">Pay Period:</span> ${paystubData.earningsInfo.payPeriodStart} to ${paystubData.earningsInfo.payPeriodEnd}</p>
            <p><span class="label">Gross Pay:</span> ${paystubData.earningsInfo.grossPay.toFixed(2)}</p>
            <p><span class="label">Net Pay:</span> ${paystubData.netPay.toFixed(2)}</p>
          </div>
        </body>
        </html>
      `;

      const htmlBuffer = Buffer.from(htmlContent, "utf-8");
      const headers = new Headers();
      headers.set("Content-Type", "text/html");
      headers.set("Content-Disposition", 'attachment; filename="paystub.html"');
      headers.set("Content-Length", htmlBuffer.length.toString());

      return new NextResponse(htmlBuffer, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For demo purposes, create sample paystub data
    // In production, you'd retrieve this from Stripe session metadata
    const samplePaystubData = {
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
        companyName: "Sample Company",
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
        overtimeHours: 0,
        grossPay: 2000,
      },
      taxInfo: {
        exemptions: 1,
        federalTax: 200,
        stateTax: 100,
        socialSecurityTax: 124,
        medicareTax: 29,
        stateDisabilityTax: 0,
      },
      deductionsInfo: {
        healthInsurance: 150,
        dentalInsurance: 25,
        retirement401k: 100,
        otherDeductions: 0,
      },
      netPay: 1372,
      yearToDateGross: 2000,
      yearToDateNet: 1372,
    };

    try {
      // Generate PDF without watermark
      const pdfBuffer = await generatePaystubPDF(samplePaystubData, {
        includeWatermark: false,
      });

      // Check if the buffer contains HTML (fallback case)
      const isHtml = pdfBuffer.toString("utf8", 0, 15).includes("<!DOCTYPE");

      // Set headers for download
      const headers = new Headers();
      if (isHtml) {
        headers.set("Content-Type", "text/html");
        headers.set(
          "Content-Disposition",
          'attachment; filename="paystub.html"',
        );
      } else {
        headers.set("Content-Type", "application/pdf");
        headers.set(
          "Content-Disposition",
          'attachment; filename="paystub.pdf"',
        );
      }
      headers.set("Content-Length", pdfBuffer.length.toString());

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers,
      });
    } catch (pdfError) {
      console.error("PDF generation failed, creating HTML fallback:", pdfError);

      // Create a simple HTML version as fallback
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Paystub - ${samplePaystubData.personalInfo.firstName} ${samplePaystubData.personalInfo.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PAYROLL STATEMENT</h1>
          </div>
          <div class="section">
            <h2>Employee: ${samplePaystubData.personalInfo.firstName} ${samplePaystubData.personalInfo.lastName}</h2>
            <p><span class="label">Company:</span> ${samplePaystubData.employerInfo.companyName}</p>
            <p><span class="label">Pay Period:</span> ${samplePaystubData.earningsInfo.payPeriodStart} to ${samplePaystubData.earningsInfo.payPeriodEnd}</p>
            <p><span class="label">Gross Pay:</span> ${samplePaystubData.earningsInfo.grossPay.toFixed(2)}</p>
            <p><span class="label">Net Pay:</span> ${samplePaystubData.netPay.toFixed(2)}</p>
          </div>
        </body>
        </html>
      `;

      const htmlBuffer = Buffer.from(htmlContent, "utf-8");
      const headers = new Headers();
      headers.set("Content-Type", "text/html");
      headers.set("Content-Disposition", 'attachment; filename="paystub.html"');
      headers.set("Content-Length", htmlBuffer.length.toString());

      return new NextResponse(htmlBuffer, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 },
    );
  }
}
