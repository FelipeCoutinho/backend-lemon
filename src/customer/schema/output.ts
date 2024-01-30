export type EligibleOutputSchema = {
  eligible: boolean;
  economyAnnualCO2: number;
  message?: string;
};

export type IneligibleOutputSchema = {
  eligible: false;
  reasonsofineligibility: [string];
};

export type tResponse = {
  eligible: boolean;
  message?: string;
};

// npx prisma generate
// npx prisma migrate dev
