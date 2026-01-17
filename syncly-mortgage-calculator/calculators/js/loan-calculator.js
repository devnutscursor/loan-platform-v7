// Build base URL dynamically from the current site
    var baseUrlWebsite = window.location.origin + "/wp-content/uploads/calculators/";
	
	


    const calculatorHTML = `

		<div class="payment-calculator-main  affordability-main">
			<div class="top-hea-block">
				<div class="payment-tab-nav">
					<ul>
						<li class="active affordability " dataText="#000" dataBG="#2b3642" data-name="Affordability Calculator"><a href="#affordability">Affordability Calculator</a></li>
						<li class="mortage-item " dataText="#000" dataBG="#2b3642" data-name="Purchase Calculator"><a href="#purchase-item">Purchase</a></li>
						<li class="refinance-item " dataText="#000" dataBG="#2b3642" data-name="Refinance Calculator"><a href="#refinance-item">Refinance</a></li>
						<li class="rent-buy-item " dataText="#000" dataBG="#2b3642" data-name="Rent vs Buy Calculator"><a href="#rent-buy-item">Rent vs Buy</a></li>
						<li class="veteran-affairs " dataText="#000" dataBG="#2b3642" data-name="VA Purchase Calculator"><a href="#veteran-affairs">VA Purchase</a></li>
						<li class="va-refinance " dataText="#000" dataBG="#2b3642" data-name="VA Refinance Calculator"><a href="#va-refinance">VA Refinance</a></li>
						<li class="rental-loan " dataText="#000" dataBG="#2b3642" data-name="Debt-Service (DSCR)"><a href="#rental-loan">Debt-Service (DSCR)</a></li>
						<li class="fix-and-flip " dataText="#000" dataBG="#2b3642" data-name="Fix & Flip Calculator"><a href="#fix-and-flip">Fix & Flip</a></li>
					</ul>
				</div>
			</div>
			<div class="payment-calculator-wrapper">
				<div class="payment-calculator-left" style="background-color:#2b3642">
					<div class="title"><h2>Affordability Calculator</h2></div>
					<div class="payment-left-system">
						<!-- Affordability Calculator -->
						<div id="affordability" class="tab-content calculate-view ">
														<div class="affordability-tab-nav">
								<ul>
									<li class=""><a href="#affordability-conventional">Conventional</a></li>
									<li class=""><a href="#affordability-fha">FHA</a></li>
									<li class=""><a href="#affordability-va">VA</a></li>
									<li class=""><a href="#affordability-usda">USDA</a></li>
									<li class=""><a href="#affordability-jumbo">Jumbo</a></li>
								</ul>
							</div>
							<div class="affordability-tab-content">
								<div class="affordability-tab-item " id="affordability-conventional">
									<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
										<div class="original-mortgage">
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Gross Income (Monthly)</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityGrossMonthlyIncome" name="affordabilityGrossMonthlyIncome" data-type="currency" class="form-control afd-monthly-income-common-field" value="5000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<div class="tooltip-main">
														<label>Monthly Debts</label>
														<div class="toltip-wrp">
															<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
															<div class="toltip">
																<b>Monthly Debts</b>	
																<p>Monthly Debt includes the payments you make each month on auto loans, and credit cards (minimum payment) and student loans. Exclude Rent and Utilities.</p>
															</div>
														</div>
													</div>
													<div class="input-item-relative">
														<input type="text" id="affordabilityMonthlyDebts" name="affordabilityMonthlyDebts" data-type="currency" class="form-control afd-monthly-debts-common-field" value="1500" required /> 
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Home Price</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityHomePrice" name="affordabilityHomePrice" data-type="currency" class="form-control afd-home-price-common-field" value="200000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Down Payment</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityDownPayment" name="affordabilityDownPayment" data-type="currency" class="form-control " value="0" required /> 
														<div class="afd-down-payment-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active dollar">
																	<input type="radio" name="affordability_down_payment_dollar" id="affordability_down_payment_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_down_payment_percent" id="affordability_down_payment_percent" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Loan Amount</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityLoanAmount" name="affordabilityLoanAmount" data-type="currency" class="form-control " value="200000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Loan Term</label>
													<div class="input-item-relative">
														<input type="number" id="affordabilityLoanTerm" name="affordabilityLoanTerm" class="form-control afd-loan-term-common-field" value="30" />
														<div class="mortgage-term-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active year">
																	<input type="radio" name="affordability_loan_term_dollar" id="affordability_loan_term_dollar" value="year"> Year 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_loan_term_percentage" id="affordability_loan_term_percentage" value="month" checked="">Month 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Interest Rate</label>
													<div class="input-item-relative">
														<input type="number" min="0.125" step="0.125" id="affordabilityInteretRate" name="affordabilityInteretRate" class="form-control afd-interest-rate-common-field" value="5" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Credit Score</label>
													<div class="input-item-relative">
														<select name="affordabilityCreditScore" id="affordabilityCreditScore">
															<option value="1.50" selected>620-639</option>
															<option value="1.31" >640-659</option>
															<option value="1.23" >660-679</option>
															<option value="0.98">680-699</option>
															<option value="0.79">700-719</option>
															<option value="0.70">720-739</option>
															<option value="0.58">740-759</option>
															<option value="0.46">760 and above</option>
														</select>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Prop Tax <br />( Yearly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityPropTax" name="affordabilityPropTax" class="form-control afd-prop-tax-common-field percentage" value="0.6" required /> 
														<div class="afd-prop-tax-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_prop_tax_dollar" id="affordability_prop_tax_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary percentage active">
																	<input type="radio" name="affordability_prop_tax_percentage" id="affordability_prop_tax_percentage" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Homeowners Insurance <br />( Yearly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityHomeownersInsurance" name="affordabilityHomeownersInsurance" data-type="currency" class="form-control afd-house-insurance-common-field" value="1200" required /> 
														<div class="afd-home-insurance-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active dollar">
																	<input type="radio" name="affordability_home_insurance_dollar" id="affordability_home_insurance_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_home_insurance_percentage" id="affordability_home_insurance_percentage" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>PMI ( Yearly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityPMI" name="affordabilityPMI" data-type="currency" class="form-control" value="0" required disabled /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>HOA Dues ( Monthly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityHoaDues" name="affordabilityHoaDues" data-type="currency" class="form-control" value="0" required /> 
													</div>
												</div>
											</div>
										</div>
									</form>
									<div class="btn-wrp">
										<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 										<a href="/quote/"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="GET A QUOTE"></a>
 -->									</div>
								</div>
								<div class="affordability-tab-item " id="affordability-fha">
									<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
										<div class="original-mortgage">
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Gross Income (Monthly)</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityFHAGrossMonthlyIncome" name="affordabilityFHAGrossMonthlyIncome" data-type="currency" class="form-control afd-monthly-income-common-field" value="5000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<div class="tooltip-main">
														<label>Monthly Debts</label>
														<div class="toltip-wrp">
															<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
															<div class="toltip">
																<b>Monthly Debts</b>	
																<p>Monthly Debt includes the payments you make each month on auto loans, and credit cards (minimum payment) and student loans. Exclude Rent and Utilities.</p>
															</div>
														</div>
													</div>
													<div class="input-item-relative">
														<input type="text" id="affordabilityFHAMonthlyDebts" name="affordabilityFHAMonthlyDebts" data-type="currency" class="form-control afd-monthly-debts-common-field" value="1500" required /> 
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Home Price</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityFHAHomePrice" name="affordabilityFHAHomePrice" data-type="currency" class="form-control afd-home-price-common-field" value="200000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Down Payment</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityFHADownPayment" name="affordabilityFHADownPayment" data-type="currency" class="form-control  percentage" value="3.5" required /> 
														<div class="afd-down-payment-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_fha_down_payment_dollar" id="affordability_fha_down_payment_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary percentage active">
																	<input type="radio" name="affordability_fha_down_payment_percent" id="affordability_fha_down_payment_percent" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Loan Amount</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityFHALoanAmount" name="affordabilityFHALoanAmount" data-type="currency" class="form-control " value="200000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Loan Term</label>
													<div class="input-item-relative">
														<input type="number" id="affordabilityFHALoanTerm" name="affordabilityFHALoanTerm" class="form-control afd-loan-term-common-field" value="30" />
														<div class="mortgage-term-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active year">
																	<input type="radio" name="affordability_fha_loan_term" id="affordability_fha_loan_term" value="year" checked> Year 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_fha_loan_term" id="affordability_fha_loan_term" value="month">Month 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Prop Tax <br />( Yearly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityFHAPropTax" name="affordabilityFHAPropTax" data-type="currency" class="form-control afd-prop-tax-common-field percentage" value="0.6" required /> 
														<div class="afd-prop-tax-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_fha_prop_tax_dollar" id="affordability_fha_prop_tax_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary percentage active">
																	<input type="radio" name="affordability_fha_prop_tax_percentage" id="affordability_fha_prop_tax_percentage" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Homeowners Insurance <br />( Yearly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityFHAHomeownersInsurance" name="affordabilityFHAHomeownersInsurance" data-type="currency" class="form-control afd-house-insurance-common-field" value="1200" required /> 
														<div class="afd-home-insurance-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active dollar">
																	<input type="radio" name="affordability_fha_home_insurance_dollar" id="affordability_fha_home_insurance_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_fha_home_insurance_percentage" id="affordability_fha_home_insurance_percentage" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Interest Rate</label>
													<div class="input-item-relative">
														<input type="number" min="0.125" step="0.125" id="affordabilityFHAInteretRate" name="affordabilityFHAInteretRate" class="form-control afd-interest-rate-common-field" value="5" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>HOA Dues ( Monthly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityFHAHoaDues" name="affordabilityFHAHoaDues" data-type="currency" class="form-control" value="0" required /> 
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Upfront MIP (%)</label>
													<div class="input-item-relative">
														<input type="number" id="affordabilityFHAUpfrontMIP" name="affordabilityFHAUpfrontMIP" class="form-control" value="" required disabled /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Annual MIP (%)</label>
													<div class="input-item-relative">
														<input type="number" id="affordabilityFHAAnnualMIP" name="affordabilityFHAAnnualMIP" class="form-control" value="" required disabled /> 
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Annual FHA Duration</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityFHAAnnualDuration" name="affordabilityFHAAnnualDuration" class="form-control" value="" required disabled /> 
													</div>
												</div>
												<div class="mortage-item-input"></div>
											</div>
										</div>
									</form>
									<div class="btn-wrp">
										<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 										<a href="/quote/"><input class="btn" type="button" name="submit" id="afd-fha-submit" value="GET A QUOTE"></a>
 -->									</div>
								</div>
								<div class="affordability-tab-item " id="affordability-va">
									<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
										<input type="hidden" id="affordabilityVALessFiveFUFF" name="affordabilityVALessFiveFUFF" value="2.15" /> 
										<input type="hidden" id="affordabilityVAGreaterFiveFUFF" name="affordabilityVAGreaterFiveFUFF" value="1.5" /> 
										<input type="hidden" id="affordabilityVAGreaterTenFUFF" name="affordabilityVAGreaterTenFUFF" value="1.25" /> 
										<input type="hidden" id="affordabilityVALessFiveAFUFF" name="affordabilityVALessFiveAFUFF" value="3.3" /> 
										<input type="hidden" id="affordabilityVAGreaterFiveAFUFF" name="affordabilityVAGreaterFiveAFUFF" value="1.5" /> 
										<input type="hidden" id="affordabilityVAGreaterTenAFUFF" name="affordabilityVAGreaterTenAFUFF" value="1.25" /> 
										<div class="item-input-group">
											<div class="mortage-item-input">
												<label>Gross Income (Monthly)</label>
												<div class="input-item-relative">
													<input type="text" id="affordabilityVAGrossMonthlyIncome" name="affordabilityVAGrossMonthlyIncome" data-type="currency" class="form-control afd-monthly-income-common-field" value="5000" required /> 
												</div>
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Monthly Debts</label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Monthly Debts</b>	
															<p>Monthly Debt includes the payments you make each month on auto loans, and credit cards (minimum payment) and student loans. Exclude Rent and Utilities.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="text" id="affordabilityVAMonthlyDebts" name="affordabilityVAMonthlyDebts" data-type="currency" class="form-control afd-monthly-debts-common-field" value="1500" required /> 
												</div>
											</div>
										</div>
										<div class="item-input-group">
											<div class="mortage-item-input">
												<label>Home Value </label>
												<input type="text" id="affordabilityVAHomePrice" data-type="currency" name="affordabilityVAHomePrice" class="form-control afd-home-price-common-field" value="200000" required /> 
											</div>
											<div class="mortage-item-input">
												<label>Down Payment </label>
												<div class="input-item-relative">
													<input type="text" id="affordabilityVADownPayment" data-type="currency" name="affordabilityVADownPayment" class="form-control " value="0" required />
													<div class="afd-down-payment-type btn-group-wrp">
														<div class="btn-group">
															<label class="btn btn-primary active dollar">
																<input type="radio" name="affordability_va_down_payment_dollar" id="affordability_va_down_payment_dollar" class="afd-input" value="dollar"> $ 
															</label>
															<label class="btn btn-primary">
																<input type="radio" name="affordability_va_down_payment_percent" id="affordability_va_down_payment_percent" class="afd-input" value="percent" checked=""> % 
															</label>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="item-input-group">
											<div class="mortage-item-input">
												<label>Base Mortgage Amount</label>
												<input type="text" id="affordabilityVALoanAmount" name="affordabilityVALoanAmount" data-type="currency" class="form-control " value="200000" /> 
											</div>
											<div class="mortage-item-input">
												<label>Loan Terms </label>
												<div class="input-item-relative">
													<input type="number" id="affordabilityVALoanTerm" name="affordabilityVALoanTerm" class="form-control afd-loan-term-common-field" value="30" />
													<div class="mortgage-term-type btn-group-wrp">
														<div class="btn-group">
															<label class="btn btn-primary active year">
																<input type="radio" name="affordability_va_loan_term_dollar" id="affordability_va_loan_term_dollar" value="year"> Year 
															</label>
															<label class="btn btn-primary">
																<input type="radio" name="affordability_va_loan_term_percentage" id="affordability_va_loan_term_percentage" value="month" checked="">Month 
															</label>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="item-input-group">
											<div class="mortage-item-input">
												<label>Payment Frequency </label>
												<div class="input-item-relative payment-frequency">
													<div class="blank-space"></div>
													<div class="btn-group-wrp">
														<div class="btn-group">
															<label class="btn btn-primary">
																<input type="radio" name="affordabilityVAPaymentFrequency" id="affordabilityVAPaymentFrequencyYear" value="Year"> Year 
															</label>
															<label class="btn btn-primary active">
																<input type="radio" name="affordabilityVAPaymentFrequency" id="affordabilityVAPaymentFrequencyMonth" value="Month" checked=""> Month
															</label>
														</div>
													</div>
												</div>
											</div>
											<div class="mortage-item-input">
												<label>Interest Rate </label>
												<input type="number" id="affordabilityVAInterestRate" name="affordabilityVAInterestRate" class="form-control afd-interest-rate-common-field" value="5"> 
											</div>
										</div>
										<div class="item-input-group">
											<div class="mortage-item-input">
												<label>This is my...</label>
												<select name="affordabilityVAFundingFeeOptions" id="affordabilityVAFundingFeeOptions">
													<option value="first_use" selected>First Time Use of a VA Loan</option>
													<option value="after_first_use">I have used a VA loan before</option>
													<option value="exempt_va_funding_fee">I am exempt from the VA funding fee</option>
												</select>
											</div>
											<div class="mortage-item-input">
												<label>VA Funding Fee </label>
												<div class="input-item-relative">
													<input type="number" id="affordabilityVAFundingFee" name="affordabilityVAFundingFee" class="form-control" value="2.15" disabled />
												</div>
											</div>
										</div>
										<div class="item-input-group">
											<div class="mortage-item-input">
												<label>Property Tax <br />(Yearly)</label>
												<div class="input-item-relative">
													<input type="text" data-type="currency" id="affordabilityVAPropTax" name="affordabilityVAPropTax" value="0.6" class="percentage form-control afd-prop-tax-common-field"> 
													<div class="afd-prop-tax-type btn-group-wrp">
														<div class="btn-group">
															<label class="btn btn-primary">
																<input type="radio" name="affordability_va_prop_tax_dollar" id="affordability_va_prop_tax_dollar" class="afd-input" value="dollar"> $ 
															</label>
															<label class="btn btn-primary percentage active">
																<input type="radio" name="affordability_va_prop_tax_percentage" id="affordability_va_prop_tax_percentage" class="afd-input" value="percent" checked=""> % 
															</label>
														</div>
													</div>
												</div>
											</div>
											<div class="mortage-item-input">
												<label>Homeowners Insurance (Yearly)</label>
												<div class="input-item-relative">
													<input type="text" data-type="currency" id="affordabilityVAHomeownersInsurance" name="affordabilityVAHomeownersInsurance" value="1200" class="form-control afd-house-insurance-common-field"> 
													<div class="afd-home-insurance-type btn-group-wrp">
														<div class="btn-group">
															<label class="btn btn-primary active dollar">
																<input type="radio" name="affordability_va_home_insurance_dollar" id="affordability_va_home_insurance_dollar" class="afd-input" value="dollar"> $ 
															</label>
															<label class="btn btn-primary">
																<input type="radio" name="affordability_va_home_insurance_percentage" id="affordability_va_home_insurance_percentage" class="afd-input" value="percent" checked=""> % 
															</label>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="item-input-group">
											<div class="mortage-item-input">
												<label>Final Mortgage Amount </label>
												<input type="text" data-type="currency" id="affordabilityVAFinalMortageLoanAmount" name="affordabilityVAFinalMortageLoanAmount" value="" class="form-control" disabled> 
											</div>
											<div class="mortage-item-input">
												<label>HOA Dues ( Monthly )</label>
												<input type="text" data-type="currency" id="affordabilityVAHoaDues" name="affordabilityVAHoaDues" value="0" class="form-control"> 
											</div>
										</div>
										<div class="item-input-group">
											<div class="mortage-item-input">
												<label>First Payment Date</label>
												<input type="text" id="datepicker" name="datepicker" value="February 03, 2025" class="datepicker percentage form-control"> 
											</div>
											<div class="mortage-item-input">
											</div>
										</div>
									</form>
									<div class="btn-wrp">
										<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 										<a href="/quote/"><input class="btn" type="button" name="submit" id="afd-va-submit" value="GET A QUOTE"></a>
 -->									</div>
								</div>
								<div class="affordability-tab-item " id="affordability-usda">
									<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
										<div class="original-mortgage">
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Gross Income (Monthly)</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityUSDAGrossMonthlyIncome" name="affordabilityUSDAGrossMonthlyIncome" data-type="currency" class="form-control afd-monthly-income-common-field" value="5000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<div class="tooltip-main">
														<label>Monthly Debts</label>
														<div class="toltip-wrp">
															<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
															<div class="toltip">
																<b>Monthly Debts</b>	
																<p>Monthly Debt includes the payments you make each month on auto loans, and credit cards (minimum payment) and student loans. Exclude Rent and Utilities.</p>
															</div>
														</div>
													</div>
													<div class="input-item-relative">
														<input type="text" id="affordabilityUSDAMonthlyDebts" name="affordabilityUSDAMonthlyDebts" data-type="currency" class="form-control afd-monthly-debts-common-field" value="1500" required /> 
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Home Price</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityUSDAHomePrice" name="affordabilityUSDAHomePrice" data-type="currency" class="form-control afd-home-price-common-field" value="200000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Down Payment</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityUSDADownPayment" name="affordabilityUSDADownPayment" data-type="currency" class="form-control " value="0" required /> 
														<div class="afd-down-payment-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active dollar">
																	<input type="radio" name="affordability_usda_down_payment_dollar" id="affordability_usda_down_payment_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_usda_down_payment_percent" id="affordability_usda_down_payment_percent" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Loan Amount</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityUSDALoanAmount" name="affordabilityUSDALoanAmount" data-type="currency" class="form-control " value="200000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Loan Term</label>
													<div class="input-item-relative">
														<input type="number" id="affordabilityUSDALoanTerm" name="affordabilityUSDALoanTerm" class="form-control afd-loan-term-common-field" value="30" />
														<div class="mortgage-term-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active year">
																	<input type="radio" name="affordability_usda_loan_term" id="affordability_usda_loan_term" value="year" checked> Year 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_usda_loan_term" id="affordability_usda_loan_term" value="month">Month 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Prop Tax <br />( Yearly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityUSDAPropTax" name="affordabilityUSDAPropTax" data-type="currency" class="form-control afd-prop-tax-common-field percentage" value="0.6" required /> 
														<div class="afd-prop-tax-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_usda_prop_tax_dollar" id="affordability_usda_prop_tax_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary percentage active">
																	<input type="radio" name="affordability_usda_prop_tax_percentage" id="affordability_usda_prop_tax_percentage" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Homeowners Insurance <br />( Yearly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityUSDAHomeownersInsurance" name="affordabilityUSDAHomeownersInsurance" data-type="currency" class="form-control afd-house-insurance-common-field" value="1200" required /> 
														<div class="afd-home-insurance-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active dollar">
																	<input type="radio" name="affordability_usda_home_insurance_dollar" id="affordability_usda_home_insurance_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_usda_home_insurance_percentage" id="affordability_usda_home_insurance_percentage" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Interest Rate</label>
													<div class="input-item-relative">
														<input type="number" min="0.125" step="0.125" id="affordabilityUSDAInteretRate" name="affordabilityUSDAInteretRate" class="form-control afd-interest-rate-common-field" value="5" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>HOA Dues ( Monthly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityUSDAHoaDues" name="affordabilityUSDAHoaDues" data-type="currency" class="form-control" value="0" required /> 
													</div>
												</div>
											</div>
										</div>
									</form>
									<div class="btn-wrp">
										<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 										<a href="/quote/"><input class="btn" type="button" name="submit" id="afd-usda-submit" value="GET A QUOTE"></a>
 -->									</div>
								</div>
								<div class="affordability-tab-item " id="affordability-jumbo">
									<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
										<div class="original-mortgage">
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Gross Income (Monthly)</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityJumboGrossMonthlyIncome" name="affordabilityJumboGrossMonthlyIncome" data-type="currency" class="form-control afd-monthly-income-common-field" value="5000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<div class="tooltip-main">
														<label>Monthly Debts</label>
														<div class="toltip-wrp">
															<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
															<div class="toltip">
																<b>Monthly Debts</b>	
																<p>Monthly Debt includes the payments you make each month on auto loans, and credit cards (minimum payment) and student loans. Exclude Rent and Utilities.</p>
															</div>
														</div>
													</div>
													<div class="input-item-relative">
														<input type="text" id="affordabilityJumboMonthlyDebts" name="affordabilityJumboMonthlyDebts" data-type="currency" class="form-control afd-monthly-debts-common-field" value="1500" required /> 
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Home Price</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityJumboHomePrice" name="affordabilityJumboHomePrice" data-type="currency" class="form-control afd-home-price-common-field" value="200000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Down Payment</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityJumboDownPayment" name="affordabilityJumboDownPayment" data-type="currency" class="form-control " value="0" required /> 
														<div class="afd-down-payment-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active dollar">
																	<input type="radio" name="affordability_jumbo_down_payment_dollar" id="affordability_jumbo_down_payment_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_jumbo_down_payment_percent" id="affordability_jumbo_down_payment_percent" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Loan Amount</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityJumboLoanAmount" name="affordabilityJumboLoanAmount" data-type="currency" class="form-control " value="200000" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Loan Term</label>
													<div class="input-item-relative">
														<input type="number" id="affordabilityJumboLoanTerm" name="affordabilityJumboLoanTerm" class="form-control afd-loan-term-common-field" value="30" />
														<div class="mortgage-term-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active year">
																	<input type="radio" name="affordability_jumbo_loan_term_dollar" id="affordability_jumbo_loan_term_dollar" value="year"> Year 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_jumbo_loan_term_percentage" id="affordability_jumbo_loan_term_percentage" value="month" checked="">Month 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Interest Rate</label>
													<div class="input-item-relative">
														<input type="number" min="0.125" step="0.125" id="affordabilityJumboInteretRate" name="affordabilityJumboInteretRate" class="form-control afd-interest-rate-common-field" value="5" required /> 
													</div>
												</div>
												<div class="mortage-item-input">
													<label>Prop Tax <br />( Yearly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityJumboPropTax" name="affordabilityJumboPropTax" class="form-control afd-prop-tax-common-field percentage" value="0.6" required /> 
														<div class="afd-prop-tax-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_jumbo_prop_tax_dollar" id="affordability_jumbo_prop_tax_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary percentage active">
																	<input type="radio" name="affordability_jumbo_prop_tax_percentage" id="affordability_jumbo_prop_tax_percentage" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>Homeowners Insurance <br />( Yearly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityJumboHomeownersInsurance" name="affordabilityJumboHomeownersInsurance" data-type="currency" class="form-control afd-house-insurance-common-field" value="1200" required /> 
														<div class="afd-home-insurance-type btn-group-wrp">
															<div class="btn-group">
																<label class="btn btn-primary active dollar">
																	<input type="radio" name="affordability_jumbo_home_insurance_dollar" id="affordability_jumbo_home_insurance_dollar" class="afd-input" value="dollar"> $ 
																</label>
																<label class="btn btn-primary">
																	<input type="radio" name="affordability_jumbo_home_insurance_percentage" id="affordability_jumbo_home_insurance_percentage" class="afd-input" value="percent" checked=""> % 
																</label>
															</div>
														</div>
													</div>
												</div>
												<div class="mortage-item-input">
													<label>PMI ( Yearly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityJumboPMI" name="affordabilityJumboPMI" data-type="currency" class="form-control" value="0" required /> 
													</div>
												</div>
											</div>
											<div class="item-input-group">
												<div class="mortage-item-input">
													<label>HOA Dues ( Monthly )</label>
													<div class="input-item-relative">
														<input type="text" id="affordabilityJumboHoaDues" name="affordabilityJumboHoaDues" data-type="currency" class="form-control" value="0" required /> 
													</div>
												</div>
												<div class="mortage-item-input"></div>
											</div>
										</div>
									</form>
									<div class="btn-wrp">
										<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 										<a href="/quote/"><input class="btn" type="button" name="submit" id="afd-jumbo-submit" value="GET A QUOTE"></a>
 -->									</div>
								</div>
							</div>
						</div>

						<!-- Purchase Calculator -->
						<div id="purchase-item" class="tab-content calculate-view ">
							<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
								<div class="mortage-item-input">
									<label>Home Value </label>
									<input type="text" id="mortageHomePrice" data-type="currency" name="mortageHomePrice" class="form-control" value="200000" required /> 
								</div>
								<div class="mortage-item-input">
									<label>Down Payment </label>
									<div class="input-item-relative">
										<input type="text" id="mortageDownPayment" data-type="currency" name="mortageDownPayment" class="form-control" value="0" required />
										<div class="down-payment-type btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary active dollar">
													<input type="radio" name="down_payment_dollar" id="down_payment_dollar" value="dollar"> $ 
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="down_payment_percent" id="down_payment_percent" value="percent" checked=""> % 
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="mortage-item-input">
									<label>Mortgage Amount </label>
									<input type="text" id="mortageLoanAmount" name="mortageLoanAmount" data-type="currency" class="form-control" value="200000" /> 
								</div>
								<div class="mortage-item-input">
									<label>Loan Terms </label>
									<div class="input-item-relative">
										<input type="number" id="mortageLoanTerm" name="mortageLoanTerm" class="form-control" value="30" />
										<div class="mortgage-term-type btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary active year">
													<input type="radio" name="loan_term_dollar" id="loan_term_dollar" value="year"> Year 
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="loan_term_percentage" id="loan_term_percentage" value="month" checked="">Month 
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="mortage-item-input">
									<label>Interest Rate </label>
									<input type="number" min="0.125" step="0.125" id="mortageInterestRate" name="mortageInterestRate" class="form-control" value="5"> 
								</div>
								<div class="mortage-item-input">
									<label>PMI (Yearly) </label>
									<div class="input-item-relative">
										<input type="text" id="mortagePMI" name="mortagePMI" data-type="currency" class="form-control" value="0" />
										<div class="mortgage-pmi-type btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary active dollar">
													<input type="radio" name="pmi_payment_dollar" id="pmi_payment_dollar" value="dollar"> $ 
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="pmi_payment_percent" id="pmi_payment_percent" value="percent" checked=""> % 
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="mortage-item-input">
									<label>Property Tax (Yearly)</label>
									<div class="input-item-relative">
										<input type="text" data-type="currency" value="0.6" id="mortagePropertyTax" name="mortagePropertyTax" class="percentage form-control"> 
										<div class="mortgage-property-tex-type btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary">
													<input type="radio" name="property_tax_dollar" id="property_tax_dollar" value="dollar"> $ 
												</label>
												<label class="btn btn-primary percentage active">
													<input type="radio" name="property_tax_percentage" id="property_tax_percentage" value="percent" checked=""> % 
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="mortage-item-input">
									<label>Homeowners Insurance (Yearly)</label>
									<div class="input-item-relative">
										<input type="text" data-type="currency" value="1200" id="mortageHomeownersInsurence" name="mortageHomeownersInsurence" class="form-control"> 
										<div class="mortgage-home-insurance-type btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary active dollar">
													<input type="radio" name="home_insurance_dollar" id="home_insurance_dollar" value="dollar"> $ 
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="home_insurance_percentage" id="home_insurance_percentage" value="percent" checked=""> % 
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="mortage-item-input">
									<label>HOA Dues Per Month</label>
									<input type="text" value="0" data-type="currency" id="mortageHoaDues" name="mortageHoaDues" class="form-control"> 
								</div>
								<div class="mortage-item-input">
									<label>First Payment Date</label>
									<input type="text" value="February 03, 2025" id="datepicker" name="datepicker" class="datepicker percentage form-control"> 
								</div>
								<div class="mortage-item-input">
									<label>Extra Payment Per Month</label>
									<input type="text" data-type="currency" value="0" id="mortageExtraPayment" name="mortageExtraPayment" class="form-control"> 
								</div>
								
							</form>
							<div class="btn-wrp">
								<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 								<a href="/quote/"><input class="btn" type="button" name="submit" id="mortgage-submit" value="GET A QUOTE"></a>
 -->							</div>
						</div>
						<div id="refinance-item" class="tab-content calculate-view ">
							<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
								<div class="mortage-item-input original-blank-space">
									<h4>What is most important to you? </h4>
									<div class="input-item-relative">
										<div class="btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary dollar">
													<input type="radio" name="low_monthly_payment" id="low_monthly_payment" value="true" checked="checked"> Low Monthly Payment
													<span class="checkmark"></span>
												</label>
												<label class="btn btn-primary active">
													<input type="radio" name="low_monthly_payment" id="low_intrest_payment" value="false"> Lower Interest Paid 
													<span class="checkmark"></span>
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="original-mortgage">
									<h4>Current Loan</h4>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Original Loan Amount </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Mortgage Amount</b>	
													<p>Enter the amount of the actual mortgage after down payment.</p>
												</div>
											</div>
										</div>
										<div class="input-item-relative">
											<input type="text" id="originalLoanAmount" data-type="currency" name="originalLoanAmount" min="0" max="100000000" class="form-control" value="300000" required /> 
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Original Rate </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Interest Rate</b>	
													<p>Enter the interest rate of the original Mortgage.</p>
												</div>
											</div>
										</div>
										<div class="input-item-relative">
											<input type="number" id="currentIntrestRate" name="currentIntrestRate" class="form-control" value="5" min="0.01" max="50" required />
										</div>
									</div>
									<div class="mortage-item-input rf-loan-items">
										<div class="tooltip-main">
											<label>Original Loan Term </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Loan Term</b>	
													<p>Enter the number of years of your original Mortgage.</p>
												</div>
											</div>
										</div>
										
										<div class="input-item-relative">
											<input type="number" id="originalLoanTerm" name="originalLoanTerm" class="form-control" value="30" />
											<div class="rf-loan-term btn-group-wrp">
												<div class="btn-group">
													<label class="btn btn-primary active year">
														<input type="radio" name="loan_term_val" id="loan_term_dollar" value="year"> Year 
													</label>
													<label class="btn btn-primary">
														<input type="radio" name="loan_term_val" id="loan_term_percentage" value="month" checked="">Month 
													</label>
												</div>
											</div>
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Loan Start Date </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Mortgage Start Date</b>	
													<p>Choose the month and year your original mortgage started.</p>
												</div>
											</div>
										</div>
										<input type="text" value="March 2022" id="rent-datepicker" data-name="refinance-calc" name="datepicker" class="datepicker month-year-datepicker loan-start-date form-control"> 
									</div>
								</div>
								<div class="original-mortgage">
									<h4>New Loan</h4>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Current Loan Balance </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Mortgage Amount</b>	
													<p>Enter your current mortgage balance.</p>
												</div>
											</div>
										</div>
										<div class="input-item-relative">
											<input type="text" id="currentLoanBalance" data-type="currency" min="0" max="100000000" name="currentLoanBalance" class="form-control" value="250000" required /> 
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Cash Out Amount </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Cash Out Amount</b>	
													<p>Enter the amount of Cash Out you are taking on your new mortgage.</p>
												</div>
											</div>
										</div>
										<input type="text" id="cashOutAmount" data-type="currency" name="cashOutAmount" min="0" max="100000000" class="form-control" value="10000" required /> 
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Refinance Costs </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Refinancce Costs</b>	
													<p>Enter the amount of fixed refinance costs (Points/Fees).</p>
												</div>
											</div>
										</div>
										<input type="text" id="refinanceFees" data-type="currency" min="0" max="100000000" name="refinanceFees" class="form-control" value="1000" required /> 
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>New Loan Amount </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>New Loan Amount</b>	
													<p>The new loan amount after cash out and refinance costs.</p>
												</div>
											</div>
										</div>
										<div class="input-item-relative">
											<input type="text" id="newLoanAmount" data-type="currency" name="newLoanAmount" class="form-control" value="250000" readonly required /> 
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>New Rate </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Interest Rate</b>	
													<p>Enter the current Market Rate.</p>
												</div>
											</div>
										</div>
										
										<input type="number" id="newIntrestRate" name="newIntrestRate" class="form-control" value="3" min="0.01" max="50"> 
									</div>
									<div class="mortage-item-input rf-loan-items">
										<div class="tooltip-main">
											<label>New Loan Term </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Loan Term</b>	
													<p>Enter the number of years of the Mortgage.</p>
												</div>
											</div>
										</div>
										
										<div class="input-item-relative">
											<input type="number" id="newLoanTerm" name="newLoanTerm" class="form-control" value="15" />
											<div class="rf-loan-term btn-group-wrp">
												<div class="btn-group">
													<label class="btn btn-primary active year">
														<input type="radio" name="new_term_val" id="new_term_dollar" value="year"> Year 
													</label>
													<label class="btn btn-primary">
														<input type="radio" name="new_term_val" id="new_term_percentage" value="month" checked="">Month 
													</label>
												</div>
											</div>
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>New Loan Start Date </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Mortgage Start Date</b>	
													<p>Choose the month and year the new mortgage will start.</p>
												</div>
											</div>
										</div>
										
										<input type="text" value="February 2025" id="rent-loan-start-datepicker" data-name="refinance-calc" name="datepicker" class="datepicker month-year-datepicker new-loan-start-date form-control"> 
									</div>
									<div class="mortage-item-input original-blank-space">
										<div class="tooltip-main">
											<label>Paying Refinance Costs </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Include Refinance Costs</b>	
													<p>Will Refinance costs be included in the new loan?</p>
												</div>
											</div>
										</div>
										
										<div class="input-item-relative">
											<div class="btn-group-wrp">
												<div class="btn-group">
													<label class="btn btn-primary dollar">
														<input type="radio" name="paying_refinance_cost" id="paying_refinance_cost" value="true"> Include In Loan
														<span class="checkmark"></span>
													</label>
													<label class="btn btn-primary active">
														<input type="radio" name="paying_refinance_cost" id="paying_refinance_cost" value="false" checked="checked"> Pay Out of Pocket 
														<span class="checkmark"></span>
													</label>
												</div>
											</div>
										</div>
									</div>
								</div>
							</form>
							<div class="btn-wrp">
								<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 								<a href="/quote/"><input class="btn" type="button" name="submit" id="va-submit" value="GET A QUOTE"></a>
 -->							</div>
						</div>
						<div id="rent-buy-item" class="tab-content calculate-view ">
							<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
								<div class="original-mortgage mortage-information-wrapper rent-buy-list-item">
									<h4 class="active rent-buy-list-title"><span class="title-check-mark"><img src="${baseUrlWebsite}images/check-mark.svg" alt="information" width="20" height="20"/></span>Mortgage Information</h4>
									<div class="mortage-information-section">
										<div class="mortage-information">
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Home Price </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Home Price</b>	
															<p>Enter the amount of the home's value.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="text" id="rentHomePrice" data-type="currency" name="rentHomePrice" class="form-control" min="0" max="100000000" value="500000" required /> 
												</div>
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Down Payment </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Down Payment</b>	
															<p>Enter the amount or percentage of the down payment.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="text" id="rentBuyDownPayment" data-type="currency" name="rentBuyDownPayment" class="form-control" min="0" max="100000000" value="50000" required />
													<div class="buy-down-payment-type btn-group-wrp">
														<div class="btn-group">
															<label class="btn btn-primary active dollar">
																<input type="radio" name="rent_down_payment_dollar" id="rent_down_payment_dollar" value="dollar"> $ 
															</label>
															<label class="btn btn-primary percent">
																<input type="radio" name="rent_down_payment_percent" id="rent_down_payment_percent" value="percent" checked=""> % 
															</label>
														</div>
													</div>
												</div>
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Loan Amount </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Mortgage Amount</b>	
															<p>Enter the amount of the actual mortgage after down payment.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="text" id="rentLoanPayment" data-type="currency" name="rentLoanPayment" class="form-control" min="0" max="100000000" value="450000" required readonly /> 
												</div>
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Interest Rate </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Interest Rate</b>	
															<p>Enter the current Market Rate.</p>
														</div>
													</div>
												</div>
												<input type="number" id="rentCurrentInterestRate" name="rentCurrentInterestRate" class="form-control" min="0.01" max="50" value="7.5"> 
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Loan Term </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Loan Term</b>	
															<p>Choose the number of years of the Mortgage.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="number" id="rentNewLoanTerm" name="rentNewLoanTerm" class="form-control" min="1" max="50" value="30" />
													<div class="mortgage-term-type btn-group-wrp">
														<div class="btn-group">
															<label class="btn btn-primary active year">
																<input type="radio" name="rent_new_term_val" id="rent_new_term_dollar" value="year"> Year 
															</label>
															<label class="btn btn-primary">
																<input type="radio" name="rent_new_term_val" id="rent_new_term_percentage" value="month" checked="">Month 
															</label>
														</div>
													</div>
												</div>
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Start Date </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Mortgage Start Date</b>	
															<p>Choose the month and year the mortgage will start.</p>
														</div>
													</div>
												</div>
												<input type="text" value="March 2020" id="rent-datepicker" data-name="rent-vs-buy-calc" name="datepicker" class="datepicker month-year-datepicker buy-loan-start-date form-control"> 
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>PMI (Yearly) </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>PMI Rate</b>	
															<p>Private Mortgage Insurance (PMI) protects the lender from losing money if you default on the loan. Most mortgages with a down payment of less than 20% require PMI. his is an estimate based on the details above.  PMI can vary significantly based on several factors.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="number" id="rentBuyPMI" name="rentBuyPMI" class="form-control" min="0" max="2.50" value="0"> 
												</div>
											</div>
										</div>
										<div class="optional-information">
											<h4>Optional Information</h4>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Home Insurance </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Home Insurance</b>	
															<p>Enter the annual amount of insurance.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="text" id="rentHomeInsurance" data-type="currency" name="rentHomeInsurance" class="form-control" min="0" max="100000" value="1500" required /> 
												</div>
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Taxes </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Annual Tax Amount</b>	
															<p>Enter the annual tax amount.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="text" id="rentTaxes" data-type="currency" name="rentTaxes" class="form-control" min="0" max="1000000" value="6000" required /> 
												</div>
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>HOA Dues </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>HOA Dues</b>	
															<p>Enter the annual HOA dues.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="text" id="rentHoaDues" data-type="currency" name="rentHoaDues" class="form-control" min="0" max="100000" value="600" required /> 
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="original-mortgage buying-assumptions-wrapper rent-buy-list-item">
									<h4 class="rent-buy-list-title"><span class="title-check-mark"><img src="${baseUrlWebsite}images/check-mark.svg" alt="information" width="20" height="20"/></span>Buying Assumptions</h4>
									<div class="buying-assumptions-section" style="display:none">
										<div class="buying-assumptions">
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Marginal Tax Bracket </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Tax Bracket</b>	
															<p>Enter your Marginal Tax Bracket.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="text" id="marginalTaxBracket" name="marginalTaxBracket" class="form-control" min="1" max="50" value="25" required /> 
												</div>
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Annual Costs </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Annual Costs</b>	
															<p>Enter the % of home value expected in costs per year.</p>
														</div>
													</div>
												</div>
												<input type="number" id="rentAnnualCosts" name="rentAnnualCosts" class="form-control" min="0.01" max="50" value="1.00"> 
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Selling Costs </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Closing Costs</b>	
															<p>Enter an estimated closing costs %.</p>
														</div>
													</div>
												</div>
												<input type="number" id="rentSellingCosts" name="rentSellingCosts" class="form-control" min="0" max="50" value="6.00"> 
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Annual Appreciation </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Annual Appreciation</b>	
															<p>Enter an estimated annual appreciation %.</p>
														</div>
													</div>
												</div>
												<input type="number" id="annualAppreciation" name="annualAppreciation" class="form-control" min="0.01" max="50" value="3.00"> 
											</div>
										</div>
									</div>
								</div>
								<div class="original-mortgage renting-assumptions-wrapper rent-buy-list-item">
									<h4 class="rent-buy-list-title"><span class="title-check-mark"><img src="${baseUrlWebsite}images/check-mark.svg" alt="information" width="20" height="20"/></span>Renting Assumptions</h4>
									<div class="renting-assumptions-section" style="display:none">
										<div class="renting-assumptions">
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Monthly Rent </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Monthly Rent</b>	
															<p>Enter the monthly rent amount.</p>
														</div>
													</div>
												</div>
												<div class="input-item-relative">
													<input type="text" id="rentMonthlyAmount" data-type="currency" name="rentMonthlyAmount" class="form-control" min="0" max="100000000" value="2000" required /> 
												</div>
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Renters Insurance </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Renters Insurance</b>	
															<p>Enter an estimated annual renters insurance %.</p>
														</div>
													</div>
												</div>
												<input type="number" id="rentersInsurance" name="rentersInsurance" class="form-control" min="0" max="50" value="1.30"> 
											</div>
											<div class="mortage-item-input">
												<div class="tooltip-main">
													<label>Rent Appreciation </label>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
														<div class="toltip">
															<b>Rent Appreciation</b>	
															<p>Enter an estimated annual rent appreciation %.</p>
														</div>
													</div>
												</div>
												<input type="number" id="rentAppreciation" name="rentAppreciation" class="form-control" min="0.01" max="50" value="2.00"> 
											</div>
										</div>
									</div>
								</div>
							</form>
							<div class="btn-wrp">
								<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 								<a href="/quote/"><input class="btn" type="button" name="submit" id="rent-submit" value="GET A QUOTE"></a>
 -->							</div>
						</div>
						<div id="veteran-affairs" class="tab-content calculate-view ">
							<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
								<div class="veteran-affairs-item-input">
									<label>Home Value </label>
									<input type="text" id="VAHomePrice" data-type="currency" name="VAHomePrice" class="form-control" value="200000" required /> 
								</div>
								<div class="veteran-affairs-item-input">
									<label>Down Payment </label>
									<div class="input-item-relative">
										<input type="text" id="VADownPayment" data-type="currency" name="VADownPayment" class="form-control" value="0" required />
										<div class="down-payment-type btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary active dollar">
													<input type="radio" name="down_payment_dollar" id="down_payment_dollar" value="dollar"> $ 
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="down_payment_percent" id="down_payment_percent" value="percent" checked=""> % 
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="veteran-affairs-item-input">
									<label>Base Mortgage Amount</label>
									<input type="text" id="VAMortageAmount" name="VAMortageAmount" data-type="currency" class="form-control" value="200000" /> 
								</div>
								<div class="veteran-affairs-item-input">
									<label>Loan Terms </label>
									<div class="input-item-relative">
										<input type="number" id="VALoanTerm" name="VALoanTerm" class="form-control" value="30" />
										<div class="mortgage-term-type btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary active year">
													<input type="radio" name="loan_term_dollar" id="loan_term_dollar" value="year"> Year 
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="loan_term_percentage" id="loan_term_percentage" value="month" checked="">Month 
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="veteran-affairs-item-input">
									<label>Payment Frequency </label>
									<div class="input-item-relative payment-frequency">
										<div class="blank-space"></div>
										<div class="btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary">
													<input type="radio" name="va_payment_frequency" id="va_payment_frequency_year" value="Year"> Year 
												</label>
												<label class="btn btn-primary active">
													<input type="radio" name="va_payment_frequency" id="va_payment_frequency_month" value="Month" checked=""> Month
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="veteran-affairs-item-input">
									<label>Interest Rate </label>
									<input type="number" id="VAInterestRate" name="VAInterestRate" class="form-control" value="5"> 
								</div>
								<div class="veteran-affairs-item-input">
									<label>This is my...</label>
									<select name="vaFundingFeeOptions" id="vaFundingFeeOptions">
										<option value="first_use" selected>First Time Use of a VA Loan</option>
										<option value="after_first_use">I have used a VA loan before</option>
										<option value="exempt_va_funding_fee">I am exempt from the VA funding fee</option>
									</select>
								</div>
								<div class="veteran-affairs-item-input">
									<label>VA Funding Fee </label>
									<div class="input-item-relative">
										<input type="number" id="VAFundingFee" name="VAFundingFee" class="form-control" value="2.15" disabled />
									</div>
								</div>
								<div class="veteran-affairs-item-input">
									<label>Final Mortgage Amount </label>
									<input type="text" data-type="currency" id="finalMortageLoanAmount" name="finalMortageLoanAmount" value="" class="form-control" disabled> 
								</div>
								<div class="veteran-affairs-item-input">
									<label>Property Tax (Yearly)</label>
									<div class="input-item-relative">
										<input type="text" data-type="currency" id="VAPropertyTax" name="VAPropertyTax" value="0.6" class="percentage form-control"> 
										<div class="mortgage-property-tex-type btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary">
													<input type="radio" name="property_tax_dollar" id="property_tax_dollar" value="dollar"> $ 
												</label>
												<label class="btn btn-primary percentage active">
													<input type="radio" name="property_tax_percentage" id="property_tax_percentage" value="percent" checked=""> % 
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="veteran-affairs-item-input">
									<label>Homeowners Insurance (Yearly)</label>
									<div class="input-item-relative">
										<input type="text" data-type="currency" id="VAHomeInsurence" name="VAHomeInsurence" value="1200" class="form-control"> 
										<div class="mortgage-home-insurance-type btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary active dollar">
													<input type="radio" name="home_insurance_dollar" id="home_insurance_dollar" value="dollar"> $ 
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="home_insurance_percentage" id="home_insurance_percentage" value="percent" checked=""> % 
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="veteran-affairs-item-input">
									<label>HOA Dues Per Month</label>
									<input type="text" data-type="currency" id="VAHoaDues" name="VAHoaDues" value="0" class="form-control"> 
								</div>
								<div class="veteran-affairs-item-input">
									<label>First Payment Date</label>
									<input type="text" id="datepicker" name="datepicker" value="February 03, 2025" class="datepicker percentage form-control"> 
								</div>
								<div class="veteran-affairs-item-input">
									<label>Extra Payment Per Month</label>
									<input type="text" data-type="currency" id="VAExtraPayment" name="VAExtraPayment" value="0" class="form-control"> 
								</div>	
							</form>
							<div class="btn-wrp">
								<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 								<a href="/quote/"><input class="btn" type="button" name="submit" id="va-submit" value="GET A QUOTE"></a>
 -->							</div>
						</div>
						<div id="va-refinance" class="tab-content calculate-view ">
							<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
								<div class="mortage-item-input original-blank-space">
									<h4>What is most important to you? </h4>
									<div class="input-item-relative">
										<div class="btn-group-wrp">
											<div class="btn-group">
												<label class="btn btn-primary dollar">
													<input type="radio" name="low_monthly_payment" id="low_monthly_payment" value="true" checked="checked"> Low Monthly Payment
													<span class="checkmark"></span>
												</label>
												<label class="btn btn-primary active">
													<input type="radio" name="low_monthly_payment" id="low_intrest_payment" value="false"> Lower Interest Paid 
													<span class="checkmark"></span>
												</label>
											</div>
										</div>
									</div>
								</div>
								<div class="original-mortgage">
									<h4>Current Loan</h4>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Original Loan Amount </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Mortgage Amount</b>	
													<p>Enter the amount of the actual mortgage after down payment.</p>
												</div>
											</div>
										</div>
										<div class="input-item-relative">
											<input type="text" id="VARefinanceOriginalLoanAmount" data-type="currency" name="VARefinanceOriginalLoanAmount" min="0" max="100000000" class="form-control" value="300000" required /> 
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Original Rate </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Interest Rate</b>	
													<p>Enter the interest rate of the original Mortgage.</p>
												</div>
											</div>
										</div>
										<div class="input-item-relative">
											<input type="number" id="VARefinanceCurrentInterestRate" name="VARefinanceCurrentInterestRate" class="form-control" value="5" min="0.01" max="50" required />
										</div>
									</div>
									<div class="mortage-item-input rf-loan-items">
										<div class="tooltip-main">
											<label>Original Loan Term </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Loan Term</b>	
													<p>Enter the number of years of your original Mortgage.</p>
												</div>
											</div>
										</div>
										
										<div class="input-item-relative">
											<input type="number" id="VARefinanceOriginalLoanTerm" name="VARefinanceOriginalLoanTerm" class="form-control" value="30" />
											<div class="rf-loan-term btn-group-wrp">
												<div class="btn-group">
													<label class="btn btn-primary active year">
														<input type="radio" name="loan_term_val" id="loan_term_dollar" value="year"> Year 
													</label>
													<label class="btn btn-primary">
														<input type="radio" name="loan_term_val" id="loan_term_percentage" value="month" checked="">Month 
													</label>
												</div>
											</div>
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Loan Start Date </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Mortgage Start Date</b>	
													<p>Choose the month and year your original mortgage started.</p>
												</div>
											</div>
										</div>
										<input type="text" value="March 2022" id="rent-datepicker" data-name="va-refinance-calc" name="datepicker" class="datepicker month-year-datepicker loan-start-date form-control"> 
									</div>
								</div>
								<div class="original-mortgage">
									<h4>New Loan</h4>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Current Loan Balance </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Mortgage Amount</b>	
													<p>Enter your current mortgage balance.</p>
												</div>
											</div>
										</div>
										<div class="input-item-relative">
											<input type="text" id="VARefinanceCurrentLoanBalance" data-type="currency" min="0" max="100000000" name="VARefinanceCurrentLoanBalance" class="form-control" value="250000" required /> 
										</div>
									</div>
									<div class="mortage-item-input">
										<label>VA Refinance Purpose</label>
										<select name="vaRefinancePurposeOptions" id="vaRefinancePurposeOptions">
											<option value="cash_out_refinance" selected>Cash Out Refinance</option>
											<option value="interest_rate_reduction">Interest Rate Reduction (IRRL)</option>
										</select>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Cash Out Amount </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Cash Out Amount</b>	
													<p>Enter the amount of Cash Out you are taking on your new mortgage.</p>
												</div>
											</div>
										</div>
										<input type="text" id="VARefinanceCashOutAmount" data-type="currency" name="VARefinanceCashOutAmount" min="0" max="100000000" class="form-control" value="10000" required /> 
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Refinance Costs </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Refinancce Costs</b>	
													<p>Enter the amount of fixed refinance costs (Points/Fees).</p>
												</div>
											</div>
										</div>
										<input type="text" id="VARefinanceRefinanceFees" data-type="currency" min="0" max="100000000" name="VARefinanceRefinanceFees" class="form-control" value="1000" required /> 
									</div>
									<div class="mortage-item-input">
										<label>This is my...</label>
										<select name="vaRefinanceFundingFeeOptions" id="vaRefinanceFundingFeeOptions">
											<option value="first_use" selected>First Time Use of a VA Loan</option>
											<option value="after_first_use">I have used a VA loan before</option>
											<option value="exempt_va_funding_fee">I am exempt from the VA funding fee</option>
										</select>
									</div>
									<div class="mortage-item-input">
										<label>VA Funding Fee </label>
										<div class="input-item-relative">
											<input type="number" id="VARefinanceFundingFee" name="VARefinanceFundingFee" class="form-control" value="2.15" disabled />
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>New Loan Amount </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>New Loan Amount</b>	
													<p>The new loan amount after cash out and refinance costs.</p>
												</div>
											</div>
										</div>
										<div class="input-item-relative">
											<input type="text" id="VARefinanceNewLoanAmount" data-type="currency" name="VARefinanceNewLoanAmount" class="form-control" value="250000" readonly required /> 
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>New Rate </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Interest Rate</b>	
													<p>Enter the current Market Rate.</p>
												</div>
											</div>
										</div>
										
										<input type="number" id="VARefinanceNewInterestRate" name="VARefinanceNewInterestRate" class="form-control" value="3" min="0.01" max="50"> 
									</div>
									<div class="mortage-item-input rf-loan-items">
										<div class="tooltip-main">
											<label>New Loan Term </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Loan Term</b>	
													<p>Enter the number of years of the Mortgage.</p>
												</div>
											</div>
										</div>
										
										<div class="input-item-relative">
											<input type="number" id="VARefinanceNewLoanTerm" name="VARefinanceNewLoanTerm" class="form-control" value="15" />
											<div class="rf-loan-term btn-group-wrp">
												<div class="btn-group">
													<label class="btn btn-primary active year">
														<input type="radio" name="new_term_val" id="new_term_dollar" value="year"> Year 
													</label>
													<label class="btn btn-primary">
														<input type="radio" name="new_term_val" id="new_term_percentage" value="month" checked="">Month 
													</label>
												</div>
											</div>
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>New Loan Start Date </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Mortgage Start Date</b>	
													<p>Choose the month and year the new mortgage will start.</p>
												</div>
											</div>
										</div>
										
										<input type="text" value="February 2025" id="rent-loan-start-datepicker" data-name="va-refinance-calc" name="datepicker" class="datepicker month-year-datepicker new-loan-start-date form-control"> 
									</div>
									<div class="mortage-item-input original-blank-space">
										<div class="tooltip-main">
											<label>Paying Refinance Costs </label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Include Refinance Costs</b>	
													<p>Will Refinance costs be included in the new loan?</p>
												</div>
											</div>
										</div>
										
										<div class="input-item-relative">
											<div class="btn-group-wrp">
												<div class="btn-group">
													<label class="btn btn-primary dollar">
														<input type="radio" name="paying_refinance_cost" id="paying_refinance_cost" value="true"> Include In Loan
														<span class="checkmark"></span>
													</label>
													<label class="btn btn-primary active">
														<input type="radio" name="paying_refinance_cost" id="paying_refinance_cost" value="false" checked="checked"> Pay Out of Pocket 
														<span class="checkmark"></span>
													</label>
												</div>
											</div>
										</div>
									</div>
								</div>
							</form>
							<div class="btn-wrp">
								<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 								<a href="/quote/"><input class="btn" type="button" name="submit" id="va-submit" value="GET A QUOTE"></a>
 -->							</div>
						</div>
						<!-- Rental Loan Calculator -->
						<div id="rental-loan" class="tab-content calculate-view ">
							<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
								<div class="original-mortgage">
									<input type="hidden" id="rlEnablePropertyAddress" name="rlEnablePropertyAddress" value="0" /> 
																			<div class="item-input-group">
											<div class="mortage-item-input">
												<label>Number of Units</label>
												<select name="RentalLoanNoOfUnits" id="RentalLoanNoOfUnits">
													<option value="1" selected>1</option>
													<option value="2" >2</option>
													<option value="3" >3</option>
													<option value="4">4</option>
												</select>
											</div>
											<div class="mortage-item-input">
											</div>
										</div>
																			<div class="item-input-group">
										<div class="mortage-item-input">
											<label>Purchase or Refinance</label>
											<div class="input-item-relative purchase-or-refinance">
												<div class="blank-space"></div>
												<div class="btn-group-wrp">
													<div class="btn-group">
														<label class="btn btn-primary">
															<input type="radio" name="rental_loan_por" id="rental_loan_por_purchase" value="purchase"> Purchase 
														</label>
														<label class="btn btn-primary active">
															<input type="radio" name="rental_loan_por" id="rental_loan_por_refinance" value="refinance" checked=""> Refinance
														</label>
													</div>
												</div>
											</div>
										</div>
										<div class="mortage-item-input">
											<div class="tooltip-main">
												<label>Property Value or Purchase Price</label>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Property Value or Purchase Price</b>	
														<p>Enter the property Value or purchase Price.</p>
													</div>
												</div>
											</div>
											<div class="input-item-relative">
												<input type="text" id="RentalLoanPropertyValuePurchasePrice" name="RentalLoanPropertyValue" data-type="currency" class="form-control" value="500000" required /> 
											</div>
										</div>
									</div>
									<div class="item-input-group">
										<div class="mortage-item-input">
											<div class="tooltip-main">
												<label>Unit 1 Monthly Rent</label>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Unit 1 Monthly Rent</b>	
														<p>Enter the Unit 1 Monthly Rent.</p>
													</div>
												</div>
											</div>
											<div class="input-item-relative">
												<input type="text" id="RentalLoanUnit1MonthlyRent" name="RentalLoanUnit1MonthlyRent" data-type="currency" class="form-control" value="2500"  required /> 
											</div>
										</div>
										<div class="mortage-item-input">
											<div class="tooltip-main">
												<label>Annual Property Taxes</label>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Annual Property Taxes</b>	
														<p>Enter the Annual Property Taxes.</p>
													</div>
												</div>
											</div>
											<div class="input-item-relative">
												<input type="text" id="RentalLoanAnnualPropertyTaxes" name="RentalLoanAnnualPropertyTaxes" data-type="currency" class="form-control" value="4000" required /> 
											</div>
										</div>
									</div>
									<div class="item-input-group">
										<div class="mortage-item-input">
											<div class="tooltip-main">
												<label>Annual Insurance</label>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Annual Insurance</b>	
														<p>Enter the Annual Insurance.</p>
													</div>
												</div>
											</div>
											<div class="input-item-relative">
												<input type="text" id="RentalLoanAnnualInsurance" name="RentalLoanAnnualInsurance" data-type="currency" class="form-control" value="3000" required /> 
											</div>
										</div>
										<div class="mortage-item-input">
											<div class="tooltip-main">
												<label>Monthly HOA Fee</label>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Monthly HOA Fee</b>	
														<p>Enter the Monthly HOA Fee.</p>
													</div>
												</div>
											</div>
											<div class="input-item-relative">
												<input type="text" id="RentalLoanMonthlyHOAFee" name="RentalLoanMonthlyHOAFee" data-type="currency" class="form-control" value="0" required /> 
											</div>
										</div>
									</div>
									<div class="item-input-group">
										<div class="mortage-item-input">
											<label>Vacancy Rate</label>
											<select name="RentalLoanVacancyRate" id="RentalLoanVacancyRate">
												<option value="3" >3%</option>
												<option value="4" >4%</option>
												<option value="5" selected>5%</option>
												<option value="6" >6%</option>
												<option value="7" >7%</option>
												<option value="8" >8%</option>
												<option value="9" >9%</option>
												<option value="10" >10%</option>
												<option value="11" >11%</option>
												<option value="12" >12%</option>
												<option value="13" >13%</option>
												<option value="14" >14%</option>
												<option value="15" >15%</option>
												<option value="16" >16%</option>
												<option value="17" >17%</option>
												<option value="18" >18%</option>
												<option value="19" >19%</option>
												<option value="20" >20%</option>
											</select>
										</div>
										<div class="mortage-item-input">
											<label>Annual Repairs & Maintenance</label>
											<select name="RentalLoanAnnualRepairsMaintenance" id="RentalLoanAnnualRepairsMaintenance">
												<option value="300" >$300.00</option>
												<option value="400" >$400.00</option>
												<option value="500" selected>$500.00</option>
												<option value="600" >$600.00</option>
												<option value="700" >$700.00</option>
												<option value="800" >$800.00</option>
												<option value="900" >$900.00</option>
												<option value="1000" >$1000.00</option>
											</select>
										</div>
									</div>
									<div class="item-input-group">
										<div class="mortage-item-input">
											<div class="tooltip-main">
												<label>Annual Utilities</label>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Annual Utilities</b>	
														<p>Enter the Annual Utilities.</p>
													</div>
												</div>
											</div>
											<div class="input-item-relative">
												<input type="text" id="RentalLoanAnnualUtilities" name="RentalLoanAnnualUtilities" data-type="currency" class="form-control" value="5000" required /> 
											</div>
										</div>
										<div class="mortage-item-input">
											<label>Loan to Value</label>
											<select name="RentalLoanLoanToValue" id="RentalLoanLoanToValue">
												<option value="0" >0%</option>
												<option value="5" >5%</option>
												<option value="10" >10%</option>
												<option value="15" >15%</option>
												<option value="20" >20%</option>
												<option value="25" >25%</option>
												<option value="30" >30%</option>
												<option value="35" >35%</option>
												<option value="40" >40%</option>
												<option value="45" >45%</option>
												<option value="50" >50%</option>
												<option value="55" >55%</option>
												<option value="60" >60%</option>
												<option value="65" >65%</option>
												<option value="70" >70%</option>
												<option value="75" >75%</option>
												<option value="80" selected>80%</option>
											</select>
										</div>
									</div>
									<div class="item-input-group">
										<div class="mortage-item-input">
											<label>Interest Rate</label>
											<select name="RentalLoanInterestRate" id="RentalLoanInterestRate">
												<option value="6.000" >6.000%</option>
												<option value="6.125" >6.125%</option>
												<option value="6.250" >6.250%</option>
												<option value="6.375" >6.375%</option>
												<option value="6.500" >6.500%</option>
												<option value="6.625" >6.625%</option>
												<option value="6.750" >6.750%</option>
												<option value="6.875" >6.875%</option>
												<option value="7.000" >7.000%</option>
												<option value="7.125" >7.125%</option>
												<option value="7.250" >7.250%</option>
												<option value="7.375" >7.375%</option>
												<option value="7.500" >7.500%</option>
												<option value="7.625" >7.625%</option>
												<option value="7.750" >7.750%</option>
												<option value="7.875" >7.875%</option>
												<option value="8.000" selected>8.000%</option>
												<option value="8.125" >8.125%</option>
												<option value="8.250" >8.250%</option>
												<option value="8.375" >8.375%</option>
												<option value="8.500" >8.500%</option>
												<option value="8.625" >8.625%</option>
												<option value="8.750" >8.750%</option>
												<option value="8.875" >8.875%</option>
												<option value="9.000" >9.000%</option>
											</select>
										</div>
										<div class="mortage-item-input">
											<label>Origination Fee</label>
											<select name="RentalLoanOriginationFee" id="RentalLoanOriginationFee">
												<option value="0.00" >0.00%</option>
												<option value="0.25" >0.25%</option>
												<option value="0.50" >0.50%</option>
												<option value="0.75" >0.75%</option>
												<option value="1.00" >1.00%</option>
												<option value="1.25" >1.25%</option>
												<option value="1.50" >1.50%</option>
												<option value="1.75" >1.75%</option>
												<option value="2.00" selected>2.00%</option>
												<option value="2.25" >2.25%</option>
												<option value="2.50" >2.50%</option>
												<option value="2.75" >2.75%</option>
												<option value="3.00" >3.00%</option>
											</select>
										</div>
									</div>
									<div class="mortage-item-input">
										<div class="tooltip-main">
											<label>Closing Costs</label>
											<div class="toltip-wrp">
												<img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information_icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information_icon.svg" alt="information" width="20" height="20"/></noscript>
												<div class="toltip">
													<b>Closing Costs</b>	
													<p>Enter the Closing Costs.</p>
												</div>
											</div>
										</div>
										<div class="input-item-relative">
											<input type="text" id="RentalLoanClosingCosts" name="RentalLoanClosingCosts" data-type="currency" value="6500" class="form-control" required /> 
										</div>
									</div>

								</div>
							</form>
							<div class="btn-wrp">
								<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
<!-- 								<a href="/quote/"><input class="btn" type="button" name="submit" id="va-submit" value="GET A QUOTE"></a>
 -->							</div>
						</div>
						<!-- Fix and Flip Calculator -->
						<div id="fix-and-flip" class="tab-content calculate-view ">
							<form method="post" class="calulate-form-item" data-mcs-theme="rounded-dots">
								<div class="original-mortgage">
									<input type="hidden" id="ffEnablePropertyAddress" name="ffEnablePropertyAddress" value="0" /> 
																		<div class="item-input-group">
										<div class="mortage-item-input">
											<label>Purchase Price</label>
											<div class="input-item-relative">
												<input type="text" id="FixAndFlipPurchasePrice" name="FixAndFlipPurchasePrice" data-type="currency" class="form-control" value="500000" required /> 
											</div>
										</div>
										<div class="mortage-item-input">
											<div class="tooltip-main">
												<label>Renovation Cost</label>
											</div>
											<div class="input-item-relative">
												<input type="text" id="FixAndFlipRenovationCost" name="FixAndFlipRenovationCost" data-type="currency" class="form-control" value="75000" required /> 
											</div>
										</div>
									</div>
									<div class="item-input-group">
										<div class="mortage-item-input">
											<label>After Repaired Value</label>
											<div class="input-item-relative">
												<input type="text" id="FixAndFlipAfterRepairedValue" name="FixAndFlipAfterRepairedValue" data-type="currency" class="form-control" value="750000" required /> 
											</div>
										</div>
										<div class="mortage-item-input">
											<div class="tooltip-main">
												<label>Length of Loan</label>
											</div>
											<div class="input-item-relative">
												<select name="FixAndFlipLengthOfLoan" id="FixAndFlipLengthOfLoan">
													<option value="1" >1 Month</option>
													<option value="2" >2 Months</option>
													<option value="3" >3 Months</option>
													<option value="4" >4 Months</option>
													<option value="5" >5 Months</option>
													<option value="6" >6 Months</option>
													<option value="7" >7 Months</option>
													<option value="8" >8 Months</option>
													<option value="9" selected>9 Months</option>
													<option value="10" >10 Months</option>
													<option value="11" >11 Months</option>
													<option value="12" >12 Months</option>
													<option value="13" >13 Months</option>
													<option value="14" >14 Months</option>
													<option value="15" >15 Months</option>
													<option value="16" >16 Months</option>
													<option value="17" >17 Months</option>
													<option value="18" >18 Months</option>
												</select>
											</div>
										</div>
									</div>
									<div class="item-input-group">
										<div class="mortage-item-input">
											<label>Annual Property Taxes</label>
											<div class="input-item-relative">
												<input type="text" id="FixAndFlipAnnualPropertyTaxes" name="FixAndFlipAnnualPropertyTaxes" data-type="currency" class="form-control" value="4000" required /> 
											</div>
										</div>
										<div class="mortage-item-input">
											<div class="tooltip-main">
												<label>Annual Insurance</label>
											</div>
											<div class="input-item-relative">
												<input type="text" id="FixAndFlipAnnualInsurance" name="FixAndFlipAnnualInsurance" data-type="currency" class="form-control" value="3000" required /> 
											</div>
										</div>
									</div>
									<div class="item-input-group">
										<div class="mortage-item-input">
											<label>Purchase Price LTV</label>
											<div class="input-item-relative">
												<select name="FixAndFlipPurchasePriceLTV" id="FixAndFlipPurchasePriceLTV">
													<option value="90" >90% (Experienced Only)</option>
													<option value="85" >85% (Experienced Only)</option>
													<option value="80" selected>80%</option>
													<option value="75" >75%</option>
													<option value="70" >70%</option>
													<option value="65" >65%</option>
												</select>
											</div>
										</div>
										<div class="mortage-item-input">
											<div class="tooltip-main">
												<label>Intrest Rate</label>
											</div>
											<div class="input-item-relative">
												<select name="FixAndFlipIntrestRate" id="FixAndFlipIntrestRate">
													<option value="9.000" >9.000%</option>
													<option value="9.125" >9.125%</option>
													<option value="9.250" >9.250%</option>
													<option value="9.375" >9.375%</option>
													<option value="9.500" >9.500%</option>
													<option value="9.625" >9.625%</option>
													<option value="9.750" >9.750%</option>
													<option value="9.875" >9.875%</option>
													<option value="10.000" selected>10.000%</option>
													<option value="10.125" >10.125%</option>
													<option value="10.250" >10.250%</option>
													<option value="10.375" >10.375%</option>
													<option value="10.500" >10.500%</option>
													<option value="10.625" >10.625%</option>
													<option value="10.750" >10.750%</option>
													<option value="10.875" >10.875%</option>
													<option value="11.000" >11.000%</option>
													<option value="11.125" >11.125%</option>
													<option value="11.250" >11.250%</option>
													<option value="11.375" >11.375%</option>
													<option value="11.500" >11.500%</option>
													<option value="11.625" >11.625%</option>
													<option value="11.750" >11.750%</option>
													<option value="11.875" >11.875%</option>
													<option value="12.000" >12.000%</option>
												</select>
											</div>
										</div>
									</div>
									<div class="item-input-group">
										<div class="mortage-item-input">
											<label>Origination Fee</label>
											<select name="FixAndFlipOriginationFee" id="FixAndFlipOriginationFee">
												<option value="2.00" selected>2.00%</option>
												<option value="2.25" >2.25%</option>
												<option value="2.50" >2.50%</option>
												<option value="2.75" >2.75%</option>
												<option value="3.00" >3.00%</option>
											</select>
										</div>
										<div class="mortage-item-input">
											<label>Other Closing Costs</label>
											<select name="FixAndFlipOtherClosingCosts" id="FixAndFlipOtherClosingCosts">
												<option value="2.0" >2.0%</option>
												<option value="2.5" >2.5%</option>
												<option value="3.0" selected>3.0%</option>
												<option value="3.5" >3.5%</option>
												<option value="4.0" >4.0%</option>
											</select>
										</div>
									</div>
									<div class="mortage-item-input">
										<label>Cost To Sell</label>
										<select name="FixAndFlipCostToSell" id="FixAndFlipCostToSell">
											<option value="1" >1%</option>
											<option value="2" >2%</option>
											<option value="3" >3%</option>
											<option value="4" >4%</option>
											<option value="5" selected>5%</option>
											<option value="6" >6%</option>
											<option value="7" >7%</option>
										</select>
									</div>

								</div>
							</form>
							<div class="btn-wrp">
								<!-- <a href="#"><input class="btn afd-trigger-email-form" type="button" name="submit" id="afd-cc-submit" value="Email Me This"></a> -->
								<!-- <a href="/quote/"><input class="btn" type="button" name="submit" id="va-submit" value="GET A QUOTE"></a> -->
							</div>
						</div>
<!-- 
						<div class="afd-email-report-container">
							<form method="post" class="afd-email-report-form">
								<div class="afd-email-report-item-input">
									<h3>Email Me This</h3>
								</div>
								<div class="afd-email-report-item-input">
									<input type="text" id="afdReportFullName" name="afdReportFullName"  class="form-control" placeholder="Full Name" value="" required /> 
								</div>
								<div class="afd-email-report-item-input">
									<input type="email" id="afdReportEmailID" name="afdReportEmailID"  class="form-control" placeholder="Email" value="" required /> 
								</div>
								<div class="afd-email-report-item-input">
									<div class="afd-email-report-message">
										<div class="afd-email-report-success hidden">Report sent to your mail successfully!</div>
										<div class="afd-email-report-error hidden">Something went wrong! Please try again later.</div>
									</div>
								</div>
								<div class="afd-email-report-item-input">
									<input type="hidden" id="afdReportCalculatorID" value="" />
									<button type="button" class="afd-close-email-form">Close</button>
									<button type="submit" class="afd-send-report-email">Send Email</button>
								</div>
							</form>
						</div> -->

					</div>
				</div>
				<div class="payment-calculator-right">
					<div class="payment-right-system">
						<!-- Affordability Calculator -->
						<div data-id="#affordability" class="affordability_calculator tab-content "> 
							<div class="affordability-right-tab-content">
								<div class="affordability-right-tab-item afd-tab-content " id="affordability-conventional-content">
									<div class="mortgage-item-colum">
										<div class="mortgage-item-colum-inner-item">
											<div class="payment-breakdown-card card-item">
												<div class="card-inner-item">
													<div class="card-title">
														<h2>Payment Breakdown</h2>
													</div>
													<div class="graph-items">
														<div class="relative-graph">
															<div id="affordabilityGraph">
																<canvas id="affordabilityChart" width="300px" height="300px"></canvas>
															</div>
															<div class="absolute-center text-center graph-inner-text">
																<strong class="line-2 price-item afdChartCenterAmount">$0</strong>
																<p class="line-3 per-month">per month</p>
															</div>
														</div>
														<ul class="afd-payment-results-list afd-conventional-payment-results">
															<li><span class="dots principle-interest-color" style="background-color:#FA9D39;" data-color="#FA9D39"></span><span>Principal & Interest <span id="affordabilityChartPrinciple"></span></span>
															</li>
															<li><span class="dots taxes-color" style="background-color:#59C2C0;" data-color="#59C2C0"></span><span>Taxes <span id="affordabilityChartTaxes"></span></span>
															</li>
															<li><span class="dots insurance-color" style="background-color:#F85A85;" data-color="#F85A85"></span><span>Insurance <span id="affordabilityChartInsurence"></span></span>
															</li>
															<li><span class="dots hoa-dues-color" style="background-color:#41A2ED;" data-color="#41A2ED"></span><span>HOA Dues <span id="affordabilityChartHOADues"></span></span>
															</li>
															<li><span class="dots pmi-color" style="background-color:#eeee22;" data-color="#eeee22"></span><span>PMI <span id="affordabilityChartPMI"></span></span>
															</li>
														</ul>
													</div>
												</div>
											</div>

											<div class="deal-breakdown-card card-item">
												<div class="card-inner-item">
													<div class="card-title">
														<h2>Loan Details</h2>
													</div>
													<div class="card-content">
														<ul>
															<li><span>Home Value: <span id="afdHomeValue"></span></span></li>
															<li><span>Mortgage Amount: <span id="afdMortageAmount"></span></span></li>
															<li><span>Monthly Conventional Payment: <span id="afdMonthlyConventionalPayment"></span></span></li>
															<li><span>Down Payment: <span id="afdDownPayment"></span></span></li>
															<li><span>Monthly Estimated PMI: <span id="afdMonthlyEstimatedPMI"></span></span></li>
														</ul>
													</div>
												</div>
											</div>

										</div>
									</div>
									<div class="mortgage-item-colum">
										<div class="mortgage-item-colum-inner-item">
											<div class="affordability-conventional-button">
												<div class="top-head affordability-conventional-head">
													<span class="primary-bg">
														<span>Monthly Mortgage Payment</span>
														<h2><span id="afdBBMonthlyMortageAmount"></span></h2>
													</span>
													<span class="primary-bg">
														<span>Loan Amount</span>
														<h2><span id="afdBBLoanAmount"></span></h2>
													</span>
												</div>
												<div class="top-head affordability-conventional-head">
													<span class="primary-bg">
														<span>Your Debt to Income Ratio</span>
														<h2><span id="afdBBYourDebt"></span>/<span id="afdBBYourIncome"></span></h2>
													</span>
													<span class="primary-bg">
														<span>Allowable Debt to Income Ratio</span>
														<h2><span class="amount">50%/50%</span></h2>
													</span>
												</div>
											</div>

											<div id="affordability-slider-data">
												<div class="slider-data-wrp">
													<div id="afdSliderHomePrice" class="afd-sliders afd-slider-home-price" data-amount="200000"></div>
													<div class="slider-label">
														<span> Purchase Price </span>
														<strong id="afdSliderHomePriceLabel">$200000</strong>
													</div>
												</div>
											</div>
											<div id="affordability-slider-data">
												<div class="slider-data-wrp">
													<div id="afdSliderDownPayment" class="afd-sliders afd-slider-down-payment" data-amount="0"></div>
													<div class="slider-label">
														<span> Down Payment </span>
														<strong id="afdSliderDownPaymentLabel">$0</strong>
													</div>
												</div>
											</div>

											<div class="top-head light-primary-bg rvb-head affordability-description">
												<b>Summary:</b>
												<span>Based on what you input into today your Total Payment would be <strong id="afdSummaryMortagePayment">$2850</strong> on a <strong>Conventional Loan</strong> with a <strong id="afdSummaryDownPaymentPercent">Down Payment of 15%</strong>. Your <strong id="afdSummaryDebtToIncome">Debt-to-Income Ratio is 32%/45%</strong> and the <strong>maximum allowable on this program type is 50%/50%</strong>. Please confirm all these numbers for accuracy with your loan officer. The Monthly Debts Calculation is often where we see errors.</span>
											</div>

										</div>
									</div>
								</div>
								<div class="affordability-right-tab-item afd-tab-content " id="affordability-fha-content">
									<div class="mortgage-item-colum">
										<div class="mortgage-item-colum-inner-item">
											<div class="payment-breakdown-card card-item">
												<div class="card-inner-item">
													<div class="card-title">
														<h2>Payment Breakdown</h2>
													</div>
													<div class="graph-items">
														<div class="relative-graph">
															<div id="affordabilityFHAGraph">
																<canvas id="affordabilityFHAChart" width="300px" height="300px"></canvas>
															</div>
															<div class="absolute-center text-center graph-inner-text">
																<strong class="line-2 price-item afdFHAChartCenterAmount">$0</strong>
																<p class="line-3 per-month">per month</p>
															</div>
														</div>
														<ul class="afd-payment-results-list afd-fha-payment-results">
															<li><span class="dots principle-interest-color" style="background-color:#FA9D39;" data-color="#FA9D39"></span><span>Principal & Interest <span id="affordabilityFHAChartPrinciple"></span></span>
															</li>
															<li><span class="dots taxes-color" style="background-color:#59C2C0;" data-color="#59C2C0"></span><span>Taxes <span id="affordabilityFHAChartTaxes"></span></span>
															</li>
															<li><span class="dots insurance-color" style="background-color:#F85A85;" data-color="#F85A85"></span><span>Insurance <span id="affordabilityFHAChartInsurence"></span></span>
															</li>
															<li><span class="dots hoa-dues-color" style="background-color:#41A2ED;" data-color="#41A2ED"></span><span>HOA Dues <span id="affordabilityFHAChartHOADues"></span></span>
															</li>
															<li><span class="dots pmi-color" style="background-color:#eeee22;" data-color="#eeee22"></span><span>MIP <span id="affordabilityFHAChartMIP"></span></span>
															</li>
														</ul>
													</div>
												</div>
											</div>
											<div class="deal-breakdown-card card-item">
												<div class="card-inner-item">
													<div class="card-title">
														<h2>Loan Details</h2>
													</div>
													<div class="card-content">
														<ul>
															<li><span>Home Value: <span id="afdFHAHomeValue"></span></span></li>
															<li><span>Base Loan Amount: <span id="afdFHABaseLoanAmount"></span></span></li>
															<li><span>Monthly FHA Payment: <span id="afdFHAMonthlyFHAPayment"></span></span></li>
															<li><span>Down Payment: <span id="afdFHADownPayment"></span></span></li>
															<li><span>FHA Loan Amount: <span id="afdFHALoanAmount"></span></span></li>
															<li><span>Upfront MIP: <span id="afdFHAUpfrontMIP"></span></span></li>
														</ul>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="mortgage-item-colum">
										<div class="mortgage-item-colum-inner-item">
											<div class="affordability-conventional-button">
												<div class="top-head affordability-conventional-head">
													<span class="primary-bg">
														<span>Monthly Mortgage Payment</span>
														<h2><span id="afdFHABBMonthlyMortageAmount"></span></h2>
													</span>
													<span class="primary-bg">
														<span>Loan Amount</span>
														<h2><span id="afdFHABBLoanAmount"></span></h2>
													</span>
												</div>
												<div class="top-head affordability-conventional-head">
													<span class="primary-bg">
														<span>Your Debt to Income Ratio</span>
														<h2><span id="afdFHABBYourDebt"></span>/<span id="afdFHABBYourIncome"></span></h2>
													</span>
													<span class="primary-bg">
														<span>Allowable Debt to Income Ratio</span>
														<h2><span class="amount">50%/50%</span></h2>
													</span>
												</div>
											</div>

											<div id="affordability-slider-data">
												<div class="slider-data-wrp">
													<div id="afdFHASliderHomePrice" class="afd-sliders afd-slider-home-price" data-amount="200000"></div>
													<div class="slider-label">
														<span> Purchase Price </span>
														<strong id="afdFHASliderHomePriceLabel">$200000</strong>
													</div>
												</div>
											</div>
											<div id="affordability-slider-data">
												<div class="slider-data-wrp">
													<div id="afdFHASliderDownPayment" class="afd-sliders afd-slider-down-payment" data-amount="0"></div>
													<div class="slider-label">
														<span> Down Payment </span>
														<strong id="afdFHASliderDownPaymentLabel">$0</strong>
													</div>
												</div>
											</div>

											<div class="top-head light-primary-bg rvb-head affordability-description">
												<b>Summary:</b>
												<span>Based on what you input into today your Total Payment would be <strong id="afdSummaryFHAMortagePayment">$2850</strong> on a <strong>FHA Loan</strong> with a <strong id="afdSummaryFHADownPaymentPercent">Down Payment of 15%</strong>. Your <strong id="afdSummaryFHADebtToIncome">Debt-to-Income Ratio is 32%/45%</strong> and the <strong>maximum allowable on this program type is 50%/50%</strong>. Please confirm all these numbers for accuracy with your loan officer. The Monthly Debts Calculation is often where we see errors.</span>
											</div>

										</div>
									</div>
								</div>
								<div class="affordability-right-tab-item afd-tab-content " id="affordability-va-content">
									<div class="mortgage-item-colum">
										<div class="mortgage-item-colum-inner-item">
											<div class="payment-breakdown-card card-item">
												<div class="card-inner-item">
													<div class="card-title">
														<h2>Payment Breakdown</h2>
													</div>
													<div class="graph-items">
														<div class="relative-graph">
															<div id="affordabilityVAGraph">
																<canvas id="affordabilityVAChart" width="300px" height="300px"></canvas>
															</div>
															<div class="absolute-center text-center graph-inner-text">
																<strong class="line-2 price-item afdVAChartCenterAmount">$0</strong>
																<p class="line-3 per-month">per month</p>
															</div>
														</div>
														<ul class="afd-payment-results-list afd-va-payment-results">
															<li><span class="dots principle-interest-color" style="background-color:#FA9D39;" data-color="#FA9D39"></span><span>Principal & Interest <span id="affordabilityVAChartPrinciple"></span></span>
															</li>
															<li><span class="dots taxes-color" style="background-color:#59C2C0;" data-color="#59C2C0"></span><span>Taxes <span id="affordabilityVAChartTaxes"></span></span>
															</li>
															<li><span class="dots insurance-color" style="background-color:#F85A85;" data-color="#F85A85"></span><span>Insurance <span id="affordabilityVAChartInsurence"></span></span>
															</li>
															<li><span class="dots hoa-dues-color" style="background-color:#41A2ED;" data-color="#41A2ED"></span><span>HOA Dues <span id="affordabilityVAChartHOADues"></span></span>
															</li>
														</ul>
													</div>
												</div>
											</div>

											<div class="deal-breakdown-card card-item">
												<div class="card-inner-item">
													<div class="card-title">
														<h2>Loan Details</h2>
													</div>
													<div class="card-content">
														<ul>
															<li><span>Home Value: <span id="afdVAHomeValue"></span></span></li>
															<li><span>Base Loan Amount: <span id="afdVABaseLoanAmount"></span></span></li>
															<li><span>Monthly VA Payment: <span id="afdVAMonthlyVAPayment"></span></span></li>
															<li><span>Down Payment: <span id="afdVADownPayment"></span></span></li>
															<li><span>VA Loan Amount: <span id="afdVAFinalLoanAmount"></span></span></li>
															<li><span>VA Funding Fee: <span id="afdVAFundingFee"></span></span></li>
														</ul>
													</div>
												</div>
											</div>

										</div>
									</div>
									<div class="mortgage-item-colum">
										<div class="mortgage-item-colum-inner-item">
											<div class="affordability-conventional-button">
												<div class="top-head affordability-conventional-head">
													<span class="primary-bg">
														<span>Monthly Mortgage Payment</span>
														<h2><span id="afdVABBMonthlyMortageAmount"></span></h2>
													</span>
													<span class="primary-bg">
														<span>Loan Amount</span>
														<h2><span id="afdVABBLoanAmount"></span></h2>
													</span>
												</div>
												<div class="top-head affordability-conventional-head">
													<span class="primary-bg">
														<span>Your Debt to Income Ratio</span>
														<h2><span id="afdVABBYourDebt"></span>/<span id="afdVABBYourIncome"></span></h2>
													</span>
													<span class="primary-bg">
														<span>Allowable Debt to Income Ratio</span>
														<h2><span class="amount">65%/65%</span></h2>
													</span>
												</div>
											</div>

											<div id="affordability-slider-data">
												<div class="slider-data-wrp">
													<div id="afdVASliderHomePrice" class="afd-sliders afd-slider-home-price" data-amount="200000"></div>
													<div class="slider-label">
														<span> Purchase Price </span>
														<strong id="afdVASliderHomePriceLabel">$200000</strong>
													</div>
												</div>
											</div>
											<div id="affordability-slider-data">
												<div class="slider-data-wrp">
													<div id="afdVASliderDownPayment" class="afd-sliders afd-slider-down-payment" data-amount="0"></div>
													<div class="slider-label">
														<span> Down Payment </span>
														<strong id="afdVASliderDownPaymentLabel">$0</strong>
													</div>
												</div>
											</div>

											<div class="top-head light-primary-bg rvb-head affordability-description">
												<b>Summary:</b>
												<span>Based on what you input into today your Total Payment would be <strong id="afdSummaryVAMortagePayment">$2850</strong> on a <strong>VA Loan</strong> with a <strong id="afdSummaryVADownPaymentPercent">Down Payment of 15%</strong>. Your <strong id="afdSummaryVADebtToIncome">Debt-to-Income Ratio is 32%/45%</strong> and the <strong>maximum allowable on this program type is 65%/65%</strong>. Please confirm all these numbers for accuracy with your loan officer. The Monthly Debts Calculation is often where we see errors.</span>
											</div>

										</div>
									</div>
								</div>
								<div class="affordability-right-tab-item afd-tab-content " id="affordability-usda-content">
									<div class="mortgage-item-colum">
										<div class="mortgage-item-colum-inner-item">
											<div class="payment-breakdown-card card-item">
												<div class="card-inner-item">
													<div class="card-title">
														<h2>Payment Breakdown</h2>
													</div>
													<div class="graph-items">
														<div class="relative-graph">
															<div id="affordabilityUSDAGraph">
																<canvas id="affordabilityUSDAChart" width="300px" height="300px"></canvas>
															</div>
															<div class="absolute-center text-center graph-inner-text">
																<strong class="line-2 price-item afdUSDAChartCenterAmount">$0</strong>
																<p class="line-3 per-month">per month</p>
															</div>
														</div>
														<ul class="afd-payment-results-list afd-usda-payment-results">
															<li><span class="dots principle-interest-color" style="background-color:#FA9D39;" data-color="#FA9D39"></span><span>Principal & Interest <span id="affordabilityUSDAChartPrinciple"></span></span>
															</li>
															<li><span class="dots taxes-color" style="background-color:#59C2C0;" data-color="#59C2C0"></span><span>Taxes <span id="affordabilityUSDAChartTaxes"></span></span>
															</li>
															<li><span class="dots insurance-color" style="background-color:#F85A85;" data-color="#F85A85"></span><span>Insurance <span id="affordabilityUSDAChartInsurence"></span></span>
															</li>
															<li><span class="dots hoa-dues-color" style="background-color:#41A2ED;" data-color="#41A2ED"></span><span>HOA Dues <span id="affordabilityUSDAChartHOADues"></span></span>
															</li>
															<li><span class="dots pmi-color" style="background-color:#eeee22;" data-color="#eeee22"></span><span>USDA MIP <span id="affordabilityUSDAChartMIP"></span></span>
															</li>
														</ul>
													</div>
												</div>
											</div>
											<div class="deal-breakdown-card card-item">
												<div class="card-inner-item">
													<div class="card-title">
														<h2>Loan Details</h2>
													</div>
													<div class="card-content">
														<ul>
															<li><span>Home Value: <span id="afdUSDAHomeValue"></span></span></li>
															<li><span>Base Loan Amount: <span id="afdUSDABaseLoanAmount"></span></span></li>
															<li><span>Monthly USDA Payment: <span id="afdUSDAMonthlyUSDAPayment"></span></span></li>
															<li><span>Down Payment: <span id="afdUSDADownPayment"></span></span></li>
															<li><span>USDA Loan Amount: <span id="afdUSDALoanAmount"></span></span></li>
															<li><span>USDA Guarantee Fee: <span id="afdUSDAGuaranteeFee"></span></span></li>
														</ul>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="mortgage-item-colum">
										<div class="mortgage-item-colum-inner-item">
											<div class="affordability-conventional-button">
												<div class="top-head affordability-conventional-head">
													<span class="primary-bg">
														<span>Monthly Mortgage Payment</span>
														<h2><span id="afdUSDABBMonthlyMortageAmount"></span></h2>
													</span>
													<span class="primary-bg">
														<span>Loan Amount</span>
														<h2><span id="afdUSDABBLoanAmount"></span></h2>
													</span>
												</div>
												<div class="top-head affordability-conventional-head">
													<span class="primary-bg">
														<span>Your Debt to Income Ratio</span>
														<h2><span id="afdUSDABBYourDebt"></span>/<span id="afdUSDABBYourIncome"></span></h2>
													</span>
													<span class="primary-bg">
														<span>Allowable Debt to Income Ratio</span>
														<h2><span class="amount">29%/41%</span></h2>
													</span>
												</div>
											</div>

											<div id="affordability-slider-data">
												<div class="slider-data-wrp">
													<div id="afdUSDASliderHomePrice" class="afd-sliders afd-slider-home-price" data-amount="200000"></div>
													<div class="slider-label">
														<span> Purchase Price </span>
														<strong id="afdUSDASliderHomePriceLabel">$200000</strong>
													</div>
												</div>
											</div>
											<div id="affordability-slider-data">
												<div class="slider-data-wrp">
													<div id="afdUSDASliderDownPayment" class="afd-sliders afd-slider-down-payment" data-amount="0"></div>
													<div class="slider-label">
														<span> Down Payment </span>
														<strong id="afdUSDASliderDownPaymentLabel">$0</strong>
													</div>
												</div>
											</div>

											<div class="top-head light-primary-bg rvb-head affordability-description">
												<b>Summary:</b>
												<span>Based on what you input into today your Total Payment would be <strong id="afdSummaryUSDAMortagePayment">$2850</strong> on a <strong>USDA Loan</strong> with a <strong id="afdSummaryUSDADownPaymentPercent">Down Payment of 15%</strong>. Your <strong id="afdSummaryUSDADebtToIncome">Debt-to-Income Ratio is 32%/45%</strong> and the <strong>maximum allowable on this program type is 29%/41%</strong>. Please confirm all these numbers for accuracy with your loan officer. The Monthly Debts Calculation is often where we see errors.</span>
											</div>

										</div>
									</div>
								</div>
								<div class="affordability-right-tab-item afd-tab-content " id="affordability-jumbo-content">
									<div class="mortgage-item-colum">
										<div class="mortgage-item-colum-inner-item">
											<div class="payment-breakdown-card card-item">
												<div class="card-inner-item">
													<div class="card-title">
														<h2>Payment Breakdown</h2>
													</div>
													<div class="graph-items">
														<div class="relative-graph">
															<div id="affordabilityJumboGraph">
																<canvas id="affordabilityJumboChart" width="300px" height="300px"></canvas>
															</div>
															<div class="absolute-center text-center graph-inner-text">
																<strong class="line-2 price-item afdJumboChartCenterAmount">$0</strong>
																<p class="line-3 per-month">per month</p>
															</div>
														</div>
														<ul class="afd-payment-results-list afd-jumbo-payment-results">
															<li><span class="dots principle-interest-color" style="background-color:#FA9D39;" data-color="#FA9D39"></span><span>Principal & Interest <span id="affordabilityJumboChartPrinciple"></span></span>
															</li>
															<li><span class="dots taxes-color" style="background-color:#59C2C0;" data-color="#59C2C0"></span><span>Taxes <span id="affordabilityJumboChartTaxes"></span></span>
															</li>
															<li><span class="dots insurance-color" style="background-color:#F85A85;" data-color="#F85A85"></span><span>Insurance <span id="affordabilityJumboChartInsurence"></span></span>
															</li>
															<li><span class="dots hoa-dues-color" style="background-color:#41A2ED;" data-color="#41A2ED"></span><span>HOA Dues <span id="affordabilityJumboChartHOADues"></span></span>
															</li>
															<li><span class="dots pmi-color" style="background-color:#eeee22;" data-color="#eeee22"></span><span>PMI <span id="affordabilityJumboChartPMI"></span></span>
															</li>
														</ul>
													</div>
												</div>
											</div>

											<div class="deal-breakdown-card card-item">
												<div class="card-inner-item">
													<div class="card-title">
														<h2>Loan Details</h2>
													</div>
													<div class="card-content">
														<ul>
															<li><span>Home Value: <span id="afdJumboHomeValue"></span></span></li>
															<li><span>Mortgage Amount: <span id="afdJumboMortageAmount"></span></span></li>
															<li><span>Monthly Conventional Payment: <span id="afdJumboMonthlyConventionalPayment"></span></span></li>
															<li><span>Down Payment: <span id="afdJumboDownPayment"></span></span></li>
															<li><span>Monthly Estimated PMI: <span id="afdJumboMonthlyEstimatedPMI"></span></span></li>
														</ul>
													</div>
												</div>
											</div>

										</div>
									</div>
									<div class="mortgage-item-colum">
										<div class="mortgage-item-colum-inner-item">
											<div class="affordability-conventional-button">
												<div class="top-head affordability-conventional-head">
													<span class="primary-bg">
														<span>Monthly Mortgage Payment</span>
														<h2><span id="afdJumboBBMonthlyMortageAmount"></span></h2>
													</span>
													<span class="primary-bg">
														<span>Loan Amount</span>
														<h2><span id="afdJumboBBLoanAmount"></span></h2>
													</span>
												</div>
												<div class="top-head affordability-conventional-head">
													<span class="primary-bg">
														<span>Your Debt to Income Ratio</span>
														<h2><span id="afdJumboBBYourDebt"></span>/<span id="afdJumboBBYourIncome"></span></h2>
													</span>
													<span class="primary-bg">
														<span>Allowable Debt to Income Ratio</span>
														<h2><span class="amount">50%/50%</span></h2>
													</span>
												</div>
											</div>

											<div id="affordability-slider-data">
												<div class="slider-data-wrp">
													<div id="afdJumboSliderHomePrice" class="afd-sliders afd-slider-home-price" data-amount="200000"></div>
													<div class="slider-label">
														<span> Purchase Price </span>
														<strong id="afdJumboSliderHomePriceLabel">$200000</strong>
													</div>
												</div>
											</div>
											<div id="affordability-slider-data">
												<div class="slider-data-wrp">
													<div id="afdJumboSliderDownPayment" class="afd-sliders afd-slider-down-payment" data-amount="0"></div>
													<div class="slider-label">
														<span> Down Payment </span>
														<strong id="afdJumboSliderDownPaymentLabel">$0</strong>
													</div>
												</div>
											</div>

											<div class="top-head light-primary-bg rvb-head affordability-description">
												<b>Summary:</b>
												<span>Based on what you input into today your Total Payment would be <strong id="afdSummaryJumboMortagePayment">$2850</strong> on a <strong>Jumbo Loan</strong> with a <strong id="afdSummaryJumboDownPaymentPercent">Down Payment of 15%</strong>. Your <strong id="afdSummaryJumboDebtToIncome">Debt-to-Income Ratio is 32%/45%</strong> and the <strong>maximum allowable on this program type is 50%/50%</strong>. Please confirm all these numbers for accuracy with your loan officer. The Monthly Debts Calculation is often where we see errors.</span>
											</div>

										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Purchase Calculator -->
						<div data-id="#purchase-item" class="total-payment-item tab-content ">
							<div class="mortgage-item-colum">
								<div class="mortgage-item-colum-inner-item">
									<div class="top-head light-primary-bg"> <span>All Payment <span id="allPayment"></span></span> <span>Total Loan Amount <span id="totalLoanAmount"></span></span> <span>Total Interest Paid <span id="totalInterestPaid"></span></span></div>
										<div class="payment-breakdown-card card-item">
											<div class="card-inner-item">
												<div class="card-title">
													<h2>Payment Breakdown</h2>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
														<div class="toltip">
															<b>Payment Breakdown</b>	
															<p>A breakdown of your total payment so you can see where money is allocated.</p>
														</div>
													</div>
												</div>
												<div class="graph-items">
													<div class="relative-graph">
														<div id="mortgageGraph">
															<canvas id="myChart" width="300px" height="300px"></canvas>
														</div>
														<div class="absolute-center text-center graph-inner-text">
															<strong class="line-2 price-item mortgageAmg">$1,915</strong>
															<p class="line-3 per-month">per month</p>
														</div>
													</div>
													<ul class="payment-results-list">
														<li><span class="dots principle-interest-color"></span><span>Principal & Interest <span id="principle"></span></span>
														</li>
														<li><span class="dots taxes-color"></span><span>Taxes <span id="TaxesSpan"></span></span>
														</li>
														<li><span class="dots insurance-color"></span><span>Insurance <span id="homeownersInsurenceSpan"></span></span>
														</li>
														<li><span class="dots hoa-dues-color"></span><span>HOA Dues <span id="HOADuesSpan"></span></span>
														</li>
														<li><span class="dots pmi-color"></span><span>PMI <span id="pmiSpan"></span></span>
														</li>
														<li><span class="dots extra-payment-color"></span><span>Extra Payment <span id="extraPaymentSpan"></span></span>
														</li>
													</ul>
												</div>
											<div class="mt-payment-tabs-item mortgage-payment-tabs-item">
												<ul id="mt-payment-tabs">
													<li class="active"><span datas="monthly_payment">Monthly Payment</a> </li>
													<li><span datas="total_payment">Total Payment </a> </li>
												</ul>
												<div class="mp-item tp-tabs-content active" id="monthly_payment">
													<ul>
														<li><span>Home Value: <span id="homeVal"></span></span></li>
														<li><span>Mortgage Amount: <span id="loanAmountVal"></span></span></li>
														<li><span>Monthly Principal & Interest: <span id="PrincipalIntrestVal"></span></span></li>
														<li><span>Monthly Extra Payment: <span id="extraPaymentVal"></span></span></li>
														<li><span>Monthly Property Tax: <span id="propertTexVal"></span></span></li>
														<li><span>Monthly Home Insurance: <span id="houseInsuranceVal"></span></span></li>
														<li><span>Monthly PMI<span id="PMICount"></span>:<span id="PMIVal"></span></span></li>
														<li><span>Monthly HOA Fees: <span id="HOAVal"></span></span></li>
													</ul>
												</div>
												<div class="tp-item tp-tabs-content" id="total_payment">
													<ul>
														<li><span>Total # Of Payments: <span id="totalMonthPayment"></span></span></li>
														<li><span>Down Payment: <span id="totalDownPayment"></span></span></li>
														<li><span>Principal: <span id="totalPrincipalAmount"></span></span></li>
														<li><span>Total Extra Payment: <span id="totalExtraPayment"></span></span></li>
														<li><span>Total Interest Paid: <span id="totalIntrestPaid"></span></span></li>
														<li><span>Total Tax, Insurance, PMI and Fees: <span id="totalInsuranceTex"></span></span></li>
														<li><span>Total of all Payments: <span id="totalAllPayment"></span></span></li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="mortgage-item-colum">
								<div class="text-center-align get-approved-button">
									<div class="top-head light-red-bg"> <span>Savings <span id="savings"></span></span> <span>Payment Amount <span id="paymentAmount"></span></span> <span>Shorten Loan Term By <span id="payOff"></span></span>
									</div>
									<div class="payment-breakdown-card card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h2>Early Payoff Strategy</h2>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
													<div class="toltip">
														<b>Early Payoff Strategy</b>	
														<p>Add an extra payment and see how many months you can eliminate on the back end of the loan.</p>
													</div>
												</div>
											</div>
											<div class="card-form-item">
												<label> Additional Monthly </label>
													<input type="text" pattern="\d*" maxlength="4" data-type="currency" id="additionalMonth" name="additionalMonth" placeholder="You can add below $500.00" value="">
												<label>Increase Frequency </label>
												<div class="frequency-button-wrap card-form-button">
													<button type="button" class="payoff active" data="1">Monthly</button>
													<button type="button" class="payoff" data="2">Bi weekly</button>
													<button type="button" class="payoff" data="3">Weekly</button>  
												</div>
											</div>
										</div>
									</div>
									<div class="payment-breakdown-card card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h2>Lump Sum Payment</h2>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
													<div class="toltip">
														<b>Lump Sum Payment</b>	
														<p>Shorten your loan term by paying a lump sum all to principal.</p>
													</div>
												</div>
											</div>
											<div class="card-form-item">
												<label> Lump Sum Addition </label>
													<input type="text" pattern="\d*" maxlength="7" data-type="currency" id="cashbombAmt" name="cashbombAmt" placeholder="You can add below $100k" value="">
												<label>Frequency </label>
												<div class="lump-sum-wrap card-form-button">
													<button type="button" class="lumpSum active" data="1">One time</button>
													<button type="button" class="lumpSum" data="2">Yearly</button>
													<button type="button" class="lumpSum" data="3">Quarterly</button>  
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div data-id="#refinance-item" class="refinance_calculator payment-calculate-item tab-content "> 
							<div class="mortgage-item-colum monthly-payment-comparison-wrapper">
								<div class="mortgage-item-colum-inner-item">
									<div class="top-head light-primary-bg mpc-head"><span></span></div>
									<div class="top-head refinance-cost-head">
										<span class="light-primary-bg">
											<span>Monthly Payment Decrease</span>
											<h2><span class="dollar">$</span><span class="amount"></span></h2>
										</span>
										<span class="light-primary-bg">
											<span>Total Interest Difference</span>
											<h2><span class="dollar">$</span><span class="amount"></span></h2>
										</span>
									</div>
									<div class="card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h4>Monthly Payment Comparison</h4>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information-icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Payment Breakdown</b>	
														<p>A breakdown of your total payment so you can see where money is allocated.</p>
													</div>
												</div>
											</div>
											<div class="refinance-data">
												<div class="progress-bar-wrapper">
													<div class="progress-bar-inner mpc-current-loan">
														<div class="refinance-loan-info">
															<p>Current Loan</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														<div id="myProgress" class="myProgress-1">
															<div id="myBar"></div>
														</div>
													</div>
													<div class="progress-bar-inner mpc-new-loan">
														<div class="refinance-loan-info">
															<p>New Loan</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														<div id="myProgress" class="myProgress-2">
															<div id="myBar"></div>
														</div>
													</div>
													<div class="progress-bar-inner mpc-difference">
														<div class="refinance-loan-info">
															<p>Monthly Payment Difference</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														<div id="myProgress" class="myProgress-3">
															<div id="myBar"></div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="mortgage-item-colum total-interest-comparison-wrapper">
								<div class="text-center-align get-approved-button">
									<div class="top-head light-primary-bg tic-head"><span></span></div>
									<div class="top-head refinance-cost-head">
										<span class="light-primary-bg">
											<span>Refinance Costs</span>
											<h2><span class="dollar">$</span><span class="amount"></span></h2>
										</span>
										<span class="light-primary-bg">
											<span>Time to Recoup Fees</span>
											<h2><span class="months"></span><span class="month-text"></span></h2>
										</span>
									</div>
									<div class="card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h4>Total Interest Comparison</h4>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information-icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Payment Breakdown</b>	
														<p>A breakdown of your total payment so you can see where money is allocated.</p>
													</div>
												</div>
											</div>
											<div class="refinance-data">
												<div class="progress-bar-wrapper">
													<div class="progress-bar-inner tic-current-loan">
														<div class="refinance-loan-info">
															<p>Current Loan Remaining Interest</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														<div id="myProgress" class="myProgress-1">
															<div id="myBar"></div>
														</div>
													</div>
													<div class="progress-bar-inner tic-new-loan">
														<div class="refinance-loan-info">
															<p>New Loan Interest</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														
														<div id="myProgress" class="myProgress-2">
															<div id="myBar"></div>
														</div>
													</div>
													<div class="progress-bar-inner tic-difference">
														<div class="refinance-loan-info">
															<p>Total Interest Difference</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														
														<div id="myProgress" class="myProgress-3">
															<div id="myBar"></div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>	
						</div>
						<div data-id="#rent-buy-item" class="rent_buy_calculator payment-calculate-item tab-content "> 
							<div class="mortgage-item-colum rent-buy-left-wrapper">
								<div class="mortgage-item-colum-inner-item">
									<div class="card-item">
										<div class="card-inner-item">
											<div id="sliderData">
												<!-- <input id="slider1" class="cntr" type="range" min="0" max="15" value="0"> -->
												<div class="slider-data-wrp">
												<div id="slider1" class="cntr" data-year=""></div>
												<div class="slider-label">
													<span> Years </span>
													<strong id="slider-years">1 years</strong>
												</div>
												</div>
											</div>
										</div>
									</div>
									<div class="card-item rent-buy-results-summary-wrapper">
										<div class="card-inner-item">
											<div class="card-title">
												<h4>Results Summary</h4>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information-icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2020%2020'%3E%3C/svg%3E" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information-icon.svg"/><noscript><img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Payment Breakdown</b>	
														<p>A breakdown of your total payment so you can see where money is allocated.</p>
													</div>
												</div>
											</div>
											<table class="rent-vs-buy-table-data">
												<thead>
													<tr>
														<th></th>
														<th>Buying</th>
														<th>Renting</th>
													</tr>
												</thead>
												<tbody>
													<tr class="cash-spent-value">
														<td>Cash Spent</td>
														<td><span class="dollar">$</span><span class="amount"></span></td>
														<td><span class="dollar">$</span><span class="amount"></span></td>
													</tr>
													<tr class="home-value">
														<td>Home value</td>
														<td><span class="dollar">-$</span><span class="amount"></span></td>
														<td>--</td>
													</tr>
													<tr class="balance-loan-value">
														<td>Balance on Loan</td>
														<td><span class="dollar">$</span><span class="amount"></span></td>
														<td>--</td>
													</tr>
													<tr class="closing-costs-value">
														<td>Closing costs on sale</td>
														<td><span class="dollar">$</span><span class="amount"></span></td>
														<td>--</td>
													</tr>
												</tbody>
												<tfoot>
													<tr class="cash-savings-value">
														<td>Adjusted Net Cash Savings</td>
														<td><span class="dollar">$</span><span class="amount"></span></td>
														<td><span class="dollar">$</span><span class="amount"></span></td>
													</tr>
												</tfoot>
											</table>
											<div class="progress-bar-wrapper">
												<div class="progress-bar-inner rvb-rent-amount">
													<div class="rent-buy-loan-info">
														<p>Rent</p>
														<span><span class="dollar">$</span><span class="amount"></span></span>
													</div>
													<div id="myProgress" class="myProgress-1">
														<div id="myBar"></div>
													</div>
												</div>
												<div class="progress-bar-inner rvb-buy-amount">
													<div class="rent-buy-loan-info">
														<p>Buy</p>
														<span><span class="dollar">$</span><span class="amount">556</span></span>
													</div>
													<div id="myProgress" class="myProgress-2">
														<div id="myBar"></div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="mortgage-item-colum rent-buy-right-wrapper">
								<div class="text-center-align get-approved-button">
									<div class="top-head rent-buy-cost-head">
										<span class="light-primary-bg rvb-year">
											<span>YEAR</span>
											<h2>2</h2>
										</span>
										<span class="light-primary-bg rvb-buy-gain">
											<span><span>BUY</span> GAIN</span>
											<h2><span class="dollar">$</span><span class="amount">43,244</span></h2>
										</span>
									</div>
									<div class="top-head rent-buy-cost-head">
										<span class="light-primary-bg rvb-buy">
											<span>BUY</span>
											<h2><span class="dollar">$</span><span class="amount">43,244</span></h2>
										</span>
										<span class="light-primary-bg rvb-rent">
											<span>RENT</span>
											<h2><span class="dollar">$</span><span class="amount">43,244</span></h2>
										</span>
									</div>
									<div class="top-head light-primary-bg rvb-head rent-vs-buy-description"><b>Out of Pocket Cost:</b><span>If you opt for homeownership of a property valued at <span>$</span><span class="homeownership amount"></span>, your total expenses out of your pocket for <span class="years">2</span> years would add up to <span>$</span><span class="home amount"></span>. However, if you choose to rent instead, your overall expenditure would come to <span>$</span><span class="rent-cost amount"></span>, thus saving you <span>$</span><span class="renting-cost amount"></span> (which also covers the down payment you would have otherwise made).</span></div>
									<div class="top-head light-primary-bg rvb-head rent-vs-buy-description"><b>Financial Gain:</b><span>After <span class="years">2</span> years, if you choose to purchase the property, the value of equity in your home would be <span>$</span><span class="home-balance amount"></span>, which you can access upon selling it.</span></div>
									<div class="top-head light-primary-bg rvb-head rent-vs-buy-description"><b>Summary:</b><span>Based on the overall expenses incurred and the equity gained, it would be more advantageous for you to buy the property instead of renting, provided you intend to reside in the house for more than <span class="profit-year">2</span> years.</span></div>
								</div>
							</div>	
						</div>
						<div data-id="#veteran-affairs" class="veteran_affairs_calculator tab-content ">
							<div class="mortgage-item-colum">
								<div class="mortgage-item-colum-inner-item">
									<div class="top-head light-primary-bg"> <span>All Payment <span id="vaAllPayment"></span></span> <span>Total Loan Amount <span id="vatotalLoanAmount"></span></span> <span>Total Interest Paid <span id="vaTotalInterestPaid"></span></span></div>
										<div class="payment-breakdown-card card-item">
											<div class="card-inner-item">
												<div class="card-title">
													<h2>Payment Breakdown</h2>
													<div class="toltip-wrp">
														<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
														<div class="toltip">
															<b>Payment Breakdown</b>	
															<p>A breakdown of your total payment so you can see where money is allocated.</p>
														</div>
													</div>
												</div>
												<div class="graph-items">
													<div class="relative-graph">
														<div id="vaMortgageGraph">
															<canvas id="vaChart" width="300px" height="300px"></canvas>
														</div>
														<div class="absolute-center text-center graph-inner-text">
															<strong id="perMonthTotal" class="line-2 price-item">$1,915</strong>
															<p class="line-3 per-month">per month</p>
														</div>
													</div>
													<ul class="va-payment-results-list">
														<li><span class="dots principle-interest-color"></span><span>Principal & Interest <span id="vaPrinciple"></span></span></li>
														<li><span class="dots taxes-color"></span><span>Taxes <span id="vaTaxesSpan"></span></span></li>
														<li><span class="dots insurance-color"></span><span>Insurance <span id="vaHomeownersInsurenceSpan"></span></span></li>
														<li><span class="dots hoa-dues-color"></span><span>HOA Dues <span id="vaHOADuesSpan"></span></span></li>
														<li><span class="dots extra-payment-color"></span><span>Extra Payment <span id="vaExtraPaymentSpan"></span></span></li>
													</ul>
												</div>
											<div class="mt-payment-tabs-item va-payment-tabs-item">
												<ul id="va-mt-payment-tabs">
													<li class="active"><span datas="va_monthly_payment">Monthly Payment</a> </li>
													<li><span datas="va_total_payment">Total Payment </a> </li>
												</ul>
												<div class="mp-item tp-tabs-content active" id="va_monthly_payment">
													<ul>
														<li><span>Home Value: <span id="vaHomeVal"></span></span></li>
														<li><span>Mortgage Amount: <span id="valoanAmountVal"></span></span></li>
														<li><span>Monthly Principal & Interest: <span id="vaPrincipalIntrestVal"></span></span></li>
														<li><span>Monthly Extra Payment: <span id="vaExtraPaymentVal"></span></span></li>
														<li><span>Monthly Property Tax: <span id="vaPropertyTex"></span></span></li>
														<li><span>Monthly Home Insurance: <span id="vaHouseInsurance"></span></span></li>
														<li><span>Monthly HOA Fees: <span id="vaHOAV"></span></span></li>
													</ul>
												</div>
												<div class="tp-item tp-tabs-content" id="va_total_payment">
													<ul>
														<li><span>Total # Of Payments: <span id="vaTotalMonthPayment"></span></span></li>
														<li><span>Down Payment: <span id="vaTotalDownPayment"></span></span></li>
														<li><span>Principal: <span id="vaTotalPrincipalAmount"></span></span></li>
														<li><span>Total Extra Payment: <span id="vaTotalExtraPayment"></span></span></li>
														<li><span>Total Interest Paid: <span id="vaTotalIntrestPaid"></span></span></li>
														<li><span>Total Tax, Insurance and Fees: <span id="vaTotalInsuranceTex"></span></span></li>
														<li><span>Total of all Payments: <span id="vaTotalAllPayment"></span></span></li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="mortgage-item-colum">
								<div class="text-center-align get-approved-button">
									<div class="top-head light-red-bg"> <span>Savings <span id="vaSavings"></span></span> <span>Payment Amount <span id="vaPaymentAmount"></span></span> <span>Shorten Loan Term By <span id="vaPayOff"></span></span>
									</div>
									<div class="payment-breakdown-card card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h2>Early Payoff Strategy</h2>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
													<div class="toltip">
														<b>Early Payoff Strategy</b>	
														<p>Add an extra payment and see how many months you can eliminate on the back end of the loan.</p>
													</div>
												</div>
											</div>
											<div class="card-form-item">
												<label> Additional Monthly </label>
													<input type="text" pattern="\d*" maxlength="4" data-type="currency" id="vaAdditionalMonth" name="vaAdditionalMonth" placeholder="You can add below $500.00" value="">
												<label>Increase Frequency </label>
												<div class="va-frequency-button-wrap card-form-button">
													<button type="button" class="payoff active" data="1">Monthly</button>
													<button type="button" class="payoff" data="2">Bi weekly</button>
													<button type="button" class="payoff" data="3">Weekly</button>  
												</div>
											</div>
										</div>
									</div>
									<div class="payment-breakdown-card card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h2>Lump Sum Payment</h2>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
													<div class="toltip">
														<b>Lump Sum Payment</b>	
														<p>Shorten your loan term by paying a lump sum all to principal.</p>
													</div>
												</div>
											</div>
											<div class="card-form-item">
												<label> Lump Sum Addition </label>
													<input type="text" pattern="\d*" maxlength="7" data-type="currency" id="vaCashbombAmt" name="vaCashbombAmt" placeholder="You can add below $100k" value="">
												<label>Frequency </label>
												<div class="va-lump-sum-wrap card-form-button">
													<button type="button" class="lumpSum active" data="1">One time</button>
													<button type="button" class="lumpSum" data="2">Yearly</button>
													<button type="button" class="lumpSum" data="3">Quarterly</button>  
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div data-id="#va-refinance" class="refinance_calculator va_refinance_calculator payment-calculate-item tab-content "> 
							<div class="mortgage-item-colum monthly-payment-comparison-wrapper">
								<div class="mortgage-item-colum-inner-item">
									<div class="top-head light-primary-bg mpc-head"><span></span></div>
									<div class="top-head refinance-cost-head">
										<span class="light-primary-bg">
											<span>Monthly Payment Decrease</span>
											<h2><span class="dollar">$</span><span class="amount"></span></h2>
										</span>
										<span class="light-primary-bg">
											<span>Total Interest Difference</span>
											<h2><span class="dollar">$</span><span class="amount"></span></h2>
										</span>
									</div>
									<div class="card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h4>Monthly Payment Comparison</h4>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information-icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Monthly Payment Comparison</b>	
														<p>A breakdown of your total payment so you can see where money is allocated.</p>
													</div>
												</div>
											</div>
											<div class="refinance-data">
												<div class="progress-bar-wrapper">
													<div class="progress-bar-inner mpc-current-loan">
														<div class="refinance-loan-info">
															<p>Current Loan</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														<div id="myProgress" class="myProgress-1">
															<div id="myBar"></div>
														</div>
													</div>
													<div class="progress-bar-inner mpc-new-loan">
														<div class="refinance-loan-info">
															<p>New Loan</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														<div id="myProgress" class="myProgress-2">
															<div id="myBar"></div>
														</div>
													</div>
													<div class="progress-bar-inner mpc-difference">
														<div class="refinance-loan-info">
															<p>Monthly Payment Difference</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														<div id="myProgress" class="myProgress-3">
															<div id="myBar"></div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="mortgage-item-colum total-interest-comparison-wrapper">
								<div class="text-center-align get-approved-button">
									<div class="top-head light-primary-bg tic-head"><span></span></div>
									<div class="top-head refinance-cost-head">
										<span class="light-primary-bg">
											<span>Refinance Costs</span>
											<h2><span class="dollar">$</span><span class="amount"></span></h2>
										</span>
										<span class="light-primary-bg">
											<span>Time to Recoup Fees</span>
											<h2><span class="months"></span><span class="month-text"></span></h2>
										</span>
									</div>
									<div class="card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h4>Total Interest Comparison</h4>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20" data-lazy-src="${baseUrlWebsite}images/information-icon.svg" data-ll-status="loaded" class="entered lazyloaded"><noscript><img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/></noscript>
													<div class="toltip">
														<b>Total Interest Comparison</b>	
														<p>A breakdown of your total payment so you can see where money is allocated.</p>
													</div>
												</div>
											</div>
											<div class="refinance-data">
												<div class="progress-bar-wrapper">
													<div class="progress-bar-inner tic-current-loan">
														<div class="refinance-loan-info">
															<p>Current Loan Remaining Interest</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														<div id="myProgress" class="myProgress-1">
															<div id="myBar"></div>
														</div>
													</div>
													<div class="progress-bar-inner tic-new-loan">
														<div class="refinance-loan-info">
															<p>New Loan Interest</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														
														<div id="myProgress" class="myProgress-2">
															<div id="myBar"></div>
														</div>
													</div>
													<div class="progress-bar-inner tic-difference">
														<div class="refinance-loan-info">
															<p>Total Interest Difference</p>
															<span><span class="dollar">$</span><span class="amount"></span></span>
														</div>
														
														<div id="myProgress" class="myProgress-3">
															<div id="myBar"></div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>	
						</div>
						<!-- Rental Loan Calculator -->
						<div data-id="#rental-loan" class="rental_loan_calculator tab-content "> 
							<div class="mortgage-item-colum">
								<div class="mortgage-item-colum-inner-item">
									<div class="top-head rental-loan-cost-head">
										<span class="light-primary-bg active" id="rl-cash-flow">
											<span>Cash Flow</span>
											<h2><span class="dollar">$</span><span class="amount"></span></h2>
										</span>
										<span class="light-primary-bg" id="rl-cap-rate">
											<span>Cap Rate</span>
											<h2><span class="amount"></span><span class="percentage">%</span></h2>
										</span>
									</div>
									<div class="deal-breakdown-card card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h2>Deal Breakdown</h2>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
													<div class="toltip">
														<b>Deal Breakdown</b>	
														<p>A breakdown of your rental loan deal.</p>
													</div>
												</div>
											</div>
											<div class="card-content">
												<ul>
													<li><span>Loan Amount: <span id="rlLoanAmount"></span></span></li>
													<li><span>Down Payment: <span id="rlDownPayment"></span></span></li>
													<li><span>Mortgage Payment: <span id="rlMortgagePayment"></span></span></li>
													<li><span>Monthly Payment: <span id="rlMonthlyPayment"></span></span></li>
													<li><span>Origination Fee Amount: <span id="rlOriginationFeeAmount"></span></span></li>
												</ul>
											</div>
										</div>
									</div>
									<div class="deal-breakdown-card card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h2>Deal Metrics</h2>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
													<div class="toltip">
														<b>Deal Metrics</b>	
														<p>A metrics of your rental loan deal.</p>
													</div>
												</div>
											</div>
											<div class="card-content">
												<ul>
													<li><span>Total Closing Costs: <span id="rlTotalClosingCosts"></span></span></li>
													<li><span>Cash Needed to Close: <span id="rlCashNeededToClose"></span></span></li>
													<li><span>Price Per Unit: <span id="rlPricePerUnit"></span></span></li>
													<li><span>Gross Rental Income: <span id="rlGrossRentalIncome"></span></span></li>
													<li><span>Operating Expenses: <span id="rlOperatingExpenses"></span></span></li>
													<li><span>Net Operating Income: <span id="rlNetOperatingIncome"></span></span></li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="mortgage-item-colum">
								<div class="mortgage-item-colum-inner-item">
									<div class="top-head rental-loan-cost-head">
										<span class="light-primary-bg" id="rl-coc-return">
											<span>Cash on Cash Return</span>
											<h2><span class="amount"></span><span class="percentage">%</span></h2>
										</span>
										<span class="light-primary-bg" id="rl-dscr">
											<span>DSCR</span>
											<h2><span class="amount"></span></h2>
										</span>
									</div>
																		<div class="deal-breakdown-card card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h2>Return Metrics</h2>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
													<div class="toltip">
														<b>Deal Metrics</b>	
														<p>A metrics of your rental loan return.</p>
													</div>
												</div>
											</div>
											<div class="card-content card-toggle-items">
												<ul>
													<li>
														<div class="card-toggle-title"><span>Cash Flow: <span id="rlCashFlow"></span></span></div>
														<div class="card-toggle-content">Annual cash flow after all expenses and mortgage are paid.</div>
													</li>
													<li>
														<div class="card-toggle-title"><span>Cap Rate: <span id="rlCapRate"></span></span></div>
														<div class="card-toggle-content">Cap rate, or capitalization rate, is a metric that divides your net operating income (not including your mortgage) by the purchase price or property value. It is most useful in comparing multifamily properties.</div>
													</li>
													<li>
														<div class="card-toggle-title"><span>Cash on Cash Return: <span id="rlCashOnCashReturn"></span></span></div>
														<div class="card-toggle-content">Cash on cash return is a metric that divides your pre-tax cash flow by the total cash invested in the deal. This is a key metric for most investors.</div>
													</li>
													<li>
														<div class="card-toggle-title"><span>DSCR: <span id="rlDSCR"></span></span></div>
														<div class="card-toggle-content">DSCR calculates the ratio of rental income to your mortgage payment. Ideally, you&#039;ll have a DSCR of 1.0 or higher.</div>
													</li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<!-- Fix and Flip Calculator -->
						<div data-id="#fix-and-flip" class="fix_and_flip_calculator tab-content "> 
							<div class="mortgage-item-colum">
								<div class="mortgage-item-colum-inner-item">
									<div class="top-head fix-and-flip-cost-head">
										<span class="light-primary-bg active" id="ff-borrower-equity">
											<span>Borrower Equity Needed</span>
											<h2><span class="dollar">$</span><span class="amount"></span></h2>
										</span>
										<span class="light-primary-bg" id="ff-net-profit">
											<span>Net Profit</span>
											<h2><span class="dollar">$</span><span class="amount"></span></h2>
										</span>
									</div>
									<div class="deal-breakdown-card card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h2>Deal Breakdown</h2>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
													<div class="toltip">
														<b>Deal Breakdown</b>	
														<p>A breakdown of your rental loan deal.</p>
													</div>
												</div>
											</div>
											<div class="card-content">
												<ul>
													<li><span>Loan Amount: <span id="ffLoanAmount"></span></span></li>
													<li><span>Down Payment: <span id="ffDownPayment"></span></span></li>
													<li><span>Monthly Interest Payment: <span id="ffMonthlyInterestPayment"></span></span></li>
													<li><span>Total Interest Over Term: <span id="ffTotalInterestOverTerm"></span></span></li>
													<li><span>Origination Fee Amount: <span id="ffOriginationFeeAmount"></span></span></li>
													<li><span>Other Closing Costs Amount: <span id="ffOtherClosingCostsAmount"></span></span></li>
													<li><span>Cost To Sell Amount: <span id="ffCostToSellAmount"></span></span></li>
												</ul>
											</div>
										</div>
									</div>
									<div class="deal-breakdown-card card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h2>Deal Metrics</h2>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
													<div class="toltip">
														<b>Deal Metrics</b>	
														<p>A metrics of your rental loan deal.</p>
													</div>
												</div>
											</div>
											<div class="card-content">
												<ul>
													<li><span>Closing Costs: <span id="ffClosingCosts"></span></span></li>
													<li><span>Carrying Costs: <span id="ffCarryingCosts"></span></span></li>
													<li><span>Borrower Equity Needed: <span id="ffBorrowerEquityNeeded"></span></span></li>
													<li><span>Total Cash In Deal: <span id="ffTotalCashInDeal"></span></span></li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="mortgage-item-colum">
								<div class="mortgage-item-colum-inner-item">
									<div class="top-head fix-and-flip-cost-head">
										<span class="light-primary-bg" id="ff-return-on-investment">
											<span>Return on Investment</span>
											<h2><span class="amount"></span><span class="percentage">%</span></h2>
										</span>
										<span class="light-primary-bg" id="ff-loan-after-repaired-value">
											<span>Loan to After Repaired Value</span>
											<h2><span class="amount"></span><span class="percentage">%</span></h2>
										</span>
									</div>
																		<div class="deal-breakdown-card card-item">
										<div class="card-inner-item">
											<div class="card-title">
												<h2>Return Metrics</h2>
												<div class="toltip-wrp">
													<img src="${baseUrlWebsite}images/information-icon.svg" alt="information" width="20" height="20"/>
													<div class="toltip">
														<b>Deal Metrics</b>	
														<p>A metrics of your rental loan return.</p>
													</div>
												</div>
											</div>
											<div class="card-content card-toggle-items">
												<ul>
													<li><span>Net Profit: <span id="ffNetProfit"></span></span></li>
													<li><span>Loan to After Repaired Value: <span id="ffLoantoAfterRepairedValue"></span></span></li>
													<li><span>ROI: <span id="ffROI"></span></span></li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="company-details-container" style="display:none;">
						<input type="hidden" id="CompanyName" name="CompanyName" value="" /> 
						<input type="hidden" id="CompanyEmail" name="CompanyEmail" value="" /> 
						<input type="hidden" id="CompanyPhoneNumber" name="CompanyPhoneNumber" value="" /> 
					</div>
				</div>
			</div>
		</div>
<div>
  <p><strong>Disclaimer:</strong></p>
  <p>This calculator is intended for comparison and informational purposes only, and its accuracy cannot be guaranteed. We make no promises regarding the precision of any data or user inputs.</p>
  <p>It does not pre-qualify you for any loan program. For specific eligibility requirements, please consult one of our Loan Consultants. Qualification may also depend on factors such as credit scores and cash reserves, which are not included in this calculator. Interest rates and other costs may change at any time without notice. Additional fees like HOA dues are not calculated. All values, including interest rates, taxes, insurance, and PMI, are estimates for comparison only. We do not guarantee the completeness or accuracy of the calculator’s outputs.</p>
</div>
 `;

// Insert the HTML into the target div
document.getElementById("loan-calculator").innerHTML = calculatorHTML;