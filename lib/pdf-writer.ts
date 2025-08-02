import { PaystubData } from "@/types/paystub";
import puppeteer from "puppeteer";

export interface PDFGenerationOptions {
  includeWatermark?: boolean;
  format?: "A4" | "Letter";
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export class PaystubPDFWriter {
  private data: PaystubData;
  private options: PDFGenerationOptions;

  constructor(data: PaystubData, options: PDFGenerationOptions = {}) {
    this.data = data;
    this.options = {
      includeWatermark: false,
      format: "Letter",
      margin: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
      ...options,
    };
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  private formatDate(dateString: string): string {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  public generateHTML(): string {
    const { data } = this;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payroll Statement</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          background-color: #2563eb;
          color: white;
          text-align: center;
          padding: 20px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .company-info {
          margin-bottom: 20px;
        }
        .company-info h2 {
          font-size: 18px;
          margin: 0 0 10px 0;
          font-weight: bold;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .info-block {
          width: 48%;
        }
        .info-block h3 {
          font-size: 14px;
          font-weight: bold;
          margin: 0 0 10px 0;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .info-row {
          margin-bottom: 5px;
        }
        .label {
          font-weight: bold;
          display: inline-block;
          width: 120px;
        }
        .earnings-section {
          margin-bottom: 20px;
        }
        .section-header {
          background-color: #f3f4f6;
          padding: 10px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .earnings-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .earnings-table th,
        .earnings-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .earnings-table th {
          background-color: #f9fafb;
          font-weight: bold;
        }
        .earnings-table .amount {
          text-align: right;
        }
        .deductions-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .deductions-block {
          width: 48%;
        }
        .deduction-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          padding: 3px 0;
        }
        .net-pay {
          border-top: 2px solid #333;
          padding-top: 15px;
          text-align: right;
          font-size: 18px;
          font-weight: bold;
        }
        .net-pay .amount {
          color: #059669;
        }
        .ytd-section {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
        }
        .ytd-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          font-size: 72px;
          color: rgba(0, 0, 0, 0.1);
          font-weight: bold;
          z-index: -1;
          pointer-events: none;
        }
        @media print {
          body { margin: 0; }
          .watermark { display: ${this.options.includeWatermark ? "block" : "none"}; }
        }
      </style>
    </head>
    <body>
      ${this.options.includeWatermark ? '<div class="watermark">PREVIEW</div>' : ""}
      
      <div class="header">
        <h1>PAYROLL STATEMENT</h1>
      </div>

      <div class="company-info">
        <h2>${data.employerInfo.companyName || "[Company Name]"}</h2>
        <div>${data.employerInfo.companyAddress || "[Company Address]"}</div>
        <div>${data.employerInfo.companyCity || "[City]"}, ${data.employerInfo.companyState || "[State]"} ${data.employerInfo.companyZipCode || "[ZIP]"}</div>
      </div>

      <div class="info-section">
        <div class="info-block">
          <h3>Employee Information</h3>
          <div class="info-row">
            <span class="label">Name:</span>
            ${data.personalInfo.firstName || "[First]"} ${data.personalInfo.lastName || "[Last]"}
          </div>
          <div class="info-row">
            <span class="label">Address:</span>
            ${data.personalInfo.address || "[Address]"}
          </div>
          <div class="info-row">
            <span class="label">City, State ZIP:</span>
            ${data.personalInfo.city || "[City]"}, ${data.personalInfo.state || "[State]"} ${data.personalInfo.zipCode || "[ZIP]"}
          </div>
          ${
            data.personalInfo.ssn
              ? `
          <div class="info-row">
            <span class="label">SSN:</span>
            ***-**-${data.personalInfo.ssn}
          </div>
          `
              : ""
          }
          ${
            data.employerInfo.employeeId
              ? `
          <div class="info-row">
            <span class="label">Employee ID:</span>
            ${data.employerInfo.employeeId}
          </div>
          `
              : ""
          }
        </div>
        <div class="info-block">
          <h3>Pay Period Information</h3>
          <div class="info-row">
            <span class="label">Pay Period:</span>
            ${this.formatDate(data.earningsInfo.payPeriodStart)} - ${this.formatDate(data.earningsInfo.payPeriodEnd)}
          </div>
          <div class="info-row">
            <span class="label">Pay Date:</span>
            ${this.formatDate(data.earningsInfo.payDate)}
          </div>
        </div>
      </div>

      <div class="earnings-section">
        <div class="section-header">EARNINGS</div>
        <table class="earnings-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="amount">Rate</th>
              <th class="amount">Hours</th>
              <th class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Regular Pay</td>
              <td class="amount">${this.formatCurrency(data.earningsInfo.hourlyRate)}</td>
              <td class="amount">${data.earningsInfo.hoursWorked}</td>
              <td class="amount">${this.formatCurrency(data.earningsInfo.hourlyRate * data.earningsInfo.hoursWorked)}</td>
            </tr>
            ${
              data.earningsInfo.overtimeHours > 0
                ? `
            <tr>
              <td>Overtime Pay</td>
              <td class="amount">${this.formatCurrency(data.earningsInfo.overtimeRate)}</td>
              <td class="amount">${data.earningsInfo.overtimeHours}</td>
              <td class="amount">${this.formatCurrency(data.earningsInfo.overtimeRate * data.earningsInfo.overtimeHours)}</td>
            </tr>
            `
                : ""
            }
            <tr style="border-top: 2px solid #333; font-weight: bold;">
              <td colspan="3">GROSS PAY:</td>
              <td class="amount">${this.formatCurrency(data.earningsInfo.grossPay)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="deductions-section">
        <div class="deductions-block">
          <div class="section-header">TAXES</div>
          ${
            data.taxInfo.federalTax > 0
              ? `
          <div class="deduction-row">
            <span>Federal Tax</span>
            <span>${this.formatCurrency(data.taxInfo.federalTax)}</span>
          </div>
          `
              : ""
          }
          ${
            data.taxInfo.stateTax > 0
              ? `
          <div class="deduction-row">
            <span>State Tax</span>
            <span>${this.formatCurrency(data.taxInfo.stateTax)}</span>
          </div>
          `
              : ""
          }
          ${
            data.taxInfo.socialSecurityTax > 0
              ? `
          <div class="deduction-row">
            <span>Social Security</span>
            <span>${this.formatCurrency(data.taxInfo.socialSecurityTax)}</span>
          </div>
          `
              : ""
          }
          ${
            data.taxInfo.medicareTax > 0
              ? `
          <div class="deduction-row">
            <span>Medicare</span>
            <span>${this.formatCurrency(data.taxInfo.medicareTax)}</span>
          </div>
          `
              : ""
          }
          ${
            data.taxInfo.stateDisabilityTax > 0
              ? `
          <div class="deduction-row">
            <span>State Disability</span>
            <span>${this.formatCurrency(data.taxInfo.stateDisabilityTax)}</span>
          </div>
          `
              : ""
          }
        </div>
        <div class="deductions-block">
          <div class="section-header">OTHER DEDUCTIONS</div>
          ${
            data.deductionsInfo.healthInsurance > 0
              ? `
          <div class="deduction-row">
            <span>Health Insurance</span>
            <span>${this.formatCurrency(data.deductionsInfo.healthInsurance)}</span>
          </div>
          `
              : ""
          }
          ${
            data.deductionsInfo.dentalInsurance > 0
              ? `
          <div class="deduction-row">
            <span>Dental Insurance</span>
            <span>${this.formatCurrency(data.deductionsInfo.dentalInsurance)}</span>
          </div>
          `
              : ""
          }
          ${
            data.deductionsInfo.retirement401k > 0
              ? `
          <div class="deduction-row">
            <span>401(k)</span>
            <span>${this.formatCurrency(data.deductionsInfo.retirement401k)}</span>
          </div>
          `
              : ""
          }
          ${
            data.deductionsInfo.otherDeductions > 0
              ? `
          <div class="deduction-row">
            <span>Other</span>
            <span>${this.formatCurrency(data.deductionsInfo.otherDeductions)}</span>
          </div>
          `
              : ""
          }
        </div>
      </div>

      <div class="net-pay">
        <div>NET PAY: <span class="amount">${this.formatCurrency(data.netPay)}</span></div>
      </div>

      ${
        data.yearToDateGross > 0 || data.yearToDateNet > 0
          ? `
      <div class="ytd-section">
        <div class="section-header">YEAR TO DATE</div>
        <div class="ytd-row">
          <span>YTD Gross:</span>
          <span>${this.formatCurrency((data.yearToDateGross || 0) + (data.earningsInfo.grossPay || 0))}</span>
        </div>
        <div class="ytd-row">
          <span>YTD Net:</span>
          <span>${this.formatCurrency((data.yearToDateNet || 0) + (data.netPay || 0))}</span>
        </div>
      </div>
      `
          : ""
      }
    </body>
    </html>
    `;
  }

  public async generatePDF(): Promise<Buffer> {
    try {
      // Enhanced Puppeteer configuration for container environments
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        timeout: 30000,
      });

      const page = await browser.newPage();
      const html = this.generateHTML();

      // Set a timeout for page loading
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      const pdfBuffer = await page.pdf({
        format: this.options.format === "A4" ? "A4" : "Letter",
        margin: {
          top: `${this.options.margin?.top || 50}px`,
          right: `${this.options.margin?.right || 50}px`,
          bottom: `${this.options.margin?.bottom || 50}px`,
          left: `${this.options.margin?.left || 50}px`,
        },
        printBackground: true,
        timeout: 30000,
      });

      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Enhanced fallback - return HTML as PDF-like content
      const html = this.generateHTML();
      return Buffer.from(html, "utf-8");
    }
  }
}

export async function generatePaystubPDF(
  data: PaystubData,
  options?: PDFGenerationOptions,
): Promise<Buffer> {
  const writer = new PaystubPDFWriter(data, options);
  return writer.generatePDF();
}
