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

  if (officer) {
    return (
      <div className="embed-rates-root embed-rates-root--officer">
        <div
          className="embed-dark-card"
          style={{ '--embed-accent': officer.accentColor } as React.CSSProperties}
        >
          <div className="embed-dark-card-inner">
            <aside className="embed-dark-profile">
              <div className="embed-dark-avatar-ring">
                <div className="embed-dark-avatar-inner">
                  {officer.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={officer.avatarUrl}
                      alt={officer.displayName}
                      className="embed-dark-avatar"
                    />
                  ) : (
                    <div className="embed-dark-avatar embed-dark-avatar-fallback">
                      {officer.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="embed-dark-name-row">
                <h2 className="embed-dark-name">{officer.displayName}</h2>
                <span className="embed-dark-badge" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
                    <path
                      d="M6.2 10.6 3.8 8.2l.9-.9 1.5 1.5 4.1-4.1.9.9-5 5Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </div>

              {officer.nmlsNumber ? (
                <p className="embed-dark-nmls">NMLS# {officer.nmlsNumber}</p>
              ) : (
                <p className="embed-dark-nmls">Loan Officer</p>
              )}
            </aside>

            <section className="embed-dark-rates">
              <div className="embed-dark-rates-head">
                <div>
                  <h3 className="embed-dark-rates-title">Today&apos;s Mortgage Rates</h3>
                  {formattedUpdatedAt && (
                    <p className="embed-dark-updated">Updated {formattedUpdatedAt}</p>
                  )}
                </div>
              </div>

              <div className="embed-dark-table-wrap">
                <table className="embed-dark-table">
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
                        <td className="embed-dark-rate">{formatEmbedRate(row.displayRate)}</td>
                        <td className="embed-dark-apr">{formatEmbedRate(row.displayApr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <p className="embed-dark-disclaimer">
            Rates shown are for illustrative purposes only and are subject to change without notice.
            Actual rates, fees, and terms may vary. This is not a commitment to lend.
          </p>
        </div>
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
