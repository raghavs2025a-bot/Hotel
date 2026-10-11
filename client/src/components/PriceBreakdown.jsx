import { formatINRPrecise } from '../utils/format.js';

export default function PriceBreakdown({ quote }) {
  if (!quote) return null;
  return (
    <dl className="price-breakdown">
      <div><dt>{formatINRPrecise(quote.pricePerNight)} x {quote.nights} {quote.nights === 1 ? 'night' : 'nights'}</dt><dd>{formatINRPrecise(quote.roomCharges)}</dd></div>
      <div><dt>Taxes ({quote.taxRate}%)</dt><dd>{formatINRPrecise(quote.taxAmount)}</dd></div>
      <div><dt>Service fee ({quote.serviceFeeRate}%)</dt><dd>{formatINRPrecise(quote.serviceFee)}</dd></div>
      <div className="price-total"><dt>Total</dt><dd>{formatINRPrecise(quote.totalAmount)}</dd></div>
    </dl>
  );
}
