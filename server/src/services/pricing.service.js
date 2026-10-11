import { config } from '../config/env.js';
import { diffDays } from '../utils/dates.js';

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** All money maths happens here, on the server. Rates come from environment configuration. */
export function calculatePrice(pricePerNight, nights) {
  const roomCharges = round2(pricePerNight * nights);
  const taxAmount = round2((roomCharges * config.pricing.taxRate) / 100);
  const serviceFee = round2((roomCharges * config.pricing.serviceFeeRate) / 100);
  const totalAmount = round2(roomCharges + taxAmount + serviceFee);
  return {
    nights,
    pricePerNight,
    roomCharges,
    taxRate: config.pricing.taxRate,
    taxAmount,
    serviceFeeRate: config.pricing.serviceFeeRate,
    serviceFee,
    totalAmount,
  };
}

export const nightsBetween = diffDays;
