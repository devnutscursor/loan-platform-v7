import { db } from '@/lib/db';
import { 
  officerContentFaqs, 
  officerContentGuides, 
  officerContentVideos 
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { cloudinary } from '@/lib/cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

// Default FAQs
const defaultFaqs = [
  {
    question: "What does \"closing\" on a home mean in the mortgage process?",
    answer: "Closing is the final step where you sign all loan and title documents, pay any remaining funds, and the lender authorizes disbursement so ownership and the mortgage become official.",
    category: "process"
  },
  {
    question: "How long after final loan approval does closing usually take place?",
    answer: "Once you are clear-to-close, many loans close within a few days to a week, depending on scheduling with the title or escrow company and all parties involved.",
    category: "process"
  },
  {
    question: "What are the main steps between receiving \"clear-to-close\" and getting the keys to my home?",
    answer: "After clear-to-close, your lender sends final documents to the closing agent, you review your Closing Disclosure, sign at closing, the loan funds, and once the deed records, you receive the keys.",
    category: "process"
  },
  {
    question: "What is the difference between closing and funding of my mortgage?",
    answer: "Closing is when you sign the documents, while funding is when the lender actually releases the loan money; in many purchases, funding and recording follow shortly after signing.",
    category: "process"
  },
  {
    question: "What is a Closing Disclosure, and why must I receive it a few days before closing?",
    answer: "The Closing Disclosure summarizes your final loan terms and costs and must be provided in advance so you have time to review and compare it with your earlier Loan Estimate before signing.",
    category: "process"
  },
  {
    question: "What should I review carefully on my Closing Disclosure before I sign my mortgage documents?",
    answer: "Check your interest rate, monthly payment, cash to close, closing costs, prepaids, and whether any credits or seller contributions match your purchase agreement and expectations.",
    category: "process"
  },
  {
    question: "How much money do I need to bring to closing, and when will I know the final amount?",
    answer: "Your Closing Disclosure and settlement statement show the exact cash to close, including down payment and costs; your closing agent or lender will confirm the final figure before signing day.",
    category: "process"
  },
  {
    question: "Can I use a personal check, or do I need a wire or cashier's check for my closing funds?",
    answer: "Most closings require certified funds, such as a wire transfer or cashier's check, because personal checks can delay funding or be subject to holds by the bank.",
    category: "process"
  },
  {
    question: "What documents will I sign at closing for my mortgage and the property transfer?",
    answer: "Typical documents include the promissory note, mortgage or deed of trust, Closing Disclosure, affidavits, and title or deed paperwork that transfers ownership into your name.",
    category: "process"
  },
  {
    question: "Who typically attends the closing—lender, escrow officer, real estate agents, buyers, and sellers?",
    answer: "Depending on your state and closing type, you may meet with an escrow or title officer, notary, possibly your agent, and sometimes the seller; lenders often prepare documents but do not always attend in person.",
    category: "process"
  },
  {
    question: "What happens if my income, credit, or debt changes right before closing day?",
    answer: "Significant changes can trigger a new review and, in some cases, alter or delay your approval, so you should notify your lender immediately if anything major changes before closing.",
    category: "process"
  },
  {
    question: "Can the lender re-verify my employment or recheck my credit again just before closing?",
    answer: "Yes, many lenders perform a final employment verification and may check for new credit or debts shortly before funding to confirm nothing has changed that would affect your qualification.",
    category: "process"
  },
  {
    question: "What could cause my closing to be delayed or rescheduled at the last minute?",
    answer: "Common causes include missing documents, unresolved conditions, wire or banking issues, title or insurance problems, appraisal questions, or last-minute changes to terms that require updated disclosures or approvals.",
    category: "process"
  },
  {
    question: "How can title issues or last-minute appraisal questions impact my closing timeline?",
    answer: "Unresolved liens, ownership disputes, or value concerns may require additional documentation, corrections, or reconsideration, and closing cannot occur until the title and value meet the lender's requirements.",
    category: "process"
  },
  {
    question: "When do property taxes, homeowner's insurance, and mortgage insurance start being collected with my payment?",
    answer: "Initial amounts are often collected at closing to fund your escrow account, and ongoing escrows are then included in your monthly mortgage payment beginning with your first scheduled payment.",
    category: "process"
  },
  {
    question: "What is the role of the escrow or settlement agent in the closing process for my mortgage?",
    answer: "The escrow or settlement agent coordinates documents, collects and disburses funds, ensures all conditions are met, and handles recording of the deed and mortgage with the appropriate authorities.",
    category: "process"
  },
  {
    question: "When will my first mortgage payment be due after closing, and how is that date determined?",
    answer: "Your first payment is usually due on the first of the second month after closing, because mortgage interest is paid in arrears and some interest is collected for the closing month at the signing.",
    category: "process"
  },
  {
    question: "What should I avoid doing financially in the days leading up to my closing appointment?",
    answer: "Avoid opening new credit, making large purchases, moving large sums without documentation, or missing any payments, as these can prompt additional questions or affect your final approval.",
    category: "process"
  },
  {
    question: "After closing, will my mortgage stay with the same lender or be sold to another company to service?",
    answer: "Many loans are sold or the servicing is transferred after closing; if that happens, you will receive written notice explaining where to send payments and how to manage your account going forward.",
    category: "process"
  },
  {
    question: "What should I do if I find an error on my closing documents on the day of signing?",
    answer: "Pause and alert your closing agent and lender immediately so they can correct and re-issue any affected documents; do not sign paperwork you believe is inaccurate or incomplete.",
    category: "process"
  },
  {
    question: "What are the main steps of the mortgage application process from start to finish?",
    answer: "The core steps are pre-approval, formal application, documentation review, underwriting, appraisal, final approval (clear-to-close), signing closing documents, and funding of the loan.",
    category: "application"
  },
  {
    question: "When should I apply for a mortgage—before or after I start shopping for homes?",
    answer: "It is best to get pre-approved before home shopping so you know your price range and can submit stronger offers backed by a lender letter.",
    category: "application"
  },
  {
    question: "What information and documents do I need to complete a mortgage application?",
    answer: "Most borrowers provide identification, income documents, tax returns, bank statements, details on assets and debts, and information about the property being purchased or refinanced.",
    category: "application"
  },
  {
    question: "How long does it typically take to get a mortgage application approved and closed?",
    answer: "Many loans close in about 30 to 45 days from a complete application, though timing depends on how quickly documents, appraisal, and title work are completed.",
    category: "application"
  },
  {
    question: "What is the difference between pre-qualification, pre-approval, and full loan approval?",
    answer: "Pre-qualification is an informal estimate, pre-approval includes a credit check and document review, and full approval happens after underwriting, appraisal, and final conditions are satisfied.",
    category: "application"
  },
  {
    question: "At what point does the lender pull my credit, and will they check it again before closing?",
    answer: "Credit is usually pulled at pre-approval or application, and many lenders perform a final check or monitoring before closing to confirm no major new debts or issues have appeared.",
    category: "application"
  },
  {
    question: "What happens after I submit my mortgage application and upload my documents online?",
    answer: "Your file typically moves to processing, where your information is organized and verified, then to underwriting, where an underwriter reviews credit, income, assets, and the property to decide on approval conditions.",
    category: "application"
  },
  {
    question: "What is mortgage underwriting, and what does an underwriter actually review?",
    answer: "Underwriting is the lender's risk review; the underwriter examines your credit, income, assets, debts, employment, and appraisal to ensure the loan meets program guidelines and the lender's standards.",
    category: "application"
  },
  {
    question: "What are \"conditions\" in underwriting, and how do I clear them to move forward?",
    answer: "Conditions are items the underwriter needs before final approval, such as updated documents or explanations; once you provide and the lender accepts them, your file can move to clear-to-close status.",
    category: "application"
  },
  {
    question: "How do appraisals fit into the loan process, and what if the appraisal comes in low?",
    answer: "The appraisal confirms the property's value for the lender; if it is low, you may renegotiate the price, increase your down payment, challenge the appraisal, or cancel based on your contract terms.",
    category: "application"
  },
  {
    question: "When do I receive a Loan Estimate, and what should I look for on it?",
    answer: "You should receive a Loan Estimate within a few business days of your application, outlining your projected rate, payment, and closing costs so you can compare offers and understand key terms early.",
    category: "application"
  },
  {
    question: "What is a Closing Disclosure, and when will I receive it before signing my loan?",
    answer: "The Closing Disclosure is a final, detailed summary of your loan terms and costs that must be provided at least three business days before closing so you can review everything before signing.",
    category: "application"
  },
  {
    question: "How often will I need to update pay stubs, bank statements, or other documents during the process?",
    answer: "Lenders commonly require documents to be current within a set timeframe, so you may be asked for updated pay stubs or statements if your file is in process for several weeks or more.",
    category: "application"
  },
  {
    question: "Can I change jobs, move money, or make large deposits while my mortgage is in process?",
    answer: "Major job changes, transfers between accounts, or large unexplained deposits can require extra documentation or affect approval, so talk with your lender before making any significant changes during the process.",
    category: "application"
  },
  {
    question: "What actions could delay or jeopardize my mortgage approval once I have applied?",
    answer: "New debts, missed payments, big purchases, unverified deposits, or slow responses to document requests can delay or harm your approval, so consistent finances and quick communication are important.",
    category: "application"
  },
  {
    question: "Who will be my main point of contact during the mortgage application process?",
    answer: "You will typically work with a loan officer and a loan processor, who coordinate with underwriting and keep you updated on needed items and milestones through to closing.",
    category: "application"
  },
  {
    question: "How can I track the status of my mortgage application and know what is still outstanding?",
    answer: "Many lenders offer online portals showing tasks and documents, and you can also request status updates from your loan team to see what has been completed and what remains.",
    category: "application"
  },
  {
    question: "What happens if my income, debt, or credit changes before my loan closes?",
    answer: "Material changes may require re-underwriting your file and could alter your approval or terms, so it is important to alert your lender immediately if your situation changes.",
    category: "application"
  },
  {
    question: "What is a conditional loan approval versus a clear-to-close status?",
    answer: "Conditional approval means the underwriter has approved your loan subject to specific conditions; clear-to-close confirms all conditions are met and your loan is ready for closing and funding.",
    category: "application"
  },
  {
    question: "On closing day, what should I expect in terms of signing documents and funding my loan?",
    answer: "On closing day you will review and sign final loan and title documents, provide any required funds by wire or cashier's check, and after funding and recording, you become the official owner.",
    category: "application"
  },
  {
    question: "What types of mortgage financing options are available for homebuyers?",
    answer: "Common financing options include conventional loans, FHA loans, VA loans, USDA loans, and jumbo loans, each with different down payment, credit, and occupancy requirements.",
    category: "financing"
  },
  {
    question: "How do I decide between a conventional loan, FHA, VA, or other loan program?",
    answer: "The best program depends on your credit, down payment, military status, property location, and long-term goals; your lender can compare monthly payments, fees, and qualification rules for each.",
    category: "financing"
  },
  {
    question: "What is the difference between a fixed-rate and an adjustable-rate mortgage from a financing standpoint?",
    answer: "A fixed-rate mortgage keeps the same interest rate and principal-and-interest payment for the entire term, while an adjustable-rate mortgage starts with a fixed period and then can adjust based on a market index.",
    category: "financing"
  },
  {
    question: "How do lenders calculate my debt-to-income (DTI) ratio for mortgage approval?",
    answer: "Lenders add up your monthly debts shown on your credit report plus your proposed housing payment, then divide that total by your gross monthly income to determine your DTI percentage.",
    category: "financing"
  },
  {
    question: "What DTI ratio do most lenders look for when approving a home loan?",
    answer: "Acceptable DTI limits vary by program, but many loans target total DTI at or below the low-40% range, with some allowing higher ratios when there are strong compensating factors.",
    category: "financing"
  },
  {
    question: "How does my employment history and income type affect my financing options?",
    answer: "Stable, documentable income over at least two years in the same line of work is preferred; self-employed or commission income may require additional tax returns and averaging rules to qualify.",
    category: "financing"
  },
  {
    question: "Can I use bonus, overtime, commission, or gig income to qualify for a mortgage?",
    answer: "Yes, if the income is consistent and documented over time; lenders usually average variable income over two years and verify it is likely to continue.",
    category: "financing"
  },
  {
    question: "What is the minimum down payment required for different types of mortgage loans?",
    answer: "Many conventional loans start around 3% down, FHA often requires a minimum of 3.5%, VA and USDA can offer zero-down options for eligible borrowers and properties, and jumbo loans usually require more.",
    category: "financing"
  },
  {
    question: "Can gift funds from family be used for my down payment or closing costs, and what documentation is needed?",
    answer: "Most programs allow properly documented gifts from acceptable donors, often requiring a signed gift letter and evidence of the transfer and source of funds according to the loan guidelines.",
    category: "financing"
  },
  {
    question: "What is the difference between a pre-qualification and a full pre-approval from a financing perspective?",
    answer: "Pre-qualification is an informal estimate based on basic information, while pre-approval includes a credit check and review of documents, giving you a stronger, more reliable approval amount for offers.",
    category: "financing"
  },
  {
    question: "How does my choice of loan term, such as 15-year vs. 30-year, affect my payment and total interest cost?",
    answer: "Shorter terms usually have higher monthly payments but lower interest rates and much less total interest over the life of the loan, while longer terms reduce the payment but increase overall interest paid.",
    category: "financing"
  },
  {
    question: "What are lender fees, and how do they differ from third-party closing costs in my loan estimate?",
    answer: "Lender fees are charges from the mortgage company, such as origination or underwriting, while third-party costs include appraisal, title, escrow, and government fees that are paid to outside providers.",
    category: "financing"
  },
  {
    question: "What is a rate lock, and when should I lock my interest rate during the financing process?",
    answer: "A rate lock is an agreement that secures a specific interest rate for a set period; many buyers lock after their offer is accepted and loan application is submitted so the rate cannot rise during processing.",
    category: "financing"
  },
  {
    question: "Can I change loan programs or terms after I have already applied or gone under contract?",
    answer: "Changes are often possible but may require a new loan estimate, updated underwriting, or an extension of deadlines, so any switch should be coordinated early with your lender and agent.",
    category: "financing"
  },
  {
    question: "How do points or \"buying down the rate\" work, and when does it make financial sense?",
    answer: "Points are upfront fees paid to reduce your interest rate; whether it makes sense depends on how much you pay, how much the rate drops, and how long you expect to keep the loan before selling or refinancing.",
    category: "financing"
  },
  {
    question: "What is mortgage insurance, when is it required, and how does it affect my monthly payment?",
    answer: "Mortgage insurance protects the lender when your down payment is below certain thresholds; it adds a monthly or upfront cost but can allow you to buy with less money down than would otherwise be required.",
    category: "financing"
  },
  {
    question: "Can I finance closing costs into my mortgage, or use lender or seller credits to reduce cash needed at closing?",
    answer: "Some loan programs allow limited financing of costs or the use of seller and lender credits, which can raise your interest rate or purchase price slightly but lower the cash you must bring to closing.",
    category: "financing"
  },
  {
    question: "How does refinancing work, and when might it be a good idea after I purchase a home?",
    answer: "Refinancing replaces your current mortgage with a new one, potentially lowering your rate, changing your term, or accessing equity; it can be helpful when rates drop or your finances improve enough to offset closing costs.",
    category: "financing"
  },
  {
    question: "Are there special financing options for investors, second homes, or multi-unit properties compared to primary residences?",
    answer: "Non-owner-occupied and second-home loans usually have different down payment, reserve, and pricing requirements, and financing for multi-unit properties may consider rental income and additional guidelines.",
    category: "financing"
  },
  {
    question: "Besides the interest rate, what other factors should I compare when choosing between mortgage offers?",
    answer: "Compare total lender fees, annual percentage rate (APR), mortgage insurance costs, loan term, prepayment rules, and credits or points so you understand the true overall cost of each option.",
    category: "financing"
  },
  {
    question: "How does my credit score affect my ability to qualify for a mortgage?",
    answer: "Your credit score helps lenders measure how risky it is to lend to you; higher scores generally make it easier to qualify, often with lower interest rates and better terms.",
    category: "credit"
  },
  {
    question: "What minimum credit score do most lenders require for a home loan?",
    answer: "Minimum scores vary by loan type and lender, but many conventional loans require scores in at least the mid-600s, while some government-backed programs may allow lower scores with other strong factors.",
    category: "credit"
  },
  {
    question: "Which credit score do lenders use when I apply for a mortgage?",
    answer: "Lenders typically pull scores from the three major credit bureaus and use a mortgage-specific scoring model, then base your qualification on the \"middle\" of those three scores.",
    category: "credit"
  },
  {
    question: "Do lenders look at all three credit bureaus for a mortgage application?",
    answer: "Yes, most mortgage lenders request reports and scores from Experian, Equifax, and TransUnion to get a complete view of your credit history and obligations.",
    category: "credit"
  },
  {
    question: "What is my \"middle score\" and why does it matter for mortgage approval?",
    answer: "The middle score is the one that falls between your highest and lowest of the three bureau scores, and it is usually the key number lenders use for qualifying and pricing your loan.",
    category: "credit"
  },
  {
    question: "Will my co-borrower's credit score affect our loan approval and interest rate?",
    answer: "When there are two borrowers, lenders typically use the lower middle score of the two, so a weaker score can impact loan options, pricing, or even eligibility.",
    category: "credit"
  },
  {
    question: "How does the length of my credit history impact my mortgage qualification?",
    answer: "A longer, well-managed credit history tends to be viewed more favorably, while very thin or new credit files may require stronger income, assets, or special programs to qualify.",
    category: "credit"
  },
  {
    question: "How do late payments, collections, or charge-offs affect getting approved for a mortgage?",
    answer: "Recent serious delinquencies can significantly lower your score and may trigger waiting periods or extra documentation, while older, resolved issues may have less impact if your recent history is strong.",
    category: "credit"
  },
  {
    question: "Can I get a mortgage if I have a past bankruptcy, foreclosure, or short sale on my credit?",
    answer: "Many borrowers can qualify again after certain waiting periods and re-establishing good credit, with the length of time depending on the event type and the loan program you use.",
    category: "credit"
  },
  {
    question: "How long after a bankruptcy or foreclosure do I need to wait before applying for a home loan?",
    answer: "Typical waiting periods range from about two to seven years, depending on whether it was a bankruptcy, foreclosure, or short sale and which loan type you are applying for; your lender can review your specific timeline.",
    category: "credit"
  },
  {
    question: "Does my credit card utilization ratio impact my mortgage approval and rate?",
    answer: "Yes, using a high percentage of your available revolving credit can lower your score, so keeping balances relatively low compared with limits can improve both qualification and potential pricing.",
    category: "credit"
  },
  {
    question: "Should I pay down credit cards or other debts before applying for a mortgage to improve my chances?",
    answer: "Paying down revolving debt can help your score and reduce your debt-to-income ratio, but it is wise to review a plan with your lender first to prioritize which accounts to address.",
    category: "credit"
  },
  {
    question: "Will applying with multiple lenders hurt my credit score while I shop for a mortgage?",
    answer: "Several mortgage inquiries within a short rate-shopping window are often treated as one for scoring purposes, so comparing offers within a limited time usually has a small impact on your score.",
    category: "credit"
  },
  {
    question: "What is the difference between a hard inquiry and a soft inquiry in the mortgage process?",
    answer: "A hard inquiry occurs when a lender pulls your credit for an application and can affect your score slightly, while a soft inquiry, such as some pre-approvals or self-checks, does not impact your score.",
    category: "credit"
  },
  {
    question: "How long do mortgage inquiries stay on my credit report and do they lower my score the whole time?",
    answer: "Inquiries usually remain visible for about two years, but their effect on your score is typically modest and tends to decrease after the first year as more recent behavior matters more.",
    category: "credit"
  },
  {
    question: "Should I open new credit accounts or finance a car while I am in the middle of a mortgage application?",
    answer: "Opening new credit or taking on new loans during the process can lower your score and raise your debt-to-income ratio, so most lenders advise waiting until after your home purchase closes.",
    category: "credit"
  },
  {
    question: "Is it a good idea to close old credit cards before or during my loan process to clean up my credit?",
    answer: "Closing long-standing accounts can shorten your average credit history and raise utilization on remaining cards, which may hurt your score, so changes should be discussed with your lender before you act.",
    category: "credit"
  },
  {
    question: "How quickly can my credit score improve if I pay down debt or correct errors before applying for a mortgage?",
    answer: "Some score changes may appear within a few weeks of balances updating or corrections posting, while rebuilding from serious issues can take many months; timing varies by your situation and reporting cycles.",
    category: "credit"
  },
  {
    question: "What should I do if I find an error on my credit report before applying for a home loan?",
    answer: "You can dispute inaccuracies directly with the credit bureaus and, when possible, provide supporting documents; share details with your lender as well so they understand what is being corrected.",
    category: "credit"
  },
  {
    question: "Are there mortgage programs for borrowers with lower credit scores or limited credit history?",
    answer: "Some government-backed and specialty programs are designed for borrowers with less-than-perfect credit or thin files, often balancing credit with income, savings, and other compensating strengths.",
    category: "credit"
  },
  {
    question: "What is a mortgage?",
    answer: "A mortgage is a loan used to buy real estate, where the property itself is collateral for the loan.",
    category: "mortgage-basics"
  },
  {
    question: "How does a mortgage work?",
    answer: "You borrow money from a lender, repay it over time with interest, and the lender can take the property if you don't repay as agreed.",
    category: "mortgage-basics"
  },
  {
    question: "What types of mortgage loans are available?",
    answer: "Common types include fixed-rate, adjustable-rate (ARM), FHA, VA, USDA, and jumbo loans.",
    category: "mortgage-basics"
  },
  {
    question: "What is the difference between a fixed-rate and an adjustable-rate mortgage?",
    answer: "Fixed-rate mortgages keep the same interest rate for the entire loan term, while adjustable rates can change over time.",
    category: "mortgage-basics"
  },
  {
    question: "What is a down payment, and how much do I need?",
    answer: "A down payment is the amount you pay upfront, usually ranging from 3% to 20% of the home's price.",
    category: "mortgage-basics"
  },
  {
    question: "How do I qualify for a mortgage?",
    answer: "Lenders look at your credit score, income, debt, employment, and down payment to determine if you qualify.",
    category: "mortgage-basics"
  },
  {
    question: "What is mortgage pre-approval?",
    answer: "Pre-approval means a lender has reviewed your finances and can offer you a specific loan amount, giving you a stronger buying position.",
    category: "mortgage-basics"
  },
  {
    question: "How is my mortgage payment calculated?",
    answer: "Payments include loan principal, interest, property taxes, homeowner's insurance, and possibly mortgage insurance.",
    category: "mortgage-basics"
  },
  {
    question: "What is included in my monthly mortgage payment?",
    answer: "Principal, interest, taxes, and insurance (PITI)—and sometimes PMI.",
    category: "mortgage-basics"
  },
  {
    question: "What is private mortgage insurance (PMI)?",
    answer: "PMI protects the lender if you default and is usually required if your down payment is less than 20%.",
    category: "mortgage-basics"
  },
  {
    question: "How can I avoid paying PMI?",
    answer: "Make a down payment of at least 20%, or explore lender-paid PMI or piggyback loan options.",
    category: "mortgage-basics"
  },
  {
    question: "What are closing costs and who pays them?",
    answer: "Closing costs include lender, title, and government fees (2-5% of price), and both buyer and seller may pay certain costs as negotiated.",
    category: "mortgage-basics"
  },
  {
    question: "What is an escrow account in relation to my mortgage?",
    answer: "An escrow account holds funds for property taxes and insurance to ensure they're paid on time.",
    category: "mortgage-basics"
  },
  {
    question: "How do interest rates affect my mortgage?",
    answer: "Higher rates increase your monthly payment and the total cost of your loan. Lower rates do the opposite.",
    category: "mortgage-basics"
  },
  {
    question: "Can I get a mortgage with less than perfect credit?",
    answer: "Yes, but you may pay a higher interest rate or need a larger down payment. Some programs serve buyers with lower credit scores.",
    category: "mortgage-basics"
  },
  {
    question: "What are points, and should I pay them?",
    answer: "Points are upfront payments to lower your interest rate. If you'll keep your loan long enough, paying points can save money.",
    category: "mortgage-basics"
  },
  {
    question: "What documents are required to apply for a mortgage?",
    answer: "Typically, you'll need pay stubs, W-2s, tax returns, bank statements, and ID. Self-employed borrowers may need more paperwork.",
    category: "mortgage-basics"
  },
  {
    question: "How long does it take to get approved for a mortgage?",
    answer: "30-45 days is common, but it varies. Getting your documents ready early can help speed things up.",
    category: "mortgage-basics"
  },
  {
    question: "Can I pay off my mortgage early?",
    answer: "Yes, in most cases. Check if your loan has a prepayment penalty. Paying early reduces your interest costs.",
    category: "mortgage-basics"
  },
  {
    question: "What happens if I miss a mortgage payment?",
    answer: "You'll likely owe a late fee and risk damage to your credit score. Multiple missed payments can lead to foreclosure.",
    category: "mortgage-basics"
  },
  {
    question: "What is the first step to buying my first home?",
    answer: "The first step is to review your budget and credit, then speak with a lender to get pre-approved so you know your price range and loan options.",
    category: "first-time-buyer"
  },
  {
    question: "How much should I save for a down payment as a first-time buyer?",
    answer: "Many first-time buyers put between 3% and 5% down, though saving more can lower your payment and may reduce or remove mortgage insurance.",
    category: "first-time-buyer"
  },
  {
    question: "Are there special first-time homebuyer programs or down payment assistance options?",
    answer: "Many lenders, local governments, and housing agencies offer first-time buyer grants, forgivable loans, or reduced down payment programs based on income, location, or profession.",
    category: "first-time-buyer"
  },
  {
    question: "What credit score do I need to buy my first home?",
    answer: "Minimum credit score requirements vary by loan type, but many first-time buyer programs start around the mid-600s, with stronger scores qualifying for better rates and terms.",
    category: "first-time-buyer"
  },
  {
    question: "How long should I be at my job before applying as a first-time buyer?",
    answer: "Lenders typically like to see a two-year work history in the same field, though recent graduates or job changes within the same industry can often be acceptable with documentation.",
    category: "first-time-buyer"
  },
  {
    question: "How is buying my first home different from renting?",
    answer: "Buying usually involves upfront costs, maintenance responsibilities, and a longer commitment, but it also builds equity and can offer more stability and potential tax benefits than renting.",
    category: "first-time-buyer"
  },
  {
    question: "How do I choose the right lender as a first-time buyer?",
    answer: "Compare interest rates, fees, loan programs, and reviews, and look for a lender experienced with first-time buyers who can clearly explain your options and closing costs.",
    category: "first-time-buyer"
  },
  {
    question: "How do I know what price range is realistic for my first home?",
    answer: "Your pre-approval, monthly budget, and comfort level with payments together determine a realistic range; your agent can also show how taxes, HOA dues, and insurance affect affordability.",
    category: "first-time-buyer"
  },
  {
    question: "How much should I budget for closing costs on my first home purchase?",
    answer: "Closing costs typically run about 2% to 5% of the purchase price, and may be paid by you, shared with the seller, or partially covered by lender or assistance programs, depending on your contract.",
    category: "first-time-buyer"
  },
  {
    question: "What monthly payment should I be comfortable with as a first-time buyer?",
    answer: "A common guideline is that your total housing payment fits comfortably within your budget after other debts and savings goals, often keeping your debt-to-income ratio within lender limits.",
    category: "first-time-buyer"
  },
  {
    question: "What are the most common mistakes first-time homebuyers make?",
    answer: "Common missteps include skipping pre-approval, stretching the budget too far, waiving important inspections, making big purchases before closing, and not understanding loan terms or closing costs.",
    category: "first-time-buyer"
  },
  {
    question: "How long does the process usually take for a first-time buyer from pre-approval to move-in?",
    answer: "Once pre-approved and under contract, many first-time buyers close in about 30 to 45 days, though searching for the right home can add additional time depending on the market.",
    category: "first-time-buyer"
  },
  {
    question: "Should I buy a \"starter\" home or wait until I can afford my long-term home?",
    answer: "A starter home can help you build equity sooner, while waiting may allow a larger budget; the best choice depends on your timeline, local prices, and how long you plan to stay in the home.",
    category: "first-time-buyer"
  },
  {
    question: "Is a fixed-rate or adjustable-rate mortgage better for first-time buyers?",
    answer: "Many first-time buyers prefer fixed-rate loans for payment stability, while adjustable-rate mortgages may be useful if you expect to move or refinance before the rate can adjust.",
    category: "first-time-buyer"
  },
  {
    question: "What inspections are especially important for first-time buyers before closing?",
    answer: "A general home inspection is standard, and depending on the property and location you may also consider roof, sewer, pest, foundation, or environmental inspections for added peace of mind.",
    category: "first-time-buyer"
  },
  {
    question: "How much should I plan for repairs and maintenance on my first home each year?",
    answer: "A common rule of thumb is to budget around 1% of the home's value per year for maintenance and repairs, though older homes or special features may require more.",
    category: "first-time-buyer"
  },
  {
    question: "Can I buy my first home if I have student loans or other debt?",
    answer: "Yes, as long as your total monthly debts, including your future mortgage payment, stay within the lender's debt-to-income guidelines and you meet credit and income requirements.",
    category: "first-time-buyer"
  },
  {
    question: "What happens if the appraisal comes in lower than the price on my first home?",
    answer: "A low appraisal may lead to renegotiating the price, increasing your down payment, changing loan terms, or canceling based on your contract's appraisal contingency.",
    category: "first-time-buyer"
  },
  {
    question: "Can I ask the seller for credits or help with closing costs as a first-time buyer?",
    answer: "Yes, you can request seller credits toward closing costs in your offer, subject to loan and seller limits, which can reduce the cash you need at closing.",
    category: "first-time-buyer"
  },
  {
    question: "Do I need a real estate agent for my first home purchase, and how are they paid?",
    answer: "An agent can guide you through pricing, contracts, and negotiations, and in most markets the seller pays the listing and buyer's agent commissions from the sale proceeds.",
    category: "first-time-buyer"
  }
];

// Default Guides - file names should match files in default-content/guides/
const defaultGuides = [
  {
    name: "Buyer's Guide",
    category: "first-time-buyer",
    fileName: "BUYER'S GUIDE.pdf",
    fileType: "application/pdf",
    funnelUrl: null
  },
  {
    name: "Credit Score Guide",
    category: "credit",
    fileName: "CREDIT SCORE GUIDE.pdf",
    fileType: "application/pdf",
    funnelUrl: null
  },
  {
    name: "Document Checklist",
    category: "application",
    fileName: "Document Checklist.pdf",
    fileType: "application/pdf",
    funnelUrl: null
  },
  {
    name: "Home Buying Roadmap",
    category: "first-time-buyer",
    fileName: "Home Buying Roadmap.pdf",
    fileType: "application/pdf",
    funnelUrl: null
  },
  {
    name: "Home Buying Steps",
    category: "first-time-buyer",
    fileName: "Home Buying Steps.pdf",
    fileType: "application/pdf",
    funnelUrl: null
  },
  {
    name: "Seller's Guide",
    category: "mortgage-basics",
    fileName: "SELLERS GUIDE.pdf",
    fileType: "application/pdf",
    funnelUrl: null
  }
];

// Default Videos - file names should match files in default-content/videos/
const defaultVideos = [
  {
    title: "Conditional Loan Approval",
    description: "Understanding conditional loan approval and what it means for your mortgage application.",
    category: "conventional",
    fileName: "Conditional Loan Approval.mp4",
    thumbnailFileName: null, // Optional: if null, Cloudinary will auto-generate
    duration: "0:00" // Will be updated from video metadata after upload
  }
];

export interface UploadDefaultContentResult {
  success: boolean;
  faqsCount: number;
  guidesCount: number;
  videosCount: number;
  error?: string;
}

// Helper function to upload a guide file to Cloudinary
async function uploadGuideToCloudinary(
  filePath: string,
  fileName: string,
  officerId: string
): Promise<{ fileUrl: string; cloudinaryPublicId: string }> {
  const folder = `officer-content/guides/${officerId}`;
  const fileBuffer = readFileSync(filePath);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'raw',
          overwrite: false,
          unique_filename: true,
          public_id: fileName.replace(/\.[^/.]+$/, '') // Remove extension for public_id
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary guide upload failed'));
          }
          resolve({
            fileUrl: result.secure_url,
            cloudinaryPublicId: result.public_id
          });
        }
      )
      .end(fileBuffer);
  });
}

// Helper function to upload a video file to Cloudinary
async function uploadVideoToCloudinary(
  filePath: string,
  thumbnailPath: string | null,
  officerId: string
): Promise<{ videoUrl: string; thumbnailUrl: string; cloudinaryPublicId: string; duration: number }> {
  const folder = `officer-content/videos/${officerId}`;
  const videoBuffer = readFileSync(filePath);

  // Upload video
  const videoResult = await new Promise<{
    secure_url: string;
    public_id: string;
    duration: number;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'video',
          overwrite: false,
          unique_filename: true,
          eager: [
            { width: 1280, height: 720, crop: 'limit', format: 'jpg' } // Auto-generate thumbnail
          ]
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary video upload failed'));
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration || 0
          });
        }
      )
      .end(videoBuffer);
  });

  // Upload custom thumbnail if provided, otherwise use auto-generated one
  let thumbnailUrl = '';
  if (thumbnailPath && existsSync(thumbnailPath)) {
    const thumbnailBuffer = readFileSync(thumbnailPath);
    const thumbnailResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `${folder}/thumbnails`,
            resource_type: 'image',
            overwrite: false,
            unique_filename: true
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary thumbnail upload failed'));
            }
            resolve({ secure_url: result.secure_url });
          }
        )
        .end(thumbnailBuffer);
    });
    thumbnailUrl = thumbnailResult.secure_url;
  } else {
    // Generate thumbnail from video using Cloudinary transformation
    thumbnailUrl = cloudinary.url(videoResult.public_id, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        { width: 1280, height: 720, crop: 'limit' },
        { start_offset: '1' } // Frame at 1 second
      ]
    });
  }

  return {
    videoUrl: videoResult.secure_url,
    thumbnailUrl,
    cloudinaryPublicId: videoResult.public_id,
    duration: videoResult.duration
  };
}

/**
 * Uploads default FAQs, guides, and videos for a loan officer
 * @param officerId - The UUID of the loan officer
 * @returns Result with counts of uploaded items
 */
export async function uploadDefaultContentForOfficer(
  officerId: string
): Promise<UploadDefaultContentResult> {
  try {
    // Check if content already exists (idempotent check)
    const existingFaqs = await db
      .select()
      .from(officerContentFaqs)
      .where(eq(officerContentFaqs.officerId, officerId))
      .limit(1);

    // Only upload if no content exists (prevent duplicates)
    if (existingFaqs.length > 0) {
      console.log(`⚠️ Officer ${officerId} already has content. Skipping upload.`);
      return {
        success: true,
        faqsCount: 0,
        guidesCount: 0,
        videosCount: 0
      };
    }

    // Upload FAQs
    const faqsToInsert = defaultFaqs.map(faq => ({
      officerId,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const insertedFaqs = await db.insert(officerContentFaqs).values(faqsToInsert).returning();

    // Upload Guides to Cloudinary and then to database
    const defaultContentPath = join(process.cwd(), 'default-content');
    const guidesToInsert = [];

    for (const guide of defaultGuides) {
      const guidePath = join(defaultContentPath, 'guides', guide.fileName);
      
      if (!existsSync(guidePath)) {
        console.warn(`⚠️ Guide file not found: ${guidePath}. Skipping guide: ${guide.name}`);
        continue;
      }

      try {
        const { fileUrl, cloudinaryPublicId } = await uploadGuideToCloudinary(
          guidePath,
          guide.fileName,
          officerId
        );

        guidesToInsert.push({
          officerId,
          name: guide.name,
          category: guide.category,
          fileUrl,
          fileName: guide.fileName,
          fileType: guide.fileType,
          cloudinaryPublicId,
          funnelUrl: guide.funnelUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        console.error(`❌ Error uploading guide ${guide.name}:`, error);
        // Continue with other guides even if one fails
      }
    }

    const insertedGuides = guidesToInsert.length > 0
      ? await db.insert(officerContentGuides).values(guidesToInsert).returning()
      : [];

    // Upload Videos to Cloudinary and then to database
    const videosToInsert = [];

    for (const video of defaultVideos) {
      const videoPath = join(defaultContentPath, 'videos', video.fileName);
      
      if (!existsSync(videoPath)) {
        console.warn(`⚠️ Video file not found: ${videoPath}. Skipping video: ${video.title}`);
        continue;
      }

      const thumbnailPath = video.thumbnailFileName
        ? join(defaultContentPath, 'videos', video.thumbnailFileName)
        : null;

      try {
        const { videoUrl, thumbnailUrl, cloudinaryPublicId, duration } = await uploadVideoToCloudinary(
          videoPath,
          thumbnailPath,
          officerId
        );

        // Format duration as MM:SS
        const formattedDuration = duration > 0
          ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`
          : video.duration;

        videosToInsert.push({
          officerId,
          title: video.title,
          description: video.description,
          category: video.category,
          videoUrl,
          thumbnailUrl,
          duration: formattedDuration,
          cloudinaryPublicId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        console.error(`❌ Error uploading video ${video.title}:`, error);
        // Continue with other videos even if one fails
      }
    }

    const insertedVideos = videosToInsert.length > 0
      ? await db.insert(officerContentVideos).values(videosToInsert).returning()
      : [];

    console.log(`✅ Uploaded default content for officer ${officerId}:`, {
      faqs: insertedFaqs.length,
      guides: insertedGuides.length,
      videos: insertedVideos.length
    });

    return {
      success: true,
      faqsCount: insertedFaqs.length,
      guidesCount: insertedGuides.length,
      videosCount: insertedVideos.length
    };

  } catch (error) {
    console.error('❌ Error uploading default content:', error);
    return {
      success: false,
      faqsCount: 0,
      guidesCount: 0,
      videosCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

