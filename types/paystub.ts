export interface PersonalInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ssn: string;
}

export interface EmployerInfo {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZipCode: string;
  employeeId: string;
}

export interface EarningsInfo {
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  payFrequency: "weekly" | "biweekly" | "semimonthly" | "monthly" | "salary";
  hourlyRate: number;
  hoursWorked: number;
  overtimeHours: number;
  overtimeRate: number;
  grossPay: number;
  annualSalary?: number;
}

export interface TaxInfo {
  exemptions: number;
  filingStatus: "single" | "married";
  federalTax: number;
  stateTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  stateDisabilityTax: number;
  ytdFederalTax: number;
  ytdStateTax: number;
  ytdSocialSecurityTax: number;
  ytdMedicareTax: number;
  payPeriodsWorked: number;
}

export interface DeductionsInfo {
  healthInsurance: number;
  dentalInsurance: number;
  retirement401k: number;
  otherDeductions: number;
  ytdHealthInsurance: number;
  ytdDentalInsurance: number;
  ytdRetirement401k: number;
  ytdOtherDeductions: number;
}

export interface PaystubData {
  personalInfo: PersonalInfo;
  employerInfo: EmployerInfo;
  earningsInfo: EarningsInfo;
  taxInfo: TaxInfo;
  deductionsInfo: DeductionsInfo;
  netPay: number;
  yearToDateGross: number;
  yearToDateNet: number;
}

export interface FormStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: "Personal Information",
    description: "Enter your personal details",
    isCompleted: false,
  },
  {
    id: 2,
    title: "Employer Information",
    description: "Enter your employer details",
    isCompleted: false,
  },
  {
    id: 3,
    title: "Earnings Information",
    description: "Enter your earnings and pay period",
    isCompleted: false,
  },
  {
    id: 4,
    title: "Tax Information",
    description: "Enter your tax deductions",
    isCompleted: false,
  },
  {
    id: 5,
    title: "Other Deductions",
    description: "Enter additional deductions",
    isCompleted: false,
  },
];
