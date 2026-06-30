export interface PForm {
  providerUuid: string;
  serviceUuid: string;
  amount: string;
  currency: string;
  paymentDate: string;
  description: string;
}

export const toIso = (d: string) => (d ? new Date(`${d}T00:00:00Z`).toISOString() : undefined);
