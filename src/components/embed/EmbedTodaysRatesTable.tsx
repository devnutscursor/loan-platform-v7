import type { OfficerEmbedPublicProfile } from '@/lib/embed/officerEmbedWidget';
import type { EmbedTodaysRateRow } from '@/lib/mortech/embedTodaysRates';
import { formatEmbedRate } from '@/lib/mortech/embedTodaysRates';

type EmbedTodaysRatesTableProps = {
  rates: EmbedTodaysRateRow[];
  updatedAt?: string | null;
  officer?: OfficerEmbedPublicProfile | null;
};

export default function EmbedTodaysRatesTable({
  rates,
  updatedAt,
  officer,
}: EmbedTodaysRatesTableProps) {
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
      {officer && (
        <div className="embed-officer-card">
          {officer.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={officer.avatarUrl}
              alt={officer.displayName}
              className="embed-officer-avatar"
            />
          ) : (
            <div className="embed-officer-avatar embed-officer-avatar-fallback">
              {officer.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="embed-officer-info">
            <h2 className="embed-officer-name">{officer.displayName}</h2>
            {officer.nmlsNumber && (
              <p className="embed-officer-nmls">NMLS# {officer.nmlsNumber}</p>
            )}
          </div>
        </div>
      )}

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
