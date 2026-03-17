import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { parseString } from 'xml2js';

/** Path to private.pem in project root (loan-officer-platform) */
const PRIVATE_PEM_PATH = path.join(process.cwd(), 'private.pem');

const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 55 * 60;
let cachedAccessToken: string | null = null;
let cachedAccessTokenExpiresAt = 0;

export interface MortechRequest {
  request_id: number;
  customerId: string;
  thirdPartyName: string;
  licenseKey: string;
  emailAddress: string;
  propertyState?: string; // Two-letter state code (e.g. CA, TX)
  propertyZip: string;
  appraisedvalue: number;
  loan_amount: number;
  fico: number;
  loanpurpose: 'Purchase' | 'Refinance';
  /**
   * Property type: numeric code per Marksman 3rd Party guide,
   * but we still accept legacy string values for backward compatibility.
   */
  proptype: number | 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family';
  /**
   * Occupancy: numeric code per Marksman 3rd Party guide,
   * but we still accept legacy string values for backward compatibility.
   */
  occupancy: number | 'Primary' | 'Secondary' | 'Investment';
  /**
   * Loan product description (e.g. "30 year fixed", "15 year fixed", "5 year ARM/30 yrs").
   * Optional when using productList (explicit product IDs); in that case Mortech
   * determines the term from the product itself and loanProduct1 should be omitted.
   */
  loanProduct1?: string;
  productList?: string; // Optional: comma-separated product IDs
  filterId?: string; // Optional filter for Best Offer Strategy
  pmiCompany?: number; // -999 for best MI company
  noMI?: number; // 0 for borrower paid MI
  financeMI?: number; // 1 to finance MI in loan amount
  vaType?: string; // VA loan type
  subsequentUse?: number; // VA subsequent use flag
  // Additional custom rate parameters
  waiveEscrow?: boolean; // Waive escrow option
  militaryVeteran?: boolean; // Military/Veteran status
  lockDays?: string; // Lock period in days (30, 45, 60)
  secondMortgageAmount?: number; // Second mortgage amount
  targetPrice?: number; // -999 for full rate range
}

export interface MortechResponse {
  success: boolean;
  error?: string;
  quotes?: MortechQuote[];
  rawXml?: string; // Optional raw XML for testing/debugging
}

export interface MortechQuote {
  productId: string;
  vendorName: string;
  vendorProductName: string;
  vendorProductCode: string;
  productDesc: string;
  productTerm: string;
  rate: number;
  apr: number;
  monthlyPayment: number;
  /**
   * Execution price on a 0–100 scale (e.g. 98.75, 100.00, 101.25).
   * Parsed from <ratesheet_price> in the Mortech XML.
   * Used for Lowest / PAR / Higher selection (closest to 99 / 100).
   */
  executionPrice?: number;
  /**
   * Discount points charged/credited to the borrower (e.g. 0.000, 1.000, 2.250).
   * Parsed from quote_detail.$.price in the Mortech XML.
   */
  points: number;
  originationFee: number;
  upfrontFee: number;
  monthlyPremium: number;
  downPayment: number;
  loanAmount: number;
  lockTerm: number;
  termType: string;
  pricingStatus: string;
  lastUpdate: string;
  fees: MortechFee[];
  eligibility: {
    eligibilityCheck: string;
    comments: string;
  };
}

export interface MortechFee {
  hudline: string;
  description: string;
  feeamount: number;
  section: string;
  paymenttype: string;
  prepaid: boolean;
}

export class MortechAPI {
  private baseUrl: string;
  private customerId: string;
  private thirdPartyName: string;
  private licenseKey: string;
  private emailAddress: string;
  private partnerId: string | undefined;
  private privateKey: string | undefined;
  private xApiKey: string | undefined;
  private authUrl: string;
  private accessTokenTtlSeconds: number;

  constructor(config: {
    customerId: string;
    thirdPartyName: string;
    licenseKey: string;
    emailAddress: string;
    baseUrl?: string;
    partnerId?: string;
    privateKey?: string;
    xApiKey?: string;
    authUrl?: string;
    accessTokenTtlSeconds?: number;
  }) {
    this.baseUrl = config.baseUrl || 'https://thirdparty.mortech-inc.com/mpg/servlet/mpgThirdPartyServlet';
    this.customerId = config.customerId;
    this.thirdPartyName = config.thirdPartyName;
    this.licenseKey = config.licenseKey;
    this.emailAddress = config.emailAddress;
    this.partnerId = config.partnerId;
    this.privateKey = config.privateKey;
    this.xApiKey = config.xApiKey;
    this.authUrl = config.authUrl || 'https://api.mortech-inc.com/auth';
    this.accessTokenTtlSeconds =
      typeof config.accessTokenTtlSeconds === 'number' && config.accessTokenTtlSeconds > 0
        ? config.accessTokenTtlSeconds
        : DEFAULT_ACCESS_TOKEN_TTL_SECONDS;
  }

  private isJwtAuthConfigured(): boolean {
    return Boolean(this.partnerId && this.privateKey && this.xApiKey);
  }

  private async getAccessToken(): Promise<string | null> {
    const now = Math.floor(Date.now() / 1000);
    if (cachedAccessToken && cachedAccessTokenExpiresAt > now + 30) {
      return cachedAccessToken;
    }
    if (!this.isJwtAuthConfigured()) {
      return null;
    }
    const jwtPayload = {
      partnerId: this.partnerId,
      customerId: this.customerId,
      iat: now,
    };
    const signedJwt = jwt.sign(jwtPayload, this.privateKey!, { algorithm: 'RS256' });
    const authResponse = await fetch(this.authUrl, {
      method: 'GET',
      headers: {
        authorizationtoken: `Bearer ${signedJwt}`,
        'x-api-key': this.xApiKey!,
        Accept: 'application/json',
      },
    });
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Mortech Auth API error: ${authResponse.status} ${authResponse.statusText} - ${errorText}`);
    }
    const authData = (await authResponse.json()) as { accesstoken?: string };
    if (!authData?.accesstoken) {
      throw new Error('Mortech Auth API error: missing accesstoken in response');
    }
    cachedAccessToken = authData.accesstoken;
    cachedAccessTokenExpiresAt = now + this.accessTokenTtlSeconds;
    return cachedAccessToken;
  }

  async getRates(request: Omit<MortechRequest, 'request_id' | 'customerId' | 'thirdPartyName' | 'licenseKey' | 'emailAddress'>, options?: { includeRawXml?: boolean }): Promise<MortechResponse> {
    try {
      const targetPrice = request.targetPrice !== undefined && request.targetPrice !== null ? request.targetPrice : -999;
      const params = new URLSearchParams({
        request_id: '1',
        customerId: this.customerId,
        thirdPartyName: this.thirdPartyName,
        licenseKey: this.licenseKey,
        emailAddress: this.emailAddress,
        targetPrice: String(targetPrice),
        ...(request.propertyState && { propertyState: request.propertyState }),
        propertyZip: request.propertyZip,
        appraisedvalue: request.appraisedvalue.toString(),
        loan_amount: request.loan_amount.toString(),
        fico: request.fico.toString(),
        loanpurpose: request.loanpurpose,
        // proptype / occupancy may be numeric codes or legacy strings; stringify either way.
        proptype: String(request.proptype),
        occupancy: String(request.occupancy),
        // Only send loanProduct1 when provided; when using productList,
        // Mortech expects productList instead of loanProduct1.
        ...(request.loanProduct1 && { loanProduct1: request.loanProduct1 }),
        ...(request.productList && { productList: request.productList }),
        ...(request.filterId && { filterId: request.filterId }),
        ...(request.pmiCompany && { pmiCompany: request.pmiCompany.toString() }),
        ...(request.noMI !== undefined && { noMI: request.noMI.toString() }),
        ...(request.financeMI !== undefined && { financeMI: request.financeMI.toString() }),
        ...(request.vaType && { vaType: request.vaType }),
        ...(request.subsequentUse !== undefined && { subsequentUse: request.subsequentUse.toString() }),
        // Additional custom rate parameters - only include if they have meaningful values
        // Numeric-style controls per guide; keep booleans only as selectors here.
        ...(request.waiveEscrow === true && { waiveescrow: '1' }),
        ...(request.militaryVeteran === true && { militaryVeteran: 'true' }),
        ...(request.lockDays && { lockindays: request.lockDays }),
        // Only include secondMortgageAmount if it's a valid positive number
        ...(request.secondMortgageAmount !== undefined && 
            request.secondMortgageAmount !== null &&
            typeof request.secondMortgageAmount === 'number' &&
            request.secondMortgageAmount > 0 && 
            { secondMortgageAmount: request.secondMortgageAmount.toString() }),
      });

      console.log('🔍 Mortech API Request:', this.baseUrl + '?' + params.toString());
      console.log('📋 Request Parameters Debug:');
      console.log('- loanAmount:', request.loan_amount);
      console.log('- propertyValue:', request.appraisedvalue);
      console.log('- creditScore:', request.fico);
      console.log('- propertyZip:', request.propertyZip);
      console.log('- loanPurpose:', request.loanpurpose);
      console.log('- propertyType:', request.proptype);
      console.log('- occupancy:', request.occupancy);
      console.log('- loanProduct1:', request.loanProduct1);
      console.log('- productList:', request.productList);
      console.log('- filterId:', request.filterId);
      console.log('- waiveEscrow:', request.waiveEscrow);
      console.log('- militaryVeteran:', request.militaryVeteran);
      console.log('- lockDays:', request.lockDays);
      console.log('- secondMortgageAmount:', request.secondMortgageAmount);

      const accessToken = await this.getAccessToken();
      const headers: Record<string, string> = {
        Accept: 'application/xml, text/xml',
        'User-Agent': 'LoanOfficerPlatform/1.0',
      };
      if (accessToken) {
        headers['authorizationtoken'] = accessToken;
      }
      if (this.xApiKey) {
        headers['x-api-key'] = this.xApiKey;
      }

      let response = await fetch(this.baseUrl + '?' + params.toString(), { method: 'GET', headers });

      if ((response.status === 401 || response.status === 403) && this.isJwtAuthConfigured()) {
        cachedAccessToken = null;
        cachedAccessTokenExpiresAt = 0;
        const newToken = await this.getAccessToken();
        if (newToken) {
          headers['authorizationtoken'] = newToken;
          response = await fetch(this.baseUrl + '?' + params.toString(), { method: 'GET', headers });
        }
      }

      if (!response.ok) {
        throw new Error(`Mortech API error: ${response.status} ${response.statusText}`);
      }

      const xmlData = await response.text();
      console.log('📄 Mortech XML Response:', xmlData.substring(0, 500) + '...');

      const parsedResponse = await this.parseXMLResponse(xmlData);
      
      // Include raw XML if requested (useful for testing/debugging)
      if (options?.includeRawXml) {
        parsedResponse.rawXml = xmlData;
      }
      
      return parsedResponse;

    } catch (error) {
      console.error('❌ Mortech API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async parseXMLResponse(xmlData: string): Promise<MortechResponse> {
    return new Promise((resolve) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          console.error('❌ XML Parse Error:', err);
          resolve({
            success: false,
            error: 'Failed to parse XML response',
          });
          return;
        }

        try {
          const mortech = result.mortech;
          
          // Debug: Log the structure for troubleshooting (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Parsed XML structure:', JSON.stringify(mortech, null, 2).substring(0, 1000) + '...');
          }
          
          // Check for errors in header
          const errorNum = parseInt(mortech.header[0].errorNum[0]);
          const errorDesc = mortech.header[0].errorDesc[0];

          if (errorNum !== 0) {
            resolve({
              success: false,
              error: errorDesc,
            });
            return;
          }

          // Parse quotes (full rate range: iterate all quote elements in each results block)
          const quotes: MortechQuote[] = [];

          if (mortech.results) {
            for (const resultItem of mortech.results) {
              const quoteList = Array.isArray(resultItem.quote) ? resultItem.quote : [resultItem.quote];
              const eligibilityList = resultItem.eligibility
                ? (Array.isArray(resultItem.eligibility) ? resultItem.eligibility : [resultItem.eligibility])
                : [];
              const fallbackEligibility = {
                eligibilityCheck: [''],
                comments: [''],
              };

              for (let qIdx = 0; qIdx < quoteList.length; qIdx++) {
                const quote = quoteList[qIdx];
                const quoteDetail = quote.quote_detail[0];
                const eligibility = eligibilityList[qIdx] ?? eligibilityList[0] ?? fallbackEligibility;

                // Execution price (0–100 scale) used by Marksman "Price" column.
                // This is distinct from borrower points (quote_detail.$.price).
                const ratesheetPriceRaw =
                  Array.isArray(quoteDetail.ratesheet_price) && quoteDetail.ratesheet_price.length > 0
                    ? quoteDetail.ratesheet_price[0]
                    : quoteDetail.ratesheet_price;
                const executionPrice =
                  typeof ratesheetPriceRaw === 'string' && ratesheetPriceRaw.trim() !== ''
                    ? parseFloat(ratesheetPriceRaw)
                    : undefined;

                // Parse fees
                const fees: MortechFee[] = [];
                if (quoteDetail.fees && quoteDetail.fees[0].fee_list) {
                  const feeListContainer = quoteDetail.fees[0].fee_list;

                  /**
                   * xml2js typically produces:
                   * fees: [
                   *   {
                   *     fee_list: [
                   *       {
                   *         fee: [
                   *           { $: { description: 'Origination Fee', feeamount: '5000.00', ... } },
                   *           ...
                   *         ]
                   *       }
                   *     ]
                   *   }
                   * ]
                   *
                   * However, we keep the parsing defensive in case of slight structural differences.
                   */

                  const feeNodes: any[] = [];

                  if (Array.isArray(feeListContainer)) {
                    for (const node of feeListContainer) {
                      if (node && Array.isArray(node.fee)) {
                        feeNodes.push(...node.fee);
                      } else if (node && node.fee) {
                        feeNodes.push(node.fee);
                      } else {
                        // Fallback for legacy shapes where fee_list itself is the fee node
                        feeNodes.push(node);
                      }
                    }
                  } else if (feeListContainer && Array.isArray(feeListContainer.fee)) {
                    feeNodes.push(...feeListContainer.fee);
                  } else if (feeListContainer && feeListContainer.fee) {
                    feeNodes.push(feeListContainer.fee);
                  } else {
                    // Final fallback: treat fee_list as a single fee node with attributes
                    feeNodes.push(feeListContainer);
                  }

                  for (const node of feeNodes) {
                    const feeData = node.$ || node;
                    if (!feeData) continue;
                    fees.push({
                      hudline: feeData.hudline || '',
                      description: feeData.description || '',
                      feeamount: parseFloat(feeData.feeamount || '0'),
                      section: feeData.section || '',
                      paymenttype: feeData.paymenttype || '',
                      prepaid: feeData.prepaid === 'true',
                    });
                  }
                }

                quotes.push({
                  productId: quote.$.product_id,
                  vendorName: quote.$.vendor_name,
                  vendorProductName: quote.$.vendor_product_name,
                  vendorProductCode: quote.$.vendor_product_code,
                  productDesc: quote.$.productDesc,
                  productTerm: quote.$.productTerm,
                  rate: parseFloat(quoteDetail.$.rate),
                  apr: parseFloat(quoteDetail.$.apr),
                  monthlyPayment: parseFloat(quoteDetail.$.piti),
                  executionPrice,
                  points: parseFloat(quoteDetail.$.price),
                  originationFee: parseFloat(quoteDetail.$.originationFee),
                  upfrontFee: parseFloat(quoteDetail.$.upfrontFee),
                  monthlyPremium: parseFloat(quoteDetail.$.monthlyPremium),
                  downPayment: parseFloat(quoteDetail.$.downPayment),
                  loanAmount: parseFloat(quoteDetail.$.loanAmount),
                  lockTerm: parseInt(resultItem.$.lockTerm),
                  termType: resultItem.$.termType,
                  pricingStatus: quote.$.pricingStatus ?? '',
                  lastUpdate: quote.$.lastUpdate ?? '',
                  fees,
                  eligibility: {
                    eligibilityCheck: eligibility.eligibilityCheck?.[0] ?? '',
                    comments: eligibility.comments?.[0] ?? '',
                  },
                });
              }
            }
          }

          resolve({
            success: true,
            quotes,
          });

        } catch (parseError) {
          console.error('❌ Response Parse Error:', parseError);
          resolve({
            success: false,
            error: 'Failed to parse response data',
          });
        }
      });
    });
  }
}

function loadPrivateKey(): string | undefined {
  try {
    if (fs.existsSync(PRIVATE_PEM_PATH)) {
      return fs.readFileSync(PRIVATE_PEM_PATH, 'utf8');
    }
  } catch {
    // fall through to env
  }
  const base64 = process.env.MORTECH_PRIVATE_KEY_BASE64;
  if (base64) {
    try {
      return Buffer.from(base64, 'base64').toString('utf8');
    } catch {
      throw new Error('Failed to decode MORTECH_PRIVATE_KEY_BASE64');
    }
  }
  const raw = process.env.MORTECH_PRIVATE_KEY;
  if (raw) {
    return raw.replace(/\\n/g, '\n');
  }
  return undefined;
}

// Helper function to create Mortech API instance
export function createMortechAPI(): MortechAPI {
  const customerId = process.env.MORTECH_CUSTOMER_ID;
  const thirdPartyName = process.env.MORTECH_THIRD_PARTY_NAME;
  const licenseKey = process.env.MORTECH_LICENSE_KEY;
  const emailAddress = process.env.MORTECH_EMAIL_ADDRESS;
  const partnerId = process.env.MORTECH_PARTNER_ID;
  const xApiKey = process.env.MORTECH_X_API_KEY;
  const privateKey = loadPrivateKey();
  const authUrl = process.env.MORTECH_AUTH_URL;
  const accessTokenTtlSeconds = process.env.MORTECH_ACCESS_TOKEN_TTL_SECONDS
    ? parseInt(process.env.MORTECH_ACCESS_TOKEN_TTL_SECONDS, 10)
    : undefined;

  if (!customerId || !thirdPartyName || !licenseKey || !emailAddress) {
    throw new Error('Missing required Mortech configuration. Please set MORTECH_CUSTOMER_ID, MORTECH_THIRD_PARTY_NAME, MORTECH_LICENSE_KEY, and MORTECH_EMAIL_ADDRESS environment variables.');
  }

  return new MortechAPI({
    customerId,
    thirdPartyName,
    licenseKey,
    emailAddress,
    baseUrl: process.env.MORTECH_BASE_URL,
    partnerId: partnerId || undefined,
    xApiKey: xApiKey || undefined,
    privateKey,
    authUrl: authUrl || undefined,
    accessTokenTtlSeconds,
  });
}
