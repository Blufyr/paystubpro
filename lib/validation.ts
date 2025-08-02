// Input validation and sanitization utilities

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>"'&]/g, (match) => {
    const entities: { [key: string]: string } = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "&": "&amp;",
    };
    return entities[match] || match;
  });
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateSSN = (ssn: string): boolean => {
  const ssnRegex = /^\d{4}$/;
  return ssnRegex.test(ssn);
};

export const validateZipCode = (zipCode: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

export const validateState = (state: string): boolean => {
  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "DC",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];
  return states.includes(state.toUpperCase());
};

export const validateCurrency = (amount: number): boolean => {
  return !isNaN(amount) && amount >= 0 && amount <= 999999.99;
};

export const validateHours = (hours: number): boolean => {
  return !isNaN(hours) && hours >= 0 && hours <= 200;
};

export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

export const validatePayPeriod = (
  startDate: string,
  endDate: string,
): boolean => {
  if (!validateDate(startDate) || !validateDate(endDate)) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return start < end;
};
