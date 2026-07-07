import type { EmbedTodaysRateRow } from '@/lib/mortech/embedTodaysRates';
import { formatEmbedRate } from '@/lib/mortech/embedTodaysRates';

type EmbedTodaysRatesTableProps = {
  rates: EmbedTodaysRateRow[];
  updatedAt?: string | null;
};

export default function EmbedTodaysRatesTable({ rates, updatedAt }: EmbedTodaysRatesTableProps) {
  const formattedUpdatedAt = updatedAt
    ? new Date(updatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  if (rates.length === 0) {
    return (
      <div className="embed-rates-empty">
        <p>Rates are being updated. Please check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="embed-rates-root">
      <div className="embed-rates-header">
        <h1 className="embed-rates-title">Today&apos;s Mortgage Rates</h1>
        {formattedUpdatedAt && (
          <p className="embed-rates-updated">Last updated {formattedUpdatedAt}</p>
        )}
      </div>

      <div className="embed-rates-table-wrap">
        <table className="embed-rates-table">
          <thead>
            <tr>
              <th scope="col">Program</th>
              <th scope="col">Rate</th>
              <th scope="col">APR</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((row) => (
              <tr key={row.bucketId || row.loanProgram}>
                <td>{row.loanProgram}</td>
                <td className="embed-rates-rate">{formatEmbedRate(row.displayRate)}</td>
                <td>{formatEmbedRate(row.displayApr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="embed-rates-disclaimer">
        Rates shown are for illustrative purposes only and are subject to change without notice.
        Actual rates, fees, and terms may vary based on credit, loan amount, property type, and other
        factors. This is not a commitment to lend.
      </p>
    </div>
  );
}
