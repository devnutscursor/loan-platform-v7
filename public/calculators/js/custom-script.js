var frontend = {
  "piColor": "#FA9D39",
  "hoaDues": "#41A2ED",
  "taxes": "#59C2C0",
  "pmi": "#eeee22",
  "insurance": "#F85A85",
  "extraPay": "#8224e3",
  "home_val": "200000",
  "down_payment_val": "0",
  "mortgage_amount_val": "200000",
  "interest_rate_val": "5",
  "loan_terms_val": "30",
  "private_mortgage_insurance": "0",
  "property_tax_val": "0.6",
  "home_insurance_val": "1200",
  "HOA_fees_val": "0",
  "extra_payment_per_month": "0",
  "vaPiColor": "#FA9D39",
  "vaHoaDues": "#41A2ED",
  "vaTaxesColor": "#59C2C0",
  "vaInsurance": "#F85A85",
  "vaExtraPay": "#8224e3",
  "vaHomePrice": "200000",
  "vaDownPayment": "0",
  "vaLoanAmount": "200000",
  "vaRate": "5",
  "fu_less_five_va_funding_fee": "2.15",
  "fu_greater_five_va_funding_fee": "1.5",
  "fu_greater_ten_va_funding_fee": "1.25",
  "afu_less_five_va_funding_fee": "3.3",
  "afu_greater_five_va_funding_fee": "1.5",
  "afu_greater_ten_va_funding_fee": "1.25",
  "vaYears": "30",
  "vaTaxes": "0.6",
  "vaHomeInsurence": "1200",
  "vaHOA": "0",
  "vaExtraInicial": "0",
  "cor_first_va_refinance_funding_fee": "2.15",
  "cor_after_first_va_refinance_funding_fee": "3.3",
  "irrl_va_refinance_funding_fee": "0.5"
};



 
  // After content is rendered or on window load:
// Inside the remote site:
function sendHeight() {
  const height = document.documentElement.scrollHeight;
  parent.postMessage({ type: 'LSMCalcHeight', height: height }, '*');
}
window.addEventListener('DOMContentLoaded', sendHeight);
window.addEventListener('resize', sendHeight);
