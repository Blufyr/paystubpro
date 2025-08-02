"use client";

import { PaystubData } from "@/types/paystub";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaystubPreviewProps {
  data: PaystubData;
  showWatermark?: boolean;
}

export default function PaystubPreview({
  data,
  showWatermark = true,
}: PaystubPreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="bg-white relative print:shadow-none">
      {showWatermark && (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-gray-200 text-6xl font-bold transform rotate-45 opacity-20">
              PREVIEW
            </div>
          </div>
          <div className="absolute top-1/4 left-1/4 pointer-events-none z-10">
            <div className="text-gray-100 text-4xl font-bold transform rotate-12 opacity-15">
              SAMPLE
            </div>
          </div>
          <div className="absolute bottom-1/4 right-1/4 pointer-events-none z-10">
            <div className="text-gray-100 text-4xl font-bold transform -rotate-12 opacity-15">
              DRAFT
            </div>
          </div>
        </>
      )}

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-center text-2xl">
            PAYROLL STATEMENT
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Company Information */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">
              {data.employerInfo.companyName || "[Company Name]"}
            </h3>
            <div className="text-sm text-gray-600">
              <div>
                {data.employerInfo.companyAddress || "[Company Address]"}
              </div>
              <div>
                {data.employerInfo.companyCity || "[City]"},{" "}
                {data.employerInfo.companyState || "[State]"}{" "}
                {data.employerInfo.companyZipCode || "[ZIP]"}
              </div>
            </div>
          </div>

          {/* Employee Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Employee Information</h4>
              <div className="text-sm space-y-1">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {data.personalInfo.firstName || "[First]"}{" "}
                  {data.personalInfo.lastName || "[Last]"}
                </div>
                <div>
                  <span className="font-medium">Address:</span>{" "}
                  {data.personalInfo.address || "[Address]"}
                </div>
                <div>
                  <span className="font-medium">City, State ZIP:</span>{" "}
                  {data.personalInfo.city || "[City]"},{" "}
                  {data.personalInfo.state || "[State]"}{" "}
                  {data.personalInfo.zipCode || "[ZIP]"}
                </div>
                {data.personalInfo.ssn && (
                  <div>
                    <span className="font-medium">SSN:</span> ***-**-
                    {data.personalInfo.ssn}
                  </div>
                )}
                {data.employerInfo.employeeId && (
                  <div>
                    <span className="font-medium">Employee ID:</span>{" "}
                    {data.employerInfo.employeeId}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Pay Period Information</h4>
              <div className="text-sm space-y-1">
                <div>
                  <span className="font-medium">Pay Period:</span>{" "}
                  {formatDate(data.earningsInfo.payPeriodStart)} -{" "}
                  {formatDate(data.earningsInfo.payPeriodEnd)}
                </div>
                <div>
                  <span className="font-medium">Pay Date:</span>{" "}
                  {formatDate(data.earningsInfo.payDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Section */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 bg-gray-100 p-2">EARNINGS</h4>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="font-medium">Description</div>
              <div className="font-medium text-right">Rate</div>
              <div className="font-medium text-right">Hours</div>
              <div className="font-medium text-right">Amount</div>

              <div>Regular Pay</div>
              <div className="text-right">
                {formatCurrency(data.earningsInfo.hourlyRate)}
              </div>
              <div className="text-right">{data.earningsInfo.hoursWorked}</div>
              <div className="text-right">
                {formatCurrency(
                  data.earningsInfo.hourlyRate * data.earningsInfo.hoursWorked,
                )}
              </div>

              {data.earningsInfo.overtimeHours > 0 && (
                <>
                  <div>Overtime Pay</div>
                  <div className="text-right">
                    {formatCurrency(data.earningsInfo.overtimeRate)}
                  </div>
                  <div className="text-right">
                    {data.earningsInfo.overtimeHours}
                  </div>
                  <div className="text-right">
                    {formatCurrency(
                      data.earningsInfo.overtimeRate *
                        data.earningsInfo.overtimeHours,
                    )}
                  </div>
                </>
              )}

              <div className="col-span-4 border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>GROSS PAY:</span>
                  <span>{formatCurrency(data.earningsInfo.grossPay)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 bg-gray-100 p-2">DEDUCTIONS</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h5 className="font-medium">Taxes</h5>
                {data.taxInfo.federalTax > 0 && (
                  <div className="flex justify-between">
                    <span>Federal Tax</span>
                    <span>{formatCurrency(data.taxInfo.federalTax)}</span>
                  </div>
                )}
                {data.taxInfo.stateTax > 0 && (
                  <div className="flex justify-between">
                    <span>State Tax</span>
                    <span>{formatCurrency(data.taxInfo.stateTax)}</span>
                  </div>
                )}
                {data.taxInfo.socialSecurityTax > 0 && (
                  <div className="flex justify-between">
                    <span>Social Security</span>
                    <span>
                      {formatCurrency(data.taxInfo.socialSecurityTax)}
                    </span>
                  </div>
                )}
                {data.taxInfo.medicareTax > 0 && (
                  <div className="flex justify-between">
                    <span>Medicare</span>
                    <span>{formatCurrency(data.taxInfo.medicareTax)}</span>
                  </div>
                )}
                {data.taxInfo.stateDisabilityTax > 0 && (
                  <div className="flex justify-between">
                    <span>State Disability</span>
                    <span>
                      {formatCurrency(data.taxInfo.stateDisabilityTax)}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">Other Deductions</h5>
                {data.deductionsInfo.healthInsurance > 0 && (
                  <div className="flex justify-between">
                    <span>Health Insurance</span>
                    <span>
                      {formatCurrency(data.deductionsInfo.healthInsurance)}
                    </span>
                  </div>
                )}
                {data.deductionsInfo.dentalInsurance > 0 && (
                  <div className="flex justify-between">
                    <span>Dental Insurance</span>
                    <span>
                      {formatCurrency(data.deductionsInfo.dentalInsurance)}
                    </span>
                  </div>
                )}
                {data.deductionsInfo.retirement401k > 0 && (
                  <div className="flex justify-between">
                    <span>401(k)</span>
                    <span>
                      {formatCurrency(data.deductionsInfo.retirement401k)}
                    </span>
                  </div>
                )}
                {data.deductionsInfo.otherDeductions > 0 && (
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span>
                      {formatCurrency(data.deductionsInfo.otherDeductions)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Net Pay Section */}
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>NET PAY:</span>
              <span className="text-green-600">
                {formatCurrency(data.netPay)}
              </span>
            </div>
          </div>

          {/* Year to Date Section */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-semibold mb-3 bg-gray-100 p-2">YEAR TO DATE</h4>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <h5 className="font-medium">Earnings</h5>
                <div className="flex justify-between">
                  <span>YTD Gross:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      (data.yearToDateGross || 0) +
                        (data.earningsInfo.grossPay || 0),
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>YTD Net:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      (data.yearToDateNet || 0) + (data.netPay || 0),
                    )}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">Tax Withholdings</h5>
                {(data.taxInfo.ytdFederalTax > 0 ||
                  data.taxInfo.federalTax > 0) && (
                  <div className="flex justify-between">
                    <span>YTD Federal:</span>
                    <span>
                      {formatCurrency(
                        (data.taxInfo.ytdFederalTax || 0) +
                          (data.taxInfo.federalTax || 0),
                      )}
                    </span>
                  </div>
                )}
                {(data.taxInfo.ytdStateTax > 0 ||
                  data.taxInfo.stateTax > 0) && (
                  <div className="flex justify-between">
                    <span>YTD State:</span>
                    <span>
                      {formatCurrency(
                        (data.taxInfo.ytdStateTax || 0) +
                          (data.taxInfo.stateTax || 0),
                      )}
                    </span>
                  </div>
                )}
                {(data.taxInfo.ytdSocialSecurityTax > 0 ||
                  data.taxInfo.socialSecurityTax > 0) && (
                  <div className="flex justify-between">
                    <span>YTD Social Security:</span>
                    <span>
                      {formatCurrency(
                        (data.taxInfo.ytdSocialSecurityTax || 0) +
                          (data.taxInfo.socialSecurityTax || 0),
                      )}
                    </span>
                  </div>
                )}
                {(data.taxInfo.ytdMedicareTax > 0 ||
                  data.taxInfo.medicareTax > 0) && (
                  <div className="flex justify-between">
                    <span>YTD Medicare:</span>
                    <span>
                      {formatCurrency(
                        (data.taxInfo.ytdMedicareTax || 0) +
                          (data.taxInfo.medicareTax || 0),
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* YTD Deductions Section */}
            <div className="mt-4 pt-4 border-t">
              <h5 className="font-medium mb-3">YTD Deductions</h5>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <h6 className="font-medium text-gray-700">Benefits</h6>
                  {(data.deductionsInfo.ytdHealthInsurance > 0 ||
                    data.deductionsInfo.healthInsurance > 0) && (
                    <div className="flex justify-between">
                      <span>YTD Health Insurance:</span>
                      <span>
                        {formatCurrency(
                          (data.deductionsInfo.ytdHealthInsurance || 0) +
                            (data.deductionsInfo.healthInsurance || 0),
                        )}
                      </span>
                    </div>
                  )}
                  {(data.deductionsInfo.ytdDentalInsurance > 0 ||
                    data.deductionsInfo.dentalInsurance > 0) && (
                    <div className="flex justify-between">
                      <span>YTD Dental Insurance:</span>
                      <span>
                        {formatCurrency(
                          (data.deductionsInfo.ytdDentalInsurance || 0) +
                            (data.deductionsInfo.dentalInsurance || 0),
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h6 className="font-medium text-gray-700">
                    Retirement & Other
                  </h6>
                  {(data.deductionsInfo.ytdRetirement401k > 0 ||
                    data.deductionsInfo.retirement401k > 0) && (
                    <div className="flex justify-between">
                      <span>YTD 401(k):</span>
                      <span>
                        {formatCurrency(
                          (data.deductionsInfo.ytdRetirement401k || 0) +
                            (data.deductionsInfo.retirement401k || 0),
                        )}
                      </span>
                    </div>
                  )}
                  {(data.deductionsInfo.ytdOtherDeductions > 0 ||
                    data.deductionsInfo.otherDeductions > 0) && (
                    <div className="flex justify-between">
                      <span>YTD Other:</span>
                      <span>
                        {formatCurrency(
                          (data.deductionsInfo.ytdOtherDeductions || 0) +
                            (data.deductionsInfo.otherDeductions || 0),
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
