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
  // 30yr Conventional - Conf 30 Yr Fixed family (fixed + ARM variants)
  conv_30yr: [
    2799, 32657, 22656, 2783, 2653, 32658, 82657, 4, 2662, 2788, 42656, 90015, 2798, 10394, 2658,
    12656, 92658, 10004, 2657, 30015, 32656, 15, 2493, 80015, 42657,
  ],

  // 15yr Conforming - Conf 15 Yr Fixed family
  conf_15yr: [2, 2790, 13, 20002, 50013, 2785, 40013, 60013, 80013, 10013, 10002, 2780, 30013, 20013],

  // VA - Govt VA 30 Yr Fixed family
  va_30yr: [26, 10026, 11338, 2538, 2607, 1338],

  // FHA - Govt FHA 30 Yr Fixed / related FHA 30yr programs
  fha_30yr: [
    12486, 12481, 40038, 38, 10023, 10038, 22481, 20023, 2006, 22486, 2486, 50023, 40023, 2481, 934,
    20038, 30023, 23, 2005, 37,
  ],

  // Jumbo - Agency Jumbo 30 Yr Fixed and related jumbo 30yr products
  jumbo_30yr: [
    2678, 12486, 2673, 1307, 2703, 2708, 40038, 38, 11338, 10038, 2676, 2006, 1338, 2403, 2704, 2674,
    22486, 2705, 1311, 2486, 2677, 2675, 2709, 11307, 2607,
  ],

  // Second Home - Second Home Equity 30 Yr Fixed
  second_home_30yr: [2869],

  // Home Ready Program - Conf Home Ready 30 Yr Fixed/ARM family
  home_ready_30yr: [2420, 2696, 12420, 2698, 2697],

  // Home Possible Program - Conf Home Poss 97% 30 Yr Fixed/ARM family
  home_possible_30yr: [971, 2701, 2702, 2700],
};

