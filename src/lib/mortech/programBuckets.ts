export type ProgramBucketId =
  | 'conv_30yr'
  | 'conf_15yr'
  | 'va_30yr'
  | 'fha_30yr'
  | 'jumbo_30yr'
  | 'second_home_30yr'
  | 'home_ready_30yr'
  | 'home_possible_30yr';

export type ProgramBucket = {
  id: ProgramBucketId;
  label: string;
  /**
   * Human-readable match string that corresponds to the client's
   * requested Mortech program name. Used for fuzzy matching in
   * seed defaults and Today’s Rates tab.
   */
  match: string;
};

/**
 * Single source of truth for the 8 Today’s Rates buckets.
 *
 * These labels and match strings are taken directly from the
 * client requirement:
 *
 * a. 30yr Conventional (Mortech: Conf 30 Yr Fixed)
 * b. 15Yr Conforming (Mortech: Conf 15 Yr Fixed)
 * c. VA (Mortech: Govt VA 30 Yr Fixed)
 * d. FHA (Mortech: Govt FHA 30 Yr Fixed)
 * e. Jumbo (Mortech: Agency Jumbo 30 Yr Fixed)
 * f. Second Home (Mortech: Second 30 Yr Fixed)
 * g. Home Ready Program (Mortech: Conf Home Ready 30 Yr Fixed)
 * h. Home Possible Program (Mortech: Conf Home Poss 97% 30 Yr Fixed)
 */
export const PROGRAM_BUCKETS: ProgramBucket[] = [
  { id: 'conv_30yr', label: '30yr Conventional', match: 'Conf 30 Yr Fixed' },
  { id: 'conf_15yr', label: '15yr Conforming', match: 'Conf 15 Yr Fixed' },
  { id: 'va_30yr', label: 'VA', match: 'Govt VA 30 Yr Fixed' },
  { id: 'fha_30yr', label: 'FHA', match: 'Govt FHA 30 Yr Fixed' },
  // Match on label so seeded rows (loanProgram = "Jumbo") are recognized; avoids re-calling Mortech every time
  { id: 'jumbo_30yr', label: 'Jumbo', match: 'Jumbo' },
  // Mortech returns "Second Home Equity 30 Yr Fixed"; match label so seeded row is found
  { id: 'second_home_30yr', label: 'Second Home', match: 'Second Home' },
  { id: 'home_ready_30yr', label: 'Home Ready Program', match: 'Home Ready' },
  { id: 'home_possible_30yr', label: 'Home Possible Program', match: 'Home Possible' },
] as const;

/**
 * Candidate Mortech product IDs for each bucket, discovered by the
 * `test-mortech-ratecaddy-buckets` script using the current catalog.
 *
 * These IDs are used to build productList per bucket when calling
 * Mortech so that we can reliably pick the lowest rate for each
 * of the 8 program types.
 */
export const BUCKET_PRODUCT_IDS: Record<ProgramBucketId, number[]> = {
  // Fixed single-product Today's Rates mapping requested by client.
  conv_30yr: [4],
  conf_15yr: [2],
  va_30yr: [26],
  fha_30yr: [23],
  jumbo_30yr: [2678],
  second_home_30yr: [2869],
  home_ready_30yr: [2420],
  home_possible_30yr: [971],
};

