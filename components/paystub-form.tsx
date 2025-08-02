"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  PaystubData,
  PersonalInfo,
  EmployerInfo,
  EarningsInfo,
  TaxInfo,
  DeductionsInfo,
  FORM_STEPS,
} from "@/types/paystub";
import { cn } from "@/lib/utils";
import {
  sanitizeString,
  validateSSN,
  validateZipCode,
  validateState,
  validateCurrency,
  validateHours,
  validateDate,
  validatePayPeriod,
} from "@/lib/validation";

// —— US STATES AND TERRITORIES ——
const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// —— PAYROLL TAX CONSTANTS ——
// These are simplified withholding rates for payroll purposes
// Real payroll systems use complex withholding tables from IRS Publication 15

// Federal withholding rates by filing status and pay frequency
const FEDERAL_WITHHOLDING_RATES: Record<string, number> = {
  single_weekly: 0.12,
  single_biweekly: 0.12,
  single_semimonthly: 0.12,
  single_monthly: 0.12,
  married_weekly: 0.1,
  married_biweekly: 0.1,
  married_semimonthly: 0.1,
  married_monthly: 0.1,
};

// State withholding rates (simplified)
const STATE_WITHHOLDING_RATES: Record<string, number> = {
  AL: 0.04, // Alabama
  AK: 0, // Alaska (no income tax)
  AZ: 0.025, // Arizona
  AR: 0.035, // Arkansas
  CA: 0.06, // California (varies widely)
  CO: 0.044, // Colorado
  CT: 0.05, // Connecticut
  DE: 0.04, // Delaware
  DC: 0.06, // District of Columbia
  FL: 0, // Florida (no income tax)
  GA: 0.04, // Georgia
  HI: 0.05, // Hawaii
  ID: 0.058, // Idaho
  IL: 0.0495, // Illinois
  IN: 0.0315, // Indiana
  IA: 0.045, // Iowa
  KS: 0.04, // Kansas
  KY: 0.045, // Kentucky
  LA: 0.03, // Louisiana
  ME: 0.055, // Maine
  MD: 0.045, // Maryland
  MA: 0.05, // Massachusetts
  MI: 0.0425, // Michigan
  MN: 0.06, // Minnesota
  MS: 0.05, // Mississippi
  MO: 0.04, // Missouri
  MT: 0.05, // Montana
  NE: 0.045, // Nebraska
  NV: 0, // Nevada (no income tax)
  NH: 0, // New Hampshire (no wage tax)
  NJ: 0.05, // New Jersey
  NM: 0.04, // New Mexico
  NY: 0.06, // New York
  NC: 0.0475, // North Carolina
  ND: 0.02, // North Dakota
  OH: 0.035, // Ohio
  OK: 0.035, // Oklahoma
  OR: 0.07, // Oregon
  PA: 0.0307, // Pennsylvania
  RI: 0.045, // Rhode Island
  SC: 0.04, // South Carolina
  SD: 0, // South Dakota (no income tax)
  TN: 0, // Tennessee (no wage tax)
  TX: 0, // Texas (no income tax)
  UT: 0.0485, // Utah
  VT: 0.06, // Vermont
  VA: 0.045, // Virginia
  WA: 0, // Washington (no income tax)
  WV: 0.05, // West Virginia
  WI: 0.055, // Wisconsin
  WY: 0, // Wyoming (no income tax)
};

// FICA rates (fixed by law)
const SOCIAL_SECURITY_RATE = 0.062; // 6.2%
const MEDICARE_RATE = 0.0145; // 1.45%
const SOCIAL_SECURITY_WAGE_BASE = 160_200; // 2023 limit

// Standard allowances for federal withholding
const FEDERAL_ALLOWANCE_WEEKLY = 91.35;
const FEDERAL_ALLOWANCE_BIWEEKLY = 182.69;
const FEDERAL_ALLOWANCE_SEMIMONTHLY = 197.92;
const FEDERAL_ALLOWANCE_MONTHLY = 395.83;

// Calculate federal withholding using simplified method
function calculateFederalWithholding(
  grossPay: number,
  allowances: number,
  payFrequency:
    | "weekly"
    | "biweekly"
    | "semimonthly"
    | "monthly"
    | "salary" = "biweekly",
  filingStatus: "single" | "married" = "single",
): number {
  // Get allowance amount based on pay frequency
  const allowanceAmounts = {
    weekly: FEDERAL_ALLOWANCE_WEEKLY,
    biweekly: FEDERAL_ALLOWANCE_BIWEEKLY,
    semimonthly: FEDERAL_ALLOWANCE_SEMIMONTHLY,
    monthly: FEDERAL_ALLOWANCE_MONTHLY,
    salary: FEDERAL_ALLOWANCE_MONTHLY, // Use monthly for salary
  };

  const allowanceAmount = allowanceAmounts[payFrequency];
  const taxableWages = Math.max(0, grossPay - allowances * allowanceAmount);

  // Use simplified withholding rate
  const frequency = payFrequency === "salary" ? "monthly" : payFrequency;
  const rateKey = `${filingStatus}_${frequency}`;
  const rate = FEDERAL_WITHHOLDING_RATES[rateKey] || 0.12;

  return taxableWages * rate;
}

// Calculate state withholding
function calculateStateWithholding(
  grossPay: number,
  state: string,
  allowances: number = 0,
): number {
  const stateCode = state.toUpperCase();
  const rate = STATE_WITHHOLDING_RATES[stateCode] || 0;

  if (rate === 0) return 0;

  // Simple calculation - most states use a percentage of gross
  // Some states have allowances, but we'll keep it simple
  const allowanceReduction = allowances * 50; // Rough estimate
  const taxableWages = Math.max(0, grossPay - allowanceReduction);

  return taxableWages * rate;
}

interface PaystubFormProps {
  onDataChange?: (data: PaystubData) => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
}

export default function PaystubForm({
  onDataChange = () => {},
  onStepChange = () => {},
  currentStep = 1,
}: PaystubFormProps) {
  const [formData, setFormData] = useState<PaystubData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      ssn: "",
    },
    employerInfo: {
      companyName: "",
      companyAddress: "",
      companyCity: "",
      companyState: "",
      companyZipCode: "",
      employeeId: "",
    },
    earningsInfo: {
      payPeriodStart: "",
      payPeriodEnd: "",
      payDate: "",
      payFrequency: "biweekly",
      hourlyRate: 0,
      hoursWorked: 0,
      overtimeRate: 0,
      overtimeHours: 0,
      grossPay: 0,
      annualSalary: 0,
    },
    taxInfo: {
      exemptions: 0,
      filingStatus: "single",
      federalTax: 0,
      stateTax: 0,
      socialSecurityTax: 0,
      medicareTax: 0,
      stateDisabilityTax: 0,
      ytdFederalTax: 0,
      ytdStateTax: 0,
      ytdSocialSecurityTax: 0,
      ytdMedicareTax: 0,
      payPeriodsWorked: 0,
    },
    deductionsInfo: {
      healthInsurance: 0,
      dentalInsurance: 0,
      retirement401k: 0,
      otherDeductions: 0,
      ytdHealthInsurance: 0,
      ytdDentalInsurance: 0,
      ytdRetirement401k: 0,
      ytdOtherDeductions: 0,
    },
    netPay: 0,
    yearToDateGross: 0,
    yearToDateNet: 0,
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculate YTD taxes based on pay periods worked
  const calculateYTDTaxes = (currentTax: number, payPeriodsWorked: number) => {
    return currentTax * payPeriodsWorked;
  };

  // Get pay periods per year based on frequency
  const getPayPeriodsPerYear = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return 52;
      case "biweekly":
        return 26;
      case "semimonthly":
        return 24;
      case "monthly":
        return 12;
      case "salary":
        return 12; // Assume monthly for salary
      default:
        return 26;
    }
  };

  // Recalculate gross, taxes, net pay when relevant fields change
  useEffect(() => {
    const {
      hourlyRate,
      hoursWorked,
      overtimeRate,
      overtimeHours,
      payFrequency,
      annualSalary,
    } = formData.earningsInfo;

    // Calculate gross pay based on pay frequency
    let grossPay = 0;
    if (payFrequency === "salary" && annualSalary > 0) {
      const payPeriodsPerYear = getPayPeriodsPerYear(payFrequency);
      grossPay = annualSalary / payPeriodsPerYear;
    } else {
      const regularPay = hourlyRate * hoursWorked;
      const overtimePay = overtimeRate * overtimeHours;
      grossPay = regularPay + overtimePay;
    }

    // Skip calculations if no gross pay
    if (grossPay <= 0) {
      const updated: PaystubData = {
        ...formData,
        earningsInfo: { ...formData.earningsInfo, grossPay: 0 },
        taxInfo: {
          ...formData.taxInfo,
          federalTax: 0,
          stateTax: 0,
          socialSecurityTax: 0,
          medicareTax: 0,
        },
        netPay: 0,
      };
      setFormData(updated);
      onDataChange(updated);
      return;
    }

    // Calculate federal withholding
    const allowances = formData.taxInfo.exemptions || 0;
    const filingStatus = formData.taxInfo.filingStatus || "single";
    const federalTax = calculateFederalWithholding(
      grossPay,
      allowances,
      payFrequency,
      filingStatus,
    );

    // Calculate state withholding
    const state = formData.personalInfo.state;
    const stateTax = calculateStateWithholding(grossPay, state, allowances);

    // Calculate FICA taxes
    const socialSecurityTax =
      Math.min(grossPay, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE;
    const medicareTax = grossPay * MEDICARE_RATE;

    // Calculate total taxes
    const totalTaxes =
      federalTax +
      socialSecurityTax +
      medicareTax +
      stateTax +
      formData.taxInfo.stateDisabilityTax;

    // Calculate total pre-tax deductions (current period only)
    const totalDeductions =
      formData.deductionsInfo.healthInsurance +
      formData.deductionsInfo.dentalInsurance +
      formData.deductionsInfo.retirement401k +
      formData.deductionsInfo.otherDeductions;

    // Calculate net pay
    const netPay = grossPay - totalTaxes - totalDeductions;

    // Calculate YTD taxes based on pay periods worked (if specified)
    const payPeriodsWorked = formData.taxInfo.payPeriodsWorked || 0;
    let ytdFederalTax = formData.taxInfo.ytdFederalTax || 0;
    let ytdStateTax = formData.taxInfo.ytdStateTax || 0;
    let ytdSocialSecurityTax = formData.taxInfo.ytdSocialSecurityTax || 0;
    let ytdMedicareTax = formData.taxInfo.ytdMedicareTax || 0;

    // If pay periods worked is specified, calculate YTD based on current taxes
    if (payPeriodsWorked > 0) {
      ytdFederalTax = calculateYTDTaxes(federalTax, payPeriodsWorked);
      ytdStateTax = calculateYTDTaxes(stateTax, payPeriodsWorked);
      ytdSocialSecurityTax = calculateYTDTaxes(
        socialSecurityTax,
        payPeriodsWorked,
      );
      ytdMedicareTax = calculateYTDTaxes(medicareTax, payPeriodsWorked);
    }

    const ytdHealthInsurance = formData.deductionsInfo.ytdHealthInsurance || 0;
    const ytdDentalInsurance = formData.deductionsInfo.ytdDentalInsurance || 0;
    const ytdRetirement401k = formData.deductionsInfo.ytdRetirement401k || 0;
    const ytdOtherDeductions = formData.deductionsInfo.ytdOtherDeductions || 0;

    // YTD totals are also managed separately
    const yearToDateGross = formData.yearToDateGross || 0;
    const yearToDateNet = formData.yearToDateNet || 0;

    // Update form data with calculated values
    const updated: PaystubData = {
      ...formData,
      earningsInfo: { ...formData.earningsInfo, grossPay },
      taxInfo: {
        ...formData.taxInfo,
        federalTax,
        stateTax,
        socialSecurityTax,
        medicareTax,
        ytdFederalTax,
        ytdStateTax,
        ytdSocialSecurityTax,
        ytdMedicareTax,
        payPeriodsWorked: formData.taxInfo.payPeriodsWorked,
      },
      deductionsInfo: {
        ...formData.deductionsInfo,
        ytdHealthInsurance,
        ytdDentalInsurance,
        ytdRetirement401k,
        ytdOtherDeductions,
      },
      netPay,
      yearToDateGross,
      yearToDateNet,
    };

    setFormData(updated);
    onDataChange(updated);
  }, [
    formData.earningsInfo.hourlyRate,
    formData.earningsInfo.hoursWorked,
    formData.earningsInfo.overtimeRate,
    formData.earningsInfo.overtimeHours,
    formData.earningsInfo.payFrequency,
    formData.earningsInfo.annualSalary,
    formData.personalInfo.state,
    formData.taxInfo.exemptions,
    formData.taxInfo.filingStatus,
    formData.taxInfo.payPeriodsWorked,
    formData.taxInfo.stateDisabilityTax,
    formData.deductionsInfo.healthInsurance,
    formData.deductionsInfo.dentalInsurance,
    formData.deductionsInfo.retirement401k,
    formData.deductionsInfo.otherDeductions,
  ]);

  const updateFormData = <K extends keyof PaystubData>(
    section: K,
    patch: Partial<PaystubData[K]>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...patch },
    }));
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];

    switch (step) {
      case 1: {
        const { firstName, lastName, address, city, state, zipCode, ssn } =
          formData.personalInfo;

        if (!firstName.trim()) errors.push("First name is required");
        if (!lastName.trim()) errors.push("Last name is required");
        if (!address.trim()) errors.push("Address is required");
        if (!city.trim()) errors.push("City is required");
        if (!state.trim()) errors.push("State is required");
        else if (!validateState(state)) errors.push("Invalid state code");
        if (!zipCode.trim()) errors.push("ZIP code is required");
        else if (!validateZipCode(zipCode))
          errors.push("Invalid ZIP code format");
        if (ssn && !validateSSN(ssn)) errors.push("SSN must be 4 digits");

        break;
      }
      case 2: {
        const {
          companyName,
          companyAddress,
          companyCity,
          companyState,
          companyZipCode,
        } = formData.employerInfo;

        if (!companyName.trim()) errors.push("Company name is required");
        if (!companyAddress.trim()) errors.push("Company address is required");
        if (!companyCity.trim()) errors.push("Company city is required");
        if (!companyState.trim()) errors.push("Company state is required");
        else if (!validateState(companyState))
          errors.push("Invalid company state code");
        if (!companyZipCode.trim()) errors.push("Company ZIP code is required");
        else if (!validateZipCode(companyZipCode))
          errors.push("Invalid company ZIP code format");

        break;
      }
      case 3: {
        const {
          payPeriodStart,
          payPeriodEnd,
          payDate,
          payFrequency,
          hourlyRate,
          hoursWorked,
          overtimeRate,
          overtimeHours,
          annualSalary,
        } = formData.earningsInfo;

        if (!payPeriodStart) errors.push("Pay period start date is required");
        if (!payPeriodEnd) errors.push("Pay period end date is required");
        if (!payDate) errors.push("Pay date is required");

        if (
          payPeriodStart &&
          payPeriodEnd &&
          !validatePayPeriod(payPeriodStart, payPeriodEnd)
        ) {
          errors.push("Pay period end date must be after start date");
        }

        if (payFrequency === "salary") {
          if (!validateCurrency(annualSalary) || annualSalary <= 0) {
            errors.push(
              "Valid annual salary is required for salary pay frequency",
            );
          }
        } else {
          if (!validateCurrency(hourlyRate) || hourlyRate <= 0) {
            errors.push("Valid hourly rate is required");
          }
          if (!validateHours(hoursWorked) || hoursWorked <= 0) {
            errors.push("Valid hours worked is required");
          }
        }
        if (
          overtimeHours > 0 &&
          (!validateCurrency(overtimeRate) || overtimeRate <= 0)
        ) {
          errors.push(
            "Overtime rate is required when overtime hours are specified",
          );
        }

        break;
      }
      case 4:
      case 5:
        // Tax and deductions steps are optional
        break;
      default:
        return false;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      setValidationErrors([]);
      onStepChange(currentStep + 1);
    }
    // Validation errors are now displayed in the UI
  };

  const handlePrevious = () => {
    onStepChange(currentStep - 1);
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <Input
            value={formData.personalInfo.firstName}
            onChange={(e) =>
              updateFormData("personalInfo", {
                firstName: sanitizeString(e.target.value),
              })
            }
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <Input
            value={formData.personalInfo.lastName}
            onChange={(e) =>
              updateFormData("personalInfo", {
                lastName: sanitizeString(e.target.value),
              })
            }
            placeholder="Doe"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Address *</label>
        <Input
          value={formData.personalInfo.address}
          onChange={(e) =>
            updateFormData("personalInfo", {
              address: sanitizeString(e.target.value),
            })
          }
          placeholder="123 Main St"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City *</label>
          <Input
            value={formData.personalInfo.city}
            onChange={(e) =>
              updateFormData("personalInfo", {
                city: sanitizeString(e.target.value),
              })
            }
            placeholder="Anytown"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State *</label>
          <Select
            value={formData.personalInfo.state}
            onValueChange={(value: string) =>
              updateFormData("personalInfo", { state: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.code} - {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ZIP Code *</label>
          <Input
            value={formData.personalInfo.zipCode}
            onChange={(e) =>
              updateFormData("personalInfo", {
                zipCode: sanitizeString(e.target.value),
              })
            }
            placeholder="30073"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          SSN (Last 4 digits)
        </label>
        <Input
          value={formData.personalInfo.ssn}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 4);
            updateFormData("personalInfo", { ssn: value });
          }}
          placeholder="1234"
          maxLength={4}
          pattern="[0-9]{4}"
        />
      </div>
    </div>
  );

  const renderEmployerInfoStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Company Name *</label>
        <Input
          value={formData.employerInfo.companyName}
          onChange={(e) =>
            updateFormData("employerInfo", {
              companyName: e.target.value,
            })
          }
          placeholder="Acme Corp"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Company Address *
        </label>
        <Input
          value={formData.employerInfo.companyAddress}
          onChange={(e) =>
            updateFormData("employerInfo", {
              companyAddress: e.target.value,
            })
          }
          placeholder="456 Corporate Blvd"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City *</label>
          <Input
            value={formData.employerInfo.companyCity}
            onChange={(e) =>
              updateFormData("employerInfo", {
                companyCity: e.target.value,
              })
            }
            placeholder="Bigcity"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State *</label>
          <Select
            value={formData.employerInfo.companyState}
            onValueChange={(value: string) =>
              updateFormData("employerInfo", { companyState: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.code} - {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ZIP Code *</label>
          <Input
            value={formData.employerInfo.companyZipCode}
            onChange={(e) =>
              updateFormData("employerInfo", {
                companyZipCode: e.target.value,
              })
            }
            placeholder="30073"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Employee ID</label>
        <Input
          value={formData.employerInfo.employeeId}
          onChange={(e) =>
            updateFormData("employerInfo", {
              employeeId: e.target.value,
            })
          }
          placeholder="E12345"
        />
      </div>
    </div>
  );

  const renderEarningsInfoStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Pay Period Start *
          </label>
          <Input
            type="date"
            value={formData.earningsInfo.payPeriodStart}
            onChange={(e) =>
              updateFormData("earningsInfo", {
                payPeriodStart: e.target.value,
              })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Pay Period End *
          </label>
          <Input
            type="date"
            value={formData.earningsInfo.payPeriodEnd}
            onChange={(e) =>
              updateFormData("earningsInfo", {
                payPeriodEnd: e.target.value,
              })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pay Date *</label>
          <Input
            type="date"
            value={formData.earningsInfo.payDate}
            onChange={(e) =>
              updateFormData("earningsInfo", { payDate: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Pay Frequency *
          </label>
          <Select
            value={formData.earningsInfo.payFrequency}
            onValueChange={(
              value:
                | "weekly"
                | "biweekly"
                | "semimonthly"
                | "monthly"
                | "salary",
            ) => updateFormData("earningsInfo", { payFrequency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly (52/year)</SelectItem>
              <SelectItem value="biweekly">Bi-weekly (26/year)</SelectItem>
              <SelectItem value="semimonthly">
                Semi-monthly (24/year)
              </SelectItem>
              <SelectItem value="monthly">Monthly (12/year)</SelectItem>
              <SelectItem value="salary">Salary (Annual)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {formData.earningsInfo.payFrequency === "salary" ? (
        <div>
          <label className="block text-sm font-medium mb-1">
            Annual Salary *
          </label>
          <Input
            type="text"
            value={
              formData.earningsInfo.annualSalary
                ? `${formData.earningsInfo.annualSalary.toFixed(2)}`
                : ""
            }
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d.]/g, "");
              updateFormData("earningsInfo", {
                annualSalary: Math.max(0, parseFloat(value) || 0),
              });
            }}
            placeholder="$65,000.00"
          />
          <div className="text-xs text-gray-500 mt-1">
            Gross pay will be calculated based on pay frequency
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Hourly Rate *
            </label>
            <Input
              type="text"
              value={
                formData.earningsInfo.hourlyRate
                  ? `${formData.earningsInfo.hourlyRate.toFixed(2)}`
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("earningsInfo", {
                  hourlyRate: Math.max(0, parseFloat(value) || 0),
                });
              }}
              placeholder="$25.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Hours Worked *
            </label>
            <Input
              type="text"
              value={formData.earningsInfo.hoursWorked || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("earningsInfo", {
                  hoursWorked: Math.max(0, parseFloat(value) || 0),
                });
              }}
              placeholder="40"
            />
          </div>
        </div>
      )}
      {formData.earningsInfo.payFrequency !== "salary" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Overtime Hours
            </label>
            <Input
              type="text"
              value={formData.earningsInfo.overtimeHours || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("earningsInfo", {
                  overtimeHours: parseFloat(value) || 0,
                });
              }}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Overtime Rate
            </label>
            <Input
              type="text"
              value={
                formData.earningsInfo.overtimeRate
                  ? `${formData.earningsInfo.overtimeRate.toFixed(2)}`
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("earningsInfo", {
                  overtimeRate: parseFloat(value) || 0,
                });
              }}
              placeholder="$37.50"
            />
          </div>
        </div>
      )}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm font-medium text-gray-700">
          Calculated Gross Pay
        </div>
        <div className="text-2xl font-bold text-green-600">
          ${formData.earningsInfo.grossPay.toFixed(2)}
        </div>
      </div>
    </div>
  );

  const renderTaxInfoStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Federal Allowances/Exemptions
          </label>
          <Input
            type="number"
            min="0"
            max="10"
            value={formData.taxInfo.exemptions}
            onChange={(e) =>
              updateFormData("taxInfo", {
                exemptions: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            placeholder="0"
          />
          <div className="text-xs text-gray-500 mt-1">
            Number of allowances claimed on W-4 form
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Filing Status
          </label>
          <Select
            value={formData.taxInfo.filingStatus}
            onValueChange={(value: "single" | "married") =>
              updateFormData("taxInfo", { filingStatus: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Pay Periods Worked This Year
          </label>
          <Input
            type="number"
            min="0"
            max="52"
            value={formData.taxInfo.payPeriodsWorked}
            onChange={(e) =>
              updateFormData("taxInfo", {
                payPeriodsWorked: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            placeholder="0"
          />
          <div className="text-xs text-gray-500 mt-1">
            Auto-calculate YTD taxes based on current period
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-medium mb-3">
          Current Pay Period Tax Withholdings
        </h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Federal Withholding
            </label>
            <Input
              readOnly
              value={`${formData.taxInfo.federalTax.toFixed(2)}`}
              className="bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              State Withholding
            </label>
            <Input
              readOnly
              value={`${formData.taxInfo.stateTax.toFixed(2)}`}
              className="bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Social Security (6.2%)
            </label>
            <Input
              readOnly
              value={`${formData.taxInfo.socialSecurityTax.toFixed(2)}`}
              className="bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Medicare (1.45%)
            </label>
            <Input
              readOnly
              value={`${formData.taxInfo.medicareTax.toFixed(2)}`}
              className="bg-white"
            />
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          * Tax withholdings are calculated using simplified payroll formulas
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h5 className="font-medium mb-3">Year-to-Date Tax Totals</h5>
        <div className="text-sm text-gray-600 mb-3">
          {formData.taxInfo.payPeriodsWorked > 0
            ? `YTD taxes calculated automatically based on ${formData.taxInfo.payPeriodsWorked} pay periods worked.`
            : "Enter your previous YTD tax withholdings (before this pay period). Current period taxes will be automatically added."}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              YTD Federal Withholding
            </label>
            <Input
              type="text"
              value={
                formData.taxInfo.ytdFederalTax > 0
                  ? formData.taxInfo.ytdFederalTax.toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("taxInfo", {
                  ytdFederalTax: parseFloat(value) || 0,
                });
              }}
              placeholder="0.00"
              readOnly={formData.taxInfo.payPeriodsWorked > 0}
              className={
                formData.taxInfo.payPeriodsWorked > 0 ? "bg-gray-100" : ""
              }
            />
            <div className="text-xs text-gray-500 mt-1">
              Previous YTD total (before this pay period)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              YTD State Withholding
            </label>
            <Input
              type="text"
              value={
                formData.taxInfo.ytdStateTax > 0
                  ? formData.taxInfo.ytdStateTax.toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("taxInfo", {
                  ytdStateTax: parseFloat(value) || 0,
                });
              }}
              placeholder="0.00"
              readOnly={formData.taxInfo.payPeriodsWorked > 0}
              className={
                formData.taxInfo.payPeriodsWorked > 0 ? "bg-gray-100" : ""
              }
            />
            <div className="text-xs text-gray-500 mt-1">
              Previous YTD total (before this pay period)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              YTD Social Security
            </label>
            <Input
              type="text"
              value={
                formData.taxInfo.ytdSocialSecurityTax > 0
                  ? formData.taxInfo.ytdSocialSecurityTax.toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("taxInfo", {
                  ytdSocialSecurityTax: parseFloat(value) || 0,
                });
              }}
              placeholder="0.00"
              readOnly={formData.taxInfo.payPeriodsWorked > 0}
              className={
                formData.taxInfo.payPeriodsWorked > 0 ? "bg-gray-100" : ""
              }
            />
            <div className="text-xs text-gray-500 mt-1">
              Previous YTD total (before this pay period)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              YTD Medicare
            </label>
            <Input
              type="text"
              value={
                formData.taxInfo.ytdMedicareTax > 0
                  ? formData.taxInfo.ytdMedicareTax.toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("taxInfo", {
                  ytdMedicareTax: parseFloat(value) || 0,
                });
              }}
              placeholder="0.00"
              readOnly={formData.taxInfo.payPeriodsWorked > 0}
              className={
                formData.taxInfo.payPeriodsWorked > 0 ? "bg-gray-100" : ""
              }
            />
            <div className="text-xs text-gray-500 mt-1">
              Previous YTD total (before this pay period)
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          State Disability Tax (SDI)
        </label>
        <Input
          type="text"
          value={
            formData.taxInfo.stateDisabilityTax > 0
              ? formData.taxInfo.stateDisabilityTax.toFixed(2)
              : ""
          }
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d.]/g, "");
            updateFormData("taxInfo", {
              stateDisabilityTax: parseFloat(value) || 0,
            });
          }}
          placeholder="0.00"
        />
        <div className="text-xs text-gray-500 mt-1">
          Only applicable in certain states (CA, NJ, NY, RI, HI)
        </div>
      </div>
    </div>
  );

  const renderDeductionsInfoStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Health Insurance
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.deductionsInfo.healthInsurance}
            onChange={(e) =>
              updateFormData("deductionsInfo", {
                healthInsurance: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Dental Insurance
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.deductionsInfo.dentalInsurance}
            onChange={(e) =>
              updateFormData("deductionsInfo", {
                dentalInsurance: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            401(k) Retirement
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.deductionsInfo.retirement401k}
            onChange={(e) =>
              updateFormData("deductionsInfo", {
                retirement401k: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Other Deductions
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.deductionsInfo.otherDeductions}
            onChange={(e) =>
              updateFormData("deductionsInfo", {
                otherDeductions: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <h5 className="font-medium mb-3">Year-to-Date Deduction Totals</h5>
        <div className="text-sm text-gray-600 mb-3">
          Enter your previous YTD deductions (before this pay period).
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              YTD Health Insurance
            </label>
            <Input
              type="text"
              value={
                formData.deductionsInfo.ytdHealthInsurance > 0
                  ? formData.deductionsInfo.ytdHealthInsurance.toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("deductionsInfo", {
                  ytdHealthInsurance: parseFloat(value) || 0,
                });
              }}
              placeholder="0.00"
            />
            <div className="text-xs text-gray-500 mt-1">
              Previous YTD total (before this pay period)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              YTD Dental Insurance
            </label>
            <Input
              type="text"
              value={
                formData.deductionsInfo.ytdDentalInsurance > 0
                  ? formData.deductionsInfo.ytdDentalInsurance.toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("deductionsInfo", {
                  ytdDentalInsurance: parseFloat(value) || 0,
                });
              }}
              placeholder="0.00"
            />
            <div className="text-xs text-gray-500 mt-1">
              Previous YTD total (before this pay period)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              YTD 401(k) Retirement
            </label>
            <Input
              type="text"
              value={
                formData.deductionsInfo.ytdRetirement401k > 0
                  ? formData.deductionsInfo.ytdRetirement401k.toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("deductionsInfo", {
                  ytdRetirement401k: parseFloat(value) || 0,
                });
              }}
              placeholder="0.00"
            />
            <div className="text-xs text-gray-500 mt-1">
              Previous YTD total (before this pay period)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              YTD Other Deductions
            </label>
            <Input
              type="text"
              value={
                formData.deductionsInfo.ytdOtherDeductions > 0
                  ? formData.deductionsInfo.ytdOtherDeductions.toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                updateFormData("deductionsInfo", {
                  ytdOtherDeductions: parseFloat(value) || 0,
                });
              }}
              placeholder="0.00"
            />
            <div className="text-xs text-gray-500 mt-1">
              Previous YTD total (before this pay period)
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-700">
              Current Period Net Pay
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${formData.netPay.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">
              Calculated YTD Net Pay
            </div>
            <div className="text-xl font-bold text-blue-600">
              ${((formData.yearToDateNet || 0) + formData.netPay).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              Previous YTD + Current Period
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h5 className="font-medium mb-3">Year-to-Date Gross Totals</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Previous YTD Gross Pay
            </label>
            <Input
              type="text"
              value={
                formData.yearToDateGross > 0
                  ? formData.yearToDateGross.toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                setFormData((prev) => ({
                  ...prev,
                  yearToDateGross: parseFloat(value) || 0,
                }));
              }}
              placeholder="0.00"
            />
            <div className="text-xs text-gray-500 mt-1">
              Previous YTD gross (before this pay period)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Previous YTD Net Pay
            </label>
            <Input
              type="text"
              value={
                formData.yearToDateNet > 0
                  ? formData.yearToDateNet.toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                setFormData((prev) => ({
                  ...prev,
                  yearToDateNet: parseFloat(value) || 0,
                }));
              }}
              placeholder="0.00"
            />
            <div className="text-xs text-gray-500 mt-1">
              Previous YTD net (before this pay period)
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Calculated YTD Gross:</span>
              <span className="float-right font-bold text-blue-700">
                $
                {(
                  (formData.yearToDateGross || 0) +
                  formData.earningsInfo.grossPay
                ).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="font-medium">Calculated YTD Net:</span>
              <span className="float-right font-bold text-blue-700">
                ${((formData.yearToDateNet || 0) + formData.netPay).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderEmployerInfoStep();
      case 3:
        return renderEarningsInfoStep();
      case 4:
        return renderTaxInfoStep();
      case 5:
        return renderDeductionsInfoStep();
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{FORM_STEPS[currentStep - 1].title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderStepContent()}

        {validationErrors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-red-800 font-medium mb-2">
              Please fix the following errors:
            </h4>
            <ul className="text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <Button onClick={handleNext}>
            {currentStep === FORM_STEPS.length ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Finish
              </>
            ) : (
              <>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
