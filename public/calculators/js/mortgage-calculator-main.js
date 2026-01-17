var homePrice = parseFloat(frontend.home_val);
var downPayment = parseFloat(frontend.down_payment_val);
var homeownersInsurence = parseFloat(frontend.home_insurance_val);
var insurence = parseFloat(frontend.home_insurance_val);
var hoa = parseFloat(frontend.HOA_fees_val);
var taxes = parseFloat(frontend.property_tax_val);
var pmi = parseFloat(frontend.private_mortgage_insurance) / 12;
var extraInicial = parseFloat(frontend.extra_payment_per_month);
var extra = parseFloat(frontend.extra_payment_per_month);
var loanAmount = parseFloat(frontend.mortgage_amount_val);
var years = parseFloat(frontend.loan_terms_val);
var rate = parseFloat(frontend.interest_rate_val);
var Total = 0;
var totalInterestPaid = 0;
var PropertyTax = parseFloat(frontend.property_tax_val);
var TotalAllPayment = 0;
var monthly = 0;
var cashBombMoney = 50000;
var PaymentAmount = 0;
var labelAmount = "";
var slider1 = 1;
var numberCalc = 12;
var payOff = "";
var newPercentageDP = 0;

extra = extraInicial + monthly;
extra = parseFloat(extra);

var Terms = 12;
//for VA Calculator
var vaHomePrice = parseFloat(frontend.vaHomePrice);
var vaDownPayment = parseFloat(frontend.vaDownPayment);
var vaHomeInsurence = parseFloat(frontend.vaHomeInsurence);
var vaInsurence = parseFloat(frontend.vaHomeInsurence);
var vaHOA = parseFloat(frontend.vaHOA);
var vaTaxes = parseFloat(frontend.vaTaxes);
var vaExtraInicial = parseFloat(frontend.vaExtraInicial);
var vaExtra = 0;
var finalAmount = 0;
var vaYears = parseFloat(frontend.vaYears);
var vaRate = parseFloat(frontend.vaRate);
var vaTotal = 0;
var vaTotalInterestPaid = 0;
var vaPropertyTax = parseFloat(frontend.vaTaxes);
var vaTotalAllPayment = 0;
var vaMonthly = 0;
var vaCashBombMoney = 50000;
var vaPaymentAmount = 0;
var vaLabelAmount = "";
var vaSlider1 = 1;
var vaNumberCalc = Terms;
var vaPayOff = "";
var vaPMIPercentage = 0;
var vaLoanAmount = parseFloat(frontend.vaLoanAmount);
var fuLessFiveVaFundingFee = parseFloat(frontend.fu_less_five_va_funding_fee);
var fuGreaterFiveVaFundingFee = parseFloat(frontend.fu_greater_five_va_funding_fee);
var fuGreaterTenVaFundingFee = parseFloat(frontend.fu_greater_ten_va_funding_fee);
var afuLessFiveVaFundingFee = parseFloat(frontend.afu_less_five_va_funding_fee);
var afuGreaterFiveVaFundingFee = parseFloat(frontend.afu_greater_five_va_funding_fee);
var afuGreaterTenVaFundingFee = parseFloat(frontend.afu_greater_ten_va_funding_fee);
var vaFundingFee = fuLessFiveVaFundingFee;
var vaPrinciple = 0;

var corFistVaRefinanceFundingFee = parseFloat(frontend.cor_first_va_refinance_funding_fee);
var corAfterFirstVaRefinanceFundingFee = parseFloat(frontend.cor_after_first_va_refinance_funding_fee);
var iRRLVaRefinanceFundingFee = parseFloat(frontend.irrl_va_refinance_funding_fee);

vaExtra = vaExtraInicial + vaMonthly;
vaExtra = parseFloat(vaExtra);

var breakdownData = [];
var barChart = '';
var breakAmountArray = [];
var breakBGArray = [];
var breakLabelArray = [];
var breakBorderColorArray = [];
var $ = jQuery;

// Jquery Dependency
function formatNumber(n) {
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function mortgageFormatCurrency(input, blur) {
  var label = false;
  var input_val = input.val();
  var original_len = input_val.length;
  var caret_pos = input.prop("selectionStart");
  if (input_val === "") {
    input_val = input.text();
    label = true;
  }

  if (input_val === "") {
    return;
  }

  if (input.hasClass("percentage")) {
    return;
  }

  // check for decimal
  if (input_val.indexOf(".") >= 0) {
    var decimal_pos = input_val.indexOf(".");
    var left_side = input_val.substring(0, decimal_pos);
    var right_side = input_val.substring(decimal_pos);
    left_side = formatNumber(left_side);
    right_side = formatNumber(right_side);

    if (blur === "blur") {
      right_side += "00";
    }
    right_side = right_side.substring(0, 2);
    input_val = "$" + left_side + "." + right_side;
  } else {
    input_val = formatNumber(input_val);
    input_val = "$" + input_val;
    if (blur === "blur") {
      input_val += ".00";
    }
  }

  if (label) {
    if (input.parents().hasClass("payment-results-list") || input.parents().hasClass("va-payment-results-list")) {
      input.text("(" + input_val + ")");
    } else {
      input.text(input_val);
    }
  } else {
    input.val(input_val);
  }
}

// Refinance Calcultors Functionas.
function calculatePayment(rate, periods, present, future, type) {

  var result;
  if (rate === 0) {
    result = (present + future) / periods;
  } else {
    var term = Math.pow(1 + rate, periods);
    if (type === 1) {
      result = (future * rate / (term - 1) + present * rate / (1 - 1 / term)) / (1 + rate);
    } else {
      result = future * rate / (term - 1) + present * rate / (1 - 1 / term);
    }
  }
  return -result;
}
function calculateFuturePayment(rate, periods, payment, value, type) { // Return future value
  var result;
  if (rate === 0) {
    result = value + payment * periods;
  } else {
    var term = Math.pow(1 + rate, periods);
    if (type === 1) {
      result = value * term + payment * (1 + rate) * (term - 1) / rate;
    } else {
      result = value * term + payment * (term - 1) / rate;
    }
  }
  return -result;
}
function calculateTotalInterest(rate, periodsLeft, value) {
  var payment = calculatePayment(rate, periodsLeft, value, 0, 0);
  var interest = 0;
  interest = -value;
  for (var i = 1; i <= periodsLeft; i++) {
    interest += calculateFuturePayment(rate, i - 2, payment, value, 1) - payment;
  }
  interest *= rate; // Return cumulative interest
  return interest;
}
function calculateAmortizationSchedule(loanAmount, currentLoanPayment, newCurrentIntrest, current_loan_amount) {
  var loanAmount = loanAmount,
    monthlyPayment = currentLoanPayment,
    interestRate = newCurrentIntrest,
    principal = current_loan_amount;
  var monthlyInterestRate = interestRate / 12;
  var currentLoanAmount = loanAmount;
  var principalLeft = principal;
  var interestSchedule = [];
  var principalSchedule = [];
  var loanAmountSchedule = [];
  while (currentLoanAmount > 0) {
    var interestForMonth = principalLeft * monthlyInterestRate;
    var _principalPaid = monthlyPayment - interestForMonth;
    var nextLoanAmount = currentLoanAmount - _principalPaid;
    principalLeft = principalLeft - _principalPaid;
    if (nextLoanAmount < 0) {
      _principalPaid = currentLoanAmount;
      nextLoanAmount = 0;
    }
    currentLoanAmount = nextLoanAmount;
    interestSchedule.push(interestForMonth);
    principalSchedule.push(_principalPaid);
    loanAmountSchedule.push(currentLoanAmount);
  }
  return {
    interestSchedule: interestSchedule,
    principalSchedule: principalSchedule,
    loanAmountSchedule: loanAmountSchedule
  };
};
// Create our number formatter.
var refinanaceFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  currency: 'USD',
  minimumFractionDigits: 0
});

function refinanceCalculate() {
  if (jQuery("#veteran-affairs .mortgage-error").length > 0) {
    return false;
  }
  var current_loan_amount   = jQuery('#originalLoanAmount').val();
  var current_loan_term     = jQuery('#originalLoanTerm').val();
  var current_interest_rate = jQuery('#currentIntrestRate').val();
  var startDate             = jQuery('#refinance-item .loan-start-date').val();
  var new_loan_amount       = jQuery('#newLoanAmount').val();
  var new_loan_term         = jQuery('#newLoanTerm').val();
  var new_interest_rate     = jQuery('#newIntrestRate').val();
  var cashout_amount        = jQuery('#cashOutAmount').val();
  var refinance_fees        = jQuery('#refinanceFees').val();
  var currentLoanBalance    = jQuery('#currentLoanBalance').val();
  var newLoanStartDate      = jQuery('#refinance-item .new-loan-start-date').val();
  
  current_loan_amount   = ( current_loan_amount != '' ) ? parseFloat( current_loan_amount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  current_loan_term     = ( current_loan_term != '' ) ? parseFloat( current_loan_term.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  current_interest_rate = ( current_interest_rate != '' ) ? parseFloat( current_interest_rate.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;

  new_loan_amount       = ( new_loan_amount != '' ) ? parseFloat( new_loan_amount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  new_loan_term         = ( new_loan_term != '' ) ? parseFloat( new_loan_term.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  new_interest_rate     = ( new_interest_rate != '' ) ? parseFloat( new_interest_rate.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  cashout_amount        = ( cashout_amount != '' ) ? parseFloat( cashout_amount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  refinance_fees        = ( refinance_fees != '' ) ? parseFloat( refinance_fees.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  currentLoanBalance    = ( currentLoanBalance != '' ) ? parseFloat( currentLoanBalance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;

  var payingRefinanceCost = jQuery("#refinance-item input[name='paying_refinance_cost']:checked").val();
  if ( payingRefinanceCost == 'true' ) {
    new_loan_amount = currentLoanBalance + refinance_fees + cashout_amount;
    jQuery('#newLoanAmount').val(new_loan_amount);
  } else {
    new_loan_amount = currentLoanBalance + cashout_amount ;
    jQuery('#newLoanAmount').val(new_loan_amount);
  }

  var low_monthly_payment = jQuery("#refinance-item input[name='low_monthly_payment']:checked").val();
  jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head span').removeClass('active');
  if ( low_monthly_payment == 'true' ) {
    jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:first').addClass('active');
  } else {
    jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)').addClass('active');
  }

  if (jQuery('#originalLoanTerm').hasClass("month")) {
    current_loan_term = current_loan_term / 12;
  }

  if (jQuery('#newLoanTerm').hasClass("month")) {
    new_loan_term = new_loan_term / 12;
  }

  var monthlyCurrentRate    = current_interest_rate / 100 / 12;
  var monthlyNewRate        = new_interest_rate / 100 / 12;
  var currentMinimumPayment = monthlyCurrentRate * current_loan_amount / (1 - Math.pow(1 + monthlyCurrentRate, -1 * current_loan_term * 12));
  var newMinimumPayment     = Math.abs(calculatePayment(monthlyNewRate, new_loan_term * 12, new_loan_amount, 0, 0));
  var paymentDifference     = Math.round(newMinimumPayment) - Math.round(currentMinimumPayment);
 

    if ( !isNaN(currentMinimumPayment) && !isNaN(newMinimumPayment) ) {
      var refiLoanMonthlyWidth = newMinimumPayment / currentMinimumPayment * 100 * .66;
      var crntLoanMonthlyWidth = currentMinimumPayment / newMinimumPayment * 100 * .66;
      
      jQuery('.mpc-current-loan .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(Math.round(currentMinimumPayment)))).counterUp({
        delay: 6,
        time: 1000
      });
      jQuery('.mpc-new-loan .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(Math.round(newMinimumPayment)))).counterUp({
        delay: 6,
        time: 1000
      });

      if( currentMinimumPayment < newMinimumPayment ) {
        jQuery('.mpc-current-loan .myProgress-1 #myBar').css('width', crntLoanMonthlyWidth.toFixed(2) + '%');
      } else {
        jQuery('.mpc-current-loan .myProgress-1 #myBar').css('width', '100%');
      }
      if( currentMinimumPayment > newMinimumPayment ) {
        jQuery('.mpc-new-loan .myProgress-2 #myBar').css({'width': refiLoanMonthlyWidth.toFixed(2) + '%', "background-color":"#5dc76f"});
      } else {
        jQuery('.mpc-new-loan .myProgress-2 #myBar').css({'width':'100%', "background-color":"#f8d7da"});
      }

    }
    if ( !isNaN(paymentDifference) ) {
      
      if ( paymentDifference > 0 ) {
        jQuery('.mpc-difference .refinance-loan-info span .dollar').html("$");
        jQuery('.mpc-difference .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(paymentDifference))).counterUp({
          delay: 6,
          time: 1000
        });
        jQuery('.monthly-payment-comparison-wrapper .mpc-head span').html(" Your monthly payment will increases $" + refinanaceFormatter.format(parseInt(paymentDifference)) + " per month.");
       
        jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:first>span').html("Monthly Payment Increase");
        jQuery('.total-interest-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .months').html("-");
        jQuery('.total-interest-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .month-text').html("");
        jQuery('.total-interest-comparison-wrapper .tic-head span').html("--");
      }
      else if( paymentDifference < 0 ) {
        paymentDifference = Math.abs( paymentDifference );
        jQuery('.mpc-difference .refinance-loan-info span .dollar').html("-$");
        jQuery('.mpc-difference .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(paymentDifference))).counterUp({
          delay: 6,
          time: 1000
        });
        jQuery('.monthly-payment-comparison-wrapper .mpc-head span').html(" Your monthly payment will decreases $" + refinanaceFormatter.format(parseInt(paymentDifference)) + " per month.");
        jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:first>span').html("Monthly Payment Decrease");
        if ( !isNaN(refinance_fees) ) { 
          var recoupMonths = refinance_fees / Math.abs(paymentDifference);
          jQuery('.total-interest-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .months').html(numberWithCommas(recoupMonths, 1)).counterUp({
            delay: 6,
            time: 1000
          });
          jQuery('.total-interest-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .month-text').html(" months");
          jQuery('.total-interest-comparison-wrapper .tic-head span').html("It will take you " + numberWithCommas(recoupMonths, 1) + " months to recoup the cost to refinance.");
        }
      
      }
      var diffLoanMonthlyWidth = paymentDifference / currentMinimumPayment * 100 * .66;
      if( currentMinimumPayment > newMinimumPayment ) {
        jQuery('.mpc-difference .myProgress-3 #myBar').css({'width': diffLoanMonthlyWidth.toFixed(2) + '%', "background-color":"#5dc76f"});
      } else {
        jQuery('.mpc-difference .myProgress-3 #myBar').css({'width':'100%', "background-color":"#f8d7da"});
      }
      
      jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:first>h2 .amount').html(refinanaceFormatter.format(parseInt(paymentDifference))).counterUp({
        delay: 6,
        time: 1000
      });
    }
    if ( !isNaN(refinance_fees) ) { 
      jQuery('.total-interest-comparison-wrapper .refinance-cost-head>span:first>h2 .amount').html(refinanaceFormatter.format(parseInt(refinance_fees))).counterUp({
        delay: 6,
        time: 1000
      });
    }
   
    var totalInterest = calculateTotalInterests(new_loan_amount, new_interest_rate, new_loan_term);
    var currentTotalInterest = getCurrentLoanRemainingInterest(current_loan_amount, current_interest_rate, currentMinimumPayment, startDate, current_loan_term, newLoanStartDate );
    
    if ( !isNaN(totalInterest) && !isNaN(currentTotalInterest) ) {  
      var totalInterestWidth        = totalInterest / currentTotalInterest * 100 * .66;
      var currentTotalInterestWidth = currentTotalInterest / totalInterest * 100 * .66;
      var totalSaved                = totalInterest - currentTotalInterest;
    
      jQuery('.tic-new-loan .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(totalInterest))).counterUp({
        delay: 6,
        time: 1000
      });
      jQuery('.tic-current-loan .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(currentTotalInterest))).counterUp({
        delay: 6,
        time: 1000
      });
      
      if( totalSaved > 0 ) {
        jQuery('.tic-difference .refinance-loan-info span .dollar').html("$");
        jQuery('.tic-difference .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(totalSaved))).counterUp({
          delay: 6,
          time: 1000
        });
        jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .dollar').html("$");
        jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .amount').html(refinanaceFormatter.format(parseInt(totalSaved))).counterUp({
          delay: 6,
          time: 1000
        });
      } else if( totalSaved < 0 ) {
        totalSaved = Math.abs( totalSaved );
        jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .amount').html(refinanaceFormatter.format(parseInt(totalSaved))).counterUp({
          delay: 6,
          time: 1000
        });
        jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .dollar').html("-$");
        jQuery('.tic-difference .refinance-loan-info span .dollar').html("-$");
        jQuery('.tic-difference .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(totalSaved))).counterUp({
          delay: 6,
          time: 1000
        });
      }
      var totalSavedWidth = totalSaved / currentTotalInterest * 100 * .66;
      if( currentTotalInterestWidth < totalInterestWidth ) {
        jQuery('.tic-current-loan .myProgress-1 #myBar').css('width', currentTotalInterestWidth.toFixed(2) + '%');
      } else {
        jQuery('.tic-current-loan .myProgress-1 #myBar').css('width', '100%');
      }
      if( currentTotalInterestWidth > totalInterestWidth ) {
        jQuery('.tic-new-loan .myProgress-2 #myBar').css({'width': totalInterestWidth.toFixed(2) + '%', "background-color":"#5dc76f"});
        jQuery('.tic-difference .myProgress-3 #myBar').css({'width': totalSavedWidth.toFixed(2) + '%', "background-color":"#5dc76f"});
      } else {
        jQuery('.tic-new-loan .myProgress-2 #myBar').css({'width':'100%', "background-color":"#f8d7da"});
        jQuery('.tic-difference .myProgress-3 #myBar').css({'width':'100%', "background-color":"#f8d7da"});
      }
    }
    refinanceAllElementCurrencyRefresh();
}

function vaRefinanceCalculate() {
  if (jQuery("#va-refinance .mortgage-error").length > 0) {
    return false;
  }
  var current_loan_amount   = jQuery('#VARefinanceOriginalLoanAmount').val();
  var current_loan_term     = jQuery('#VARefinanceOriginalLoanTerm').val();
  var current_interest_rate = jQuery('#VARefinanceCurrentInterestRate').val();
  var startDate             = jQuery('#va-refinance .loan-start-date').val();
  var new_loan_amount       = jQuery('#VARefinanceNewLoanAmount').val();
  var new_loan_term         = jQuery('#VARefinanceNewLoanTerm').val();
  var new_interest_rate     = jQuery('#VARefinanceNewInterestRate').val();
  var cashout_amount        = jQuery('#VARefinanceCashOutAmount').val();
  var refinance_fees        = jQuery('#VARefinanceRefinanceFees').val();
  var currentLoanBalance    = jQuery('#VARefinanceCurrentLoanBalance').val();
  var newLoanStartDate      = jQuery('#va-refinance .new-loan-start-date').val();
  
  current_loan_amount   = ( current_loan_amount != '' ) ? parseFloat( current_loan_amount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  current_loan_term     = ( current_loan_term != '' ) ? parseFloat( current_loan_term.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  current_interest_rate = ( current_interest_rate != '' ) ? parseFloat( current_interest_rate.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;

  new_loan_amount       = ( new_loan_amount != '' ) ? parseFloat( new_loan_amount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  new_loan_term         = ( new_loan_term != '' ) ? parseFloat( new_loan_term.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  new_interest_rate     = ( new_interest_rate != '' ) ? parseFloat( new_interest_rate.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  cashout_amount        = ( cashout_amount != '' ) ? parseFloat( cashout_amount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  refinance_fees        = ( refinance_fees != '' ) ? parseFloat( refinance_fees.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  currentLoanBalance    = ( currentLoanBalance != '' ) ? parseFloat( currentLoanBalance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;

  var vaRefinancePurposeOptions = jQuery('#vaRefinancePurposeOptions').find(":selected").val();
  var vaRefinanceFundingFeeOptions = jQuery('#vaRefinanceFundingFeeOptions').find(":selected").val();
  var vaRefinanceFundingFee = 0;
  if ( vaRefinancePurposeOptions == 'cash_out_refinance' ) {
    if ( vaRefinanceFundingFeeOptions == 'first_use' ) {
      vaRefinanceFundingFee = corFistVaRefinanceFundingFee;
    } else {
      vaRefinanceFundingFee = corAfterFirstVaRefinanceFundingFee;
    }
  }
  if ( vaRefinancePurposeOptions == 'interest_rate_reduction' ) {
    vaRefinanceFundingFee = iRRLVaRefinanceFundingFee;
  }
  if ( vaRefinanceFundingFeeOptions == 'exempt_va_funding_fee' ) { 
    vaRefinanceFundingFee = 0;
  }

  jQuery(".mortage-item-input #VARefinanceFundingFee").val(vaRefinanceFundingFee);
  var vaNewLoanAmount = 0;
  var vaRefinanceFundingExtraFee = 0;
  var payingRefinanceCost = jQuery("#va-refinance input[name='paying_refinance_cost']:checked").val();
  if ( payingRefinanceCost == 'true' ) {
    vaNewLoanAmount = currentLoanBalance + refinance_fees + cashout_amount;
    vaRefinanceFundingExtraFee = ( vaRefinanceFundingFee / 100 ) * vaNewLoanAmount;
    new_loan_amount = vaNewLoanAmount + parseFloat(vaRefinanceFundingExtraFee.toFixed(2));
    jQuery('#VARefinanceNewLoanAmount').val(new_loan_amount);
  } else {
    vaNewLoanAmount = currentLoanBalance + cashout_amount;
    vaRefinanceFundingExtraFee = ( vaRefinanceFundingFee / 100 ) * vaNewLoanAmount;
    new_loan_amount = vaNewLoanAmount + parseFloat(vaRefinanceFundingExtraFee.toFixed(2));
    jQuery('#VARefinanceNewLoanAmount').val(new_loan_amount);
  }

  var low_monthly_payment = jQuery("#va-refinance input[name='low_monthly_payment']:checked").val();
  jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head span').removeClass('active');
  if ( low_monthly_payment == 'true' ) {
    jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:first').addClass('active');
  } else {
    jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)').addClass('active');
  }

  if (jQuery('#VARefinanceOriginalLoanTerm').hasClass("month")) {
    current_loan_term = current_loan_term / 12;
  }

  if (jQuery('#VARefinanceNewLoanTerm').hasClass("month")) {
    new_loan_term = new_loan_term / 12;
  }

  var monthlyCurrentRate    = current_interest_rate / 100 / 12;
  var monthlyNewRate        = new_interest_rate / 100 / 12;
  var currentMinimumPayment = monthlyCurrentRate * current_loan_amount / (1 - Math.pow(1 + monthlyCurrentRate, -1 * current_loan_term * 12));
  var newMinimumPayment     = Math.abs(calculatePayment(monthlyNewRate, new_loan_term * 12, new_loan_amount, 0, 0));
  var paymentDifference     = Math.round(newMinimumPayment) - Math.round(currentMinimumPayment);
 

    if ( !isNaN(currentMinimumPayment) && !isNaN(newMinimumPayment) ) {
      var refiLoanMonthlyWidth = newMinimumPayment / currentMinimumPayment * 100 * .66;
      var crntLoanMonthlyWidth = currentMinimumPayment / newMinimumPayment * 100 * .66;
      
      jQuery('.va_refinance_calculator .mpc-current-loan .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(Math.round(currentMinimumPayment)))).counterUp({
        delay: 6,
        time: 1000
      });
      jQuery('.va_refinance_calculator .mpc-new-loan .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(Math.round(newMinimumPayment)))).counterUp({
        delay: 6,
        time: 1000
      });

      if( currentMinimumPayment < newMinimumPayment ) {
        jQuery('.va_refinance_calculator .mpc-current-loan .myProgress-1 #myBar').css('width', crntLoanMonthlyWidth.toFixed(2) + '%');
      } else {
        jQuery('.va_refinance_calculator .mpc-current-loan .myProgress-1 #myBar').css('width', '100%');
      }
      if( currentMinimumPayment > newMinimumPayment ) {
        jQuery('.va_refinance_calculator .mpc-new-loan .myProgress-2 #myBar').css({'width': refiLoanMonthlyWidth.toFixed(2) + '%', "background-color":"#5dc76f"});
      } else {
        jQuery('.va_refinance_calculator .mpc-new-loan .myProgress-2 #myBar').css({'width':'100%', "background-color":"#f8d7da"});
      }

    }
    if ( !isNaN(paymentDifference) ) {
      
      if ( paymentDifference > 0 ) {
        jQuery('.va_refinance_calculator .mpc-difference .refinance-loan-info span .dollar').html("$");
        jQuery('.va_refinance_calculator .mpc-difference .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(paymentDifference))).counterUp({
          delay: 6,
          time: 1000
        });
        jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .mpc-head span').html(" Your monthly payment will increases $" + refinanaceFormatter.format(parseInt(paymentDifference)) + " per month.");
       
        jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:first>span').html("Monthly Payment Increase");
        jQuery('.va_refinance_calculator .total-interest-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .months').html("-");
        jQuery('.va_refinance_calculator .total-interest-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .month-text').html("");
        jQuery('.va_refinance_calculator .total-interest-comparison-wrapper .tic-head span').html("--");
      }
      else if( paymentDifference < 0 ) {
        paymentDifference = Math.abs( paymentDifference );
        jQuery('.va_refinance_calculator .mpc-difference .refinance-loan-info span .dollar').html("-$");
        jQuery('.va_refinance_calculator .mpc-difference .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(paymentDifference))).counterUp({
          delay: 6,
          time: 1000
        });
        jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .mpc-head span').html(" Your monthly payment will decreases $" + refinanaceFormatter.format(parseInt(paymentDifference)) + " per month.");
        jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:first>span').html("Monthly Payment Decrease");
        if ( !isNaN(refinance_fees) ) { 
          var recoupMonths = refinance_fees / Math.abs(paymentDifference);
          jQuery('.va_refinance_calculator .total-interest-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .months').html(numberWithCommas(recoupMonths, 1)).counterUp({
            delay: 6,
            time: 1000
          });
          jQuery('.va_refinance_calculator .total-interest-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .month-text').html(" months");
          jQuery('.va_refinance_calculator .total-interest-comparison-wrapper .tic-head span').html("It will take you " + numberWithCommas(recoupMonths, 1) + " months to recoup the cost to refinance.");
        }
      
      }
      var diffLoanMonthlyWidth = paymentDifference / currentMinimumPayment * 100 * .66;
      if( currentMinimumPayment > newMinimumPayment ) {
        jQuery('.va_refinance_calculator .mpc-difference .myProgress-3 #myBar').css({'width': diffLoanMonthlyWidth.toFixed(2) + '%', "background-color":"#5dc76f"});
      } else {
        jQuery('.va_refinance_calculator .mpc-difference .myProgress-3 #myBar').css({'width':'100%', "background-color":"#f8d7da"});
      }
      
      jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:first>h2 .amount').html(refinanaceFormatter.format(parseInt(paymentDifference))).counterUp({
        delay: 6,
        time: 1000
      });
    }
    if ( !isNaN(refinance_fees) ) { 
      jQuery('.va_refinance_calculator .total-interest-comparison-wrapper .refinance-cost-head>span:first>h2 .amount').html(refinanaceFormatter.format(parseInt(refinance_fees))).counterUp({
        delay: 6,
        time: 1000
      });
    }
   
    var totalInterest = calculateTotalInterests(new_loan_amount, new_interest_rate, new_loan_term);
    var currentTotalInterest = getCurrentLoanRemainingInterest(current_loan_amount, current_interest_rate, currentMinimumPayment, startDate, current_loan_term, newLoanStartDate );
    
    if ( !isNaN(totalInterest) && !isNaN(currentTotalInterest) ) {  
      var totalInterestWidth        = totalInterest / currentTotalInterest * 100 * .66;
      var currentTotalInterestWidth = currentTotalInterest / totalInterest * 100 * .66;
      var totalSaved                = totalInterest - currentTotalInterest;
    
      jQuery('.va_refinance_calculator .tic-new-loan .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(totalInterest))).counterUp({
        delay: 6,
        time: 1000
      });
      jQuery('.va_refinance_calculator .tic-current-loan .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(currentTotalInterest))).counterUp({
        delay: 6,
        time: 1000
      });
      
      if( totalSaved > 0 ) {
        jQuery('.va_refinance_calculator .tic-difference .refinance-loan-info span .dollar').html("$");
        jQuery('.va_refinance_calculator .tic-difference .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(totalSaved))).counterUp({
          delay: 6,
          time: 1000
        });
        jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .dollar').html("$");
        jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .amount').html(refinanaceFormatter.format(parseInt(totalSaved))).counterUp({
          delay: 6,
          time: 1000
        });
      } else if( totalSaved < 0 ) {
        totalSaved = Math.abs( totalSaved );
        jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .amount').html(refinanaceFormatter.format(parseInt(totalSaved))).counterUp({
          delay: 6,
          time: 1000
        });
        jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)>h2 .dollar').html("-$");
        jQuery('.va_refinance_calculator .tic-difference .refinance-loan-info span .dollar').html("-$");
        jQuery('.va_refinance_calculator .tic-difference .refinance-loan-info span .amount').html(refinanaceFormatter.format(parseInt(totalSaved))).counterUp({
          delay: 6,
          time: 1000
        });
      }
      var totalSavedWidth = totalSaved / currentTotalInterest * 100 * .66;
      if( currentTotalInterestWidth < totalInterestWidth ) {
        jQuery('.va_refinance_calculator .tic-current-loan .myProgress-1 #myBar').css('width', currentTotalInterestWidth.toFixed(2) + '%');
      } else {
        jQuery('.va_refinance_calculator .tic-current-loan .myProgress-1 #myBar').css('width', '100%');
      }
      if( currentTotalInterestWidth > totalInterestWidth ) {
        jQuery('.va_refinance_calculator .tic-new-loan .myProgress-2 #myBar').css({'width': totalInterestWidth.toFixed(2) + '%', "background-color":"#5dc76f"});
        jQuery('.va_refinance_calculator .tic-difference .myProgress-3 #myBar').css({'width': totalSavedWidth.toFixed(2) + '%', "background-color":"#5dc76f"});
      } else {
        jQuery('.va_refinance_calculator .tic-new-loan .myProgress-2 #myBar').css({'width':'100%', "background-color":"#f8d7da"});
        jQuery('.va_refinance_calculator .tic-difference .myProgress-3 #myBar').css({'width':'100%', "background-color":"#f8d7da"});
      }
    }
    vaRefinanceAllElementCurrencyRefresh();
}

function VACalculate(finalAmount, vaRate, vaYears) {
  if (jQuery("#veteran-affairs .mortgage-error").length > 0) {
    return false;
  }

  // Downpayment
  var newVADownPayment = vaDownPayment;
  vaPMIPercentage = vaDownPayment;
  if ( jQuery("#VADownPayment").hasClass("percentage") ) {
    newVADownPayment = (parseFloat( newVADownPayment ) / 100) * vaHomePrice;
    newVADownPayment = parseFloat(newVADownPayment.toFixed(2));
  } else {
    vaPMIPercentage = (vaPMIPercentage * 100) / vaHomePrice;
    vaPMIPercentage = vaPMIPercentage.toFixed(2);
  }
  var vaPMIPercentageNum = parseFloat(vaPMIPercentage);
  var vaFundingFeeOptions = jQuery('#vaFundingFeeOptions').find(":selected").val();
  if ( vaPMIPercentageNum < 5 ) {
    if ( vaFundingFeeOptions == 'first_use' ) {
      vaFundingFee = fuLessFiveVaFundingFee;
    } else {
      vaFundingFee = afuLessFiveVaFundingFee;
    }
  } else if( vaPMIPercentageNum >= 10 ) {
    if ( vaFundingFeeOptions == 'first_use' ) {
      vaFundingFee = fuGreaterTenVaFundingFee;
    } else {
      vaFundingFee = afuGreaterTenVaFundingFee;
    }
  } else if( vaPMIPercentageNum >= 5 ) {
    if ( vaFundingFeeOptions == 'first_use' ) {
      vaFundingFee = fuGreaterFiveVaFundingFee;
    } else {
      vaFundingFee = afuGreaterFiveVaFundingFee;
    }
  }
  if ( vaFundingFeeOptions == 'exempt_va_funding_fee' ) { 
    vaFundingFee = 0;
  }

  jQuery(".veteran-affairs-item-input #VAFundingFee").val(vaFundingFee);
  var newVaLoanAmount = parseFloat(vaHomePrice) - newVADownPayment;
  var vaFundingExtraFee = ( vaFundingFee / 100 ) * newVaLoanAmount;
  finalAmount = newVaLoanAmount + parseFloat(vaFundingExtraFee.toFixed(2));
  vaLoanAmount = finalAmount;
  jQuery("#VAMortageAmount").val(newVaLoanAmount);
  jQuery("#vaTotalDownPayment").html("$" + parseFloat(newVADownPayment).toFixed(2));
  jQuery("#finalMortageLoanAmount").val(finalAmount);
  jQuery("#vatotalLoanAmount").html("$" + parseFloat(finalAmount).toFixed(2));
  jQuery("#valoanAmountVal").html("$" + parseFloat(finalAmount).toFixed(2));
  jQuery("#vaHomeVal").html("$" + parseFloat(vaHomePrice).toFixed(2));
  jQuery("#vaHOADuesSpan").html("$" + parseFloat(vaHOA).toFixed(2));
  jQuery("#vaHOAV").html("$" + parseFloat(vaHOA).toFixed(2));  
  jQuery("#vaExtraPaymentSpan").html("$" + parseFloat(vaExtra).toFixed(2));
  jQuery("#vaExtraPaymentVal").html("$" + parseFloat(vaExtra).toFixed(2));

  var radioValue = jQuery("input[name='va_payment_frequency']:checked").val();

  if ( radioValue == 'Month' ) {
    Terms = 12;
  } else {
    Terms = 1;
  }
  vaNumberCalc = Terms;
  // Principal & Intrest.
  var r = vaRate / 100;
  r = parseFloat(r / vaNumberCalc);
  var n = vaYears * vaNumberCalc;
  n = parseFloat(n);
  var P = parseFloat(finalAmount);
  vaPrinciple = P * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

  if (r > 0) {
    jQuery("#vaPrinciple").html("$" + parseFloat(vaPrinciple).toFixed(2));
    jQuery("#vaPrincipalIntrestVal").html("$" + parseFloat(vaPrinciple).toFixed(2));
  } else {
    jQuery("#vaPrinciple").text("$0");
    jQuery("#vaPrincipalIntrestVal").text("$0");
  }

  //Home Insurence.
  vaCalcInsurence(vaHomeInsurence);

  //Property Tax.
  vaTaxesCallback(vaHomePrice, vaPropertyTax);
  
  // Total Sum
  vaTotalSum(vaPrinciple, vaHOA, vaTaxes, vaInsurence, vaExtra);

  //Total Extra, Total Intrest Count.
  var totalMonth = parseFloat(vaYears) * Terms;
  var newVABalance = finalAmount;
  var totalExtraPayment = 0;
  var newDownPaymentCal = finalAmount - (finalAmount * 20) / 100;
  var newExtraAllPayments = 0;
  var newPrinciple = vaPrinciple;
  var totalIntrestCount = 0;
  for (var toalNoOfMonth = 1; toalNoOfMonth < totalMonth; toalNoOfMonth++) {
    var perMonthIntrest = ((vaRate / Terms) * newVABalance) / 100;
    var perMonthPrincipal = newPrinciple - perMonthIntrest + vaExtra;
    newVABalance = newVABalance - perMonthPrincipal;
    if (newVABalance > 0) {
      totalExtraPayment = totalExtraPayment + vaExtra;
      totalIntrestCount = totalIntrestCount + perMonthIntrest;   
      newExtraAllPayments = newExtraAllPayments + vaHOA + vaInsurence + vaTaxes;
    }
    if ( newVABalance < 0 ) {
      var extraIntrest = ((vaRate / Terms) * newVABalance) / 100;
      totalIntrestCount = totalIntrestCount + perMonthIntrest;
      newExtraAllPayments = newExtraAllPayments + vaHOA + vaInsurence + vaTaxes;
      break;
    } 
  }

  if ( newVABalance > 0 && toalNoOfMonth == totalMonth ) { 
    var extraIntrest = ((vaRate / Terms) * newVABalance) / 100;
    totalIntrestCount = totalIntrestCount + extraIntrest;
    newExtraAllPayments =  newExtraAllPayments + vaHOA + vaInsurence + vaTaxes;
  }

  var newPrincipalAmount = finalAmount - totalExtraPayment;

  jQuery("#vaTotalMonthPayment").html(toalNoOfMonth);
  jQuery("#vaTotalExtraPayment").html("$" + parseFloat(totalExtraPayment).toFixed(2));
  jQuery("#vaTotalInsuranceTex").html("$" + parseFloat(newExtraAllPayments).toFixed(2));
  jQuery("#vaTotalPrincipalAmount").html("$" + parseFloat(newPrincipalAmount).toFixed(2));
  jQuery("#vaTotalIntrestPaid").html("$" + parseFloat(totalIntrestCount).toFixed(2));
  jQuery("#vaTotalInterestPaid").html("$" + parseFloat(totalIntrestCount).toFixed(2));

  var newTotalAllPayment = totalExtraPayment + newPrincipalAmount + totalIntrestCount + newExtraAllPayments + parseFloat(newVADownPayment);
  jQuery("#vaAllPayment").html("$" + parseFloat(newTotalAllPayment).toFixed(2));
  jQuery("#vaTotalAllPayment").html("$" + parseFloat(newTotalAllPayment).toFixed(2));

  if (slider1 == 1) {
    vaMonthlySlider();
  } else if (slider1 == 2) {
    vaBiweekly();
  } else {
    vaWeekly();
  }
  vaGraph(vaPrinciple, vaHOA, vaTaxes, vaInsurence, vaExtra);
  vaAllElementCurrencyRefresh();
}

function vaTaxesCallback(vaHomePrice, vaPropertyTax) {
  if (!jQuery('#VAPropertyTax').hasClass("percentage")) {
    vaPropertyTax = (vaPropertyTax * 100) / vaHomePrice;
  }
  vaPropertyTax = vaPropertyTax / 100;
  vaTaxes = (vaHomePrice * vaPropertyTax) / Terms;
  jQuery("#vaTaxesSpan").html("$" + parseFloat(vaTaxes).toFixed(2));
  jQuery("#vaPropertyTex").html("$" + parseFloat(vaTaxes).toFixed(2));
}

function vaCalcInsurence(vaHomeInsurence) {
  vaInsurence = parseFloat(vaHomeInsurence);
  vaInsurence = vaInsurence / Terms;
  vaInsurence = parseFloat(vaInsurence);
  jQuery("#vaHomeownersInsurenceSpan").html("$" + parseFloat(vaInsurence).toFixed(2));
  jQuery("#vaHouseInsurance").html("$" + parseFloat(vaInsurence).toFixed(2));
}

function vaTotalSum(vaPrinciple, vaHOA, vaTaxes, vaInsurence, vaExtra) {
  vaTotal = vaPrinciple + vaHOA + vaTaxes + vaInsurence + vaExtra;
  vaTotal = parseFloat(vaTotal);
  jQuery("#vaPaymentAmount").html("$" + parseFloat(vaTotal).toFixed(2));
  vaGraph(vaPrinciple, vaHOA, vaTaxes, vaInsurence, vaExtra);
}

function vaBiweekly() {
  vaPaymentAmount = ((vaTotal * 12) / 52) * 2;
  vaPaymentAmount = parseFloat(vaPaymentAmount);
  vaLabelAmount = "/bi-wkly";
  jQuery("#vaPaymentAmount").html("$" + vaPaymentAmount.toFixed(2).toString() + labelAmount);
  mortgageFormatCurrency(jQuery("#vaPaymentAmount"));
}

function vaWeekly() {
  vaPaymentAmount = (vaTotal * 12) / 52;
  vaPaymentAmount = parseFloat(vaPaymentAmount);
  vaLabelAmount = "/wkly";
  jQuery("#vaPaymentAmount").html("$" + vaPaymentAmount.toFixed(2).toString() + labelAmount);
  mortgageFormatCurrency(jQuery("#vaPaymentAmount"));
}

function vaMonthlySlider() {
  vaPaymentAmount = parseFloat(vaTotal);
  vaLabelAmount = "/mthly";
  jQuery("#vaPaymentAmount").html("$" + vaPaymentAmount.toFixed(2).toString() + labelAmount);
  mortgageFormatCurrency(jQuery("#vaPaymentAmount"));
}

function mortgageCalculate(loanAmount, rate, years) {
  if (jQuery(".mortgage-error").length > 0) {
    return false;
  }
  // Principal & Intrest.
  var r = rate / 100;
  r = parseFloat(r / numberCalc);
  var n = years * numberCalc;
  n = parseFloat(n);
  var P = parseFloat(loanAmount);
  principle = P * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  if (r > 0) {
    jQuery("#principle").html("$" + parseFloat(principle).toFixed(2));
    jQuery("#PrincipalIntrestVal").html("$" + parseFloat(principle).toFixed(2));
  } else {
    jQuery("#principle").text("$0");
    jQuery("#PrincipalIntrestVal").text("$0");
  }

  var newDownPayment = downPayment;
  newPercentageDP = downPayment;
  if (jQuery("#mortageDownPayment").hasClass("percentage")) {
    newDownPayment = (newDownPayment / 100) * homePrice;
    newDownPayment = newDownPayment.toFixed(2);
  } else {
    newPercentageDP = (newPercentageDP * 100) / homePrice;
    newPercentageDP = newPercentageDP.toFixed(2);
  }

  //call functions for mortgage formula.
  calcInsurence(homeownersInsurence);
  Taxes(homePrice, PropertyTax);
  mortgageTotalSum(principle, hoa, taxes, pmi, insurence, extra);

  var totalMonth = parseFloat(years) * 12;

  // extra fileds
  jQuery("#totalLoanAmount").html("$" + parseFloat(loanAmount).toFixed(2));
  jQuery("#HOADuesSpan").html("$" + parseFloat(hoa).toFixed(2));
  jQuery("#HOAVal").html("$" + parseFloat(hoa).toFixed(2));
  jQuery("#extraPaymentSpan").html("$" + parseFloat(extra).toFixed(2));
  jQuery("#extraPaymentVal").html("$" + parseFloat(extra).toFixed(2));
  jQuery("#homeownersInsurenceSpan").html("$" + parseFloat(insurence).toFixed(2));
  jQuery("#houseInsuranceVal").html("$" + parseFloat(insurence).toFixed(2));
  jQuery("#TaxesSpan").html("$" + parseFloat(taxes).toFixed(2));
  jQuery("#propertTexVal").html("$" + parseFloat(taxes).toFixed(2));
  jQuery("#homeVal").html("$" + parseFloat(homePrice).toFixed(2));

  if(jQuery("#mortageLoanAmount").hasClass('mortage-loan-triggerred')) {
    if( jQuery("#mortageDownPayment").hasClass("percentage") ) {      
      jQuery("#mortageDownPayment").val(newPercentageDP);
    } else {
      var finalMortageDownPayment = homePrice - loanAmount;
      newDownPayment = finalMortageDownPayment;
      jQuery("#mortageDownPayment").val(finalMortageDownPayment);
    }
    jQuery("#mortageLoanAmount").removeClass('mortage-loan-triggerred');
  }

  var finalDownPayment = homePrice - newDownPayment;
  jQuery("#mortageLoanAmount").val(finalDownPayment);
  jQuery("#loanAmountVal").html("$" + parseFloat(finalDownPayment).toFixed(2));
  jQuery("#totalDownPayment").html("$" + parseFloat(newDownPayment).toFixed(2));

  var newBalance = finalDownPayment;
  var totalExtraPayment = 0;
  var newDownPaymentCal = homePrice - (homePrice * 20) / 100;
  var newExtraAllPayments = 0;
  var newPrinciple = principle;
  var totalIntrestCount = 0;
  var pmiUntilMonth = 0;
  for (var m = 1; m < totalMonth; m++) {
    var perMonthIntrest = ((rate / 12) * newBalance) / 100;
    var perMonthPrincipal = newPrinciple - perMonthIntrest + extra;
    newBalance = newBalance - perMonthPrincipal;
    if (newBalance > 0) {
      totalExtraPayment = totalExtraPayment + extra;
      totalIntrestCount = totalIntrestCount + perMonthIntrest;
      if (newBalance > newDownPaymentCal) {
        if (newPercentageDP < 20) {
          newExtraAllPayments = newExtraAllPayments + hoa + pmi + insurence + taxes; 
          pmiUntilMonth = pmiUntilMonth + 1;
        } else {
          newExtraAllPayments = newExtraAllPayments + hoa + insurence + taxes;
        }
      } else {
        newExtraAllPayments = newExtraAllPayments + hoa + insurence + taxes;
      }
    }
    if ( newBalance < 0 ) {
      var extraIntrest = ((rate / 12) * newBalance) / 100;
      totalIntrestCount = totalIntrestCount + perMonthIntrest;
      newExtraAllPayments = newPercentageDP < 20 ? newExtraAllPayments + hoa + pmi + insurence + taxes : newExtraAllPayments + hoa + insurence + taxes;
      break;
    } 
  }

  if ( newBalance > 0 && m == totalMonth ) { 
    var extraIntrest = ((rate / 12) * newBalance) / 100;
    totalIntrestCount = totalIntrestCount + extraIntrest;
    newExtraAllPayments = newPercentageDP < 20 ? newExtraAllPayments + hoa + pmi + insurence + taxes : newExtraAllPayments + hoa + insurence + taxes;
  }

  var newPrincipalAmount = finalDownPayment - totalExtraPayment;
  totalInterestPaid = totalIntrestCount;
  jQuery("#totalMonthPayment").html(m);
  jQuery("#totalExtraPayment").html("$" + parseFloat(totalExtraPayment).toFixed(2));
  jQuery("#totalInsuranceTex").html("$" + parseFloat(newExtraAllPayments).toFixed(2));
  jQuery("#totalPrincipalAmount").html("$" + parseFloat(newPrincipalAmount).toFixed(2));
  jQuery("#totalInterestPaid").html("$" + parseFloat(totalInterestPaid).toFixed(2));
  jQuery("#totalIntrestPaid").html("$" + parseFloat(totalInterestPaid).toFixed(2));
  if (newPercentageDP < 20) {
    jQuery("#pmiSpan").html("$" + parseFloat(pmi).toFixed(2));
    jQuery("#PMIVal").html("$" + parseFloat(pmi).toFixed(2));
  } else {
    jQuery("#pmiSpan").addClass("percentage").html("(PMI not required)");
    jQuery("#PMIVal").addClass("percentage").html("(PMI not required)");
  }

  if (pmiUntilMonth !== 0) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var dt = new Date(jQuery("#datepicker").datepicker().val());
    dt.setMonth(dt.getMonth() + pmiUntilMonth);
    var monthName = months[dt.getMonth()];
    jQuery("#PMICount").html(" (Until " + monthName + ", " + dt.getFullYear() + ")");
  } else {
    jQuery("#PMICount").html("");
  }

  var newTotalAllPayment = totalExtraPayment + newPrincipalAmount + totalInterestPaid + newExtraAllPayments + parseFloat(newDownPayment);
  jQuery("#allPayment").html("$" + parseFloat(newTotalAllPayment).toFixed(2));
  jQuery("#totalAllPayment").html("$" + parseFloat(newTotalAllPayment).toFixed(2));

  if (slider1 == 1) {
    monthlySlider();
  } else if (slider1 == 2) {
    biweekly();
  } else {
    weekly();
  }
  allElementCurrencyRefresh();
}

function mortgageTotalSum(principle, hoa, taxes, pmi, insurence, extra) {
  Total = newPercentageDP < 20 ? principle + hoa + taxes + pmi + insurence + extra : principle + hoa + taxes + insurence + extra;
  //Total = principle + hoa + taxes + pmi + insurence + extra;
  Total = parseFloat(Total);
  jQuery("#paymentAmount").html("$" + parseFloat(Total).toFixed(2));
  graph(principle, hoa, taxes, pmi, insurence, extra);
}

function Taxes(homePrice, PropertyTax) {
  PropertyTax = PropertyTax / 100;
  taxes = (homePrice * PropertyTax) / 12;
}

function calcInsurence(homeownersInsurence) {
  insurence = parseFloat(homeownersInsurence);
  insurence = insurence / 12;
  insurence = parseFloat(insurence);
}

function biweekly() {
  PaymentAmount = ((Total * 12) / 52) * 2;
  PaymentAmount = parseFloat(PaymentAmount);
  labelAmount = "/bi-wkly";
  jQuery("#paymentAmount").html(
    "$" + PaymentAmount.toFixed(2).toString() + labelAmount
  );
  mortgageFormatCurrency(jQuery("#paymentAmount"));
}

function weekly() {
  PaymentAmount = (Total * 12) / 52;
  PaymentAmount = parseFloat(PaymentAmount);
  labelAmount = "/wkly";
  jQuery("#paymentAmount").html(
    "$" + PaymentAmount.toFixed(2).toString() + labelAmount
  );
  mortgageFormatCurrency(jQuery("#paymentAmount"));
}

function monthlySlider() {
  PaymentAmount = parseFloat(Total);
  labelAmount = "/mthly";
  jQuery("#paymentAmount").html(
    "$" + PaymentAmount.toFixed(2).toString() + labelAmount
  );
  mortgageFormatCurrency(jQuery("#paymentAmount"));
}

function graph(principle, hoa, taxes, pmi, insurence, extra) {
  jQuery("#mortgageGraph").html('<canvas id="myChart" width="300px" height="300px"></canvas>');
  var ctx = jQuery("#myChart");
  var data = {
    labels: ["Principle and Interest", "HOA", "Taxes", "PMI", "Insurance", "Extra Payment"],
    datasets: [
      {
        data: [ principle.toFixed(2), hoa.toFixed(2), taxes.toFixed(2), pmi.toFixed(2), insurence.toFixed(2), extra.toFixed(2)],
        backgroundColor: [ frontend.piColor, frontend.hoaDues, frontend.taxes, frontend.pmi, frontend.insurance, frontend.extraPay]
      },
    ],
  };

  var options = {
    cutoutPercentage: 70,
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          return data["datasets"][0]["data"][tooltipItem["index"]];
        },
      },
      backgroundColor: "#5DC76F",
      displayColors: false,
      cornerRadius: 18,
      caretSize: 0,
	    xPadding: 10,
	    yPadding: 10,
    },
    legend: {
      display: false,
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  var myDoughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: data,
    options: options,
  });

  Chart.pluginService.register({
    afterDraw: function (chart) {
      jQuery(".text-center .line-2").text("$" + parseFloat(Total).toFixed(2));
      mortgageFormatCurrency(jQuery(".text-center .line-2"));
    },
  });
}

function vaGraph(vaPrinciple, vaHOA, vaTaxes, vaInsurence, vaExtra) {
  jQuery("#vaMortgageGraph").html('<canvas id="vaChart" width="300px" height="300px"></canvas>');
  var ctx = jQuery("#vaChart");
  var data = {
    labels: ["Principle and Interest", "HOA", "Taxes", "Insurance", "Extra Payment"],
    datasets: [
      {
        data: [ vaPrinciple.toFixed(2), vaHOA.toFixed(2), vaTaxes.toFixed(2), vaInsurence.toFixed(2), vaExtra.toFixed(2)],
        backgroundColor: [ frontend.vaPiColor, frontend.vaHoaDues, frontend.vaTaxesColor, frontend.vaInsurance, frontend.vaExtraPay]
      },
    ],
  };

  var options = {
    cutoutPercentage: 70,
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          return data["datasets"][0]["data"][tooltipItem["index"]];
        },
      },
      backgroundColor: "#5DC76F",
      displayColors: false,
      cornerRadius: 18,
      caretSize: 0,
	    xPadding: 10,
	    yPadding: 10,
    },
    legend: {
      display: false,
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  var myDoughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: data,
    options: options,
  });

  Chart.pluginService.register({
    afterDraw: function (chart) {
      jQuery("#perMonthTotal").text("$" + parseFloat(vaTotal).toFixed(2));
      mortgageFormatCurrency(jQuery("#perMonthTotal"));
    },
  });
}

function refinanceGraph() {
  jQuery(".barChart").html('<canvas id="barChart"  height="250px" width="240px"></canvas>');

  var bgData = breakBGArray;

  var ctx = jQuery("#barChart");

  barChart = new Chart(ctx, {
    type: 'bar',
	responsive: true,
    data: {
      labels: breakLabelArray,
      datasets: [{
        data: breakAmountArray,
        borderColor: breakBorderColorArray,
        backgroundColor: bgData,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
	  cornerRadius: 2,
      legend: {
        display: false
      },
      tooltips: {enabled: false},
      hover: {mode: null},
      showMyTooltips: '',
      scales: {
          xAxes: [{
              gridLines: {display: false},
              ticks:{display: false}
          }],
          yAxes: [{
              gridLines:{display: false},
              ticks:{display: false}
          }]
      },
  }
  });
}

function mortgageCalcPayOff() {
  var monthsLeftTotal = 0;
  var yearsLeftTotal = 0;

  var rnd = function (n) {
    return Math.round(n * 100) / 100; // round to 2 digits
  };

  var principal = Number(loanAmount);
  var interest = Number(rate);
  var months = Number(years * 12);

  var i = interest / 100.0 / 12;
  var payment = rnd(principal * (i + i / (Math.pow(1 + i, months) - 1)));

  //var tabledata = '';
  var m;
  var balance = principal - cashBombMoney;
  var totalinterest = 0;
  var monthsLeft = 0;
  var bombFrequency = jQuery(".lump-sum-wrap .lumpSum.active").attr("data");
  var bombAmount = jQuery("#cashbombAmt").val();
  bombAmount = bombAmount.replace("$", "").replace(/[^0-9.-]+/g, "");
  if ( bombAmount === '' ) {
    bombAmount = 1;
  }
  var yearCount = 0;

  //Cash Bomb cycle.
  for (m = 1; m < months && bombAmount > 1; m++) {
    if (bombFrequency == 2) {
      yearCount++;

      if (yearCount == 12) {
        balance = balance - cashBombMoney;
        yearCount = 0;
      }
    }

    if (bombFrequency == 3) {
      yearCount++;

      if (yearCount == (months / 4).toFixed(0)) {
        balance = balance - cashBombMoney;
        yearCount = 0;
      }
    }

    var tointerest = rnd(balance * i);
    totalinterest = totalinterest + tointerest;
    var toprincipal = rnd(payment - tointerest);
    balance = rnd(balance - toprincipal);

    if (balance < 0) {
      monthsLeft = months - m;
      break;
    }
  }

  var savings = 0;

  if (Number(bombAmount) > 1) {
    yearsLeft = Number((monthsLeft / 12).toFixed(0));
    monthsLeft = Number(monthsLeft - yearsLeft * 12);
    yearsLeftTotal = yearsLeft;
    monthsLeftTotal = monthsLeft;
    savings = totalInterestPaid - totalinterest;
  }

  var principal = Number(loanAmount);
  var interest = Number(rate);
  var months = Number(years * 12);

  var i = interest / 100.0 / 12;

  var m;
  var balance = principal;
  var totalinterest = 0;
  var monthsLeft = 0;
  var bombFrequency = jQuery(".frequency-button-wrap .payoff.active").attr(
    "data"
  );
  var yearCount = 0;
  var payment = rnd(principal * (i + i / (Math.pow(1 + i, months) - 1)));
  var numPayments = 12;
  var monthlyAdd = monthly;

  if (bombFrequency == 2) {
    numPayments = 26;
    months = Number(years * numPayments);
    payment = payment / 2;
    monthlyAdd = monthly / 2;
  }

  if (bombFrequency == 3) {
    numPayments = 52;
    months = Number(years * numPayments);
    payment = payment / 4;
    monthlyAdd = monthly / 4;
  }

  var monthlyAdd = monthly;

  // Increase Frequency and Additional Monthly.
  for (m = 1; m < months && numPayments > 0; m++) {
    var tointerest = rnd(((interest / numPayments) * balance) / 100);
    totalinterest = totalinterest + tointerest;
    var toprincipal = rnd(payment - tointerest);
    balance = rnd(balance - toprincipal - monthlyAdd);

    if (balance < 0) {
      monthsLeft = months - m;
      break;
    }
  }

  if (bombFrequency == 2) {
    yearsLeft = (monthsLeft / 26).toFixed(0);
    monthsLeft = ((monthsLeft - yearsLeft * 26) * 12) / 26;
  }

  if (bombFrequency == 3) {
    yearsLeft = (monthsLeft / 26 / 2).toFixed(0);
    monthsLeft = ((monthsLeft - yearsLeft * 52) * 12) / 26 / 2;
  }

  if (bombFrequency == 1) {
    yearsLeft = Math.floor(monthsLeft / 12);
    monthsLeft = monthsLeft - yearsLeft * 12;
  }

  // Sum all totals.
  yearsLeftTotal = yearsLeftTotal + Number(yearsLeft);
  monthsLeftTotal = monthsLeftTotal + Number(monthsLeft.toFixed(0));

  if (yearsLeftTotal > 0) {
    yearsLeft = yearsLeftTotal + " years";
  } else {
    yearsLeft = "";
  }

  if (monthsLeftTotal > 0) {
    monthsLeft = " " + monthsLeftTotal + " months";
  } else {
    monthsLeft = "";
  }
  if (yearsLeftTotal > 0 || monthsLeftTotal > 0) {
    payOff = yearsLeft + monthsLeft;
  }

  if (totalinterest > 0) {
    var n = years * 12;
    n = parseFloat(n);
    var totalIntrestforsaving = (n * principle) - loanAmount;
    savings = savings +  ( totalIntrestforsaving - totalinterest );
  }

  if (monthsLeftTotal == 0 && yearsLeftTotal == 0) {
    payOff = "-";
    savings = "$0";
  } else {
    savings = "$" + parseFloat(savings).toFixed(2);
  }

  jQuery("#payOff").text(payOff);

  jQuery("#savings").text(savings);
  mortgageFormatCurrency(jQuery("#savings"));
}

function veteranAffairsCalcPayOff() {
  var monthsLeftTotal = 0;
  var yearsLeftTotal = 0;

  var rnd = function (n) {
    return Math.round(n * 100) / 100; // round to 2 digits
  };

  var principal = Number(vaLoanAmount);
  var interest = Number(vaRate);
  var months = Number(vaYears * Terms);

  var i = interest / 100.0 / Terms;
  var payment = rnd(principal * (i + i / (Math.pow(1 + i, months) - 1)));

  //var tabledata = '';
  var m;
  var balance = principal - vaCashBombMoney;
  var totalinterest = 0;
  var monthsLeft = 0;
  var bombFrequency = jQuery(".va-lump-sum-wrap .lumpSum.active").attr("data");
  var bombAmount = jQuery("#vaCashbombAmt").val();
  bombAmount = bombAmount.replace("$", "").replace(/[^0-9.-]+/g, "");
  if ( bombAmount === '' ) {
    bombAmount = 1;
  }
  var yearCount = 0;

  //Cash Bomb cycle.
  for (m = 1; m < months && bombAmount > 1; m++) {
    if (bombFrequency == 2) {
      yearCount++;

      if (yearCount == Terms) {
        balance = balance - vaCashBombMoney;
        yearCount = 0;
      }
    }

    if (bombFrequency == 3) {
      yearCount++;

      if (yearCount == (months / 4).toFixed(0)) {
        balance = balance - vaCashBombMoney;
        yearCount = 0;
      }
    }

    var tointerest = rnd(balance * i);
    totalinterest = totalinterest + tointerest;
    var toprincipal = rnd(payment - tointerest);
    balance = rnd(balance - toprincipal);

    if (balance < 0) {
      monthsLeft = months - m;
      break;
    }
  }

  var savings = 0;

  if (Number(bombAmount) > 1) {
    yearsLeft = Number((monthsLeft / Terms).toFixed(0));
    monthsLeft = Number(monthsLeft - yearsLeft * Terms);
    yearsLeftTotal = yearsLeft;
    monthsLeftTotal = monthsLeft;
    savings = totalInterestPaid - totalinterest;
  }

  var principal = Number(vaLoanAmount);
  var interest = Number(vaRate);
  var months = Number(vaYears * Terms);

  var i = interest / 100.0 / Terms;

  var m;
  var balance = principal;
  var totalinterest = 0;
  var monthsLeft = 0;
  var bombFrequency = jQuery(".va-frequency-button-wrap .payoff.active").attr("data");
  var yearCount = 0;
  var payment = rnd(principal * (i + i / (Math.pow(1 + i, months) - 1)));
  var numPayments = 12;
  var monthlyAdd = vaMonthly;

  if (bombFrequency == 2) {
    numPayments = 26;
    months = Number(years * numPayments);
    payment = payment / 2;
    monthlyAdd = monthly / 2;
  }

  if (bombFrequency == 3) {
    numPayments = 52;
    months = Number(years * numPayments);
    payment = payment / 4;
    monthlyAdd = monthly / 4;
  }

  var monthlyAdd = vaMonthly;

  // Increase Frequency and Additional Monthly.
  for (m = 1; m < months && numPayments > 0; m++) {
    var tointerest = rnd(((interest / numPayments) * balance) / 100);
    totalinterest = totalinterest + tointerest;
    var toprincipal = rnd(payment - tointerest);
    balance = rnd(balance - toprincipal - monthlyAdd);

    if (balance < 0) {
      monthsLeft = months - m;
      break;
    }
  }

  if (bombFrequency == 2) {
    yearsLeft = (monthsLeft / 26).toFixed(0);
    monthsLeft = ((monthsLeft - yearsLeft * 26) * Terms) / 26;
  }

  if (bombFrequency == 3) {
    yearsLeft = (monthsLeft / 26 / 2).toFixed(0);
    monthsLeft = ((monthsLeft - yearsLeft * 52) * Terms) / 26 / 2;
  }

  if (bombFrequency == 1) {
    yearsLeft = Math.floor(monthsLeft / Terms);
    monthsLeft = monthsLeft - yearsLeft * Terms;
  }

  // Sum all totals.
  yearsLeftTotal = yearsLeftTotal + Number(yearsLeft);
  monthsLeftTotal = monthsLeftTotal + Number(monthsLeft.toFixed(0));

  if (yearsLeftTotal > 0) {
    yearsLeft = yearsLeftTotal + " years";
  } else {
    yearsLeft = "";
  }

  if (monthsLeftTotal > 0) {
    monthsLeft = " " + monthsLeftTotal + " months";
  } else {
    monthsLeft = "";
  }
  if (yearsLeftTotal > 0 || monthsLeftTotal > 0) {
    payOff = yearsLeft + monthsLeft;
  }

  if (totalinterest > 0) {
    var n = vaYears * 12;
    n = parseFloat(n);
    var totalIntrestforsaving = (n * vaPrinciple) - vaLoanAmount;
    savings = savings +  ( totalIntrestforsaving - totalinterest );
  }

  if (monthsLeftTotal == 0 && yearsLeftTotal == 0) {
    payOff = "-";
    savings = "$0";
  } else {
    savings = "$" + parseFloat(savings).toFixed(2);
  }

  jQuery("#vaPayOff").text(payOff);

  jQuery("#vaSavings").text(savings);
  mortgageFormatCurrency(jQuery("#vaSavings"));
}

function rentalLoanCalculate() {

  var rl_no_of_units   = jQuery('#RentalLoanNoOfUnits').val();
  var rl_por     = jQuery("input[name='rental_loan_por']:checked").val();
  var rl_property_value     = jQuery('#RentalLoanPropertyValuePurchasePrice').val();
  var rl_unit1_montly_rent     = jQuery('#RentalLoanUnit1MonthlyRent').val();
  var rl_annual_property_taxes     = jQuery('#RentalLoanAnnualPropertyTaxes').val();
  var rl_annual_insurance     = jQuery('#RentalLoanAnnualInsurance').val();
  var rl_monthly_hoa_fee    = jQuery('#RentalLoanMonthlyHOAFee').val();
  var rl_vacancy_rate     = jQuery('#RentalLoanVacancyRate').val();
  var rl_annual_repairs_maintenance     = jQuery('#RentalLoanAnnualRepairsMaintenance').val();
  var rl_annual_utilities     = jQuery('#RentalLoanAnnualUtilities').val();
  var rl_loan_to_value     = jQuery('#RentalLoanLoanToValue').val();
  var rl_interest_rate     = jQuery('#RentalLoanInterestRate').val();
  var rl_origination_fee     = jQuery('#RentalLoanOriginationFee').val();
  var rl_closing_cost     = jQuery('#RentalLoanClosingCosts').val();

  rl_property_value   = ( rl_property_value != '' ) ? parseFloat( rl_property_value.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rl_unit1_montly_rent   = ( rl_unit1_montly_rent != '' ) ? parseFloat( rl_unit1_montly_rent.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rl_annual_property_taxes   = ( rl_annual_property_taxes != '' ) ? parseFloat( rl_annual_property_taxes.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rl_annual_insurance   = ( rl_annual_insurance != '' ) ? parseFloat( rl_annual_insurance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rl_annual_repairs_maintenance   = ( rl_annual_repairs_maintenance != '' ) ? parseFloat( rl_annual_repairs_maintenance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rl_annual_utilities   = ( rl_annual_utilities != '' ) ? parseFloat( rl_annual_utilities.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rl_closing_cost   = ( rl_closing_cost != '' ) ? parseFloat( rl_closing_cost.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;


  var rl_loan_amount = ( rl_property_value * rl_loan_to_value) / 100;
  var rl_down_amount = ( rl_property_value - rl_loan_amount);

  jQuery("#rlLoanAmount").html("$" + parseFloat(rl_loan_amount).toFixed(2));
  jQuery("#rlDownPayment").html("$" + parseFloat(rl_down_amount).toFixed(2));

  var rl_loan_period_months = 360;  // 30 years loan
  var rl_monthly_interest_rate = rl_interest_rate / 12 / 100;
  var rl_mortage_payments = rl_loan_amount * rl_monthly_interest_rate / (1 - Math.pow(1 + rl_monthly_interest_rate, -rl_loan_period_months));
  jQuery("#rlMortgagePayment").html("$" + parseFloat(rl_mortage_payments).toFixed(2));

  var rl_monthly_payments = ( rl_mortage_payments + ( ( rl_annual_property_taxes + rl_annual_insurance + 0) / 12 ) );
  jQuery("#rlMonthlyPayment").html("$" + parseFloat(rl_monthly_payments).toFixed(2));

  var rl_organisation_amount = ( rl_origination_fee * rl_loan_amount ) / 100;
  jQuery("#rlOriginationFeeAmount").html("$" + parseFloat(rl_organisation_amount).toFixed(2));

  var rl_total_closing_cost = parseFloat(rl_organisation_amount)+parseFloat(rl_closing_cost);
  jQuery("#rlTotalClosingCosts").html("$" + parseFloat(rl_total_closing_cost).toFixed(2));

  var rl_cash_needed_to_close = parseFloat(rl_down_amount)+parseFloat(rl_total_closing_cost);
  jQuery("#rlCashNeededToClose").html("$" + parseFloat(rl_cash_needed_to_close).toFixed(2));

  var rl_price_per_unit = (rl_property_value / rl_no_of_units);
  jQuery("#rlPricePerUnit").html("$" + parseFloat(rl_price_per_unit).toFixed(2));

  var rl_gross_rental_income = (12 * rl_unit1_montly_rent) * rl_no_of_units;
  jQuery("#rlGrossRentalIncome").html("$" + parseFloat(rl_gross_rental_income).toFixed(2));

  var rl_operating_expenses = ( rl_annual_property_taxes + rl_annual_insurance + rl_annual_utilities + (rl_annual_repairs_maintenance * rl_no_of_units) + ((rl_vacancy_rate * rl_gross_rental_income)/100));
  jQuery("#rlOperatingExpenses").html("$" + parseFloat(rl_operating_expenses).toFixed(2));

  var rl_net_operating_income = (rl_gross_rental_income - rl_operating_expenses);
  jQuery("#rlNetOperatingIncome").html("$" + parseFloat(rl_net_operating_income).toFixed(2));

  var rl_cash_flow = rl_gross_rental_income - (rl_monthly_payments*12) - rl_annual_repairs_maintenance - rl_annual_utilities - ((rl_vacancy_rate * rl_gross_rental_income)/100);
  jQuery("#rlCashFlow").html(parseFloat(rl_cash_flow).toFixed(2));

  var rl_cap_rate = ((rl_net_operating_income/rl_property_value)*100);
  jQuery("#rlCapRate").html(parseFloat(rl_cap_rate).toFixed(2) + "%");

  var rl_coc_return = ((rl_cash_flow/rl_cash_needed_to_close)*100);
  jQuery("#rlCashOnCashReturn").html(parseFloat(rl_coc_return).toFixed(2) + "%");

  var rl_dscr = (rl_unit1_montly_rent/rl_monthly_payments);
  jQuery("#rlDSCR").html(parseFloat(rl_dscr).toFixed(2));

  // Cash Flow 
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-cash-flow .amount').html(refinanaceFormatter.format(parseFloat(Math.abs(rl_cash_flow)).toFixed(2)));
  let cash_flow_class = '';
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-cash-flow .dollar').html('$');
  if( rl_cash_flow < 0 ) {
    jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-cash-flow .dollar').html('-$');
    cash_flow_class = 'negative';
  }
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-cash-flow').removeClass('negative').addClass(cash_flow_class);

  // Cap Rate
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-cap-rate .amount').html(refinanaceFormatter.format(parseFloat(Math.abs(rl_cap_rate)).toFixed(2)));
  let cap_rate_class = '';
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-cap-rate h2').find('.symbol').remove();
  if( rl_cap_rate < 0 ) {
    jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-cap-rate h2').prepend('<span class="symbol">-</span>');
    cap_rate_class = 'negative';
  }
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-cap-rate').removeClass('negative').addClass(cap_rate_class);

  // Cash on Return
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-coc-return .amount').html(refinanaceFormatter.format(parseFloat(Math.abs(rl_coc_return)).toFixed(2)));
  let coc_return_class = '';
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-coc-return h2').find('.symbol').remove();
  if( rl_coc_return < 0 ) {
    jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-coc-return h2').prepend('<span class="symbol">-</span>');
    coc_return_class = 'negative';
  }
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-coc-return').removeClass('negative').addClass(coc_return_class);
  
  // DSCR
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-dscr .amount').html(refinanaceFormatter.format(parseFloat(Math.abs(rl_dscr)).toFixed(2)));
  let dscr_class = '';
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-dscr h2').find('.symbol').remove();
  if( rl_dscr < 0 ) {
    jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-dscr h2').prepend('<span class="symbol">-</span>');
    dscr_class = 'negative';
  }
  jQuery('.rental_loan_calculator .rental-loan-cost-head #rl-dscr').removeClass('negative').addClass(dscr_class);

  mortgageFormatCurrency(jQuery("#rlLoanAmount"));
  mortgageFormatCurrency(jQuery("#rlDownPayment"));
  mortgageFormatCurrency(jQuery("#rlMortgagePayment"));
  mortgageFormatCurrency(jQuery("#rlMonthlyPayment"));
  mortgageFormatCurrency(jQuery("#rlOriginationFeeAmount"));
  mortgageFormatCurrency(jQuery("#rlTotalClosingCosts"));
  mortgageFormatCurrency(jQuery("#rlCashNeededToClose"));
  mortgageFormatCurrency(jQuery("#rlPricePerUnit"));
  mortgageFormatCurrency(jQuery("#rlGrossRentalIncome"));
  mortgageFormatCurrency(jQuery("#rlOperatingExpenses"));
  mortgageFormatCurrency(jQuery("#rlNetOperatingIncome"));
  mortgageFormatCurrency(jQuery("#rlCashFlow"));

  if( rl_cash_flow < 0 ) {
    jQuery("#rlCashFlow").html('-'+jQuery("#rlCashFlow").html());
  }

}

function rentalLoanFormatCurrency() {
  mortgageFormatCurrency(jQuery("#RentalLoanPropertyValuePurchasePrice"));
  mortgageFormatCurrency(jQuery("#RentalLoanUnit1MonthlyRent"));
  mortgageFormatCurrency(jQuery("#RentalLoanAnnualPropertyTaxes"));
  mortgageFormatCurrency(jQuery("#RentalLoanAnnualInsurance"));
  mortgageFormatCurrency(jQuery("#RentalLoanMonthlyHOAFee"));
  mortgageFormatCurrency(jQuery("#RentalLoanAnnualUtilities"));
  mortgageFormatCurrency(jQuery("#RentalLoanClosingCosts"));
}

function FixAndFlipCalculate() {

  var ff_purchase_price   = jQuery('#FixAndFlipPurchasePrice').val();
  var ff_renovation_cost     = jQuery('#FixAndFlipRenovationCost').val();
  var ff_after_repaired_value     = jQuery('#FixAndFlipAfterRepairedValue').val();
  var ff_length_of_loan     = jQuery('#FixAndFlipLengthOfLoan').val();
  var ff_annual_property_taxes     = jQuery('#FixAndFlipAnnualPropertyTaxes').val();
  var ff_annual_insurance    = jQuery('#FixAndFlipAnnualInsurance').val();
  var ff_purchase_price_ltv     = jQuery('#FixAndFlipPurchasePriceLTV').val();
  var ff_intrest_rate     = jQuery('#FixAndFlipIntrestRate').val();
  var ff_origination_fee     = jQuery('#FixAndFlipOriginationFee').val();
  var ff_other_closing_costs     = jQuery('#FixAndFlipOtherClosingCosts').val();
  var ff_cost_to_sell     = jQuery('#FixAndFlipCostToSell').val();

  ff_purchase_price   = ( ff_purchase_price != '' ) ? parseFloat( ff_purchase_price.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  ff_renovation_cost   = ( ff_renovation_cost != '' ) ? parseFloat( ff_renovation_cost.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  ff_after_repaired_value   = ( ff_after_repaired_value != '' ) ? parseFloat( ff_after_repaired_value.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  ff_annual_property_taxes   = ( ff_annual_property_taxes != '' ) ? parseFloat( ff_annual_property_taxes.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  ff_annual_insurance   = ( ff_annual_insurance != '' ) ? parseFloat( ff_annual_insurance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;


  var ff_loan_amount = ( ( ff_purchase_price * ff_purchase_price_ltv) / 100 ) + ff_renovation_cost;
  var ff_down_payment = ( ( 1 - ( ff_purchase_price_ltv / 100 ) ) * ff_purchase_price );
  var ff_monthly_interest_payment = ( ( ff_intrest_rate / 100 ) / 12 ) * ff_loan_amount;
  var ff_total_interest_over_term = ( ff_monthly_interest_payment * ff_length_of_loan );
  var ff_organisation_fee_amount = ( ( ff_origination_fee / 100 ) * ff_loan_amount );
  var ff_other_closing_costs_amount = ( ( ff_other_closing_costs / 100 ) * ff_purchase_price );
  var ff_cost_to_sell_amount = ( ( ff_cost_to_sell / 100 ) * ff_after_repaired_value );
  var ff_closing_costs = ( ff_organisation_fee_amount + ff_other_closing_costs_amount );
  var ff_carrying_costs = ( ff_monthly_interest_payment * ff_length_of_loan ) + ( (ff_annual_property_taxes/12) * ff_length_of_loan ) + ( (ff_annual_insurance/12) * ff_length_of_loan );
  var ff_borrower_equity_needed = ( ff_down_payment + ff_closing_costs );
  var ff_total_cash_in_deal = ( ff_down_payment + ff_closing_costs + ff_carrying_costs );
  var ff_net_profit = ( ff_after_repaired_value - ff_loan_amount - ff_down_payment - ff_closing_costs - ff_carrying_costs - ff_cost_to_sell_amount );
  var ff_loan_to_after_repaired_value = ( ff_loan_amount / ff_after_repaired_value ) * 100;
  var ff_roi = ( ff_net_profit / ff_total_cash_in_deal ) * 100;

  jQuery("#ffLoanAmount").html("$" + parseFloat(ff_loan_amount).toFixed(2));
  jQuery("#ffDownPayment").html("$" + parseFloat(ff_down_payment).toFixed(2));
  jQuery("#ffMonthlyInterestPayment").html("$" + parseFloat(ff_monthly_interest_payment).toFixed(2));
  jQuery("#ffTotalInterestOverTerm").html("$" + parseFloat(ff_total_interest_over_term).toFixed(2));
  jQuery("#ffOriginationFeeAmount").html("$" + parseFloat(ff_organisation_fee_amount).toFixed(2));
  jQuery("#ffOtherClosingCostsAmount").html("$" + parseFloat(ff_other_closing_costs_amount).toFixed(2));
  jQuery("#ffCostToSellAmount").html("$" + parseFloat(ff_cost_to_sell_amount).toFixed(2));
  jQuery("#ffClosingCosts").html("$" + parseFloat(ff_closing_costs).toFixed(2));
  jQuery("#ffCarryingCosts").html("$" + parseFloat(ff_carrying_costs).toFixed(2));
  jQuery("#ffBorrowerEquityNeeded").html("$" + parseFloat(ff_borrower_equity_needed).toFixed(2));
  jQuery("#ffTotalCashInDeal").html("$" + parseFloat(ff_total_cash_in_deal).toFixed(2));
  jQuery("#ffNetProfit").html("$" + parseFloat(ff_net_profit).toFixed(2));
  jQuery("#ffLoantoAfterRepairedValue").html(parseFloat(ff_loan_to_after_repaired_value).toFixed(2) + "%");
  jQuery("#ffROI").html(parseFloat(ff_roi).toFixed(2) + "%");

  // Borrower equity needed
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-borrower-equity .amount').html(refinanaceFormatter.format(parseFloat(Math.abs(ff_borrower_equity_needed)).toFixed(2)));
  let borrower_equity_class = '';
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-borrower-equity .dollar').html('$');
  if( ff_borrower_equity_needed < 0 ) {
    jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-borrower-equity .dollar').html('-$');
    borrower_equity_class = 'negative';
  }
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-borrower-equity').removeClass('negative').addClass(borrower_equity_class);

  // Net profit
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-net-profit .amount').html(refinanaceFormatter.format(parseFloat(Math.abs(ff_net_profit)).toFixed(2)));
  let net_profit_class = '';
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-net-profit .dollar').html('$');
  if( ff_net_profit < 0 ) {
    jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-net-profit .dollar').html('-$');
    net_profit_class = 'negative';
  }
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-net-profit').removeClass('negative').addClass(net_profit_class);

  // Return on Investment
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-return-on-investment .amount').html(refinanaceFormatter.format(parseFloat(Math.abs(ff_roi)).toFixed(2)));
  let roi_class = '';
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-return-on-investment h2').find('.symbol').remove();
  if( ff_roi < 0 ) {
    jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-return-on-investment h2').prepend('<span class="symbol">-</span>');
    roi_class = 'negative';
  }
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-return-on-investment').removeClass('negative').addClass(roi_class);

  // Loan to After Repaired Value
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-loan-after-repaired-value .amount').html(refinanaceFormatter.format(parseFloat(Math.abs(ff_loan_to_after_repaired_value)).toFixed(2)));
  let larv_class = '';
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-loan-after-repaired-value h2').find('.symbol').remove();
  if( ff_loan_to_after_repaired_value < 0 ) {
    jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-loan-after-repaired-value h2').prepend('<span class="symbol">-</span>');
    larv_class = 'negative';
  }
  jQuery('.fix_and_flip_calculator .fix-and-flip-cost-head #ff-loan-after-repaired-value').removeClass('negative').addClass(larv_class);

  mortgageFormatCurrency(jQuery("#ffLoanAmount"));
  mortgageFormatCurrency(jQuery("#ffDownPayment"));
  mortgageFormatCurrency(jQuery("#ffMonthlyInterestPayment"));
  mortgageFormatCurrency(jQuery("#ffTotalInterestOverTerm"));
  mortgageFormatCurrency(jQuery("#ffOriginationFeeAmount"));
  mortgageFormatCurrency(jQuery("#ffOtherClosingCostsAmount"));
  mortgageFormatCurrency(jQuery("#ffCostToSellAmount"));
  mortgageFormatCurrency(jQuery("#ffClosingCosts"));
  mortgageFormatCurrency(jQuery("#ffCarryingCosts"));
  mortgageFormatCurrency(jQuery("#ffBorrowerEquityNeeded"));
  mortgageFormatCurrency(jQuery("#ffTotalCashInDeal"));
  mortgageFormatCurrency(jQuery("#ffNetProfit"));

}
function FixAndFlipFormatCurrency() {
  mortgageFormatCurrency(jQuery("#FixAndFlipPurchasePrice"));
  mortgageFormatCurrency(jQuery("#FixAndFlipRenovationCost"));
  mortgageFormatCurrency(jQuery("#FixAndFlipAfterRepairedValue"));
  mortgageFormatCurrency(jQuery("#FixAndFlipAnnualPropertyTaxes"));
  mortgageFormatCurrency(jQuery("#FixAndFlipAnnualInsurance"));
}

// Affordability Start

// Conventional
function AffordabilityCalculator() {

  // Init Slider

  let afdSliderHomePrice = jQuery("#afdSliderHomePrice").attr('data-amount');
  jQuery("#afdSliderHomePrice").slider({
    range: "min",
    min: 0,
    max: 1000000,
    step: 5000,
    value: afdSliderHomePrice,
    slide: function(e, ui) {
     jQuery('#afdSliderHomePriceLabel').html('$'+ui.value);
      jQuery(this).attr('data-amount',ui.value);
      jQuery('#affordabilityHomePrice').val('$'+ui.value);
      AffordabilityCalculator();
    }
  });
 

  let afdSliderDownPayment = jQuery("#afdSliderDownPayment").attr('data-amount');
  jQuery("#afdSliderDownPayment").slider({
    range: "min",
    min: 0,
    max: 1000000,
    step: 5000,
    value: afdSliderDownPayment,
    slide: function(e, ui) {
      if (jQuery("#affordabilityDownPayment").hasClass("percentage")) {
        jQuery("#affordabilityDownPayment").removeClass("percentage");
        jQuery("#affordabilityDownPayment").parents(".mortage-item-input").find(".btn-primary").removeClass("active percentage");
        jQuery("#affordabilityDownPayment").parents(".mortage-item-input").find("#affordability_down_payment_dollar").parent().addClass("active dollar");
      }
      jQuery('#afdSliderDownPaymentLabel').html('$'+ui.value);
      jQuery(this).attr('data-amount',ui.value);
      jQuery('#affordabilityDownPayment').val('$'+ui.value);
      AffordabilityCalculator();
    }
  });
  

  // Get all datas

  var affordabilityGrossMonthlyIncome = jQuery('#affordabilityGrossMonthlyIncome').val();
  var affordabilityMonthlyDebts = jQuery('#affordabilityMonthlyDebts').val();
  var affordabilityHomePrice = jQuery('#affordabilityHomePrice').val();
  var affordabilityDownPayment = jQuery('#affordabilityDownPayment').val();
  var affordabilityLoanAmount = jQuery('#affordabilityLoanAmount').val();
  var affordabilityLoanTerm = jQuery('#affordabilityLoanTerm').val();
  var affordabilityInteretRate = jQuery('#affordabilityInteretRate').val();
  var affordabilityCreditScore = jQuery('#affordabilityCreditScore').val();
  var affordabilityPropTax = jQuery('#affordabilityPropTax').val();
  var affordabilityHomeownersInsurance = jQuery('#affordabilityHomeownersInsurance').val();
  var affordabilityPMI = jQuery('#affordabilityPMI').val();
  var affordabilityHoaDues = jQuery('#affordabilityHoaDues').val();

  affordabilityGrossMonthlyIncome = ( affordabilityGrossMonthlyIncome != '' ) ? parseFloat( affordabilityGrossMonthlyIncome.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  affordabilityMonthlyDebts = ( affordabilityMonthlyDebts != '' ) ? parseFloat( affordabilityMonthlyDebts.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  affordabilityHomePrice = ( affordabilityHomePrice != '' ) ? parseFloat( affordabilityHomePrice.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  affordabilityLoanAmount = ( affordabilityLoanAmount != '' ) ? parseFloat( affordabilityLoanAmount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  affordabilityDownPayment = ( affordabilityDownPayment != '' ) ? parseFloat( affordabilityDownPayment.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  affordabilityPropTax = ( affordabilityPropTax != '' ) ? parseFloat( affordabilityPropTax.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  affordabilityHomeownersInsurance = ( affordabilityHomeownersInsurance != '' ) ? parseFloat( affordabilityHomeownersInsurance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  affordabilityPMI = ( affordabilityPMI != '' ) ? parseFloat( affordabilityPMI.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  affordabilityHoaDues = ( affordabilityHoaDues != '' ) ? parseFloat( affordabilityHoaDues.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;


  // Calcualtion begins

  var afdHomePrice = affordabilityHomePrice;
  var afdLoanAmount = affordabilityLoanAmount;
  var afdHoaDues = affordabilityHoaDues;
  var afdDownPayment = affordabilityDownPayment;
  var afdDownPaymentPercent = affordabilityDownPayment;
  var afdCreditScore = affordabilityCreditScore;

  if (jQuery("#affordabilityDownPayment").hasClass("percentage")) {
    afdDownPayment = (afdDownPayment / 100) * afdHomePrice;
    afdDownPayment = afdDownPayment.toFixed(2);
  } else {
    afdDownPaymentPercent = (afdDownPaymentPercent * 100) / afdHomePrice;
    afdDownPaymentPercent = afdDownPaymentPercent.toFixed(2);
  }

  if(afdDownPayment > afdHomePrice) {
    afdDownPayment = afdHomePrice;
  }

  // Set loan amount and downpayment
  if( jQuery('#affordabilityLoanAmount').hasClass('afd-loan-triggerred') ) {
    afdDownPayment = (afdHomePrice-afdLoanAmount);
    jQuery('#affordabilityLoanAmount').removeClass('afd-loan-triggerred');
  } else {
    afdLoanAmount = (afdHomePrice-afdDownPayment);
  }

  // Update slider values
  jQuery("#afdSliderHomePrice").slider({
    value: afdHomePrice
  });
  jQuery("#afdSliderHomePriceLabel").html("$"+afdHomePrice);
  jQuery("#afdSliderDownPayment").slider({
    value: afdDownPayment,
    max: afdHomePrice
  });
  jQuery("#afdSliderDownPaymentLabel").html("$"+parseFloat(afdDownPayment).toFixed(0));

/*   var afdNewDownPaymentPercentage = afdDownPayment;
  afdNewDownPaymentPercentage = (afdNewDownPaymentPercentage * 100) / afdHomePrice;
  afdNewDownPaymentPercentage = afdNewDownPaymentPercentage.toFixed(2); */

  var r = affordabilityInteretRate / 100;
  r = parseFloat(r / 12);
  var n = affordabilityLoanTerm * 12;
  n = parseFloat(n);
  var P = parseFloat(afdLoanAmount);
  var afdPrinciple = P * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

  var afdLoanToValue = (afdLoanAmount/afdHomePrice)*100;
  
  if (jQuery("#affordabilityHomeownersInsurance").hasClass("percentage")) {
    var afdInsurence = (afdHomePrice*affordabilityHomeownersInsurance)/100;
    afdInsurence = afdInsurence / 12;
    afdInsurence = parseFloat(afdInsurence);
  } else {
    var afdInsurence = parseFloat(affordabilityHomeownersInsurance);
    afdInsurence = afdInsurence / 12;
    afdInsurence = parseFloat(afdInsurence);
  }

  if (jQuery("#affordabilityPropTax").hasClass("percentage")) {
    var afdTaxes = (afdHomePrice * affordabilityPropTax) / 100;
    afdTaxes = afdTaxes / 12;
  } else {
    var afdTaxes = affordabilityPropTax / 12;
  }

  // Calcualte PMI
  if( jQuery('#affordabilityPMI').hasClass('afd-pmi-triggerred') ) {
    var afdPMI = parseFloat(affordabilityPMI/12);
    jQuery('#affordabilityPMI').removeClass('afd-pmi-triggerred');
  } else {
    if (afdLoanToValue <= 80) {
      var afdPMI = 0;
     jQuery('#affordabilityPMI').val(afdPMI);
    } else {
      var afdPMIYearly = parseFloat((afdLoanAmount*afdCreditScore)/100).toFixed(2);
      jQuery('#affordabilityPMI').val(afdPMIYearly);
      var afdPMI = parseFloat(afdPMIYearly/12);
    }
  }
  
  var afdMonthlyMortaggePayment = parseFloat(afdPrinciple)+afdPMI+parseFloat(afdTaxes)+afdInsurence+afdHoaDues;

  var afdBBYourDebt = parseFloat((afdMonthlyMortaggePayment/affordabilityGrossMonthlyIncome)*100).toFixed(2);
  var afdBBYourIncome = parseFloat(((afdMonthlyMortaggePayment+affordabilityMonthlyDebts)/affordabilityGrossMonthlyIncome)*100).toFixed(2);

  // Input fields updates

  jQuery("#affordabilityLoanAmount").val("$" + parseFloat(afdLoanAmount).toFixed(2));
  if (jQuery("#affordabilityDownPayment").hasClass("percentage")) {
    jQuery("#affordabilityDownPayment").val(parseFloat(afdDownPaymentPercent));
  } else {
    jQuery("#affordabilityDownPayment").val("$" + parseFloat(afdDownPayment).toFixed(2));
  }

  // Output fields updates

  if (r > 0) {
    jQuery("#affordabilityChartPrinciple").html("$" + parseFloat(afdPrinciple).toFixed(2));
    jQuery("#afdMonthlyConventionalPayment").html("$" + parseFloat(afdPrinciple).toFixed(2));
  } else {
    jQuery("#affordabilityChartPrinciple").text("$0");
    jQuery("#afdMonthlyConventionalPayment").text("$0");
  }

  if (afdLoanToValue <= 80) {
    jQuery("#affordabilityChartPMI").html("(PMI not required)");
    jQuery("#afdMonthlyEstimatedPMI").html("(PMI not required)");
  } else {
    jQuery("#affordabilityChartPMI").html("$" + parseFloat(afdPMI).toFixed(2));
    jQuery("#afdMonthlyEstimatedPMI").html("$" + parseFloat(afdPMI).toFixed(2));
  }

  jQuery("#afdHomeValue").html("$" + parseFloat(afdHomePrice).toFixed(2));
  jQuery("#afdMortageAmount").html("$" + parseFloat(afdLoanAmount).toFixed(2));
  jQuery("#afdDownPayment").html("$" + parseFloat(afdDownPayment).toFixed(2));

  jQuery("#affordabilityChartTaxes").html("$" + parseFloat(afdTaxes).toFixed(2));
  jQuery("#affordabilityChartInsurence").html("$" + parseFloat(afdInsurence).toFixed(2));
  jQuery("#affordabilityChartHOADues").html("$" + parseFloat(afdHoaDues).toFixed(2));

  jQuery("#afdBBMonthlyMortageAmount").html("$" + parseFloat(afdMonthlyMortaggePayment).toFixed(2));
  jQuery("#afdBBLoanAmount").html("$" + parseFloat(afdLoanAmount).toFixed(2));
  jQuery("#afdBBYourDebt").html(parseFloat(afdBBYourDebt)+"%");
  jQuery("#afdBBYourIncome").html(parseFloat(afdBBYourIncome)+"%");

  jQuery("#afdSummaryMortagePayment").html("$" + parseFloat(afdMonthlyMortaggePayment).toFixed(2));
  jQuery("#afdSummaryDownPaymentPercent").html(parseFloat(afdDownPaymentPercent).toFixed(2)+'% Down Payment');
  jQuery("#afdSummaryDebtToIncome").html('Debt-to-Income Ratio is '+parseFloat(afdBBYourDebt)+'%/'+parseFloat(afdBBYourIncome)+'%');

  mortgageFormatCurrency(jQuery("#affordabilityGrossMonthlyIncome"));
  mortgageFormatCurrency(jQuery("#affordabilityMonthlyDebts"));
  mortgageFormatCurrency(jQuery("#affordabilityHomePrice"));
  if (!jQuery("#affordabilityDownPayment").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityDownPayment"));
  }
  if (!jQuery("#affordabilityHomeownersInsurance").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityHomeownersInsurance"));
  }
  if (!jQuery("#affordabilityPropTax").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityPropTax"));
  }
  mortgageFormatCurrency(jQuery("#affordabilityLoanAmount"));
  mortgageFormatCurrency(jQuery("#affordabilityPMI"));
  mortgageFormatCurrency(jQuery("#afdHomeValue"));
  mortgageFormatCurrency(jQuery("#afdMortageAmount"));
  mortgageFormatCurrency(jQuery("#afdMonthlyConventionalPayment"));
  mortgageFormatCurrency(jQuery("#afdDownPayment"));
  mortgageFormatCurrency(jQuery("#afdMonthlyEstimatedPMI"));
  mortgageFormatCurrency(jQuery("#afdBBMonthlyMortageAmount"));
  mortgageFormatCurrency(jQuery("#afdBBLoanAmount"));
  mortgageFormatCurrency(jQuery("#affordabilityChartPrinciple"));
  mortgageFormatCurrency(jQuery("#affordabilityChartTaxes"));
  mortgageFormatCurrency(jQuery("#affordabilityChartInsurence"));
  mortgageFormatCurrency(jQuery("#affordabilityChartHOADues"));
  mortgageFormatCurrency(jQuery("#affordabilityChartPMI"));
  mortgageFormatCurrency(jQuery("#afdSummaryMortagePayment"));
  mortgageFormatCurrency(jQuery("#afdSliderHomePriceLabel"));
  mortgageFormatCurrency(jQuery("#afdSliderDownPaymentLabel"));

  affordabilityGraph(afdPrinciple, afdHoaDues, afdTaxes, afdPMI, afdInsurence, afdMonthlyMortaggePayment);

}

function affordabilityGraph(principle, hoa, taxes, pmi, insurence, afdMonthlyMortaggePayment) {

  var pricipleColor = jQuery('.afd-conventional-payment-results').find('.principle-interest-color').attr('data-color');
  var taxesColor = jQuery('.afd-conventional-payment-results').find('.taxes-color').attr('data-color');
  var insuranceColor = jQuery('.afd-conventional-payment-results').find('.insurance-color').attr('data-color');
  var hoaDuesColor = jQuery('.afd-conventional-payment-results').find('.hoa-dues-color').attr('data-color');
  var pmiColor = jQuery('.afd-conventional-payment-results').find('.pmi-color').attr('data-color');

  jQuery("#affordabilityGraph").html('<canvas id="affordabilityChart" width="300px" height="300px"></canvas>');
  var ctx = jQuery("#affordabilityChart");
  var data = {
    labels: ["Principle and Interest", "HOA", "Taxes", "PMI", "Insurance"],
    datasets: [
      {
        data: [ principle.toFixed(2), hoa.toFixed(2), taxes.toFixed(2), pmi.toFixed(2), insurence.toFixed(2)],
        backgroundColor: [ pricipleColor, hoaDuesColor, taxesColor, pmiColor, insuranceColor]
      },
    ],
  };

  var options = {
    cutoutPercentage: 70,
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          return data["datasets"][0]["data"][tooltipItem["index"]];
        },
      },
      backgroundColor: "#5DC76F",
      displayColors: false,
      cornerRadius: 18,
      caretSize: 0,
	    xPadding: 10,
	    yPadding: 10,
    },
    legend: {
      display: false,
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  var myDoughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: data,
    options: options,
  });

  Chart.pluginService.register({
    afterDraw: function (chart) {
      jQuery(".afdChartCenterAmount").text("$" + parseFloat(afdMonthlyMortaggePayment).toFixed(2));
      mortgageFormatCurrency(jQuery(".afdChartCenterAmount"));
    },
  });
}


// FHA
function AffordabilityFHACalculator() {

	// Init Slider

	let afdFHASliderHomePrice = jQuery("#afdFHASliderHomePrice").attr('data-amount');
	jQuery("#afdFHASliderHomePrice").slider({
		range: "min",
		min: 0,
		max: 1000000,
    step: 5000,
		value: afdFHASliderHomePrice,
		slide: function(e, ui) {
			jQuery('#afdFHASliderHomePriceLabel').html('$'+ui.value);
			jQuery(this).attr('data-amount',ui.value);
			jQuery('#affordabilityFHAHomePrice').val('$'+ui.value);
			AffordabilityFHACalculator();
		}
	});


	let afdFHASliderDownPayment = jQuery("#afdFHASliderDownPayment").attr('data-amount');
	jQuery("#afdFHASliderDownPayment").slider({
		range: "min",
		min: 0,
		max: 1000000,
    step: 5000,
		value: afdFHASliderDownPayment,
		slide: function(e, ui) {
      if (jQuery("#affordabilityFHADownPayment").hasClass("percentage")) {
        jQuery("#affordabilityFHADownPayment").removeClass("percentage");
        jQuery("#affordabilityFHADownPayment").parents(".mortage-item-input").find(".btn-primary").removeClass("active percentage");
        jQuery("#affordabilityFHADownPayment").parents(".mortage-item-input").find("#affordability_fha_down_payment_dollar").parent().addClass("active dollar");
      }
			jQuery('#afdFHASliderDownPaymentLabel').html('$'+ui.value);
			jQuery(this).attr('data-amount',ui.value);
			jQuery('#affordabilityFHADownPayment').val('$'+ui.value);
			AffordabilityFHACalculator();
		}
	});


	// Get all datas

	var affordabilityFHAGrossMonthlyIncome = jQuery('#affordabilityFHAGrossMonthlyIncome').val();
	var affordabilityFHAMonthlyDebts = jQuery('#affordabilityFHAMonthlyDebts').val();
	var affordabilityFHAHomePrice = jQuery('#affordabilityFHAHomePrice').val();
	var affordabilityFHADownPayment = jQuery('#affordabilityFHADownPayment').val();
	var affordabilityFHALoanAmount = jQuery('#affordabilityFHALoanAmount').val();
	var affordabilityFHALoanTerm = jQuery('#affordabilityFHALoanTerm').val();
	var affordabilityFHAInteretRate = jQuery('#affordabilityFHAInteretRate').val();
	var affordabilityFHAPropTax = jQuery('#affordabilityFHAPropTax').val();
	var affordabilityFHAHomeownersInsurance = jQuery('#affordabilityFHAHomeownersInsurance').val();
	var affordabilityFHAHoaDues = jQuery('#affordabilityFHAHoaDues').val();
	var affordabilityFHAUpfrontMIP = jQuery('#affordabilityFHAUpfrontMIP').val();
	var affordabilityFHAAnnualMIP = jQuery('#affordabilityFHAAnnualMIP').val();
	var affordabilityFHAAnnualDuration = jQuery('#affordabilityFHAAnnualDuration').val();

	affordabilityFHAGrossMonthlyIncome = ( affordabilityFHAGrossMonthlyIncome != '' ) ? parseFloat( affordabilityFHAGrossMonthlyIncome.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityFHAMonthlyDebts = ( affordabilityFHAMonthlyDebts != '' ) ? parseFloat( affordabilityFHAMonthlyDebts.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityFHAHomePrice = ( affordabilityFHAHomePrice != '' ) ? parseFloat( affordabilityFHAHomePrice.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityFHALoanAmount = ( affordabilityFHALoanAmount != '' ) ? parseFloat( affordabilityFHALoanAmount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityFHADownPayment = ( affordabilityFHADownPayment != '' ) ? parseFloat( affordabilityFHADownPayment.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityFHAPropTax = ( affordabilityFHAPropTax != '' ) ? parseFloat( affordabilityFHAPropTax.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityFHAHomeownersInsurance = ( affordabilityFHAHomeownersInsurance != '' ) ? parseFloat( affordabilityFHAHomeownersInsurance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityFHAHoaDues = ( affordabilityFHAHoaDues != '' ) ? parseFloat( affordabilityFHAHoaDues.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;


	var afdFHAHomePrice = affordabilityFHAHomePrice;
	var afdFHALoanAmount = affordabilityFHALoanAmount;
	var afdFHAHoaDues = affordabilityFHAHoaDues;
	var afdFHADownPayment = affordabilityFHADownPayment;
  var afdFHADownPaymentPercent = affordabilityFHADownPayment;
  var afdFHALoanTerm = affordabilityFHALoanTerm;
  var afdFHALoanTermMode = jQuery("input[name='affordability_fha_loan_term']:checked").val();

/*   if(afdFHALoanTermMode == 'month') {
    afdFHALoanTerm = parseFloat(afdFHALoanTerm / 12).toFixed(2);
  } */

  var afdMinDownPayment = (afdFHAHomePrice * 3.5)/100;
  if (jQuery("#affordabilityFHADownPayment").hasClass("percentage")) {
    afdFHADownPayment = (afdFHADownPayment / 100) * afdFHAHomePrice;
    afdFHADownPayment = afdFHADownPayment.toFixed(2);
  } else {
    afdFHADownPaymentPercent = (afdFHADownPaymentPercent * 100) / afdFHAHomePrice;
    afdFHADownPaymentPercent = afdFHADownPaymentPercent.toFixed(2);
  }

  if(afdFHADownPayment > afdFHAHomePrice) {
    afdFHADownPayment = afdFHAHomePrice;
  }

  // Set loan amount and downpayment
	if( jQuery('#affordabilityFHALoanAmount').hasClass('afd-fha-loan-triggerred') ) {
		afdFHADownPayment = (afdFHAHomePrice-afdFHALoanAmount);
		jQuery('#affordabilityFHALoanAmount').removeClass('afd-fha-loan-triggerred');
	} else {
		afdFHALoanAmount = (afdFHAHomePrice-afdFHADownPayment);
	}

  // Calculate FHA Upfront MIP & Annual MIP
  var afdFHAUpfrontMIPPercentage = 1.75;
  var afdFHALoanToValue = (afdFHALoanAmount/afdFHAHomePrice)*100;
  var afdFHAAnnualMIPPercentage = AffordabilityFHAGetAnnualMIP(afdFHALoanAmount, afdFHALoanToValue, afdFHALoanTerm);
  var afdFHAUpfrontMIP = (afdFHALoanAmount * afdFHAUpfrontMIPPercentage) / 100;
  var afdFHALoanAmountWithUpfrontMIP = afdFHALoanAmount + afdFHAUpfrontMIP;
  var afdFHAMIP = ((afdFHALoanAmount * afdFHAAnnualMIPPercentage) / 100)/12;

  // Update slider values
	jQuery("#afdFHASliderHomePrice").slider({
		value: afdFHAHomePrice
	});
  jQuery("#afdFHASliderHomePriceLabel").html("$"+afdFHAHomePrice);
	jQuery("#afdFHASliderDownPayment").slider({
		value: afdFHADownPayment,
    min: afdMinDownPayment,
    max: afdFHAHomePrice
	});
  jQuery("#afdFHASliderDownPaymentLabel").html("$"+parseFloat(afdFHADownPayment).toFixed(0));

	/* var afdNewDownPaymentPercentage = afdFHADownPayment;
	afdNewDownPaymentPercentage = (afdNewDownPaymentPercentage * 100) / afdFHAHomePrice;
	afdNewDownPaymentPercentage = afdNewDownPaymentPercentage.toFixed(2); */

	var r = affordabilityFHAInteretRate / 100;
	r = parseFloat(r / 12);
	var n = affordabilityFHALoanTerm * 12;
	n = parseFloat(n);
	var P = parseFloat(afdFHALoanAmountWithUpfrontMIP);
	var afdFHAPrinciple = P * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

  if (jQuery("#affordabilityFHAHomeownersInsurance").hasClass("percentage")) {
    var afdFHAInsurence = (afdFHAHomePrice*affordabilityFHAHomeownersInsurance)/100;
    afdFHAInsurence = afdFHAInsurence / 12;
    afdFHAInsurence = parseFloat(afdFHAInsurence);
  } else {
    var afdFHAInsurence = parseFloat(affordabilityFHAHomeownersInsurance);
    afdFHAInsurence = afdFHAInsurence / 12;
    afdFHAInsurence = parseFloat(afdFHAInsurence);
  }

  if (jQuery("#affordabilityFHAPropTax").hasClass("percentage")) {
    var afdFHATaxes = (afdFHAHomePrice * affordabilityFHAPropTax) / 100;
    afdFHATaxes = afdFHATaxes / 12;
  } else {
    var afdFHATaxes = affordabilityFHAPropTax / 12;
  }

	var afdFHAMonthlyMortaggePayment = parseFloat(afdFHAPrinciple)+parseFloat(afdFHATaxes)+afdFHAInsurence+afdFHAHoaDues+afdFHAMIP;

	var afdFHABBYourDebt = parseFloat((afdFHAMonthlyMortaggePayment/affordabilityFHAGrossMonthlyIncome)*100).toFixed(2);
	var afdFHABBYourIncome = parseFloat(((afdFHAMonthlyMortaggePayment+affordabilityFHAMonthlyDebts)/affordabilityFHAGrossMonthlyIncome)*100).toFixed(2);

	// Input fields updates

  jQuery("#affordabilityFHAUpfrontMIP").val(parseFloat(afdFHAUpfrontMIPPercentage).toFixed(2));
  jQuery("#affordabilityFHAAnnualMIP").val(parseFloat(afdFHAAnnualMIPPercentage).toFixed(2));
  jQuery("#affordabilityFHAAnnualDuration").val(afdFHALoanTerm + ' years');
	jQuery("#affordabilityFHALoanAmount").val("$" + parseFloat(afdFHALoanAmount).toFixed(2));
  if (jQuery("#affordabilityFHADownPayment").hasClass("percentage")) {
    jQuery("#affordabilityFHADownPayment").val(parseFloat(afdFHADownPaymentPercent));
  } else {
    jQuery("#affordabilityFHADownPayment").val("$" + parseFloat(afdFHADownPayment).toFixed(2));
  }

	// Output fields updates

	if (r > 0) {
    jQuery("#affordabilityFHAChartPrinciple").html("$" + parseFloat(afdFHAPrinciple).toFixed(2));
    jQuery("#afdFHAMonthlyConventionalPayment").html("$" + parseFloat(afdFHAPrinciple).toFixed(2));
	} else {
    jQuery("#affordabilityFHAChartPrinciple").text("$0");
    jQuery("#afdFHAMonthlyConventionalPayment").text("$0");
	}

	jQuery("#afdFHAHomeValue").html("$" + parseFloat(afdFHAHomePrice).toFixed(2));
	jQuery("#afdFHABaseLoanAmount").html("$" + parseFloat(afdFHALoanAmount).toFixed(2));
	jQuery("#afdFHAMonthlyFHAPayment").html("$" + parseFloat(afdFHAMonthlyMortaggePayment).toFixed(2));
	jQuery("#afdFHADownPayment").html("$" + parseFloat(afdFHADownPayment).toFixed(2));
	jQuery("#afdFHALoanAmount").html("$" + parseFloat(afdFHALoanAmountWithUpfrontMIP).toFixed(2));
	jQuery("#afdFHAUpfrontMIP").html("$" + parseFloat(afdFHAUpfrontMIP).toFixed(2));

	jQuery("#affordabilityFHAChartTaxes").html("$" + parseFloat(afdFHATaxes).toFixed(2));
	jQuery("#affordabilityFHAChartInsurence").html("$" + parseFloat(afdFHAInsurence).toFixed(2));
	jQuery("#affordabilityFHAChartHOADues").html("$" + parseFloat(afdFHAHoaDues).toFixed(2));
	jQuery("#affordabilityFHAChartMIP").html("$" + parseFloat(afdFHAMIP).toFixed(2));

	jQuery("#afdFHABBMonthlyMortageAmount").html("$" + parseFloat(afdFHAMonthlyMortaggePayment).toFixed(2));
	jQuery("#afdFHABBLoanAmount").html("$" + parseFloat(afdFHALoanAmountWithUpfrontMIP).toFixed(2));
	jQuery("#afdFHABBYourDebt").html(parseFloat(afdFHABBYourDebt)+"%");
	jQuery("#afdFHABBYourIncome").html(parseFloat(afdFHABBYourIncome)+"%");

  jQuery("#afdSummaryFHAMortagePayment").html("$" + parseFloat(afdFHAMonthlyMortaggePayment).toFixed(2));
  jQuery("#afdSummaryFHADownPaymentPercent").html(parseFloat(afdFHADownPaymentPercent).toFixed(2)+'% Down Payment');
  jQuery("#afdSummaryFHADebtToIncome").html('Debt-to-Income Ratio is '+parseFloat(afdFHABBYourDebt)+'%/'+parseFloat(afdFHABBYourIncome)+'%');

  mortgageFormatCurrency(jQuery("#affordabilityFHAGrossMonthlyIncome"));
  mortgageFormatCurrency(jQuery("#affordabilityFHAMonthlyDebts"));
  mortgageFormatCurrency(jQuery("#affordabilityFHAHomePrice"));
  if (!jQuery("#affordabilityFHADownPayment").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityFHADownPayment"));
  }
  if (!jQuery("#affordabilityFHAHomeownersInsurance").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityFHAHomeownersInsurance"));
  }
  if (!jQuery("#affordabilityFHAPropTax").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityFHAPropTax"));
  }

  mortgageFormatCurrency(jQuery("#affordabilityFHALoanAmount"));
  mortgageFormatCurrency(jQuery("#afdFHAHomeValue"));
  mortgageFormatCurrency(jQuery("#afdFHABaseLoanAmount"));
  mortgageFormatCurrency(jQuery("#afdFHAMonthlyFHAPayment"));
  mortgageFormatCurrency(jQuery("#afdFHADownPayment"));
  mortgageFormatCurrency(jQuery("#afdFHALoanAmount"));
  mortgageFormatCurrency(jQuery("#afdFHAUpfrontMIP"));
  mortgageFormatCurrency(jQuery("#afdFHABBMonthlyMortageAmount"));
  mortgageFormatCurrency(jQuery("#afdFHABBLoanAmount"));
  mortgageFormatCurrency(jQuery("#affordabilityFHAChartPrinciple"));
  mortgageFormatCurrency(jQuery("#affordabilityFHAChartTaxes"));
  mortgageFormatCurrency(jQuery("#affordabilityFHAChartInsurence"));
  mortgageFormatCurrency(jQuery("#affordabilityFHAChartHOADues"));
  mortgageFormatCurrency(jQuery("#affordabilityFHAChartMIP"));
  mortgageFormatCurrency(jQuery("#afdSummaryFHAMortagePayment"));
  mortgageFormatCurrency(jQuery("#afdFHASliderHomePriceLabel"));
  mortgageFormatCurrency(jQuery("#afdFHASliderDownPaymentLabel"));

	affordabilityFHAGraph(afdFHAPrinciple, afdFHAHoaDues, afdFHATaxes, afdFHAInsurence, afdFHAMIP, afdFHAMonthlyMortaggePayment);

}

function AffordabilityFHAGetAnnualMIP(baseLoanAmount, ltv, term) {

  var afAnnualMIP = 0;

  if( term > 15) {
    if( baseLoanAmount > 726200 && ltv > 95 ) {
      afAnnualMIP = 0.75;
    } else if( baseLoanAmount > 726200 && ltv > 90 && ltv <= 95 ) {
        afAnnualMIP = 0.70;
    } else if( baseLoanAmount > 726200 && ltv <= 90 ) {
        afAnnualMIP = 0.70;
    } else if( baseLoanAmount <= 726200 && ltv <= 90 ) {
        afAnnualMIP = 0.50;
      } else if( baseLoanAmount <= 726200 && ltv > 90 && ltv <= 95 ) {
        afAnnualMIP = 0.55;
    } else if( baseLoanAmount <= 726200 && ltv > 95 ) {
        afAnnualMIP = 0.55;
    }
  } else if( term <= 15) {
    if( baseLoanAmount > 726200 && ltv > 90 ) {
      afAnnualMIP = 0.65;
    } else if( baseLoanAmount > 726200 && ltv > 78 && ltv <= 90 ) {
        afAnnualMIP = 0.40;
    } else if( baseLoanAmount > 726200 && ltv <= 78 ) {
        afAnnualMIP = 0.15;
    } else if( baseLoanAmount <= 726200 && ltv <= 90 ) {
        afAnnualMIP = 0.15;
      } else if( baseLoanAmount <= 726200 && ltv > 90 ) {
        afAnnualMIP = 0.40;
    }
  }

  return afAnnualMIP;

}

function affordabilityFHAGraph(principle, hoa, taxes, insurence, mip, afdFHAMonthlyMortaggePayment) {

	var pricipleColor = jQuery('.afd-fha-payment-results').find('.principle-interest-color').attr('data-color');
	var taxesColor = jQuery('.afd-fha-payment-results').find('.taxes-color').attr('data-color');
	var insuranceColor = jQuery('.afd-fha-payment-results').find('.insurance-color').attr('data-color');
	var hoaDuesColor = jQuery('.afd-fha-payment-results').find('.hoa-dues-color').attr('data-color');
	var pmiColor = jQuery('.afd-fha-payment-results').find('.pmi-color').attr('data-color');
  
	jQuery("#affordabilityFHAGraph").html('<canvas id="affordabilityFHAChart" width="300px" height="300px"></canvas>');
	var ctx = jQuery("#affordabilityFHAChart");
	var data = {
	  labels: ["Principle and Interest", "HOA", "Taxes", "Insurance", "MIP"],
	  datasets: [
		{
		  data: [ principle.toFixed(2), hoa.toFixed(2), taxes.toFixed(2), insurence.toFixed(2), mip.toFixed(2)],
		  backgroundColor: [ pricipleColor, hoaDuesColor, taxesColor, insuranceColor, pmiColor]
		},
	  ],
	};
  
	var options = {
	  cutoutPercentage: 70,
	  tooltips: {
		callbacks: {
		  label: function (tooltipItem, data) {
			return data["datasets"][0]["data"][tooltipItem["index"]];
		  },
		},
		backgroundColor: "#5DC76F",
		displayColors: false,
		cornerRadius: 18,
		caretSize: 0,
		  xPadding: 10,
		  yPadding: 10,
	  },
	  legend: {
		display: false,
	  },
	  responsive: true,
	  maintainAspectRatio: true,
	};
  
	var myDoughnutChart = new Chart(ctx, {
	  type: "doughnut",
	  data: data,
	  options: options,
	});
  
	Chart.pluginService.register({
	  afterDraw: function (chart) {
		jQuery(".afdFHAChartCenterAmount").text("$" + parseFloat(afdFHAMonthlyMortaggePayment).toFixed(2));
		mortgageFormatCurrency(jQuery(".afdFHAChartCenterAmount"));
	  },
	});
}


// VA
function AffordabilityVACalculator() {

	// Init Slider

	let afdVASliderHomePrice = jQuery("#afdVASliderHomePrice").attr('data-amount');
	jQuery("#afdVASliderHomePrice").slider({
		range: "min",
		min: 0,
		max: 1000000,
    step: 5000,
		value: afdVASliderHomePrice,
		slide: function(e, ui) {
			jQuery('#afdVASliderHomePriceLabel').html('$'+ui.value);
			jQuery(this).attr('data-amount',ui.value);
			jQuery('#affordabilityVAHomePrice').val('$'+ui.value);
			AffordabilityVACalculator();
		}
	});


	let afdVASliderDownPayment = jQuery("#afdVASliderDownPayment").attr('data-amount');
	jQuery("#afdVASliderDownPayment").slider({
		range: "min",
		min: 0,
		max: 1000000,
    step: 5000,
		value: afdVASliderDownPayment,
		slide: function(e, ui) {
      if (jQuery("#affordabilityVADownPayment").hasClass("percentage")) {
        jQuery("#affordabilityVADownPayment").removeClass("percentage");
        jQuery("#affordabilityVADownPayment").parents(".mortage-item-input").find(".btn-primary").removeClass("active percentage");
        jQuery("#affordabilityVADownPayment").parents(".mortage-item-input").find("#affordability_va_down_payment_dollar").parent().addClass("active dollar");
      }
			jQuery('#afdVASliderDownPaymentLabel').html('$'+ui.value);
			jQuery(this).attr('data-amount',ui.value);
			jQuery('#affordabilityVADownPayment').val('$'+ui.value);
			AffordabilityVACalculator();
		}
	});


	// Get all datas

	var affordabilityVAGrossMonthlyIncome = jQuery('#affordabilityVAGrossMonthlyIncome').val();
	var affordabilityVAMonthlyDebts = jQuery('#affordabilityVAMonthlyDebts').val();
	var affordabilityVAHomePrice = jQuery('#affordabilityVAHomePrice').val();
	var affordabilityVADownPayment = jQuery('#affordabilityVADownPayment').val();
	var affordabilityVALoanAmount = jQuery('#affordabilityVALoanAmount').val();
	var affordabilityVALoanTerm = jQuery('#affordabilityVALoanTerm').val();
	var affordabilityVAInterestRate = jQuery('#affordabilityVAInterestRate').val();
	var affordabilityVAPropTax = jQuery('#affordabilityVAPropTax').val();
	var affordabilityVAHomeownersInsurance = jQuery('#affordabilityVAHomeownersInsurance').val();
	var affordabilityVAHoaDues = jQuery('#affordabilityVAHoaDues').val();
  var affordabilityVAPaymentFrequency = jQuery("input[name='affordabilityVAPaymentFrequency']:checked").val();
  var affordabilityVAFundingFeeOptions = jQuery('#affordabilityVAFundingFeeOptions').find(":selected").val();

  var affordabilityVALessFiveFUFF = jQuery('#affordabilityVALessFiveFUFF').val();
  var affordabilityVAGreaterFiveFUFF = jQuery('#affordabilityVAGreaterFiveFUFF').val();
  var affordabilityVAGreaterTenFUFF = jQuery('#affordabilityVAGreaterTenFUFF').val();

  var affordabilityVALessFiveAFUFF = jQuery('#affordabilityVALessFiveAFUFF').val();
  var affordabilityVAGreaterFiveAFUFF = jQuery('#affordabilityVAGreaterFiveAFUFF').val();
  var affordabilityVAGreaterTenAFUFF = jQuery('#affordabilityVAGreaterTenAFUFF').val();

  if ( affordabilityVAPaymentFrequency == 'Month' ) {
    afdVATerm = 12;
  } else {
    afdVATerm = 1;
  }

	affordabilityVAGrossMonthlyIncome = ( affordabilityVAGrossMonthlyIncome != '' ) ? parseFloat( affordabilityVAGrossMonthlyIncome.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityVAMonthlyDebts = ( affordabilityVAMonthlyDebts != '' ) ? parseFloat( affordabilityVAMonthlyDebts.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityVAHomePrice = ( affordabilityVAHomePrice != '' ) ? parseFloat( affordabilityVAHomePrice.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityVALoanAmount = ( affordabilityVALoanAmount != '' ) ? parseFloat( affordabilityVALoanAmount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityVADownPayment = ( affordabilityVADownPayment != '' ) ? parseFloat( affordabilityVADownPayment.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityVAPropTax = ( affordabilityVAPropTax != '' ) ? parseFloat( affordabilityVAPropTax.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityVAHomeownersInsurance = ( affordabilityVAHomeownersInsurance != '' ) ? parseFloat( affordabilityVAHomeownersInsurance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityVAHoaDues = ( affordabilityVAHoaDues != '' ) ? parseFloat( affordabilityVAHoaDues.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;


	var afdVAHomePrice = affordabilityVAHomePrice;
	var afdVALoanAmount = affordabilityVALoanAmount;
	var afdVAHoaDues = affordabilityVAHoaDues;
	var afdVADownPayment = affordabilityVADownPayment;
  var afdVADownPaymentPercent = affordabilityVADownPayment;

  if (jQuery("#affordabilityVADownPayment").hasClass("percentage")) {
    afdVADownPayment = (afdVADownPayment / 100) * afdVAHomePrice;
    afdVADownPayment = afdVADownPayment.toFixed(2);
  } else {
    afdVADownPaymentPercent = (afdVADownPaymentPercent * 100) / afdVAHomePrice;
    afdVADownPaymentPercent = afdVADownPaymentPercent.toFixed(2);
  }

  if(afdVADownPayment > afdVAHomePrice) {
    afdVADownPayment = afdVAHomePrice;
  }

  // Set loan amount and downpayment
	if( jQuery('#affordabilityVALoanAmount').hasClass('afd-va-loan-triggerred') ) {
		afdVADownPayment = (afdVAHomePrice-afdVALoanAmount);
		jQuery('#affordabilityVALoanAmount').removeClass('afd-va-loan-triggerred');
	} else {
		afdVALoanAmount = (afdVAHomePrice-afdVADownPayment);
	}

  // Update slider values
	jQuery("#afdVASliderHomePrice").slider({
		value: afdVAHomePrice
	});
  jQuery("#afdVASliderHomePriceLabel").html("$"+afdVAHomePrice);
	jQuery("#afdVASliderDownPayment").slider({
		value: afdVADownPayment,
    max: afdVAHomePrice
	});
  jQuery("#afdVASliderDownPaymentLabel").html("$"+parseFloat(afdVADownPayment).toFixed(0));

	/* var afdNewDownPaymentPercentage = afdVADownPayment;
	afdNewDownPaymentPercentage = (afdNewDownPaymentPercentage * 100) / afdVAHomePrice;
	afdNewDownPaymentPercentage = afdNewDownPaymentPercentage.toFixed(2); */

  var afdVAFundingFee = 0;
  if ( afdVADownPaymentPercent < 5 ) {
    if ( affordabilityVAFundingFeeOptions == 'first_use' ) {
      afdVAFundingFee = affordabilityVALessFiveFUFF;
    } else {
      afdVAFundingFee = affordabilityVALessFiveAFUFF;
    }
  } else if( afdVADownPaymentPercent >= 10 ) {
    if ( affordabilityVAFundingFeeOptions == 'first_use' ) {
      afdVAFundingFee = affordabilityVAGreaterTenFUFF;
    } else {
      afdVAFundingFee = affordabilityVAGreaterTenAFUFF;
    }
  } else if( afdVADownPaymentPercent >= 5 ) {
    if ( affordabilityVAFundingFeeOptions == 'first_use' ) {
      afdVAFundingFee = affordabilityVAGreaterFiveFUFF;
    } else {
      afdVAFundingFee = affordabilityVAGreaterFiveAFUFF;
    }
  }
  if ( affordabilityVAFundingFeeOptions == 'exempt_va_funding_fee' ) { 
    afdVAFundingFee = 0;
  }

  var afdVAFundingExtraFee = ( afdVAFundingFee / 100 ) * afdVALoanAmount;
  var afdVAFinalMortageAmount = parseFloat(afdVALoanAmount) + parseFloat(afdVAFundingExtraFee);
  afdVAFinalMortageAmount = afdVAFinalMortageAmount.toFixed(2);

  jQuery('#affordabilityVAFundingFee').val(afdVAFundingFee);

	var r = affordabilityVAInterestRate / 100;
	r = parseFloat(r / afdVATerm);
	var n = affordabilityVALoanTerm * afdVATerm;
	n = parseFloat(n);
	var P = parseFloat(afdVAFinalMortageAmount);
	var afdVAPrinciple = P * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

  if (jQuery("#affordabilityVAHomeownersInsurance").hasClass("percentage")) {
    var afdVAInsurence = (afdVAHomePrice*affordabilityVAHomeownersInsurance)/100;
    afdVAInsurence = afdVAInsurence / 12;
    afdVAInsurence = parseFloat(afdVAInsurence);
  } else {
    var afdVAInsurence = parseFloat(affordabilityVAHomeownersInsurance);
    afdVAInsurence = afdVAInsurence / 12;
    afdVAInsurence = parseFloat(afdVAInsurence);
  }

  if (jQuery("#affordabilityVAPropTax").hasClass("percentage")) {
    var afdVATaxes = (afdVAHomePrice * affordabilityVAPropTax) / 100;
    afdVATaxes = afdVATaxes / 12;
  } else {
    var afdVATaxes = affordabilityVAPropTax / 12;
  }


	var afdVAMonthlyMortaggePayment = parseFloat(afdVAPrinciple)+parseFloat(afdVATaxes)+afdVAInsurence+afdVAHoaDues;

	var afdVABBYourDebt = parseFloat((afdVAMonthlyMortaggePayment/affordabilityVAGrossMonthlyIncome)*100).toFixed(2);
	var afdVABBYourIncome = parseFloat(((afdVAMonthlyMortaggePayment+affordabilityVAMonthlyDebts)/affordabilityVAGrossMonthlyIncome)*100).toFixed(2);

	// Input fields updates

	jQuery("#affordabilityVALoanAmount").val("$" + parseFloat(afdVALoanAmount).toFixed(2));
  if (jQuery("#affordabilityVADownPayment").hasClass("percentage")) {
    jQuery("#affordabilityVADownPayment").val(parseFloat(afdVADownPaymentPercent));
  } else {
    jQuery("#affordabilityVADownPayment").val("$" + parseFloat(afdVADownPayment).toFixed(2));
  }

  jQuery("#affordabilityVAFinalMortageLoanAmount").val("$" + parseFloat(afdVAFinalMortageAmount).toFixed(2));

	// Output fields updates

	if (r > 0) {
    jQuery("#affordabilityVAChartPrinciple").html("$" + parseFloat(afdVAPrinciple).toFixed(2));
    jQuery("#afdVAMonthlyVAPayment").html("$" + parseFloat(afdVAPrinciple).toFixed(2));
	} else {
    jQuery("#affordabilityVAChartPrinciple").text("$0");
    jQuery("#afdVAMonthlyVAPayment").text("$0");
	}

	jQuery("#afdVAHomeValue").html("$" + parseFloat(afdVAHomePrice).toFixed(2));
	jQuery("#afdVABaseLoanAmount").html("$" + parseFloat(afdVALoanAmount).toFixed(2));
	jQuery("#afdVADownPayment").html("$" + parseFloat(afdVADownPayment).toFixed(2));
  jQuery("#afdVAFinalLoanAmount").html("$" + parseFloat(afdVAFinalMortageAmount).toFixed(2));
	jQuery("#afdVAFundingFee").html("$" + parseFloat(afdVAFundingExtraFee).toFixed(2));

	jQuery("#affordabilityVAChartTaxes").html("$" + parseFloat(afdVATaxes).toFixed(2));
	jQuery("#affordabilityVAChartInsurence").html("$" + parseFloat(afdVAInsurence).toFixed(2));
	jQuery("#affordabilityVAChartHOADues").html("$" + parseFloat(afdVAHoaDues).toFixed(2));

	jQuery("#afdVABBMonthlyMortageAmount").html("$" + parseFloat(afdVAMonthlyMortaggePayment).toFixed(2));
	jQuery("#afdVABBLoanAmount").html("$" + parseFloat(afdVAFinalMortageAmount).toFixed(2));
	jQuery("#afdVABBYourDebt").html(parseFloat(afdVABBYourDebt)+"%");
	jQuery("#afdVABBYourIncome").html(parseFloat(afdVABBYourIncome)+"%");

  jQuery("#afdSummaryVAMortagePayment").html("$" + parseFloat(afdVAMonthlyMortaggePayment).toFixed(2));
  jQuery("#afdSummaryVADownPaymentPercent").html(parseFloat(afdVADownPaymentPercent).toFixed(2)+'% Down Payment');
  jQuery("#afdSummaryVADebtToIncome").html('Debt-to-Income Ratio is '+parseFloat(afdVABBYourDebt)+'%/'+parseFloat(afdVABBYourIncome)+'%');

  mortgageFormatCurrency(jQuery("#affordabilityVAGrossMonthlyIncome"));
  mortgageFormatCurrency(jQuery("#affordabilityVAMonthlyDebts"));
  mortgageFormatCurrency(jQuery("#affordabilityVAHomePrice"));
  if (!jQuery("#affordabilityVADownPayment").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityVADownPayment"));
  }
  if (!jQuery("#affordabilityVAHomeownersInsurance").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityVAHomeownersInsurance"));
  }
  if (!jQuery("#affordabilityVAPropTax").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityVAPropTax"));
  }

  mortgageFormatCurrency(jQuery("#affordabilityVALoanAmount"));
  mortgageFormatCurrency(jQuery("#affordabilityVAFinalMortageLoanAmount"));
  mortgageFormatCurrency(jQuery("#affordabilityVAChartPrinciple"));
  mortgageFormatCurrency(jQuery("#affordabilityVAChartTaxes"));
  mortgageFormatCurrency(jQuery("#affordabilityVAChartInsurence"));
  mortgageFormatCurrency(jQuery("#affordabilityVAChartHOADues"));
  mortgageFormatCurrency(jQuery("#afdVAHomeValue"));
  mortgageFormatCurrency(jQuery("#afdVABaseLoanAmount"));
  mortgageFormatCurrency(jQuery("#afdVAMonthlyVAPayment"));
  mortgageFormatCurrency(jQuery("#afdVADownPayment"));
  mortgageFormatCurrency(jQuery("#afdVAFinalLoanAmount"));
  mortgageFormatCurrency(jQuery("#afdVAFundingFee"));
  mortgageFormatCurrency(jQuery("#afdVABBMonthlyMortageAmount"));
  mortgageFormatCurrency(jQuery("#afdVABBLoanAmount"));
  mortgageFormatCurrency(jQuery("#afdSummaryVAMortagePayment"));
  mortgageFormatCurrency(jQuery("#afdVASliderHomePriceLabel"));
  mortgageFormatCurrency(jQuery("#afdVASliderDownPaymentLabel"));

	affordabilityVAGraph(afdVAPrinciple, afdVAHoaDues, afdVATaxes, afdVAInsurence, afdVAMonthlyMortaggePayment);

}

function affordabilityVAGraph(principle, hoa, taxes, insurence, afdVAMonthlyMortaggePayment) {

	var pricipleColor = jQuery('.afd-va-payment-results').find('.principle-interest-color').attr('data-color');
	var taxesColor = jQuery('.afd-va-payment-results').find('.taxes-color').attr('data-color');
	var insuranceColor = jQuery('.afd-va-payment-results').find('.insurance-color').attr('data-color');
	var hoaDuesColor = jQuery('.afd-va-payment-results').find('.hoa-dues-color').attr('data-color');
  
	jQuery("#affordabilityVAGraph").html('<canvas id="affordabilityVAChart" width="300px" height="300px"></canvas>');
	var ctx = jQuery("#affordabilityVAChart");
	var data = {
	  labels: ["Principle and Interest", "HOA", "Taxes", "Insurance"],
	  datasets: [
		{
		  data: [ principle.toFixed(2), hoa.toFixed(2), taxes.toFixed(2), insurence.toFixed(2)],
		  backgroundColor: [ pricipleColor, hoaDuesColor, taxesColor, insuranceColor]
		},
	  ],
	};
  
	var options = {
	  cutoutPercentage: 70,
	  tooltips: {
		callbacks: {
		  label: function (tooltipItem, data) {
			return data["datasets"][0]["data"][tooltipItem["index"]];
		  },
		},
		backgroundColor: "#5DC76F",
		displayColors: false,
		cornerRadius: 18,
		caretSize: 0,
		  xPadding: 10,
		  yPadding: 10,
	  },
	  legend: {
		display: false,
	  },
	  responsive: true,
	  maintainAspectRatio: true,
	};
  
	var myDoughnutChart = new Chart(ctx, {
	  type: "doughnut",
	  data: data,
	  options: options,
	});
  
	Chart.pluginService.register({
	  afterDraw: function (chart) {
		jQuery(".afdVAChartCenterAmount").text("$" + parseFloat(afdVAMonthlyMortaggePayment).toFixed(2));
		mortgageFormatCurrency(jQuery(".afdVAChartCenterAmount"));
	  },
	});
}


// USDA
function AffordabilityUSDACalculator() {

	// Init Slider

	let afdUSDASliderHomePrice = jQuery("#afdUSDASliderHomePrice").attr('data-amount');
	jQuery("#afdUSDASliderHomePrice").slider({
		range: "min",
		min: 0,
		max: 1000000,
    step: 5000,
		value: afdUSDASliderHomePrice,
		slide: function(e, ui) {
			jQuery('#afdUSDASliderHomePriceLabel').html('$'+ui.value);
			jQuery(this).attr('data-amount',ui.value);
			jQuery('#affordabilityUSDAHomePrice').val('$'+ui.value);
			AffordabilityUSDACalculator();
		}
	});


	let afdUSDASliderDownPayment = jQuery("#afdUSDASliderDownPayment").attr('data-amount');
	jQuery("#afdUSDASliderDownPayment").slider({
		range: "min",
		min: 0,
		max: 1000000,
    step: 5000,
		value: afdUSDASliderDownPayment,
		slide: function(e, ui) {
      if (jQuery("#affordabilityUSDADownPayment").hasClass("percentage")) {
        jQuery("#affordabilityUSDADownPayment").removeClass("percentage");
        jQuery("#affordabilityUSDADownPayment").parents(".mortage-item-input").find(".btn-primary").removeClass("active percentage");
        jQuery("#affordabilityUSDADownPayment").parents(".mortage-item-input").find("#affordability_usda_down_payment_dollar").parent().addClass("active dollar");
      }
			jQuery('#afdUSDASliderDownPaymentLabel').html('$'+ui.value);
			jQuery(this).attr('data-amount',ui.value);
			jQuery('#affordabilityUSDADownPayment').val('$'+ui.value);
			AffordabilityUSDACalculator();
		}
	});


	// Get all datas

	var affordabilityUSDAGrossMonthlyIncome = jQuery('#affordabilityUSDAGrossMonthlyIncome').val();
	var affordabilityUSDAMonthlyDebts = jQuery('#affordabilityUSDAMonthlyDebts').val();
	var affordabilityUSDAHomePrice = jQuery('#affordabilityUSDAHomePrice').val();
	var affordabilityUSDADownPayment = jQuery('#affordabilityUSDADownPayment').val();
	var affordabilityUSDALoanAmount = jQuery('#affordabilityUSDALoanAmount').val();
	var affordabilityUSDALoanTerm = jQuery('#affordabilityUSDALoanTerm').val();
	var affordabilityUSDAInteretRate = jQuery('#affordabilityUSDAInteretRate').val();
	var affordabilityUSDAPropTax = jQuery('#affordabilityUSDAPropTax').val();
	var affordabilityUSDAHomeownersInsurance = jQuery('#affordabilityUSDAHomeownersInsurance').val();
	var affordabilityUSDAHoaDues = jQuery('#affordabilityUSDAHoaDues').val();

	affordabilityUSDAGrossMonthlyIncome = ( affordabilityUSDAGrossMonthlyIncome != '' ) ? parseFloat( affordabilityUSDAGrossMonthlyIncome.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityUSDAMonthlyDebts = ( affordabilityUSDAMonthlyDebts != '' ) ? parseFloat( affordabilityUSDAMonthlyDebts.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityUSDAHomePrice = ( affordabilityUSDAHomePrice != '' ) ? parseFloat( affordabilityUSDAHomePrice.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityUSDALoanAmount = ( affordabilityUSDALoanAmount != '' ) ? parseFloat( affordabilityUSDALoanAmount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityUSDADownPayment = ( affordabilityUSDADownPayment != '' ) ? parseFloat( affordabilityUSDADownPayment.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityUSDAPropTax = ( affordabilityUSDAPropTax != '' ) ? parseFloat( affordabilityUSDAPropTax.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityUSDAHomeownersInsurance = ( affordabilityUSDAHomeownersInsurance != '' ) ? parseFloat( affordabilityUSDAHomeownersInsurance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityUSDAHoaDues = ( affordabilityUSDAHoaDues != '' ) ? parseFloat( affordabilityUSDAHoaDues.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;


	var afdUSDAHomePrice = affordabilityUSDAHomePrice;
	var afdUSDALoanAmount = affordabilityUSDALoanAmount;
	var afdUSDAHoaDues = affordabilityUSDAHoaDues;
	var afdUSDADownPayment = affordabilityUSDADownPayment;
  var afdUSDADownPaymentPercent = affordabilityUSDADownPayment;

  var afdMinDownPayment = (afdUSDAHomePrice * 3.5)/100;
  if (jQuery("#affordabilityUSDADownPayment").hasClass("percentage")) {
    afdUSDADownPayment = (afdUSDADownPayment / 100) * afdUSDAHomePrice;
    afdUSDADownPayment = afdUSDADownPayment.toFixed(2);
  } else {
    afdUSDADownPaymentPercent = (afdUSDADownPaymentPercent * 100) / afdUSDAHomePrice;
    afdUSDADownPaymentPercent = afdUSDADownPaymentPercent.toFixed(2);
  }

  if(afdUSDADownPayment > afdUSDAHomePrice) {
    afdUSDADownPayment = afdUSDAHomePrice;
  }

  // Set loan amount and downpayment
	if( jQuery('#affordabilityUSDALoanAmount').hasClass('afd-usda-loan-triggerred') ) {
		afdUSDADownPayment = (afdUSDAHomePrice-afdUSDALoanAmount);
		jQuery('#affordabilityUSDALoanAmount').removeClass('afd-usda-loan-triggerred');
	} else {
		afdUSDALoanAmount = (afdUSDAHomePrice-afdUSDADownPayment);
	}

  // Calculate USDA Fees
  var afdUSDAGuaranteeFeePercentage = 0.01;
  var afdUSDAGuaranteeFeeAmount = (afdUSDAHomePrice * afdUSDAGuaranteeFeePercentage);
  var afdUSDALoanAmountWithGuaranteeFee = afdUSDALoanAmount + afdUSDAGuaranteeFeeAmount;
  var afdUSDAAnnualGuaranteeFeeAmount = (((1-(afdUSDADownPaymentPercent/100))*afdUSDAHomePrice)*0.0035)/12;
  var afdUSDAMIP = afdUSDAAnnualGuaranteeFeeAmount;
  var afdUSDAAnnualGuaranteeFeeDisplay = (afdUSDALoanAmount * 0.01)

  // Update slider values
	jQuery("#afdUSDASliderHomePrice").slider({
		value: afdUSDAHomePrice
	});
  jQuery("#afdUSDASliderHomePriceLabel").html("$"+afdUSDAHomePrice);
	jQuery("#afdUSDASliderDownPayment").slider({
		value: afdUSDADownPayment,
    max: afdUSDAHomePrice
	});
  jQuery("#afdUSDASliderDownPaymentLabel").html("$"+parseFloat(afdUSDADownPayment).toFixed(0));

	var r = affordabilityUSDAInteretRate / 100;
	r = parseFloat(r / 12);
	var n = affordabilityUSDALoanTerm * 12;
	n = parseFloat(n);
	var P = parseFloat(afdUSDALoanAmountWithGuaranteeFee);
	var afdUSDAPrinciple = P * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

  if (jQuery("#affordabilityUSDAHomeownersInsurance").hasClass("percentage")) {
    var afdUSDAInsurence = (afdUSDAHomePrice*affordabilityUSDAHomeownersInsurance)/100;
    afdUSDAInsurence = afdUSDAInsurence / 12;
    afdUSDAInsurence = parseFloat(afdUSDAInsurence);
  } else {
    var afdUSDAInsurence = parseFloat(affordabilityUSDAHomeownersInsurance);
    afdUSDAInsurence = afdUSDAInsurence / 12;
    afdUSDAInsurence = parseFloat(afdUSDAInsurence);
  }

  if (jQuery("#affordabilityUSDAPropTax").hasClass("percentage")) {
    var afdUSDATaxes = (afdUSDAHomePrice * affordabilityUSDAPropTax) / 100;
    afdUSDATaxes = afdUSDATaxes / 12;
  } else {
    var afdUSDATaxes = affordabilityUSDAPropTax / 12;
  }

	var afdUSDAMonthlyMortaggePayment = parseFloat(afdUSDAPrinciple)+parseFloat(afdUSDATaxes)+afdUSDAInsurence+afdUSDAHoaDues+afdUSDAMIP;

	var afdUSDABBYourDebt = parseFloat((afdUSDAMonthlyMortaggePayment/affordabilityUSDAGrossMonthlyIncome)*100).toFixed(2);
	var afdUSDABBYourIncome = parseFloat(((afdUSDAMonthlyMortaggePayment+affordabilityUSDAMonthlyDebts)/affordabilityUSDAGrossMonthlyIncome)*100).toFixed(2);


	// Input fields updates

	jQuery("#affordabilityUSDALoanAmount").val("$" + parseFloat(afdUSDALoanAmount).toFixed(2));
  if (jQuery("#affordabilityUSDADownPayment").hasClass("percentage")) {
    jQuery("#affordabilityUSDADownPayment").val(parseFloat(afdUSDADownPaymentPercent));
  } else {
    jQuery("#affordabilityUSDADownPayment").val("$" + parseFloat(afdUSDADownPayment).toFixed(2));
  }

	// Output fields updates

	if (r > 0) {
    jQuery("#affordabilityUSDAChartPrinciple").html("$" + parseFloat(afdUSDAPrinciple).toFixed(2));
    jQuery("#afdUSDAMonthlyConventionalPayment").html("$" + parseFloat(afdUSDAPrinciple).toFixed(2));
	} else {
    jQuery("#affordabilityUSDAChartPrinciple").text("$0");
    jQuery("#afdUSDAMonthlyConventionalPayment").text("$0");
	}

	jQuery("#afdUSDAHomeValue").html("$" + parseFloat(afdUSDAHomePrice).toFixed(2));
	jQuery("#afdUSDABaseLoanAmount").html("$" + parseFloat(afdUSDALoanAmount).toFixed(2));
	jQuery("#afdUSDAMonthlyUSDAPayment").html("$" + parseFloat(afdUSDAMonthlyMortaggePayment).toFixed(2));
	jQuery("#afdUSDADownPayment").html("$" + parseFloat(afdUSDADownPayment).toFixed(2));
	jQuery("#afdUSDALoanAmount").html("$" + parseFloat(afdUSDALoanAmountWithGuaranteeFee).toFixed(2));
	jQuery("#afdUSDAGuaranteeFee").html("$" + parseFloat(afdUSDAAnnualGuaranteeFeeDisplay).toFixed(2));

	jQuery("#affordabilityUSDAChartTaxes").html("$" + parseFloat(afdUSDATaxes).toFixed(2));
	jQuery("#affordabilityUSDAChartInsurence").html("$" + parseFloat(afdUSDAInsurence).toFixed(2));
	jQuery("#affordabilityUSDAChartHOADues").html("$" + parseFloat(afdUSDAHoaDues).toFixed(2));
	jQuery("#affordabilityUSDAChartMIP").html("$" + parseFloat(afdUSDAMIP).toFixed(2));

	jQuery("#afdUSDABBMonthlyMortageAmount").html("$" + parseFloat(afdUSDAMonthlyMortaggePayment).toFixed(2));
	jQuery("#afdUSDABBLoanAmount").html("$" + parseFloat(afdUSDALoanAmountWithGuaranteeFee).toFixed(2));
	jQuery("#afdUSDABBYourDebt").html(parseFloat(afdUSDABBYourDebt)+"%");
	jQuery("#afdUSDABBYourIncome").html(parseFloat(afdUSDABBYourIncome)+"%");

  jQuery("#afdSummaryUSDAMortagePayment").html("$" + parseFloat(afdUSDAMonthlyMortaggePayment).toFixed(2));
  jQuery("#afdSummaryUSDADownPaymentPercent").html(parseFloat(afdUSDADownPaymentPercent).toFixed(2)+'% Down Payment');
  jQuery("#afdSummaryUSDADebtToIncome").html('Debt-to-Income Ratio is '+parseFloat(afdUSDABBYourDebt)+'%/'+parseFloat(afdUSDABBYourIncome)+'%');

  mortgageFormatCurrency(jQuery("#affordabilityUSDAGrossMonthlyIncome"));
  mortgageFormatCurrency(jQuery("#affordabilityUSDAMonthlyDebts"));
  mortgageFormatCurrency(jQuery("#affordabilityUSDAHomePrice"));
  if (!jQuery("#affordabilityUSDADownPayment").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityUSDADownPayment"));
  }
  if (!jQuery("#affordabilityUSDAHomeownersInsurance").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityUSDAHomeownersInsurance"));
  }
  if (!jQuery("#affordabilityUSDAPropTax").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityUSDAPropTax"));
  }

  mortgageFormatCurrency(jQuery("#affordabilityUSDALoanAmount"));
  mortgageFormatCurrency(jQuery("#affordabilityUSDAChartPrinciple"));
  mortgageFormatCurrency(jQuery("#affordabilityUSDAChartTaxes"));
  mortgageFormatCurrency(jQuery("#affordabilityUSDAChartInsurence"));
  mortgageFormatCurrency(jQuery("#affordabilityUSDAChartHOADues"));
  mortgageFormatCurrency(jQuery("#affordabilityUSDAChartMIP"));
  mortgageFormatCurrency(jQuery("#afdUSDAHomeValue"));
  mortgageFormatCurrency(jQuery("#afdUSDABaseLoanAmount"));
  mortgageFormatCurrency(jQuery("#afdUSDAMonthlyUSDAPayment"));
  mortgageFormatCurrency(jQuery("#afdUSDADownPayment"));
  mortgageFormatCurrency(jQuery("#afdUSDALoanAmount"));
  mortgageFormatCurrency(jQuery("#afdUSDAGuaranteeFee"));
  mortgageFormatCurrency(jQuery("#afdUSDABBMonthlyMortageAmount"));
  mortgageFormatCurrency(jQuery("#afdUSDABBLoanAmount"));
  mortgageFormatCurrency(jQuery("#afdSummaryUSDAMortagePayment"));
  mortgageFormatCurrency(jQuery("#afdUSDASliderHomePriceLabel"));
  mortgageFormatCurrency(jQuery("#afdUSDASliderDownPaymentLabel"));

	affordabilityUSDAGraph(afdUSDAPrinciple, afdUSDAHoaDues, afdUSDATaxes, afdUSDAInsurence, afdUSDAMIP, afdUSDAMonthlyMortaggePayment);

}

function affordabilityUSDAGraph(principle, hoa, taxes, insurence, mip, afdUSDAMonthlyMortaggePayment) {

	var pricipleColor = jQuery('.afd-usda-payment-results').find('.principle-interest-color').attr('data-color');
	var taxesColor = jQuery('.afd-usda-payment-results').find('.taxes-color').attr('data-color');
	var insuranceColor = jQuery('.afd-usda-payment-results').find('.insurance-color').attr('data-color');
	var hoaDuesColor = jQuery('.afd-usda-payment-results').find('.hoa-dues-color').attr('data-color');
	var pmiColor = jQuery('.afd-usda-payment-results').find('.pmi-color').attr('data-color');
  
	jQuery("#affordabilityUSDAGraph").html('<canvas id="affordabilityUSDAChart" width="300px" height="300px"></canvas>');
	var ctx = jQuery("#affordabilityUSDAChart");
	var data = {
	  labels: ["Principle and Interest", "HOA", "Taxes", "Insurance", "USDA MIP"],
	  datasets: [
		{
		  data: [ principle.toFixed(2), hoa.toFixed(2), taxes.toFixed(2), insurence.toFixed(2), mip.toFixed(2)],
		  backgroundColor: [ pricipleColor, hoaDuesColor, taxesColor, insuranceColor, pmiColor]
		},
	  ],
	};
  
	var options = {
	  cutoutPercentage: 70,
	  tooltips: {
		callbacks: {
		  label: function (tooltipItem, data) {
			return data["datasets"][0]["data"][tooltipItem["index"]];
		  },
		},
		backgroundColor: "#5DC76F",
		displayColors: false,
		cornerRadius: 18,
		caretSize: 0,
		  xPadding: 10,
		  yPadding: 10,
	  },
	  legend: {
		display: false,
	  },
	  responsive: true,
	  maintainAspectRatio: true,
	};
  
	var myDoughnutChart = new Chart(ctx, {
	  type: "doughnut",
	  data: data,
	  options: options,
	});
  
	Chart.pluginService.register({
	  afterDraw: function (chart) {
		jQuery(".afdUSDAChartCenterAmount").text("$" + parseFloat(afdUSDAMonthlyMortaggePayment).toFixed(2));
		mortgageFormatCurrency(jQuery(".afdUSDAChartCenterAmount"));
	  },
	});
}


// Jumbo
function AffordabilityJumboCalculator() {

	// Init Slider

	let afdJumboSliderHomePrice = jQuery("#afdJumboSliderHomePrice").attr('data-amount');
	jQuery("#afdJumboSliderHomePrice").slider({
		range: "min",
		min: 0,
		max: 1000000,
    step: 5000,
		value: afdJumboSliderHomePrice,
		slide: function(e, ui) {
			jQuery('#afdJumboSliderHomePriceLabel').html('$'+ui.value);
			jQuery(this).attr('data-amount',ui.value);
			jQuery('#affordabilityJumboHomePrice').val('$'+ui.value);
			AffordabilityJumboCalculator();
		}
	});


	let afdJumboSliderDownPayment = jQuery("#afdJumboSliderDownPayment").attr('data-amount');
	jQuery("#afdJumboSliderDownPayment").slider({
		range: "min",
		min: 0,
		max: 1000000,
    step: 5000,
		value: afdJumboSliderDownPayment,
		slide: function(e, ui) {
      if (jQuery("#affordabilityJumboDownPayment").hasClass("percentage")) {
        jQuery("#affordabilityJumboDownPayment").removeClass("percentage");
        jQuery("#affordabilityJumboDownPayment").parents(".mortage-item-input").find(".btn-primary").removeClass("active percentage");
        jQuery("#affordabilityJumboDownPayment").parents(".mortage-item-input").find("#affordability_jumbo_down_payment_dollar").parent().addClass("active dollar");
      }
			$('#afdJumboSliderDownPaymentLabel').html('$'+ui.value);
			$(this).attr('data-amount',ui.value);
			$('#affordabilityJumboDownPayment').val('$'+ui.value);
			AffordabilityJumboCalculator();
		}
	});


	// Get all datas

	var affordabilityJumboGrossMonthlyIncome = jQuery('#affordabilityJumboGrossMonthlyIncome').val();
	var affordabilityJumboMonthlyDebts = jQuery('#affordabilityJumboMonthlyDebts').val();
	var affordabilityJumboHomePrice = jQuery('#affordabilityJumboHomePrice').val();
	var affordabilityJumboDownPayment = jQuery('#affordabilityJumboDownPayment').val();
	var affordabilityJumboLoanAmount = jQuery('#affordabilityJumboLoanAmount').val();
	var affordabilityJumboLoanTerm = jQuery('#affordabilityJumboLoanTerm').val();
	var affordabilityJumboInteretRate = jQuery('#affordabilityJumboInteretRate').val();
	var affordabilityJumboPropTax = jQuery('#affordabilityJumboPropTax').val();
	var affordabilityJumboHomeownersInsurance = jQuery('#affordabilityJumboHomeownersInsurance').val();
	var affordabilityJumboPMI = jQuery('#affordabilityJumboPMI').val();
	var affordabilityJumboHoaDues = jQuery('#affordabilityJumboHoaDues').val();

	affordabilityJumboGrossMonthlyIncome = ( affordabilityJumboGrossMonthlyIncome != '' ) ? parseFloat( affordabilityJumboGrossMonthlyIncome.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityJumboMonthlyDebts = ( affordabilityJumboMonthlyDebts != '' ) ? parseFloat( affordabilityJumboMonthlyDebts.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityJumboHomePrice = ( affordabilityJumboHomePrice != '' ) ? parseFloat( affordabilityJumboHomePrice.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityJumboLoanAmount = ( affordabilityJumboLoanAmount != '' ) ? parseFloat( affordabilityJumboLoanAmount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityJumboDownPayment = ( affordabilityJumboDownPayment != '' ) ? parseFloat( affordabilityJumboDownPayment.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityJumboPropTax = ( affordabilityJumboPropTax != '' ) ? parseFloat( affordabilityJumboPropTax.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityJumboHomeownersInsurance = ( affordabilityJumboHomeownersInsurance != '' ) ? parseFloat( affordabilityJumboHomeownersInsurance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityJumboPMI = ( affordabilityJumboPMI != '' ) ? parseFloat( affordabilityJumboPMI.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
	affordabilityJumboHoaDues = ( affordabilityJumboHoaDues != '' ) ? parseFloat( affordabilityJumboHoaDues.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;


	var afdJumboHomePrice = affordabilityJumboHomePrice;
	var afdJumboLoanAmount = affordabilityJumboLoanAmount;
	var afdJumboHoaDues = affordabilityJumboHoaDues;
	var afdJumboDownPayment = affordabilityJumboDownPayment;
  var afdJumboDownPaymentPercent = affordabilityJumboDownPayment;

  if (jQuery("#affordabilityJumboDownPayment").hasClass("percentage")) {
    afdJumboDownPayment = (afdJumboDownPayment / 100) * afdJumboHomePrice;
    afdJumboDownPayment = afdJumboDownPayment.toFixed(2);
  } else {
    afdJumboDownPaymentPercent = (afdJumboDownPaymentPercent * 100) / afdJumboHomePrice;
    afdJumboDownPaymentPercent = afdJumboDownPaymentPercent.toFixed(2);
  }

  if(afdJumboDownPayment > afdJumboHomePrice) {
    afdJumboDownPayment = afdJumboHomePrice;
  }

  if( jQuery('#affordabilityJumboDownPayment').hasClass('afd-jumbo-downpayment-triggerred') ) {
    if(afdJumboDownPaymentPercent < 20) {
      setTimeout(function(){
        //alert('The down payment you entered is less than 20%. Please contact your loan officer to get the appropriate PMI payment to use if you do not have it already.');
        jQuery('#affordabilityJumboDownPayment').removeClass('afd-jumbo-downpayment-triggerred');
      }, 200);
    }
  }

  // Set loan amount and downpayment
	if( jQuery('#affordabilityJumboLoanAmount').hasClass('afd-jumbo-loan-triggerred') ) {
		afdJumboDownPayment = (afdJumboHomePrice-afdJumboLoanAmount);
		jQuery('#affordabilityJumboLoanAmount').removeClass('afd-jumbo-loan-triggerred');
	} else {
		afdJumboLoanAmount = (afdJumboHomePrice-afdJumboDownPayment);
	}

  // Update slider values
	jQuery("#afdJumboSliderHomePrice").slider({
		value: afdJumboHomePrice
	});
  jQuery("#afdJumboSliderHomePriceLabel").html("$"+afdJumboHomePrice);
	jQuery("#afdJumboSliderDownPayment").slider({
		value: afdJumboDownPayment,
    max: afdJumboHomePrice
	});
  jQuery("#afdJumboSliderDownPaymentLabel").html("$"+parseFloat(afdJumboDownPayment).toFixed(0));

	/* var afdNewDownPaymentPercentage = afdJumboDownPayment;
	afdNewDownPaymentPercentage = (afdNewDownPaymentPercentage * 100) / afdJumboHomePrice;
	afdNewDownPaymentPercentage = afdNewDownPaymentPercentage.toFixed(2); */

	var r = affordabilityJumboInteretRate / 100;
	r = parseFloat(r / 12);
	var n = affordabilityJumboLoanTerm * 12;
	n = parseFloat(n);
	var P = parseFloat(afdJumboLoanAmount);
	var afdJumboPrinciple = P * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

  var afdJumboLoanToValue = (afdJumboLoanAmount/afdJumboHomePrice)*100;

  if (jQuery("#affordabilityJumboHomeownersInsurance").hasClass("percentage")) {
    var afdJumboInsurence = (afdJumboHomePrice*affordabilityJumboHomeownersInsurance)/100;
    afdJumboInsurence = afdJumboInsurence / 12;
    afdJumboInsurence = parseFloat(afdJumboInsurence);
  } else {
    var afdJumboInsurence = parseFloat(affordabilityJumboHomeownersInsurance);
    afdJumboInsurence = afdJumboInsurence / 12;
    afdJumboInsurence = parseFloat(afdJumboInsurence);
  }

  if (jQuery("#affordabilityJumboPropTax").hasClass("percentage")) {
    var afdJumboTaxes = (afdJumboHomePrice * affordabilityJumboPropTax) / 100;
    afdJumboTaxes = afdJumboTaxes / 12;
  } else {
    var afdJumboTaxes = affordabilityJumboPropTax / 12;
  }

  // Calcualte PMI
  if (afdJumboLoanToValue <= 80) {
    var afdJumboPMI = 0;
    $('#affordabilityJumboPMI').val(afdJumboPMI);
  } else {
    var afdJumboPMI = parseFloat(affordabilityJumboPMI/12);
  }

	var afdJumboMonthlyMortaggePayment = parseFloat(afdJumboPrinciple)+afdJumboPMI+parseFloat(afdJumboTaxes)+afdJumboInsurence+afdJumboHoaDues;

	var afdJumboBBYourDebt = parseFloat((afdJumboMonthlyMortaggePayment/affordabilityJumboGrossMonthlyIncome)*100).toFixed(2);
	var afdJumboBBYourIncome = parseFloat(((afdJumboMonthlyMortaggePayment+affordabilityJumboMonthlyDebts)/affordabilityJumboGrossMonthlyIncome)*100).toFixed(2);

	// Input fields updates

	jQuery("#affordabilityJumboLoanAmount").val("$" + parseFloat(afdJumboLoanAmount).toFixed(2));
  if (jQuery("#affordabilityJumboDownPayment").hasClass("percentage")) {
    jQuery("#affordabilityJumboDownPayment").val(parseFloat(afdJumboDownPaymentPercent));
  } else {
    jQuery("#affordabilityJumboDownPayment").val("$" + parseFloat(afdJumboDownPayment).toFixed(2));
  }

	// Output fields updates

	if (r > 0) {
    jQuery("#affordabilityJumboChartPrinciple").html("$" + parseFloat(afdJumboPrinciple).toFixed(2));
    jQuery("#afdJumboMonthlyConventionalPayment").html("$" + parseFloat(afdJumboPrinciple).toFixed(2));
	} else {
    jQuery("#affordabilityJumboChartPrinciple").text("$0");
    jQuery("#afdJumboMonthlyConventionalPayment").text("$0");
	}

	if (afdJumboLoanToValue <= 80) {
		jQuery("#affordabilityJumboChartPMI").html("(PMI not required)");
		jQuery("#afdJumboMonthlyEstimatedPMI").html("(PMI not required)");
	} else {
		jQuery("#affordabilityJumboChartPMI").html("$" + parseFloat(afdJumboPMI).toFixed(2));
		jQuery("#afdJumboMonthlyEstimatedPMI").html("$" + parseFloat(afdJumboPMI).toFixed(2));
	}

	jQuery("#afdJumboHomeValue").html("$" + parseFloat(afdJumboHomePrice).toFixed(2));
	jQuery("#afdJumboMortageAmount").html("$" + parseFloat(afdJumboLoanAmount).toFixed(2));
	jQuery("#afdJumboDownPayment").html("$" + parseFloat(afdJumboDownPayment).toFixed(2));

	jQuery("#affordabilityJumboChartTaxes").html("$" + parseFloat(afdJumboTaxes).toFixed(2));
	jQuery("#affordabilityJumboChartInsurence").html("$" + parseFloat(afdJumboInsurence).toFixed(2));
	jQuery("#affordabilityJumboChartHOADues").html("$" + parseFloat(afdJumboHoaDues).toFixed(2));

	jQuery("#afdJumboBBMonthlyMortageAmount").html("$" + parseFloat(afdJumboMonthlyMortaggePayment).toFixed(2));
	jQuery("#afdJumboBBLoanAmount").html("$" + parseFloat(afdJumboLoanAmount).toFixed(2));
	jQuery("#afdJumboBBYourDebt").html(parseFloat(afdJumboBBYourDebt)+"%");
	jQuery("#afdJumboBBYourIncome").html(parseFloat(afdJumboBBYourIncome)+"%");

  jQuery("#afdSummaryJumboMortagePayment").html("$" + parseFloat(afdJumboMonthlyMortaggePayment).toFixed(2));
  jQuery("#afdSummaryJumboDownPaymentPercent").html(parseFloat(afdJumboDownPaymentPercent).toFixed(2)+'% Down Payment');
  jQuery("#afdSummaryJumboDebtToIncome").html('Debt-to-Income Ratio is '+parseFloat(afdJumboBBYourDebt)+'%/'+parseFloat(afdJumboBBYourIncome)+'%');

  mortgageFormatCurrency(jQuery("#affordabilityJumboGrossMonthlyIncome"));
  mortgageFormatCurrency(jQuery("#affordabilityJumboMonthlyDebts"));
  mortgageFormatCurrency(jQuery("#affordabilityJumboHomePrice"));
  if (!jQuery("#affordabilityJumboDownPayment").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityJumboDownPayment"));
  }
  if (!jQuery("#affordabilityJumboHomeownersInsurance").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityJumboHomeownersInsurance"));
  }
  if (!jQuery("#affordabilityJumboPropTax").hasClass("percentage")) {
    mortgageFormatCurrency(jQuery("#affordabilityJumboPropTax"));
  }

  mortgageFormatCurrency(jQuery("#affordabilityJumboLoanAmount"));
  mortgageFormatCurrency(jQuery("#affordabilityJumboPMI"));
  mortgageFormatCurrency(jQuery("#affordabilityJumboChartPrinciple"));
  mortgageFormatCurrency(jQuery("#affordabilityJumboChartTaxes"));
  mortgageFormatCurrency(jQuery("#affordabilityJumboChartInsurence"));
  mortgageFormatCurrency(jQuery("#affordabilityJumboChartHOADues"));
  mortgageFormatCurrency(jQuery("#affordabilityJumboChartPMI"));
  mortgageFormatCurrency(jQuery("#afdJumboHomeValue"));
  mortgageFormatCurrency(jQuery("#afdJumboMortageAmount"));
  mortgageFormatCurrency(jQuery("#afdJumboMonthlyConventionalPayment"));
  mortgageFormatCurrency(jQuery("#afdJumboDownPayment"));
  mortgageFormatCurrency(jQuery("#afdJumboMonthlyEstimatedPMI"));
  mortgageFormatCurrency(jQuery("#afdJumboBBMonthlyMortageAmount"));
  mortgageFormatCurrency(jQuery("#afdJumboBBLoanAmount"));
  mortgageFormatCurrency(jQuery("#afdSummaryJumboMortagePayment"));
  mortgageFormatCurrency(jQuery("#afdJumboSliderHomePriceLabel"));
  mortgageFormatCurrency(jQuery("#afdJumboSliderDownPaymentLabel"));

	affordabilityJumboGraph(afdJumboPrinciple, afdJumboHoaDues, afdJumboTaxes, afdJumboPMI, afdJumboInsurence, afdJumboMonthlyMortaggePayment);

}

function affordabilityJumboGraph(principle, hoa, taxes, pmi, insurence, afdJumboMonthlyMortaggePayment) {

	var pricipleColor = jQuery('.afd-jumbo-payment-results').find('.principle-interest-color').attr('data-color');
	var taxesColor = jQuery('.afd-jumbo-payment-results').find('.taxes-color').attr('data-color');
	var insuranceColor = jQuery('.afd-jumbo-payment-results').find('.insurance-color').attr('data-color');
	var hoaDuesColor = jQuery('.afd-jumbo-payment-results').find('.hoa-dues-color').attr('data-color');
	var pmiColor = jQuery('.afd-jumbo-payment-results').find('.pmi-color').attr('data-color');
  
	jQuery("#affordabilityJumboGraph").html('<canvas id="affordabilityJumboChart" width="300px" height="300px"></canvas>');
	var ctx = jQuery("#affordabilityJumboChart");
	var data = {
	  labels: ["Principle and Interest", "HOA", "Taxes", "PMI", "Insurance"],
	  datasets: [
		{
		  data: [ principle.toFixed(2), hoa.toFixed(2), taxes.toFixed(2), pmi.toFixed(2), insurence.toFixed(2)],
		  backgroundColor: [ pricipleColor, hoaDuesColor, taxesColor, pmiColor, insuranceColor]
		},
	  ],
	};
  
	var options = {
	  cutoutPercentage: 70,
	  tooltips: {
		callbacks: {
		  label: function (tooltipItem, data) {
			return data["datasets"][0]["data"][tooltipItem["index"]];
		  },
		},
		backgroundColor: "#5DC76F",
		displayColors: false,
		cornerRadius: 18,
		caretSize: 0,
		  xPadding: 10,
		  yPadding: 10,
	  },
	  legend: {
		display: false,
	  },
	  responsive: true,
	  maintainAspectRatio: true,
	};
  
	var myDoughnutChart = new Chart(ctx, {
	  type: "doughnut",
	  data: data,
	  options: options,
	});
  
	Chart.pluginService.register({
	  afterDraw: function (chart) {
		jQuery(".afdJumboChartCenterAmount").text("$" + parseFloat(afdJumboMonthlyMortaggePayment).toFixed(2));
		mortgageFormatCurrency(jQuery(".afdJumboChartCenterAmount"));
	  },
	});
}

//Affordability dollar and pecentage switcher
jQuery(document).on("click", ".btn-group .btn-primary input.afd-input", function () {
        
  if(jQuery(this).parents('.affordability-tab-item').attr('id') == 'affordability-conventional') {
    var afdHomePrice = jQuery('#affordabilityHomePrice').val();
    afdHomePrice = ( afdHomePrice != undefined) ? Number(afdHomePrice.replace("$", "").replace(/,/g, "")) : 0;
  }
  if(jQuery(this).parents('.affordability-tab-item').attr('id') == 'affordability-fha') {
    var afdHomePrice = jQuery('#affordabilityFHAHomePrice').val();
    afdHomePrice = ( afdHomePrice != undefined) ? Number(afdHomePrice.replace("$", "").replace(/,/g, "")) : 0;
  }
  if(jQuery(this).parents('.affordability-tab-item').attr('id') == 'affordability-va') {
    var afdHomePrice = jQuery('#affordabilityVAHomePrice').val();
    afdHomePrice = ( afdHomePrice != undefined) ? Number(afdHomePrice.replace("$", "").replace(/,/g, "")) : 0;
  }
  if(jQuery(this).parents('.affordability-tab-item').attr('id') == 'affordability-usda') {
    var afdHomePrice = jQuery('#affordabilityUSDAHomePrice').val();
    afdHomePrice = ( afdHomePrice != undefined) ? Number(afdHomePrice.replace("$", "").replace(/,/g, "")) : 0;
  }
  if(jQuery(this).parents('.affordability-tab-item').attr('id') == 'affordability-jumbo') {
    var afdHomePrice = jQuery('#affordabilityJumboHomePrice').val();
    afdHomePrice = ( afdHomePrice != undefined) ? Number(afdHomePrice.replace("$", "").replace(/,/g, "")) : 0;
  }

  var inputVal = jQuery(this).parents('.mortage-item-input').find("input.form-control").val();
  inputVal = ( inputVal != undefined) ? Number(inputVal.replace("$", "").replace(/,/g, "")) : 0;
  jQuery(this).parents(".btn-group").find(".btn-primary.active").removeClass("active");
  jQuery(this).parent().addClass("active");

  //for downpayment currency
  if (jQuery(this).parents(".afd-down-payment-type").length > 0) {
    if (jQuery(this).val() === "dollar") {
      if (!jQuery(this).parent().hasClass("dollar")) {

          var downPayment = (inputVal / 100) * afdHomePrice;
          jQuery(this).parents('.mortage-item-input').find("input.form-control").removeClass("percentage").val(downPayment.toFixed(2));

        jQuery(this).parents(".btn-group").find(".btn-primary").removeClass("percentage");
        jQuery(this).parent().addClass("dollar");
      }
    } else {
      if (!jQuery(this).parent().hasClass("percentage")) {

          var downPayment = (inputVal * 100) / afdHomePrice;
          jQuery(this).parents('.mortage-item-input').find("input.form-control").addClass("percentage").val(downPayment.toFixed(2));

        jQuery(this).parents(".btn-group").find(".btn-primary").removeClass("dollar");
        jQuery(this).parent().addClass("percentage");
      }
    }

    jQuery("#affordabilityDownPayment").trigger("change");
  }

  //for property tax currency
  if (jQuery(this).parents(".afd-prop-tax-type").length > 0) {
    if (jQuery(this).val() === "dollar") {
      if (!jQuery(this).parent().hasClass("dollar")) {

          var proTax = (inputVal / 100) * afdHomePrice;
          jQuery(this).parents('.mortage-item-input').find("input.form-control").removeClass("percentage").val(proTax.toFixed(2));

        jQuery(this).parents(".btn-group").find(".btn-primary").removeClass("percentage");
        jQuery(this).parent().addClass("dollar");
      }
    } else {
      if (!jQuery(this).parent().hasClass("percentage")) {

          var proTax = (inputVal * 100) / afdHomePrice;
          jQuery(this).parents('.mortage-item-input').find("input.form-control").addClass("percentage").val(proTax.toFixed(2));

        jQuery(this).parents(".btn-group").find(".btn-primary").removeClass("dollar");
        jQuery(this).parent().addClass("percentage");
      }
    }

    jQuery("#affordabilityPropTax").trigger("change");
  }

  //for home insurance currency
  if (jQuery(this).parents(".afd-home-insurance-type").length > 0) {
    if (jQuery(this).val() === "dollar") {
      if (!jQuery(this).parent().hasClass("dollar")) {

          var homeInsurance = (inputVal / 100) * afdHomePrice;
          jQuery(this).parents('.mortage-item-input').find("input.form-control").removeClass("percentage").val(homeInsurance.toFixed(2));

        jQuery(this).parents(".btn-group").find(".btn-primary").removeClass("percentage");
        jQuery(this).parent().addClass("dollar");
      }
    } else {
      if (!jQuery(this).parent().hasClass("percentage")) {

          var homeInsurance = (inputVal * 100) / afdHomePrice;
          jQuery(this).parents('.mortage-item-input').find("input.form-control").addClass("percentage").val(homeInsurance.toFixed(2));

        jQuery(this).parents(".btn-group").find(".btn-primary").removeClass("dollar");
        jQuery(this).parent().addClass("percentage");
      }
    }

    jQuery("#affordabilityHomeownersInsurance").trigger("change");
  }

});

// Affordability End

jQuery(document).ready(function ($) {
    if ( $(".payment-calculator-main").length != 0 ) {
      var BGColorChangeArr = [];
      jQuery("#slider1").slider({
        range: "min",
        min: 1,
        max: 30,
        value: 1,
        slide: function(e, ui) {
          $('#slider-years').html((ui.value + ' years') );
          $(this).attr('data-year',ui.value);
          rentVsBuy();
          return jQuery(".ui-slider-handle").html(ui.value);
        }
      });
      jQuery(".ui-slider-handle").html("1");

      $('#slider1').draggable();

      $("#datepicker").datepicker();
      chartColor();
      vaChartColor();
      allElementCurrencyRefresh();
      rate = $("#mortageInterestRate").val();
      mortgageCalculate(loanAmount, rate, years);
      mortgageCalcPayOff();
      veteranAffairsCalcPayOff();

      // Show the first tab and hide the rest
      $(".payment-tab-nav ul li:not(.hidden):first").addClass("active");
      $(".payment-left-system .tab-content").hide();
      $(".payment-left-system .tab-content:not(.hidden):first").fadeIn();
      $(".payment-right-system .tab-content").hide();
      $(".payment-right-system .tab-content:not(.hidden):first").fadeIn();

      let firstItem = $(".payment-tab-nav ul li:not(.hidden):first");

      $('.payment-calculator-main').removeClass('rental-loan-main fix-and-flip-main affordability-main');
      // Affordability Start
      if ( firstItem.hasClass('affordability')) {
        $('.payment-calculator-main').addClass('affordability-main');
        var afdActiveTab = $(".affordability-tab-nav ul li:not(.hidden):first").find("a").attr("href");
        if(afdActiveTab == '#affordability-conventional') {
          AffordabilityCalculator();
        }
        if(afdActiveTab == '#affordability-fha') {
          AffordabilityFHACalculator();
        }
        if(afdActiveTab == '#affordability-va') {
          AffordabilityVACalculator();
        }
        if(afdActiveTab == '#affordability-usda') {
          AffordabilityUSDACalculator();
        }
        if(afdActiveTab == '#affordability-jumbo') {
          AffordabilityJumboCalculator();
        }
      }
      // Affordability End
      /* if ( firstItem.hasClass('mortage-item')) {
        mortgageCalculate(loanAmount, rate, years);
      } */
      if ( firstItem.hasClass('veteran-affairs')) {
        VACalculate(finalAmount, vaRate, vaYears);
        vaTriggerAllElementChange(); 
      }
      if ( firstItem.hasClass('refinance-item')) {
        refinanceCalculate();
        initialVaRefinanceDatepicker('#refinance-item');
      }
      if ( firstItem.hasClass('rent-buy-item')) {
        rentVsBuy();
        initialVaRefinanceDatepicker('#rent-buy-item');
      }
      if ( firstItem.hasClass('va-refinance')) {
        vaRefinanceCalculate();
        initialVaRefinanceDatepicker('#va-refinance');
      }
      if ( firstItem.hasClass('rental-loan')) {
        $('.payment-calculator-main').addClass('rental-loan-main');
        rentalLoanFormatCurrency();
        rentalLoanCalculate();
      }
      if ( firstItem.hasClass('fix-and-flip')) {
        $('.payment-calculator-main').addClass('fix-and-flip-main');
        FixAndFlipFormatCurrency();
        FixAndFlipCalculate();
      }

      $(".payment-tab-nav ul li").click(function () {
        $(".payment-tab-nav ul li").removeClass("active");
        $(this).addClass("active");
        $(".tab-content").hide();
        var activeTab = $(this).find("a").attr("href");
        $(activeTab).fadeIn();
        $(".payment-right-system .tab-content").hide();
        $('.payment-right-system .tab-content[data-id="' + activeTab + '"]').fadeIn();
        var BGColor = $(this).attr('dataBG');
        var TextColor = $(this).attr('dataText');
        var dataName = $(this).attr('data-name');
        $('.payment-calculator-left .title h2').text(dataName);
        $('.payment-calculator-left').css('background-color', BGColor);
        $('.top-hea-block .title h2').css('color', TextColor);
        //$('.payment-tab-nav ul li a').css('color', TextColor);
        //$('.payment-tab-nav ul li.active a').css('color', TextColor);
        if ( $(this).hasClass('veteran-affairs')) {
          VACalculate(finalAmount, vaRate, vaYears);
          vaTriggerAllElementChange(); 
        }
        if ( $(this).hasClass('refinance-item')) {
          refinanceCalculate();
          initialVaRefinanceDatepicker('#refinance-item');
        }
        if ( $(this).hasClass('rent-buy-item')) {
          rentVsBuy();
          initialVaRefinanceDatepicker('#rent-buy-item');
        }
        if ( $(this).hasClass('va-refinance')) {
          vaRefinanceCalculate();
          initialVaRefinanceDatepicker('#va-refinance');
        }
        $(this).parents('.payment-calculator-main').removeClass('rental-loan-main');
        if ( $(this).hasClass('rental-loan')) {
          $(this).parents('.payment-calculator-main').addClass('rental-loan-main');
          rentalLoanFormatCurrency();
          rentalLoanCalculate();
        }
        $(this).parents('.payment-calculator-main').removeClass('fix-and-flip-main');
        if ( $(this).hasClass('fix-and-flip')) {
          $(this).parents('.payment-calculator-main').addClass('fix-and-flip-main');
          FixAndFlipFormatCurrency();
          FixAndFlipCalculate();
        }

        // Affordability Start
        $(this).parents('.payment-calculator-main').removeClass('affordability-main');
        if ( $(this).hasClass('affordability')) {
          $(this).parents('.payment-calculator-main').addClass('affordability-main');
          //$(".affordability-tab-nav ul li:not(.hidden):first").trigger('click');
          //AffordabilityCalculator();
          var afdActiveTab = $(".affordability-tab-nav ul li:not(.hidden):first").find("a").attr("href");
          if(afdActiveTab == '#affordability-conventional') {
            AffordabilityCalculator();
          }
          if(afdActiveTab == '#affordability-fha') {
            AffordabilityFHACalculator();
          }
          if(afdActiveTab == '#affordability-va') {
            AffordabilityVACalculator();
          }
          if(afdActiveTab == '#affordability-usda') {
            AffordabilityUSDACalculator();
          }
          if(afdActiveTab == '#affordability-jumbo') {
            AffordabilityJumboCalculator();
          }
        }
        // Affordability End

        $('.afd-email-report-container').hide();
        $(".afd-trigger-email-form-na").show();
        
        $('html,body').animate({
            scrollTop: $('.payment-calculator-main').offset().top - 100
        }, 1000);
      });
      $("#mt-payment-tabs li").click(function () {
        var tabid = $(this).find("span").attr("datas");
        $("#mt-payment-tabs li,.mortgage-payment-tabs-item .tp-tabs-content").removeClass("active");
        $(this).addClass("active");
        $(".mortgage-payment-tabs-item .tp-tabs-content").hide(); 
        $("#" + tabid).fadeIn();
      });
      $("#va-mt-payment-tabs li").click(function () {
        var tabid = $(this).find("span").attr("datas");
        $("#va-mt-payment-tabs li,.va-payment-tabs-item .tp-tabs-content").removeClass("active");
        $(this).addClass("active");
        $(".va-payment-tabs-item .tp-tabs-content").hide(); 
        $("#" + tabid).fadeIn();
      });

      $("input[data-type='currency']").on({
        keyup: function (e) {
          if ((e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 8 || e.keyCode == 46 ) {
            e = e;
          } else {
            mortgageFormatCurrency($(this));
          }
        },
        blur: function (e) {
          if ( (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 8 || e.keyCode == 46 ) {
            e = e;
          } else {
            mortgageFormatCurrency($(this), "blur");
          }
        },
        focusout: function (e) {
          if(jQuery(this).attr("id") == 'mortageDownPayment') {
            jQuery("#" + jQuery(this).attr("id")).addClass('downpayment-alert-triggered');
          }
          if(jQuery(this).attr("id") != 'mortageLoanAmount') {
            jQuery("#" + jQuery(this).attr("id")).trigger("change");
          }
        },
      });

      triggerAllElementChange();

      /** For rental loan start **/
      $(document).on("change", "#RentalLoanNoOfUnits", function () {
        rentalLoanCalculate();
      });
      $(document).on("change", "#RentalLoanPropertyValuePurchasePrice, #RentalLoanUnit1MonthlyRent, #RentalLoanAnnualPropertyTaxes, #RentalLoanAnnualInsurance, #RentalLoanMonthlyHOAFee, #RentalLoanAnnualUtilities", function () {
        rentalLoanCalculate();
      });
      $(document).on("change", "#RentalLoanVacancyRate, #RentalLoanAnnualRepairsMaintenance, #RentalLoanLoanToValue, #RentalLoanInterestRate, #RentalLoanOriginationFee", function () {
        rentalLoanCalculate();
      });

      $('.card-toggle-items .card-toggle-title').on('click', function () {
        $(this).parents('li').find('.card-toggle-content').toggle();
        if($(this).parents('li').hasClass('active')) {
            $(this).parents('li').removeClass('active');
        } else {
            $(this).parents('li').addClass('active');
        }
      });

      if( $('.rlar-popup-container').length ) {
        $('.get-analysis-report').on('click', function () {
          $('.rlar-popup-container').addClass('active');
        });
        $('body').on('click', '.rlar-popup-close, .rlar-popup-overlay', function(e) {
            $(this).closest('.rlar-popup-container').removeClass('active');
        });
      }

      $(document).on('click', '#va-download-report', function (e) {

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yAxisLabel = 10;
        let yAxisValue = 70;
        let lineNo = 20;

        // Heading
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Rental Loan - Analysis Report', yAxisLabel, lineNo);


        // Company Details

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        lineNo = 30;
        doc.text($('#CompanyName').val(), yAxisLabel, lineNo);

        lineNo = 35;
        doc.text($('#CompanyEmail').val(), yAxisLabel, lineNo);

        lineNo = 40;
        doc.text($('#CompanyPhoneNumber').val(), yAxisLabel, lineNo);


        // Property Address

        if( $('#rlEnablePropertyAddress').val() == '1' ) {

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');

          lineNo = 50;
          doc.text('Property Address', yAxisLabel, lineNo);

          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');

          lineNo = 55;
          doc.text($('#RentalLoanAddress').val(), yAxisLabel, lineNo);

          lineNo = 60;
          doc.text($('#RentalLoanCity').val(), yAxisLabel, lineNo);

          lineNo = 65;
          doc.text($('#RentalLoanState').val(), yAxisLabel, lineNo);

          lineNo = 70;
          doc.text($('#RentalLoanZipCode').val(), yAxisLabel, lineNo);

        }


        doc.setFontSize(12);

        // Deal Breakdown
        lineNo = 85;
        doc.setFont('helvetica', 'bold');
        doc.text('Deal Breakdown', yAxisLabel, lineNo);

        // Loan Amount
        lineNo = 95;
        doc.setFont('helvetica', 'normal');
        doc.text('Loan Amount:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlLoanAmount').html(), yAxisValue, lineNo);

        // Down Payment
        lineNo = 105;
        doc.setFont('helvetica', 'normal');
        doc.text('Down Payment:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlDownPayment').html(), yAxisValue, lineNo);

        // Mortgage Payment
        lineNo = 115;
        doc.setFont('helvetica', 'normal');
        doc.text('Mortgage Payment:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlMortgagePayment').html(), yAxisValue, lineNo);

        // Monthly Payment
        lineNo = 125;
        doc.setFont('helvetica', 'normal');
        doc.text('Monthly Payment:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlMonthlyPayment').html(), yAxisValue, lineNo);

        // Origination Fee Amount
        lineNo = 135;
        doc.setFont('helvetica', 'normal');
        doc.text('Origination Fee Amount:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlOriginationFeeAmount').html(), yAxisValue, lineNo);


        // Deal Metrics
        lineNo = 155;
        doc.setFont('helvetica', 'bold');
        doc.text('Deal Metrics', yAxisLabel, lineNo);

        // Total Closing Costs
        lineNo = 165;
        doc.setFont('helvetica', 'normal');
        doc.text('Total Closing Costs:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlTotalClosingCosts').html(), yAxisValue, lineNo);

        // Cash Needed to Close
        lineNo = 175;
        doc.setFont('helvetica', 'normal');
        doc.text('Cash Needed to Close:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlCashNeededToClose').html(), yAxisValue, lineNo);

        // Price Per Unit
        lineNo = 185;
        doc.setFont('helvetica', 'normal');
        doc.text('Price Per Unit:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlPricePerUnit').html(), yAxisValue, lineNo);

        // Gross Rental Income
        lineNo = 195;
        doc.setFont('helvetica', 'normal');
        doc.text('Gross Rental Income:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlGrossRentalIncome').html(), yAxisValue, lineNo);

        // Operating Expenses
        lineNo = 205;
        doc.setFont('helvetica', 'normal');
        doc.text('Operating Expenses:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlOperatingExpenses').html(), yAxisValue, lineNo);

        // Net Operating Income
        lineNo = 215;
        doc.setFont('helvetica', 'normal');
        doc.text('Net Operating Income:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlNetOperatingIncome').html(), yAxisValue, lineNo);


        // Return Metrics
        lineNo = 235;
        doc.setFont('helvetica', 'bold');
        doc.text('Return Metrics', yAxisLabel, lineNo);

        // Cash Flow
        lineNo = 245;
        doc.setFont('helvetica', 'normal');
        doc.text('Cash Flow:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlCashFlow').html(), yAxisValue, lineNo);

        // Cap Rate
        lineNo = 255;
        doc.setFont('helvetica', 'normal');
        doc.text('Cap Rate:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlCapRate').html(), yAxisValue, lineNo);

        // Cash on Cash Return
        lineNo = 265;
        doc.setFont('helvetica', 'normal');
        doc.text('Cash on Cash Return:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlCashOnCashReturn').html(), yAxisValue, lineNo);

        // DSCR
        lineNo = 275;
        doc.setFont('helvetica', 'normal');
        doc.text('DSCR:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#rlDSCR').html(), yAxisValue, lineNo);

        // Save the PDF
        doc.save('rental-loan-calculations.pdf');


        e.preventDefault();
      });
      /** For rental loan end **/

      /** For fix and flip start **/
      $(document).on("change", "#FixAndFlipPurchasePrice, #FixAndFlipRenovationCost, #FixAndFlipAfterRepairedValue, #FixAndFlipLengthOfLoan, #FixAndFlipAnnualPropertyTaxes, #FixAndFlipAnnualInsurance, #FixAndFlipPurchasePriceLTV, #FixAndFlipIntrestRate, #FixAndFlipOriginationFee, #FixAndFlipOtherClosingCosts, #FixAndFlipCostToSell", function () {
        FixAndFlipCalculate();
      });

      if( $('.rlar-popup-container').length ) {
        $('.get-analysis-report').on('click', function () {
          $('.rlar-popup-container').addClass('active');
        });
        $('body').on('click', '.rlar-popup-close, .rlar-popup-overlay', function(e) {
            $(this).closest('.rlar-popup-container').removeClass('active');
        });
      }

      $(document).on('click', '#va-ff-report-download', function (e) {

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yAxisLabel = 10;
        let yAxisValue = 70;
        let lineNo = 20;

         // Heading
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Fix & Flip - Analysis Report', yAxisLabel, lineNo);


        // Company Details

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        lineNo = 30;
        doc.text($('#CompanyName').val(), yAxisLabel, lineNo);

        lineNo = 35;
        doc.text($('#CompanyEmail').val(), yAxisLabel, lineNo);

        lineNo = 40;
        doc.text($('#CompanyPhoneNumber').val(), yAxisLabel, lineNo);


        // Property Address

        if( $('#ffEnablePropertyAddress').val() == '1' ) {

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');

          lineNo = 50;
          doc.text('Property Address', yAxisLabel, lineNo);

          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');

          lineNo = 55;
          doc.text($('#FixAndFlipAddress').val(), yAxisLabel, lineNo);

          lineNo = 60;
          doc.text($('#FixAndFlipCity').val(), yAxisLabel, lineNo);

          lineNo = 65;
          doc.text($('#FixAndFlipState').val(), yAxisLabel, lineNo);

          lineNo = 70;
          doc.text($('#FixAndFlipZipCode').val(), yAxisLabel, lineNo);

        }


        doc.setFontSize(12);

        // Deal Breakdown
        lineNo = 85;
        doc.setFont('helvetica', 'bold');
        doc.text('Deal Breakdown', yAxisLabel, lineNo);

        // Loan Amount
        lineNo = 95;
        doc.setFont('helvetica', 'normal');
        doc.text('Loan Amount:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffLoanAmount').html(), yAxisValue, lineNo);

        // Down Payment
        lineNo = 105;
        doc.setFont('helvetica', 'normal');
        doc.text('Down Payment:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffDownPayment').html(), yAxisValue, lineNo);

        // Monthly Interest Payment
        lineNo = 115;
        doc.setFont('helvetica', 'normal');
        doc.text('Monthly Interest Payment:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffMonthlyInterestPayment').html(), yAxisValue, lineNo);

        // Total Interest Over Term
        lineNo = 125;
        doc.setFont('helvetica', 'normal');
        doc.text('Total Interest Over Term:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffTotalInterestOverTerm').html(), yAxisValue, lineNo);

        // Origination Fee Amount
        lineNo = 135;
        doc.setFont('helvetica', 'normal');
        doc.text('Origination Fee Amount:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffOriginationFeeAmount').html(), yAxisValue, lineNo);

        // Other Closing Costs Amount
        lineNo = 145;
        doc.setFont('helvetica', 'normal');
        doc.text('Other Closing Costs Amount:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffOtherClosingCostsAmount').html(), yAxisValue, lineNo);

        // Cost To Sell Amount
        lineNo = 155;
        doc.setFont('helvetica', 'normal');
        doc.text('Cost To Sell Amount:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffCostToSellAmount').html(), yAxisValue, lineNo);


        // Deal Metrics
        lineNo = 175;
        doc.setFont('helvetica', 'bold');
        doc.text('Deal Metrics', yAxisLabel, lineNo);

        // Closing Costs
        lineNo = 185;
        doc.setFont('helvetica', 'normal');
        doc.text('Closing Costs:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffClosingCosts').html(), yAxisValue, lineNo);

        // Carrying Costs
        lineNo = 195;
        doc.setFont('helvetica', 'normal');
        doc.text('Carrying Costs:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffCarryingCosts').html(), yAxisValue, lineNo);

        // Borrower Equity Needed
        lineNo = 205;
        doc.setFont('helvetica', 'normal');
        doc.text('Borrower Equity Needed:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffBorrowerEquityNeeded').html(), yAxisValue, lineNo);

        // Total Cash In Deal
        lineNo = 215;
        doc.setFont('helvetica', 'normal');
        doc.text('Total Cash In Deal:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffTotalCashInDeal').html(), yAxisValue, lineNo);


        // Return Metrics
        lineNo = 235;
        doc.setFont('helvetica', 'bold');
        doc.text('Return Metrics', yAxisLabel, lineNo);

        // Net Profit
        lineNo = 245;
        doc.setFont('helvetica', 'normal');
        doc.text('Net Profit:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffNetProfit').html(), yAxisValue, lineNo);

        // Loan to After Repaired Value
        lineNo = 255;
        doc.setFont('helvetica', 'normal');
        doc.text('Loan to After Repaired Value:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffLoantoAfterRepairedValue').html(), yAxisValue, lineNo);

        // ROI
        lineNo = 265;
        doc.setFont('helvetica', 'normal');
        doc.text('ROI:', yAxisLabel, lineNo);
        doc.setFont('helvetica', 'bold');
        doc.text($('#ffROI').html(), yAxisValue, lineNo);

        // Save the PDF
        doc.save('fix-and-flip-calculations.pdf');


        e.preventDefault();
      });
      /** For fix and flip end **/


      $(document).on("change", "#originalLoanAmount, #currentLoanBalance, #cashOutAmount, #refinanceFees", function () {
        var newVal = $(this).val();
        newVal   = ( newVal != '' ) ? parseFloat( newVal.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
        var max = $(this).attr('max');
        max = parseFloat(max);
        if ( newVal > max  ) {
          $(this).val(max);
        } else if ( isNaN(newVal)) {
         
          $(this).val(max);
        }
        refinanceCalculate();
       
      });

      $(document).on("change", "#VARefinanceOriginalLoanAmount, #VARefinanceCurrentLoanBalance, #VARefinanceCashOutAmount, #VARefinanceRefinanceFees", function () {
        var newVal = $(this).val();
        newVal   = ( newVal != '' ) ? parseFloat( newVal.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
        var max = $(this).attr('max');
        max = parseFloat(max);
        if ( newVal > max  ) {
          $(this).val(max);
        } else if ( isNaN(newVal)) {
         
          $(this).val(max);
        }
        vaRefinanceCalculate();
       
      });

      // For VA Refinance Funding Fee Options Changes
      $(document).on("change", "#vaRefinancePurposeOptions", function () {
        vaRefinanceCalculate();
      });

      // For VA Refinance Funding Fee Options Changes
      $(document).on("change", "#vaRefinanceFundingFeeOptions", function () {
        // vaFundingFeeOptions = $(this).val();
        vaRefinanceCalculate();
      });


      $("#refinance-item input[name='paying_refinance_cost']").on('change', function() {
        refinanceCalculate();
      });

      $("#va-refinance input[name='paying_refinance_cost']").on('change', function() {
        vaRefinanceCalculate();
      });

      $("#refinance-item input[name='low_monthly_payment']").on('change', function() {
        var low_monthly_payment = $("#refinance-item input[name='low_monthly_payment']:checked").val();
        jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head span').removeClass('active');
        if ( low_monthly_payment == 'true' ) {
          jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:first').addClass('active');
        } else {
          jQuery('.monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)').addClass('active');
        }
      });

      $("#va-refinance input[name='low_monthly_payment']").on('change', function() {
        var low_monthly_payment = $("#va-refinance input[name='low_monthly_payment']:checked").val();
        jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head span').removeClass('active');
        if ( low_monthly_payment == 'true' ) {
          jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:first').addClass('active');
        } else {
          jQuery('.va_refinance_calculator .monthly-payment-comparison-wrapper .refinance-cost-head>span:nth-child(2)').addClass('active');
        }
      });

      $(document).on("change", "#originalLoanTerm, #newLoanTerm", function () {
        var newVal = $(this).val();
        if ( newVal == '' ) {
            $(this).val(0);
        }
        refinanceCalculate();
       
      });
      $(document).on("change", "#VARefinanceOriginalLoanTerm, #VARefinanceNewLoanTerm", function () {
        var newVal = $(this).val();
        if ( newVal == '' ) {
            $(this).val(0);
        }
        vaRefinanceCalculate();
       
      });
      $(document).on("change", "#newIntrestRate, #currentIntrestRate", function () {
        var number = $(this).val();
        var min = $(this).attr('min');
        var max = $(this).attr('max');
        min = parseFloat(min);
        max = parseFloat(max);
        if ( parseFloat(number) < min ) {
            $(this).val(min);
        } else if ( parseFloat(number) > max ) {
          $(this).val(max);
        }
        refinanceCalculate();
       
      });

      $(document).on("change", "#VARefinanceNewInterestRate, #VARefinanceCurrentInterestRate", function () {
        var number = $(this).val();
        var min = $(this).attr('min');
        var max = $(this).attr('max');
        min = parseFloat(min);
        max = parseFloat(max);
        if ( parseFloat(number) < min ) {
            $(this).val(min);
        } else if ( parseFloat(number) > max ) {
          $(this).val(max);
        }
        vaRefinanceCalculate();
       
      });

      $(document).on("change", "#mortageHomePrice", function () {
        homePrice = $(this).val();
        if ( homePrice == '') {
          $(this).val('$0');
        }
        homePrice = homePrice.replace("$", "").replace(/[^0-9.-]+/g, "");
        homePrice = parseFloat(homePrice);
        mortgageCalculate(loanAmount, rate, years);
        $("#mortageLoanAmount").trigger("change");
      });

      // For VA HomePrice Changes
      $(document).on("change", "#VAHomePrice", function () {
        vaHomePrice = $(this).val();
        if ( vaHomePrice == '') {
          $(this).val('$0');
        }
        vaHomePrice = vaHomePrice.replace("$", "").replace(/,/g, "");
        vaHomePrice = parseFloat(vaHomePrice);
        VACalculate(finalAmount, vaRate, vaYears);
      });

      $(document).on("change", "#mortageDownPayment", function () {
        downPayment = $(this).val();
        if ( downPayment == '') {
          $(this).val('$0');
        }
        downPayment = Number(downPayment.replace(/[^0-9.-]+/g, ""));
        validationForDownPayment(downPayment, homePrice);
        mortgageCalculate(loanAmount, rate, years);
        $("#mortageLoanAmount").addClass("trigger-origin-downpayment");
        $("#mortageLoanAmount").trigger("change");
        // To trigger alert if the down payment is less than 20% of the home value.
        if(!$(this).hasClass('downpayment-alert-triggered')) {
          var newDownPayment = downPayment;
          newPercentageDP = downPayment;
          if (jQuery("#mortageDownPayment").hasClass("percentage")) {
            newDownPayment = (newDownPayment / 100) * homePrice;
            newDownPayment = newDownPayment.toFixed(2);
          } else {
            newPercentageDP = (newPercentageDP * 100) / homePrice;
            newPercentageDP = newPercentageDP.toFixed(2);
          }
          /* if(newPercentageDP < 20) {
            alert('The down payment you entered is less than 20%. Please contact your loan officer to get the appropriate PMI payment to use if you do not have it already.');
          } */
        }
        $(this).removeClass('downpayment-alert-triggered');
      });

      // For VA DownPayment Changes
      $(document).on("change", "#VADownPayment", function () {
        vaDownPayment = $(this).val();
        if ( vaDownPayment == '') {
          $(this).val('$0');
        }
        vaDownPayment = Number(vaDownPayment.replace("$", "").replace(/,/g, ""));
        validationForVADownPayment(vaDownPayment, vaHomePrice);
        VACalculate(finalAmount, vaRate, vaYears);
      });

      $(document).on("change", "#mortageLoanAmount", function () {
        loanAmount = $(this).val();
        if ( loanAmount == '') {
          $(this).val('$0');
        }
        loanAmount = Number(loanAmount.replace(/[^0-9.-]+/g, ""));
        if(!$(this).hasClass('trigger-origin-downpayment')) {
          $(this).addClass('mortage-loan-triggerred');
        }
        mortgageCalculate(loanAmount, rate, years);

        // To trigger alert if the down payment is less than 20% of the home value.
        if(!$(this).hasClass('trigger-origin-downpayment')) {
          var downPayment = $('#mortageDownPayment').val();
          downPayment = Number(downPayment.replace(/[^0-9.-]+/g, ""));

          var newDownPayment = downPayment;
          newPercentageDP = downPayment;
          if (jQuery("#mortageDownPayment").hasClass("percentage")) {
            newDownPayment = (newDownPayment / 100) * homePrice;
            newDownPayment = newDownPayment.toFixed(2);
          } else {
            newPercentageDP = (newPercentageDP * 100) / homePrice;
            newPercentageDP = newPercentageDP.toFixed(2);
          }
          /* if(newPercentageDP < 20) {
            setTimeout(function(){
              alert('The down payment you entered is less than 20%. Please contact your loan officer to get the appropriate PMI payment to use if you do not have it already.');
            }, 200);
          } */
        } else {
          $(this).removeClass('trigger-origin-downpayment');
        }        

      });

      // For VA Mortgage Amount Changes
      $(document).on("change", "#VAMortageAmount", function () {
        vaLoanAmount = $(this).val();
        if ( vaLoanAmount == '') {
          $(this).val('$0');
        }
        vaLoanAmount = Number(vaLoanAmount.replace(/[^0-9.-]+/g, ""));
        VACalculate(finalAmount, vaRate, vaYears);
      });

      $(document).on("change", "#mortageLoanTerm", function () {
        years = $(this).val();
        if ( years == '') {
          $(this).val('0');
        }
        if ($(this).hasClass("month")) {
          years = years / 12;
        }
        mortgageCalculate(loanAmount, rate, years);
      });

      // For VA Loan Term Changes
      $(document).on("change", "#VALoanTerm", function () {
        vaYears = $(this).val();
        if ( vaYears == '') {
          $(this).val('0');
        }
        if ($(this).hasClass("month")) {
          vaYears = vaYears / Terms;
        }
        VACalculate(finalAmount, vaRate, vaYears);
      });

      $(document).on("change", "#mortageInterestRate", function () {
        rate = $(this).val();
        if ( rate == '') {
          $(this).val('0');
        }
        rate = parseFloat(rate);
        mortgageCalculate(loanAmount, rate, years);
      });

      // For VA Intrest Rate Changes
      $(document).on("change", "#VAInterestRate", function () {
        vaRate = $(this).val();
        if ( vaRate == '') {
          $(this).val('0');
        }

        vaRate = parseFloat(vaRate);
        VACalculate(finalAmount, vaRate, vaYears);
      });

      // For VA Intrest Rate Changes
      $(document).on("change", "#vaFundingFeeOptions", function () {
        // vaFundingFeeOptions = $(this).val();
        VACalculate(finalAmount, vaRate, vaYears);
      });

  

      $(document).on("change", "#mortageHoaDues", function () {
        hoa = $(this).val();
        if ( hoa == '') {
          $(this).val('$0');
        }
        hoa = hoa.replace("$", "").replace(/,/g, "");
        hoa = parseFloat(hoa);
        mortgageCalculate(loanAmount, rate, years);
      });

      // For VA HOADues Changes
      $(document).on("change", "#VAHoaDues", function () {
        vaHOA = $(this).val();
        if ( vaHOA == '') {
          $(this).val('$0');
        }
        vaHOA = vaHOA.replace("$", "").replace(/,/g, "");
        if ( Terms != 12 ){
          vaHOA = parseFloat(vaHOA) * 12;
        } else {
          vaHOA = parseFloat(vaHOA);
        }
        
        VACalculate(finalAmount, vaRate, vaYears);
      });

      $(document).on("change", ".veteran-affairs-item-input input[name='va_payment_frequency']", function () {
        $(this).parents('.btn-group').find('.btn-primary.active').removeClass('active');
        $(this).parent().addClass('active');
        vaTriggerAllElementChange();
      });

      $(document).on("change", "#mortagePMI", function () {
        pmi = $(this).val();
        if ( pmi == '') {
          $(this).val('$0');
        }
        pmi = pmi.replace("$", "").replace(/,/g, "");
        if ($(this).hasClass("percentage")) {
          pmi = (pmi / 100) * loanAmount;
          pmi = parseFloat(pmi) / 12;
        } else {
          pmi = parseFloat(pmi) / 12;
        }
        mortgageCalculate(loanAmount, rate, years);
      });

      $(document).on("change", "#mortageExtraPayment", function () {
        extraInicial = $(this).val();
        if ( extraInicial == '') {
          $(this).val('$0');
        }
        extraInicial = Number(extraInicial.replace(/[^0-9.-]+/g, ""));
        extra = parseFloat(extraInicial) + parseFloat(monthly);
        extra = parseFloat(extra);
        mortgageCalculate(loanAmount, rate, years);
      });

      // For VA Extra Changes
      $(document).on("change", "#VAExtraPayment", function () {
        vaExtraInicial = $(this).val();
        if ( vaExtraInicial == '') {
          $(this).val('$0');
        }
        vaExtraInicial = Number(vaExtraInicial.replace(/[^0-9.-]+/g, ""));
        vaExtra = parseFloat(vaExtraInicial) + parseFloat(vaMonthly);
        if ( Terms != 12 ){
          vaExtra = parseFloat(vaExtra) * 12;
        } else {
          vaExtra = parseFloat(vaExtra);
        }

        VACalculate(finalAmount, vaRate, vaYears);
      });

      $(document).on("change", "#mortageHomeownersInsurence", function () {
        homeownersInsurence = $(this).val();
        if ( homeownersInsurence == '') {
          $(this).val('$0');
        }
        homeownersInsurence = homeownersInsurence
          .replace("$", "")
          .replace(/,/g, "");
        if ($(this).hasClass("percentage")) {
          homeownersInsurence = (homeownersInsurence / 100) * homePrice;
        }
        mortgageCalculate(loanAmount, rate, years);
      });

      $(document).on("change", "#VAHomeInsurence", function () {
        vaHomeInsurence = $(this).val();
        if ( vaHomeInsurence == '') {
          $(this).val('$0');
        }
        vaHomeInsurence = vaHomeInsurence.replace("$", "").replace(/,/g, "");
        if ($(this).hasClass("percentage")) {
          vaHomeInsurence = (vaHomeInsurence / 100) * vaHomePrice;
        }
        VACalculate(finalAmount, vaRate, vaYears);
      });

      $(document).on("change", "#mortagePropertyTax", function () {
        PropertyTax = $(this).val();
        PropertyTax = PropertyTax.replace("$", "").replace(/,/g, "");
        PropertyTax = parseFloat(PropertyTax);
        if (!$(this).hasClass("percentage")) {
          PropertyTax = (PropertyTax * 100) / homePrice;
          if ( PropertyTax == '') {
            $(this).val('0');
          }
        }else{
          if ( PropertyTax == '') {
            $(this).val('$0');
          }
        }
        mortgageCalculate(loanAmount, rate, years);
      });

      // For VA Property Tax Changes
      $(document).on("change", "#VAPropertyTax", function () {
        vaPropertyTax = $(this).val();
        vaPropertyTax = vaPropertyTax.replace("$", "").replace(/,/g, "");
        vaPropertyTax = parseFloat(vaPropertyTax);
        if ( vaPropertyTax == '') {
          $(this).val('0');
        }
        VACalculate(finalAmount, vaRate, vaYears);
      });

      $(document).on("change", "#additionalMonth", function () {
        monthly = $(this).val();
        if ( monthly == '') {
          $(this).val('$0');
          monthly = 0;
        }
        monthly = monthly.replace("$", "").replace(/,/g, "");
        monthly = parseFloat(monthly);
        mortgageCalcPayOff();
        extra = parseFloat(extraInicial) + parseFloat(monthly);
        extra = parseFloat(extra);
        jQuery("#extraPaymentSpan").html("$" + parseFloat(extra).toFixed(2));
        mortgageFormatCurrency(jQuery("#extraPaymentSpan"));
        mortgageTotalSum(principle, hoa, taxes, pmi, insurence, extra)
      });

      $(document).on("change", "#vaAdditionalMonth", function () {
        vaMonthly = $(this).val();
        if ( vaMonthly == '') {
          $(this).val('$0');
          vaMonthly = 0;
        }
        vaMonthly = vaMonthly.replace("$", "").replace(/,/g, "");
        vaMonthly = parseFloat(vaMonthly);
        veteranAffairsCalcPayOff();
        vaExtra = parseFloat(vaExtraInicial) + parseFloat(vaMonthly);
        vaExtra = parseFloat(vaExtra);
        jQuery("#vaExtraPaymentSpan").html("$" + parseFloat(vaExtra).toFixed(2));
        mortgageFormatCurrency(jQuery("#vaExtraPaymentSpan"));
        vaTotalSum(vaPrinciple, vaHOA, vaTaxes, vaInsurence, vaExtra)
      });

      $(document).on("click", ".frequency-button-wrap button", function () {
        $(this).parent(".frequency-button-wrap").find(".active").removeClass("active");
        $(this).addClass("active");
        var intputValues = $(this).attr("data");
        if (intputValues == 1) {
          slider1 = 1;
          monthlySlider();
        } else if (intputValues == 2) {
          slider1 = 2;
          biweekly();
        } else {
          slider1 = 3;
          weekly();
        }
        mortgageCalcPayOff();
      });

      $(document).on("click", ".va-frequency-button-wrap button", function () {
        $(this).parent(".va-frequency-button-wrap").find(".active").removeClass("active");
        $(this).addClass("active");
        var intputValues = $(this).attr("data");
        if (intputValues == 1) {
          vaSlider1 = 1;
          vaMonthlySlider();
        } else if (intputValues == 2) {
          vaSlider1 = 2;
          vaBiweekly();
        } else {
          vaSlider1 = 3;
          vaWeekly();
        }
        veteranAffairsCalcPayOff();
      });

      $(document).on("change", "#cashbombAmt", function () {
        var cashbombAmtVal = $(this).val();
        if ( cashbombAmtVal == '') {
          $(this).val('0');
        }
        cashbombAmtVal = cashbombAmtVal.replace("$", "").replace(/,/g, "");
        if (cashbombAmtVal == "") {
          cashBombMoney = 0;
        } else {
          cashBombMoney = cashbombAmtVal;
        }
        mortgageCalcPayOff();
      });

      $(document).on("change", "#vaCashbombAmt", function () {
        var cashbombAmtVal = $(this).val();
        if ( cashbombAmtVal == '') {
          $(this).val('0');
        }
        cashbombAmtVal = cashbombAmtVal.replace("$", "").replace(/,/g, "");
        if (cashbombAmtVal == "") {
          vaCashBombMoney = 0;
        } else {
          vaCashBombMoney = cashbombAmtVal;
        }
        veteranAffairsCalcPayOff();
      });

      $(document).on("click", ".lump-sum-wrap button", function () {
        $(this).parent(".lump-sum-wrap").find(".active").removeClass("active");
        $(this).addClass("active");
        var lumpSumVal = $(this).attr("data");
        mortgageCalcPayOff();
      });

      $(document).on("click", ".va-lump-sum-wrap button", function () {
        $(this).parent(".va-lump-sum-wrap").find(".active").removeClass("active");
        $(this).addClass("active");
        var lumpSumVal = $(this).attr("data");
        veteranAffairsCalcPayOff();
      });

      $("#datepicker").datepicker().on("change", function () {
        if($(this).parents('.veteran_affairs_calculator').length > 0 ){
          VACalculate(finalAmount, vaRate, vaYears);
        }else{
          mortgageCalculate(loanAmount, rate, years);
        }
      });

      //currency convert to percentage and percentage convert to currency
      $(document).on("click", ".btn-group .btn-primary input:not(.afd-input)", function () {
        
        if ( $(this).parents(".mortage-item-input").length > 0 ) {
          parentClassName = '.mortage-item-input';
        } else {
          parentClassName  = '.veteran-affairs-item-input';
        }
        var inputVal = $(this).parents(parentClassName).find("input.form-control").val();
        inputVal = ( inputVal != undefined) ? Number(inputVal.replace("$", "").replace(/,/g, "")) : 0;
        $(this).parents(".btn-group").find(".btn-primary.active").removeClass("active");
        $(this).parent().addClass("active");

        //for downpayment currency
        if ($(this).parents(".down-payment-type").length > 0) {
          if ($(this).val() === "dollar") {
            if (!$(this).parent().hasClass("dollar")) {
              if ( $(this).parents('.veteran-affairs-item-input').length > 0 ) {
                vaDownPayment = (inputVal / 100) * vaHomePrice;
                $(this).parents(parentClassName).find("input.form-control").removeClass("percentage").val(vaDownPayment);
              } else {
                downPayment = (inputVal / 100) * homePrice;
                $(this).parents(parentClassName).find("input.form-control").removeClass("percentage").val(downPayment);
              }
              $(this).parents(".btn-group").find(".btn-primary").removeClass("percentage");
              $(this).parent().addClass("dollar");
            }
          } else {
            if (!$(this).parent().hasClass("percentage")) {
              if ( $(this).parents('.veteran-affairs-item-input').length > 0 ) {
                vaDownPayment = (inputVal * 100) / vaHomePrice;
                $(this).parents(parentClassName).find("input.form-control").addClass("percentage").val(vaDownPayment);
              } else {
                downPayment = (inputVal * 100) / homePrice;
                $(this).parents(parentClassName).find("input.form-control").addClass("percentage").val(downPayment);
              }
              $(this).parents(".btn-group").find(".btn-primary").removeClass("dollar");
              $(this).parent().addClass("percentage");
            }
          }
          if ( $(this).parents(".mortage-item-input").length > 0 ) {
            jQuery("#mortageDownPayment").trigger("change");
          } else {
            jQuery("#VADownPayment").trigger("change");
          }
        }
        //for PMI currency
        if ($(this).parents(".mortgage-pmi-type").length > 0) {
          if ($(this).val() === "dollar") {
            if (!$(this).parent().hasClass("dollar")) {
              pmi = (inputVal / 100) * loanAmount;
              $(this).parents(parentClassName).find("input.form-control").removeClass("percentage").val(pmi);
              $(this).parents(".btn-group").find(".btn-primary").removeClass("percentage");
              $(this).parent().addClass("dollar");
            }
          } else {
            if (!$(this).parent().hasClass("percentage")) {
              pmi = (inputVal * 100) / loanAmount;
              $(this).parents(parentClassName).find("input.form-control").addClass("percentage").val(pmi);
              $(this).parents(".btn-group").find(".btn-primary").removeClass("dollar");
              $(this).parent().addClass("percentage");
            }
          }
          if ( $(this).parents(".mortage-item-input").length > 0 ) {
            jQuery("#mortagePMI").trigger("change");
          }
        }
        //for PMI currency
        if ($(this).parents(".rent-buy-pmi-type").length > 0) {
          if ($(this).val() === "dollar") {
            if (!$(this).parent().hasClass("dollar")) {
              pmi = (inputVal / 100) * loanAmount;
              $(this).parents(parentClassName).find("input.form-control").removeClass("percentage").val(pmi);
              $(this).parents(".btn-group").find(".btn-primary").removeClass("percentage");
              $(this).parent().addClass("dollar");
            }
          } else {
            if (!$(this).parent().hasClass("percentage")) {
              pmi = (inputVal * 100) / loanAmount;
              $(this).parents(parentClassName).find("input.form-control").addClass("percentage").val(pmi);
              $(this).parents(".btn-group").find(".btn-primary").removeClass("dollar");
              $(this).parent().addClass("percentage");
            }
          }
          if ( $(this).parents(".mortage-item-input").length > 0 ) {
            jQuery("#rentBuyPMI").trigger("change");
          }
        }
        //for Property Tax currency
        if ($(this).parents(".mortgage-property-tex-type").length > 0) {
          if ($(this).val() === "dollar") {
            if (!$(this).parent().hasClass("dollar")) {
              if ( $(this).parents('.veteran-affairs-item-input').length > 0 ) {
                vaPropertyTax = (inputVal / 100) * vaHomePrice;
                $(this).parents(parentClassName).find("input.form-control").removeClass("percentage").val(vaPropertyTax);
              } else {
                PropertyTax = (inputVal / 100) * homePrice;
                $(this).parents(parentClassName).find("input.form-control").removeClass("percentage").val(PropertyTax);
              }
              $(this).parents(".btn-group").find(".btn-primary").removeClass("percentage");
              $(this).parent().addClass("dollar");
            }
          } else {
            if (!$(this).parent().hasClass("percentage")) {
              if ( $(this).parents('.veteran-affairs-item-input').length > 0 ) {
                vaPropertyTax = (inputVal * 100) / vaHomePrice;
                $(this).parents(parentClassName).find("input.form-control").addClass("percentage").val(vaPropertyTax);
              } else {
                PropertyTax = (inputVal * 100) / homePrice;
                $(this).parents(parentClassName).find("input.form-control").addClass("percentage").val(PropertyTax);
              }
              $(this).parents(".btn-group").find(".btn-primary").removeClass("dollar");
              $(this).parent().addClass("percentage");
            }
          }
          if ( $(this).parents(".mortage-item-input").length > 0 ) {
            jQuery("#mortagePropertyTax").trigger("change");
          } else {
            jQuery("#VAPropertyTax").trigger("change");
          }
        }
        //for Home Insourance currency
        if ($(this).parents(".mortgage-home-insurance-type").length > 0) {
          if ($(this).val() === "dollar") {
            if (!$(this).parent().hasClass("dollar")) {
              if ( $(this).parents('.veteran-affairs-item-input').length > 0 ) {
                vaHomeInsurence = (inputVal / 100) * vaHomePrice;
                $(this).parents(parentClassName).find("input.form-control").removeClass("percentage").val(vaHomeInsurence);
              } else {
                homeownersInsurence = (inputVal / 100) * homePrice;
                $(this).parents(parentClassName).find("input.form-control").removeClass("percentage").val(homeownersInsurence); 
              }
              $(this).parents(".btn-group").find(".btn-primary").removeClass("percentage");
              $(this).parent().addClass("dollar");
            }
          } else {
            if (!$(this).parent().hasClass("percentage")) {
              if ( $(this).parents('.veteran-affairs-item-input').length > 0 ) {
                vaHomeInsurence = (inputVal * 100) / vaHomePrice;
                $(this).parents(parentClassName).find("input.form-control").addClass("percentage").val(vaHomeInsurence);
              } else {
                homeownersInsurence = (inputVal * 100) / homePrice;
                $(this).parents(parentClassName).find("input.form-control").addClass("percentage").val(homeownersInsurence);
              }
              $(this).parents(".btn-group").find(".btn-primary").removeClass("dollar");
              $(this).parent().addClass("percentage");
            }
          }
          if ( $(this).parents(".mortage-item-input").length > 0 ) {
            jQuery("#mortageHomeownersInsurence").trigger("change");
          } else {
            jQuery("#VAHomeInsurence").trigger("change");
          }
        }
        //for Term Years currency
        if ($(this).parents(".mortgage-term-type").length > 0) {
          if ($(this).val() === "year") {
            if (!$(this).parent().hasClass("year")) {
              if ( $(this).parents('.veteran-affairs-item-input').length > 0 ) {
                vaYears = inputVal / Terms;
                $(this).parents(parentClassName).find("input.form-control").removeClass("month").val(vaYears);
              } else {
                years = inputVal / Terms;
                $(this).parents(parentClassName).find("input.form-control").removeClass("month").val(years);
              }
              $(this).parents(".btn-group").find(".btn-primary").removeClass("month");
              $(this).parent().addClass("year");
            }
          } else {
            if (!$(this).parent().hasClass("month")) {
              if ( $(this).parents('.veteran-affairs-item-input').length > 0 ) {
                vaYears = inputVal * Terms;
                $(this).parents(parentClassName).find("input.form-control").addClass("month").val(vaYears);
              } else {
                years = inputVal * Terms;
                $(this).parents(parentClassName).find("input.form-control").addClass("month").val(years);
              }
              $(this).parents(".btn-group").find(".btn-primary").removeClass("year");
              $(this).parent().addClass("month");
            }
          }
          if ( $(this).parents(".mortage-item-input").length > 0 ) {
            jQuery("#mortageLoanTerm").trigger("change");
          } else {
            jQuery("#VALoanTerm").trigger("change");
          }
          
        }

        if ($(this).parents(".rf-loan-term").length > 0) {
          var setVal = $(this).parents('.rf-loan-items').find("input.form-control").val();
          setVal = ( setVal != undefined) ? Number(setVal.replace("$", "").replace(/,/g, "")) : 0;
          if ($(this).val() === "year") {
            if (!$(this).parent().hasClass("year")) {
              var newYers = setVal / Terms;
              $(this).parents('.rf-loan-items').find("input.form-control").removeClass("month").val(newYers);
              $(this).parents(".btn-group").find(".btn-primary").removeClass("month");
              $(this).parent().addClass("year");
            }
          } else {
            if (!$(this).parent().hasClass("month")) {
              var newYers = setVal * Terms;
              $(this).parents('.rf-loan-items').find("input.form-control").addClass("month").val(newYers);
              $(this).parents(".btn-group").find(".btn-primary").removeClass("year");
              $(this).parent().addClass("month");
            }
          }
          if ( $(this).parents(".mortage-item-input").length > 0 ) {
            jQuery("#mortageLoanTerm").trigger("change");
          } else {
            jQuery("#VALoanTerm").trigger("change");
          }
          
        }

        if ($(this).parents(".buy-down-payment-type").length > 0) {
          var rentInputVal = $(this).parents(parentClassName).find("input.form-control").val();
          var rentHomePrice             = jQuery('#rentHomePrice').val();
          rentHomePrice           = ( rentHomePrice != '' ) ? parseFloat( rentHomePrice.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
          rentInputVal = ( rentInputVal != undefined) ? Number(rentInputVal.replace("$", "").replace(/,/g, "")) : 0;
          if ($(this).val() === "dollar") {
            if (!$(this).parent().hasClass("dollar")) {

              var rentDownPayment = (rentInputVal / 100) * rentHomePrice;
              
              $('#rentBuyDownPayment').removeClass("percentage").val(Math.round(rentDownPayment));
              $(this).parents(".btn-group").find(".btn-primary").removeClass("percentage");
              $(this).parent().addClass("dollar");
            }
          } else {
            
            if (!$(this).parent().hasClass("percentage")) {
              rentDownPayment = (rentInputVal * 100) / rentHomePrice;
          
              $('#rentBuyDownPayment').addClass("percentage").val(rentDownPayment.toFixed(2));

              $(this).parents(".btn-group").find(".btn-primary").removeClass("dollar");
              $(this).parent().addClass("percentage");
            }
          }
          jQuery("#rentBuyDownPayment").trigger("change");
        }

        if ( $(this).parents(".mortage-item-input").length > 0 ) {
          allElementCurrencyRefresh();
        } else {
          vaAllElementCurrencyRefresh();
        }

      });
    }
  

    // Affordability Start

    $(".affordability-tab-nav ul li:not(.hidden):first").addClass("active");
    $(".affordability-tab-item").hide();
    $(".affordability-tab-item:not(.hidden):first").fadeIn();
    $(".affordability-right-tab-content .affordability-right-tab-item").hide();
    $(".affordability-right-tab-content .affordability-right-tab-item:not(.hidden):first").fadeIn();

    $(".affordability-tab-nav ul li").click(function (e) {
      $(".affordability-tab-nav ul li").removeClass("active");
      $(this).addClass("active");
      $(".affordability-tab-item").hide();
      var afdActiveTab = $(this).find("a").attr("href");
      $(afdActiveTab).fadeIn();
      $(".affordability-right-tab-content .affordability-right-tab-item").hide();
      $(".affordability-right-tab-content").find(afdActiveTab+'-content').fadeIn();
      if(afdActiveTab == '#affordability-conventional') {
        AffordabilityCalculator();
      }
      if(afdActiveTab == '#affordability-fha') {
        AffordabilityFHACalculator();
      }
      if(afdActiveTab == '#affordability-usda') {
        AffordabilityUSDACalculator();
      }
      if(afdActiveTab == '#affordability-va') {
        AffordabilityVACalculator();
      }
      if(afdActiveTab == '#affordability-jumbo') {
        AffordabilityJumboCalculator();
      }
      $('.afd-email-report-container').hide();
      $(".afd-trigger-email-form-na").show();
      e.preventDefault();
      e.stopPropagation();
    });

    // Common field data transfer
    $(document).on("change", ".afd-monthly-income-common-field", function () {
      $('.afd-monthly-income-common-field:not(this)').val($(this).val());
    });
    $(document).on("change", ".afd-monthly-debts-common-field", function () {
      $('.afd-monthly-debts-common-field:not(this)').val($(this).val());
    });
    $(document).on("change", ".afd-home-price-common-field", function () {
      $('.afd-home-price-common-field:not(this)').val($(this).val());
    });
    $(document).on("change", ".afd-loan-term-common-field", function () {
      var afdLoanTerm = $(this).val();
      var afdLoanTermPeriod = $(this).parents('.input-item-relative').find('.active input').val();
      var afdLoanTermMonth = afdLoanTermPeriod == 'year' ? afdLoanTerm*12 : afdLoanTerm;
      var afdLoanTermYear = afdLoanTermPeriod == 'month' ? afdLoanTerm/12 : afdLoanTerm;
      $('.afd-loan-term-common-field:not(this)').each(function() {
        if($(this).hasClass('month')) {
          $(this).val(afdLoanTermMonth);
        } else {
          $(this).val(afdLoanTermYear);
        }
      });      
    });
    $(document).on("change", ".afd-interest-rate-common-field", function () {
      $('.afd-interest-rate-common-field:not(this)').val($(this).val());
    });
    $(document).on("change", ".afd-prop-tax-common-field", function () {
      var afdHomePrice = $(this).parents('.affordability-tab-item').find('.afd-home-price-common-field').val().replace("$", "").replace(/[^0-9.-]+/g, "");
      var afdPropTax = $(this).val().replace("$", "").replace(/[^0-9.-]+/g, "");
      var afdPropTaxType = $(this).hasClass('percentage') ? 'percentage' : 'dollar';
      var afdPropTaxDollar = afdPropTaxType == 'percentage' ? (afdPropTax/100)*afdHomePrice : afdPropTax;
      var afdPropTaxPercentage = afdPropTaxType == 'dollar' ? (afdPropTax*100)/afdHomePrice : afdPropTax;
       $('.afd-prop-tax-common-field:not(this)').each(function() {
        if($(this).hasClass('percentage')) {
          $(this).val(afdPropTaxPercentage);
        } else {
          $(this).val(afdPropTaxDollar);
        }
      });      
    });
    $(document).on("change", ".afd-house-insurance-common-field", function () {
      var afdHomePrice = $(this).parents('.affordability-tab-item').find('.afd-home-price-common-field').val().replace("$", "").replace(/[^0-9.-]+/g, "");
      var afdHouseInsurance = $(this).val().replace("$", "").replace(/[^0-9.-]+/g, "");
      var afdHouseInsuranceType = $(this).hasClass('percentage') ? 'percentage' : 'dollar';
      var afdHouseInsuranceDollar = afdHouseInsuranceType == 'percentage' ? (afdHouseInsurance/100)*afdHomePrice : afdHouseInsurance;
      var afdHouseInsurancePercentage = afdHouseInsuranceType == 'dollar' ? (afdHouseInsurance*100)/afdHomePrice : afdHouseInsurance;
       $('.afd-house-insurance-common-field:not(this)').each(function() {
        if($(this).hasClass('percentage')) {
          $(this).val(afdHouseInsurancePercentage);
        } else {
          $(this).val(afdHouseInsuranceDollar);
        }
      });      
    });

    // conventional
    $(document).on("change", "#affordabilityGrossMonthlyIncome, #affordabilityMonthlyDebts, #affordabilityHomePrice, #affordabilityDownPayment, #affordabilityLoanAmount, #affordabilityLoanTerm, #affordabilityInteretRate, #affordabilityCreditScore, #affordabilityPropTax, #affordabilityHomeownersInsurance, #affordabilityPMI, #affordabilityHoaDues", function () {
      if($(this).attr('id') == 'affordabilityLoanAmount') {
        $(this).addClass('afd-loan-triggerred');
      }
      if($(this).attr('id') == 'affordabilityPMI') {
        $(this).addClass('afd-pmi-triggerred');
      }
      AffordabilityCalculator();
    });

    // FHA
    $(document).on("change", "#affordabilityFHAGrossMonthlyIncome, #affordabilityFHAMonthlyDebts, #affordabilityFHAHomePrice, #affordabilityFHADownPayment, #affordabilityFHALoanAmount, #affordabilityFHALoanTerm, #affordabilityFHAInteretRate, #affordabilityFHAPropTax, #affordabilityFHAHomeownersInsurance, #affordabilityFHAHoaDues", function () {
      if($(this).attr('id') == 'affordabilityFHADownPayment') {
        $(this).addClass('afd-fha-downpayment-triggerred');
      }
      if($(this).attr('id') == 'affordabilityFHAHomePrice' || $(this).attr('id') == 'affordabilityFHADownPayment') {
        if( $('#affordabilityFHADownPayment').hasClass('percentage') ) {
          var afdDPPercent = $('#affordabilityFHADownPayment').val().replace("%", "").replace(/[^0-9.-]+/g, "");
        } else {
          var afdHomePrice = $('#affordabilityFHAHomePrice').val().replace("$", "").replace(/[^0-9.-]+/g, "");
          var afdDPval = $('#affordabilityFHADownPayment').val().replace("$", "").replace(/[^0-9.-]+/g, "");
          var afdDPPercent = (afdDPval * 100) / afdHomePrice;
        }
        if( afdDPPercent < 3.5 ) {
          if( $('#affordabilityFHADownPayment').hasClass('percentage') ) {
            $('#affordabilityFHADownPayment').val('3.5');
          } else {
            $('#affordabilityFHADownPayment').val('$' + (afdHomePrice * 0.035).toFixed(2));
          }
        }
      }
      if($(this).attr('id') == 'affordabilityFHALoanAmount') {
        $(this).addClass('afd-fha-loan-triggerred');
      }
      AffordabilityFHACalculator();
    });

    // VA
    $(document).on("change", "#affordabilityVAGrossMonthlyIncome, #affordabilityVAMonthlyDebts, #affordabilityVAHomePrice, #affordabilityVADownPayment, #affordabilityVALoanAmount, #affordabilityVALoanTerm, input[name='affordabilityVAPaymentFrequency'], #affordabilityVAInterestRate, #affordabilityVAFundingFeeOptions, #affordabilityVAPropTax, #affordabilityVAHomeownersInsurance, #affordabilityVAHoaDues", function () {
      if($(this).attr('id') == 'affordabilityVALoanAmount') {
        $(this).addClass('afd-va-loan-triggerred');
      }
      AffordabilityVACalculator();
    });

    // USDA
    $(document).on("change", "#affordabilityUSDAGrossMonthlyIncome, #affordabilityUSDAMonthlyDebts, #affordabilityUSDAHomePrice, #affordabilityUSDADownPayment, #affordabilityUSDALoanAmount, #affordabilityUSDALoanTerm, #affordabilityUSDAInteretRate, #affordabilityUSDAPropTax, #affordabilityUSDAHomeownersInsurance, #affordabilityUSDAHoaDues", function () {
      if($(this).attr('id') == 'affordabilityUSDADownPayment') {
        $(this).addClass('afd-fha-downpayment-triggerred');
      }
      if($(this).attr('id') == 'affordabilityUSDALoanAmount') {
        $(this).addClass('afd-fha-loan-triggerred');
      }
      AffordabilityUSDACalculator();
    });

    // Jumbo
    $(document).on("change", "#affordabilityJumboGrossMonthlyIncome, #affordabilityJumboMonthlyDebts, #affordabilityJumboHomePrice, #affordabilityJumboDownPayment, #affordabilityJumboLoanAmount, #affordabilityJumboLoanTerm, #affordabilityJumboInteretRate, #affordabilityJumboPropTax, #affordabilityJumboHomeownersInsurance, #affordabilityJumboPMI, #affordabilityJumboHoaDues", function () {
      if($(this).attr('id') == 'affordabilityJumboDownPayment') {
        $(this).addClass('afd-jumbo-downpayment-triggerred');
      }
      if($(this).attr('id') == 'affordabilityJumboLoanAmount') {
        $(this).addClass('afd-jumbo-loan-triggerred');
      }
      if($(this).attr('id') == 'affordabilityJumboPMI') {
        $(this).addClass('afd-jumbo-pmi-triggerred');
      }
      AffordabilityJumboCalculator();
    });


    $('.afd-trigger-email-form-na').on('click', function (e) {
      let $calculator_id = $(this).parents('.tab-content').attr('id');
      if($(this).parents('.tab-content').attr('id') === 'affordability') {
        $calculator_id = $(this).parents('.affordability-tab-item').attr('id');      
      }
      $('#afdReportCalculatorID').val($calculator_id);
      $('.afd-email-report-container').find('.afd-send-report-email').attr('disabled', false);
      $('.afd-email-report-container').find('.afd-email-report-success,.afd-email-report-error').addClass('hidden');
      $('.afd-email-report-container').slideDown();
      $(this).slideUp();
      e.preventDefault();
    });
    $('body').on('click', '.afd-close-email-form', function(e) {
      $('.afd-trigger-email-form-na').slideDown();
      $(this).closest('.afd-email-report-container').slideUp();
    });

    $('body').on('click', '.afd-send-report-email', function (e) {

      let email_form = $(this).parents('.afd-email-report-form').get(0);

      if (!email_form.checkValidity()) {
        return; 
      }

      e.preventDefault();

      let this_item = jQuery(this);
      let full_name = $(email_form).find('#afdReportFullName').val();
      let email_id = $(email_form).find('#afdReportEmailID').val();
      let calculator_id = $(email_form).find('#afdReportCalculatorID').val();

      let input_data = [];
      let output_data = [];
      let summary_data = [];

      if( calculator_id == 'affordability-conventional' || calculator_id == 'affordability-fha' || calculator_id == 'affordability-va' || calculator_id == 'affordability-usda' || calculator_id == 'affordability-jumbo') {

        let calculator_code = '';
        if( calculator_id == 'affordability-fha') {
          calculator_code = 'FHA';
        } else if( calculator_id == 'affordability-va') {
          calculator_code = 'VA';
        } else if( calculator_id == 'affordability-usda') {
          calculator_code = 'USDA';
        } else if( calculator_id == 'affordability-jumbo') {
          calculator_code = 'Jumbo';
        }

        // Processing inputs
        let form_data = $('#'+calculator_id).find('.calulate-form-item').serializeArray();
        $.each(form_data, function(i, field) {
          let key = field.name;
          let name = key;
          let fvalue = field.value;
        
          // Only convert the name if it does not contain an underscore
          if (!key.includes('_') && !name.startsWith("affordabilityVALess") && !name.startsWith("affordabilityVAGreater")) {

            if(name.startsWith("affordability")) {
              name = name.replace("affordabilityFHA", "").trim();
              name = name.replace("affordabilityVA", "").trim();
              name = name.replace("affordabilityUSDA", "").trim();
              name = name.replace("affordabilityJumbo", "").trim();
              name = name.replace("affordability", "").trim();
            }
            name = name.replace(/([A-Z])/g, ' $1').trim();

            if( key == "affordability"+calculator_code+"DownPayment") {
              if($("#"+key).hasClass('percentage')) {
                fvalue += '%';
              }
            }
            if( key == "affordability"+calculator_code+"LoanTerm") {
              if($("#"+key).hasClass('month')) {
                fvalue += ' month';
              } else {
                fvalue += ' year';
              }
            }
            if( key == "affordability"+calculator_code+"PropTax") {
              if($("#"+key).hasClass('percentage')) {
                fvalue += '%';
              }
              name += " ( Yearly )";
            }
            if( key == "affordability"+calculator_code+"HomeownersInsurance") {
              if($("#"+key).hasClass('percentage')) {
                fvalue += '%';
              }
              name += " ( Yearly )";
            }
            if( key == "affordability"+calculator_code+"HoaDues") {
              name += " ( Yearly )";
            }
            if( key == "affordability"+calculator_code+"FundingFeeOptions") {
              name = "VA Funding Fee Options";
              let temp_value = '';
              if(fvalue == 'first_use') {
                temp_value = 'First Time Use of a VA Loan';
              } else if(fvalue == 'after_first_use') {
                temp_value = 'I have used a VA loan before';
              } else if(fvalue == 'exempt_va_funding_fee') {
                temp_value = 'I am exempt from the VA funding fee';
              }
              fvalue = temp_value;
            }
            if( key == "affordability"+calculator_code+"PMI") {
              name = "PMI ( Yearly )";
            }
            if( key == "datepicker") {
              name = "First Payment Date";
            }

            input_data.push({
              key: key,
              name: name,
              value: fvalue
            });

          }
        
        });

        if( calculator_id == 'affordability-conventional') {
          input_data.push({
            key: 'affordabilityPMI',
            name: 'PMI ( Yearly )',
            value: '$'+$('#affordabilityPMI').val()
          });
        }

        if( calculator_id == 'affordability-va') {
          let afdFundingFee = $("#affordabilityVAFundingFee").val();
          input_data.push({
            key: 'affordabilityVAFundingFee',
            name: 'VA Funding Fee',
            value: afdFundingFee
          });
        }

        // Processing outputs
        if( calculator_id == 'affordability-conventional') {
          output_data.push({
            name: 'Principal & Interest',
            value: $('#affordabilityChartPrinciple').html()
          });
          output_data.push({
            name: 'Taxes',
            value: $('#affordabilityChartTaxes').html()
          });
          output_data.push({
            name: 'Insurance',
            value: $('#affordabilityChartInsurence').html()
          });
          output_data.push({
            name: 'HOA Dues',
            value: $('#affordabilityChartHOADues').html()
          });
          output_data.push({
            name: 'PMI',
            value: $('#affordabilityChartPMI').html()
          });

          output_data.push({
            name: 'Home Value',
            value: $('#afdHomeValue').html()
          });
          output_data.push({
            name: 'Mortage Amount',
            value: $('#afdMortageAmount').html()
          });
          output_data.push({
            name: 'Monthly Conventional Payment',
            value: $('#afdMonthlyConventionalPayment').html()
          });
          output_data.push({
            name: 'Down Payment',
            value: $('#afdDownPayment').html()
          });
          output_data.push({
            name: 'Monthly Estimated PMI',
            value: $('#afdMonthlyEstimatedPMI').html()
          });

          output_data.push({
            name: 'Monthly Mortgage Payment',
            value: $('#afdBBMonthlyMortageAmount').html()
          });
          output_data.push({
            name: 'Loan Amount',
            value: $('#afdBBLoanAmount').html()
          });
          output_data.push({
            name: 'Your Debt to Income Ratio',
            value: $('#afdBBYourDebt').html()+"/"+$('#afdBBYourIncome').html()
          });
          output_data.push({
            name: 'Allowable Debt to Income Ratio',
            value: $('#affordability-conventional-content').find('.affordability-conventional-head .amount').html()
          });

          summary_data.push({
            name: 'Summary',
            value: $('#affordability-conventional-content').find('.affordability-description span').html()
          });
        }

        if( calculator_id == 'affordability-fha') {
          output_data.push({
            name: 'Principal & Interest',
            value: $('#affordabilityFHAChartPrinciple').html()
          });
          output_data.push({
            name: 'Taxes',
            value: $('#affordabilityFHAChartTaxes').html()
          });
          output_data.push({
            name: 'Insurance',
            value: $('#affordabilityFHAChartInsurence').html()
          });
          output_data.push({
            name: 'HOA Dues',
            value: $('#affordabilityFHAChartHOADues').html()
          });
          output_data.push({
            name: 'MIP',
            value: $('#affordabilityFHAChartMIP').html()
          });

          output_data.push({
            name: 'Home Value',
            value: $('#afdFHAHomeValue').html()
          });
          output_data.push({
            name: 'Mortage Amount',
            value: $('#afdFHABaseLoanAmount').html()
          });
          output_data.push({
            name: 'Monthly FHA Payment',
            value: $('#afdFHAMonthlyFHAPayment').html()
          });
          output_data.push({
            name: 'Down Payment',
            value: $('#afdFHADownPayment').html()
          });
          output_data.push({
            name: 'FHA Loan Amount',
            value: $('#afdFHALoanAmount').html()
          });
          output_data.push({
            name: 'Upfront MIP',
            value: $('#afdFHAUpfrontMIP').html()
          });

          output_data.push({
            name: 'Monthly Mortgage Payment',
            value: $('#afdFHABBMonthlyMortageAmount').html()
          });
          output_data.push({
            name: 'Loan Amount',
            value: $('#afdFHABBLoanAmount').html()
          });
          output_data.push({
            name: 'Your Debt to Income Ratio',
            value: $('#afdFHABBYourDebt').html()+"/"+$('#afdFHABBYourIncome').html()
          });
          output_data.push({
            name: 'Allowable Debt to Income Ratio',
            value: $('#affordability-fha-content').find('.affordability-conventional-head .amount').html()
          });

          summary_data.push({
            name: 'Summary',
            value: $('#affordability-fha-content').find('.affordability-description span').html()
          });
        }

        if( calculator_id == 'affordability-va') {
          output_data.push({
            name: 'Principal & Interest',
            value: $('#affordabilityVAChartPrinciple').html()
          });
          output_data.push({
            name: 'Taxes',
            value: $('#affordabilityVAChartTaxes').html()
          });
          output_data.push({
            name: 'Insurance',
            value: $('#affordabilityVAChartInsurence').html()
          });
          output_data.push({
            name: 'HOA Dues',
            value: $('#affordabilityVAChartHOADues').html()
          });

          output_data.push({
            name: 'Home Value',
            value: $('#afdVAHomeValue').html()
          });
          output_data.push({
            name: 'Base Loan Amount',
            value: $('#afdVABaseLoanAmount').html()
          });
          output_data.push({
            name: 'Monthly VA Payment',
            value: $('#afdVAMonthlyVAPayment').html()
          });
          output_data.push({
            name: 'Down Payment',
            value: $('#afdVADownPayment').html()
          });
          output_data.push({
            name: 'VA Loan Amount',
            value: $('#afdVAFinalLoanAmount').html()
          });
          output_data.push({
            name: 'VA Funding Fee',
            value: $('#afdVAFundingFee').html()
          });

          output_data.push({
            name: 'Monthly Mortgage Payment',
            value: $('#afdVABBMonthlyMortageAmount').html()
          });
          output_data.push({
            name: 'Loan Amount',
            value: $('#afdVABBLoanAmount').html()
          });
          output_data.push({
            name: 'Your Debt to Income Ratio',
            value: $('#afdVABBYourDebt').html()+"/"+$('#afdVABBYourIncome').html()
          });
          output_data.push({
            name: 'Allowable Debt to Income Ratio',
            value: $('#affordability-va-content').find('.affordability-conventional-head .amount').html()
          });

          summary_data.push({
            name: 'Summary',
            value: $('#affordability-va-content').find('.affordability-description span').html()
          });
        }

        if( calculator_id == 'affordability-usda') {
          output_data.push({
            name: 'Principal & Interest',
            value: $('#affordabilityUSDAChartPrinciple').html()
          });
          output_data.push({
            name: 'Taxes',
            value: $('#affordabilityUSDAChartTaxes').html()
          });
          output_data.push({
            name: 'Insurance',
            value: $('#affordabilityUSDAChartInsurence').html()
          });
          output_data.push({
            name: 'HOA Dues',
            value: $('#affordabilityUSDAChartHOADues').html()
          });
          output_data.push({
            name: 'USDA MIP',
            value: $('#affordabilityUSDAChartMIP').html()
          });

          output_data.push({
            name: 'Home Value',
            value: $('#afdUSDAHomeValue').html()
          });
          output_data.push({
            name: 'Base Loan Amount',
            value: $('#afdUSDABaseLoanAmount').html()
          });
          output_data.push({
            name: 'Monthly USDA Payment',
            value: $('#afdUSDAMonthlyUSDAPayment').html()
          });
          output_data.push({
            name: 'Down Payment',
            value: $('#afdUSDADownPayment').html()
          });
          output_data.push({
            name: 'USDA Loan Amount',
            value: $('#afdUSDALoanAmount').html()
          });
          output_data.push({
            name: 'USDA Guarantee Fee',
            value: $('#afdUSDAGuaranteeFee').html()
          });

          output_data.push({
            name: 'Monthly Mortgage Payment',
            value: $('#afdUSDABBMonthlyMortageAmount').html()
          });
          output_data.push({
            name: 'Loan Amount',
            value: $('#afdUSDABBLoanAmount').html()
          });
          output_data.push({
            name: 'Your Debt to Income Ratio',
            value: $('#afdUSDABBYourDebt').html()+"/"+$('#afdUSDABBYourIncome').html()
          });
          output_data.push({
            name: 'Allowable Debt to Income Ratio',
            value: $('#affordability-usda-content').find('.affordability-conventional-head .amount').html()
          });

          summary_data.push({
            name: 'Summary',
            value: $('#affordability-usda-content').find('.affordability-description span').html()
          });
        }

        if( calculator_id == 'affordability-jumbo') {
          output_data.push({
            name: 'Principal & Interest',
            value: $('#affordabilityJumboChartPrinciple').html()
          });
          output_data.push({
            name: 'Taxes',
            value: $('#affordabilityJumboChartTaxes').html()
          });
          output_data.push({
            name: 'Insurance',
            value: $('#affordabilityJumboChartInsurence').html()
          });
          output_data.push({
            name: 'HOA Dues',
            value: $('#affordabilityJumboChartHOADues').html()
          });
          output_data.push({
            name: 'PMI',
            value: $('#affordabilityJumboChartPMI').html()
          });

          output_data.push({
            name: 'Home Value',
            value: $('#afdJumboHomeValue').html()
          });
          output_data.push({
            name: 'Mortage Amount',
            value: $('#afdJumboMortageAmount').html()
          });
          output_data.push({
            name: 'Monthly Conventional Payment',
            value: $('#afdJumboMonthlyConventionalPayment').html()
          });
          output_data.push({
            name: 'Down Payment',
            value: $('#afdJumboDownPayment').html()
          });
          output_data.push({
            name: 'Monthly Estimated PMI',
            value: $('#afdJumboMonthlyEstimatedPMI').html()
          });

          output_data.push({
            name: 'Monthly Mortgage Payment',
            value: $('#afdJumboBBMonthlyMortageAmount').html()
          });
          output_data.push({
            name: 'Loan Amount',
            value: $('#afdJumboBBLoanAmount').html()
          });
          output_data.push({
            name: 'Your Debt to Income Ratio',
            value: $('#afdJumboBBYourDebt').html()+"/"+$('#afdJumboBBYourIncome').html()
          });
          output_data.push({
            name: 'Allowable Debt to Income Ratio',
            value: $('#affordability-jumbo-content').find('.affordability-conventional-head .amount').html()
          });

          summary_data.push({
            name: 'Summary',
            value: $('#affordability-jumbo-content').find('.affordability-description span').html()
          });
        }

      }

      if( calculator_id == 'mortage-item') {

        let form_data = $('#'+calculator_id).find('.calulate-form-item').serializeArray();
        $.each(form_data, function(i, field) {
          let key = field.name;
          let name = key;
          let fvalue = field.value;

          if (!key.includes('_')) {

            name = name.replace("mortage", "").trim();
            name = name.replace(/([A-Z])/g, ' $1').trim();

            if (key == "mortageDownPayment") {
              if ($("#" + key).hasClass('percentage')) {
                fvalue += '%';
              }
            }

            if( key == "mortageLoanTerm") {
              if($("#"+key).hasClass('month')) {
                fvalue += ' month';
              } else {
                fvalue += ' year';
              }
            }

            if (key == "mortageInterestRate") {
              fvalue += '%';
            }

            if (key == "mortagePMI") {
              name = 'PMI (yearly)';
            }

            if (key == "mortagePropertyTax") {
              name = 'Property Tax (yearly)';
              if ($("#" + key).hasClass('percentage')) {
                fvalue += '%';
              }
            }

            if (key == "mortageHomeownersInsurence") {
              name = 'Homeowners Insurance (Yearly)';
            }

            if (key == "mortageHoaDues") {
              name = 'HOA Dues Per Month';
            }

            if( key == "datepicker") {
              name = "First Payment Date";
            }

            if( key == "mortageExtraPayment") {
              name = "Extra Payment Per Month";
            }

            input_data.push({
              key: key,
              name: name,
              value: fvalue
            });

          }

        });

        output_data.push({
          name: 'Principal & Interest',
          value: $('#principle').html().replace(/[\(\)]/g, '')
        });
        output_data.push({
          name: 'Taxes',
          value: $('#TaxesSpan').html().replace(/[\(\)]/g, '')
        });
        output_data.push({
          name: 'Insurance',
          value: $('#homeownersInsurenceSpan').html().replace(/[\(\)]/g, '')
        });
        output_data.push({
          name: 'HOA Dues',
          value: $('#HOADuesSpan').html().replace(/[\(\)]/g, '')
        });
        output_data.push({
          name: 'PMI',
          value: $('#pmiSpan').html().replace(/[\(\)]/g, '')
        });
        output_data.push({
          name: 'Extra Payment',
          value: $('#extraPaymentSpan').html().replace(/[\(\)]/g, '')
        });

        output_data.push({
          name: 'Home Value',
          value: $('#homeVal').html()
        });
        output_data.push({
          name: 'Mortgage Amount',
          value: $('#loanAmountVal').html()
        });
        output_data.push({
          name: 'Monthly Principal & Interest',
          value: $('#PrincipalIntrestVal').html()
        });
        output_data.push({
          name: 'Monthly Extra Payment',
          value: $('#extraPaymentVal').html()
        });
        output_data.push({
          name: 'Monthly Property Tax',
          value: $('#propertTexVal').html()
        });
        output_data.push({
          name: 'Monthly Home Insurance',
          value: $('#houseInsuranceVal').html()
        });
        output_data.push({
          name: 'Monthly PMI ' + $('#PMICount').html(),
          value: $('#PMIVal').html()
        });
        output_data.push({
          name: 'Monthly HOA Fees',
          value: $('#HOAVal').html()
        });

        output_data.push({
          name: 'Total # Of Payments',
          value: $('#totalMonthPayment').html()
        });
        output_data.push({
          name: 'Down Payment',
          value: $('#totalDownPayment').html()
        });
        output_data.push({
          name: 'Principal',
          value: $('#totalPrincipalAmount').html()
        });
        output_data.push({
          name: 'Total Extra Payment',
          value: $('#totalExtraPayment').html()
        });
        output_data.push({
          name: 'Total Interest Paid',
          value: $('#totalIntrestPaid').html()
        });
        output_data.push({
          name: 'Total Tax, Insurance, PMI and Fees',
          value: $('#totalInsuranceTex').html()
        });
        output_data.push({
          name: 'Total of all Payments',
          value: $('#totalAllPayment').html()
        });

      }

      if( calculator_id == 'refinance-item') {

        let form_data = $('#'+calculator_id).find('.calulate-form-item').serializeArray();
        $.each(form_data, function(i, field) {
          let key = field.name;
          let name = key;
          let fvalue = field.value;

          if (!key.includes('_') && key !== "datepicker") {

            name = name.replace(/([A-Z])/g, ' $1').trim();

            if (key == "originalLoanAmount") {
              name = 'Original Loan Amount';
            }

            if (key == "currentIntrestRate") {
              name = 'Original Rate';
              fvalue += '%';
            }
            if (key == "newIntrestRate") {
              fvalue += '%';
            }

            if( key == "originalLoanTerm") {
              name = 'Original Loan Term';
              if($("#"+key).hasClass('month')) {
                fvalue += ' month';
              } else {
                fvalue += ' year';
              }
            }

            if (key == "currentLoanBalance") {
              name = 'Current Loan Balance';
            }
            if (key == "cashOutAmount") {
              name = 'Cash Out Amount';
            }
            if (key == "refinanceFees") {
              name = 'Refinance Fees';
            }
            if (key == "newLoanAmount") {
              name = 'New Loan Amount';
            }
            if (key == "newIntrestRate") {
              name = 'New Interest Rate';
            }
            if( key == "newLoanTerm") {
              name = 'New Loan Term';
              if($("#"+key).hasClass('month')) {
                fvalue += ' month';
              } else {
                fvalue += ' year';
              }
            }

            input_data.push({
              key: key,
              name: name,
              value: fvalue
            });

          }

        });

        input_data.push({
          key: 'rent-datepicker',
          name: 'Loan Start Date',
          value: $('#'+calculator_id).find('#rent-datepicker').val()
        });
        input_data.push({
          key: 'rent-loan-start-datepicker',
          name: 'New Loan Start Date',
          value: $('#'+calculator_id).find('#rent-loan-start-datepicker').val()
        });
        if($('#'+calculator_id).find('input[name="paying_refinance_cost"]:checked').val() == 'true') {
          var paying_refinance_cost = 'Include In Loan';
        } else {
          var paying_refinance_cost = 'Pay Out of Pocket';
        }
        input_data.push({
          key: 'paying-refinance-cost',
          name: 'Paying Refinance Costs',
          value: paying_refinance_cost
        });

        output_data.push({
          name: 'Monthly Payment Increase',
          value: $('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(0).find('.dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(0).find('.amount').html()
        });
        output_data.push({
          name: 'Total Interest Difference',
          value: $('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(1).find('.dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(1).find('.amount').html()
        });
        output_data.push({
          name: 'Refinance Costs',
          value: $('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(2).find('.dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(2).find('.amount').html()
        });
        output_data.push({
          name: 'Time to Recoup Fees',
          value: $('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(3).find('.months').html()+' '+$('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(3).find('.month-text').html()
        });
        output_data.push({
          name: 'Current Loan',
          value: $('div[data-id="#' + calculator_id + '"]').find('.mpc-current-loan .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.mpc-current-loan .amount').html()
        });
        output_data.push({
          name: 'New Loan',
          value: $('div[data-id="#' + calculator_id + '"]').find('.mpc-new-loan .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.mpc-new-loan .amount').html()
        });
        output_data.push({
          name: 'Monthly Payment Difference',
          value: $('div[data-id="#' + calculator_id + '"]').find('.mpc-difference .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.mpc-difference .amount').html()
        });
        output_data.push({
          name: 'Current Loan Remaining Interest',
          value: $('div[data-id="#' + calculator_id + '"]').find('.tic-current-loan .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.tic-current-loan .amount').html()
        });
        output_data.push({
          name: 'New Loan Interest',
          value: $('div[data-id="#' + calculator_id + '"]').find('.tic-new-loan .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.tic-new-loan .amount').html()
        });
        output_data.push({
          name: 'Total Interest Difference',
          value: $('div[data-id="#' + calculator_id + '"]').find('.tic-difference .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.tic-difference .amount').html()
        });

      }

      if( calculator_id == 'rent-buy-item') {

        let form_data = $('#'+calculator_id).find('.calulate-form-item').serializeArray();
        $.each(form_data, function(i, field) {
          let key = field.name;
          let name = key;
          let fvalue = field.value;

          if (!key.includes('_') && key !== "datepicker") {

            name = name.replace("rentBuy", "").trim();
            name = name.replace("rentCurrent", "").trim();
            name = name.replace("rentNew", "").trim();
            name = name.replace("rent", "").trim();
            name = name.replace(/([A-Z])/g, ' $1').trim();

            if (key == "rentBuyPMI") {
              name = 'PMI (Yearly)';
            }
            if (key == "marginalTaxBracket") {
              name = 'Marginal Tax Bracket';
            }
            if (key == "annualAppreciation") {
              name = 'Annual Appreciation';
            }
            if (key == "rentersInsurance") {
              name = 'Renters Insurance';
            }
            if (key == "rentAppreciation") {
              name = 'Rent Appreciation';
            }
            if (key == "rentCurrentInterestRate") {
              fvalue += '%';
            }
            if( key == "rentNewLoanTerm") {
              name = 'Loan Term';
              if($("#"+key).hasClass('month')) {
                fvalue += ' month';
              } else {
                fvalue += ' year';
              }
            }

            input_data.push({
              key: key,
              name: name,
              value: fvalue
            });

          }

        });

        input_data.push({
          key: 'rent-datepicker',
          name: 'Start Date',
          value: $('#'+calculator_id).find('#rent-datepicker').val()
        });

        output_data.push({
          name: 'Year',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-buy-cost-head .rvb-year h2').html()
        });
        output_data.push({
          name: 'Buy Gain',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-buy-cost-head .rvb-buy-gain h2 .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.rent-buy-cost-head .rvb-buy-gain h2 .amount').html()
        });
        output_data.push({
          name: 'Buy',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-buy-cost-head .rvb-buy h2 .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.rent-buy-cost-head .rvb-buy h2 .amount').html()
        });
        output_data.push({
          name: 'Rent',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-buy-cost-head .rvb-rent h2 .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.rent-buy-cost-head .rvb-rent h2 .amount').html()
        });

        output_data.push({
          name: 'Buying: Cash Spent',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-vs-buy-table-data .cash-spent-value td').eq(1).html().replace(/<[^>]*>?/gm, '')
        });
        output_data.push({
          name: 'Buying: Home value',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-vs-buy-table-data .home-value td').eq(1).html().replace(/<[^>]*>?/gm, '')
        });
        output_data.push({
          name: 'Buying: Balance on Loan',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-vs-buy-table-data .balance-loan-value td').eq(1).html().replace(/<[^>]*>?/gm, '')
        });
        output_data.push({
          name: 'Buying: Closing costs on sale',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-vs-buy-table-data .closing-costs-value td').eq(1).html().replace(/<[^>]*>?/gm, '')
        });
        output_data.push({
          name: 'Buying: Adjusted Net Cash Savings',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-vs-buy-table-data .cash-savings-value td').eq(1).html().replace(/<[^>]*>?/gm, '')
        });

        output_data.push({
          name: 'Renting: Cash Spent',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-vs-buy-table-data .cash-spent-value td').eq(2).html().replace(/<[^>]*>?/gm, '')
        });
        output_data.push({
          name: 'Renting: Home value',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-vs-buy-table-data .home-value td').eq(2).html().replace(/<[^>]*>?/gm, '')
        });
        output_data.push({
          name: 'Renting: Balance on Loan',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-vs-buy-table-data .balance-loan-value td').eq(2).html().replace(/<[^>]*>?/gm, '')
        });
        output_data.push({
          name: 'Renting: Closing costs on sale',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-vs-buy-table-data .closing-costs-value td').eq(2).html().replace(/<[^>]*>?/gm, '')
        });
        output_data.push({
          name: 'Renting: Adjusted Net Cash Savings',
          value: $('div[data-id="#' + calculator_id + '"]').find('.rent-vs-buy-table-data .cash-savings-value td').eq(2).html().replace(/<[^>]*>?/gm, '')
        });

      }

      if( calculator_id == 'veteran-affairs') {

        let form_data = $('#'+calculator_id).find('.calulate-form-item').serializeArray();
        $.each(form_data, function(i, field) {
          let key = field.name;
          let name = key;
          let fvalue = field.value;

          if (!key.includes('_')) {

            name = name.replace("VA", "").trim();
            name = name.replace(/([A-Z])/g, ' $1').trim();

            if (key == "VADownPayment") {
              if ($("#" + key).hasClass('percentage')) {
                fvalue += '%';
              }
            }

            if( key == "VALoanTerm") {
              if($("#"+key).hasClass('month')) {
                fvalue += ' month';
              } else {
                fvalue += ' year';
              }
            }

            if (key == "VAInterestRate") {
              fvalue += '%';
            }

            if (key == "VAPMI") {
              name = 'PMI (yearly)';
            }

            if (key == "VAPropertyTax") {
              name = 'Property Tax (yearly)';
              if ($("#" + key).hasClass('percentage')) {
                fvalue += '%';
              }
            }

            if (key == "VAHomeInsurence") {
              name = 'Homeowners Insurance (Yearly)';
            }

            if (key == "VAHoaDues") {
              name = 'HOA Dues Per Month';
            }

            if( key == "datepicker") {
              name = "First Payment Date";
            }

            if( key == "VAExtraPayment") {
              name = "Extra Payment Per Month";
            }

            if( key == "vaFundingFeeOptions") {
              name = "VA Funding Fee Options";
              let temp_value = '';
              if(fvalue == 'first_use') {
                temp_value = 'First Time Use of a VA Loan';
              } else if(fvalue == 'after_first_use') {
                temp_value = 'I have used a VA loan before';
              } else if(fvalue == 'exempt_va_funding_fee') {
                temp_value = 'I am exempt from the VA funding fee';
              }
              fvalue = temp_value;
            }

            input_data.push({
              key: key,
              name: name,
              value: fvalue
            });

          }

        });

        input_data.push({
          key: "VAFundingFee",
          name: "VA Funding Fee",
          value: $("#VAFundingFee").val()
        });
        input_data.push({
          key: "finalMortageLoanAmount",
          name: "Final Mortgage Amount",
          value: $("#finalMortageLoanAmount").val()
        });
        var paymentFrequency = $('#'+calculator_id).find("input[name='va_payment_frequency']:checked").val();
        input_data.push({
          key: 'payment-frequency',
          name: 'Payment Frequency',
          value: paymentFrequency
        });

        output_data.push({
          name: 'Principal & Interest',
          value: $('#vaPrinciple').html().replace(/[\(\)]/g, '')
        });
        output_data.push({
          name: 'Taxes',
          value: $('#vaTaxesSpan').html().replace(/[\(\)]/g, '')
        });
        output_data.push({
          name: 'Insurance',
          value: $('#vaHomeownersInsurenceSpan').html().replace(/[\(\)]/g, '')
        });
        output_data.push({
          name: 'HOA Dues',
          value: $('#vaHOADuesSpan').html().replace(/[\(\)]/g, '')
        });
        output_data.push({
          name: 'Extra Payment',
          value: $('#vaExtraPaymentSpan').html().replace(/[\(\)]/g, '')
        });

        output_data.push({
          name: 'Home Value',
          value: $('#vaHomeVal').html()
        });
        output_data.push({
          name: 'Mortgage Amount',
          value: $('#valoanAmountVal').html()
        });
        output_data.push({
          name: 'Monthly Principal & Interest',
          value: $('#vaPrincipalIntrestVal').html()
        });
        output_data.push({
          name: 'Monthly Extra Payment',
          value: $('#vaExtraPaymentVal').html()
        });
        output_data.push({
          name: 'Monthly Property Tax',
          value: $('#vaPropertyTex').html()
        });
        output_data.push({
          name: 'Monthly Home Insurance',
          value: $('#vaHouseInsurance').html()
        });
        output_data.push({
          name: 'Monthly HOA Fees',
          value: $('#vaHOAV').html()
        });

        output_data.push({
          name: 'Total # Of Payments',
          value: $('#vaTotalMonthPayment').html()
        });
        output_data.push({
          name: 'Down Payment',
          value: $('#vaTotalDownPayment').html()
        });
        output_data.push({
          name: 'Principal',
          value: $('#vaTotalPrincipalAmount').html()
        });
        output_data.push({
          name: 'Total Extra Payment',
          value: $('#vaTotalExtraPayment').html()
        });
        output_data.push({
          name: 'Total Interest Paid',
          value: $('#vaTotalIntrestPaid').html()
        });
        output_data.push({
          name: 'Total Tax, Insurance, PMI and Fees',
          value: $('#vaTotalInsuranceTex').html()
        });
        output_data.push({
          name: 'Total of all Payments',
          value: $('#vaTotalAllPayment').html()
        });

      }

      if( calculator_id == 'va-refinance') {

        let form_data = $('#'+calculator_id).find('.calulate-form-item').serializeArray();
        $.each(form_data, function(i, field) {
          let key = field.name;
          let name = key;
          let fvalue = field.value;

          if (!key.includes('_') && key !== "datepicker") {

            name = name.replace(/([A-Z])/g, ' $1').trim();

            if (key == "VARefinanceOriginalLoanAmount") {
              name = 'Original Loan Amount';
            }
            if (key == "VARefinanceCurrentInterestRate") {
              name = 'Original Rate';
              fvalue += '%';
            }
            if( key == "VARefinanceOriginalLoanTerm") {
              name = 'Original Loan Term';
              if($("#"+key).hasClass('month')) {
                fvalue += ' month';
              } else {
                fvalue += ' year';
              }
            }

            if (key == "VARefinanceCurrentLoanBalance") {
              name = 'Current Loan Balance';
            }
            if (key == "VARefinanceCashOutAmount") {
              name = 'Cash Out Amount';
            }
            if (key == "refinanceFees") {
              name = 'Refinance Fees';
            }
            if (key == "newLoanAmount") {
              name = 'New Loan Amount';
            }
            if (key == "newIntrestRate") {
              name = 'New Interest Rate';
            }
            if (key == "VARefinanceRefinanceFees") {
              name = 'Refinance Costs';
            }
            if (key == "VARefinanceNewInterestRate") {
              name = 'New Interest Rate';
              fvalue += '%';
            }
            if (key == "VARefinanceNewLoanAmount") {
              name = 'New Loan Amount';
            }
            if( key == "VARefinanceNewLoanTerm") {
              name = 'New Loan Term';
              if($("#"+key).hasClass('month')) {
                fvalue += ' month';
              } else {
                fvalue += ' year';
              }
            }

            if( key == "vaRefinancePurposeOptions") {
              name = "Purpose Options";
              let temp_value = '';
              if(fvalue == 'cash_out_refinance') {
                temp_value = 'Cash Out Refinance';
              } else if(fvalue == 'interest_rate_reduction') {
                temp_value = 'Interest Rate Reduction (IRRL)';
              }
              fvalue = temp_value;
            }

            if( key == "vaRefinanceFundingFeeOptions") {
              name = "Funding Fee Options";
              let temp_value = '';
              if(fvalue == 'first_use') {
                temp_value = 'First Time Use of a VA Loan';
              } else if(fvalue == 'after_first_use') {
                temp_value = 'I have used a VA loan before';
              } else if(fvalue == 'exempt_va_funding_fee') {
                temp_value = 'I am exempt from the VA funding fee';
              }
              fvalue = temp_value;
            }

            input_data.push({
              key: key,
              name: name,
              value: fvalue
            });

          }

        });

        input_data.push({
          key: "VARefinanceFundingFee",
          name: "VA Funding Fee",
          value: $("#VARefinanceFundingFee").val()
        });
        input_data.push({
          key: 'rent-datepicker',
          name: 'Loan Start Date',
          value: $('#'+calculator_id).find('#rent-datepicker').val()
        });
        input_data.push({
          key: 'rent-loan-start-datepicker',
          name: 'New Loan Start Date',
          value: $('#'+calculator_id).find('#rent-loan-start-datepicker').val()
        });
        if($('#'+calculator_id).find('input[name="paying_refinance_cost"]:checked').val() == 'true') {
          var paying_refinance_cost = 'Include In Loan';
        } else {
          var paying_refinance_cost = 'Pay Out of Pocket';
        }
        input_data.push({
          key: 'paying-refinance-cost',
          name: 'Paying Refinance Costs',
          value: paying_refinance_cost
        });

        output_data.push({
          name: 'Monthly Payment Increase',
          value: $('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(0).find('.dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(0).find('.amount').html()
        });
        output_data.push({
          name: 'Total Interest Difference',
          value: $('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(1).find('.dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(1).find('.amount').html()
        });
        output_data.push({
          name: 'Refinance Costs',
          value: $('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(2).find('.dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(2).find('.amount').html()
        });
        output_data.push({
          name: 'Time to Recoup Fees',
          value: $('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(3).find('.months').html()+' '+$('div[data-id="#' + calculator_id + '"]').find('.refinance-cost-head .light-primary-bg').eq(3).find('.month-text').html()
        });
        output_data.push({
          name: 'Current Loan',
          value: $('div[data-id="#' + calculator_id + '"]').find('.mpc-current-loan .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.mpc-current-loan .amount').html()
        });
        output_data.push({
          name: 'New Loan',
          value: $('div[data-id="#' + calculator_id + '"]').find('.mpc-new-loan .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.mpc-new-loan .amount').html()
        });
        output_data.push({
          name: 'Monthly Payment Difference',
          value: $('div[data-id="#' + calculator_id + '"]').find('.mpc-difference .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.mpc-difference .amount').html()
        });
        output_data.push({
          name: 'Current Loan Remaining Interest',
          value: $('div[data-id="#' + calculator_id + '"]').find('.tic-current-loan .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.tic-current-loan .amount').html()
        });
        output_data.push({
          name: 'New Loan Interest',
          value: $('div[data-id="#' + calculator_id + '"]').find('.tic-new-loan .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.tic-new-loan .amount').html()
        });
        output_data.push({
          name: 'Total Interest Difference',
          value: $('div[data-id="#' + calculator_id + '"]').find('.tic-difference .dollar').html()+$('div[data-id="#' + calculator_id + '"]').find('.tic-difference .amount').html()
        });

      }

      if( calculator_id == 'rental-loan') {

        let form_data = $('#'+calculator_id).find('.calulate-form-item').serializeArray();
        $.each(form_data, function(i, field) {
          let key = field.name;
          let name = key;
          let fvalue = field.value;

          if (!key.includes('_') && key !== "rlEnablePropertyAddress") {

            name = name.replace("RentalLoan", "").trim();
            name = name.replace(/([A-Z])/g, ' $1').trim();

            if (key == "RentalLoanUnit1MonthlyRent") {
              name = 'Unit 1 Monthly Rent';
            }
            if (key == "RentalLoanMonthlyHOAFee") {
              name = 'Monthly HOA Fee';
            }
            if (key == "RentalLoanVacancyRate") {
              fvalue += '%';
            }
            if (key == "RentalLoanInterestRate") {
              fvalue += '%';
            }
            if (key == "RentalLoanOriginationFee") {
              fvalue += '%';
            }
            if (key == "RentalLoanLoanToValue") {
              fvalue += '%';
            }
            if (key == "RentalLoanAnnualRepairsMaintenance") {
              name = 'Annual Repairs & Maintenance';
            }

            input_data.push({
              key: key,
              name: name,
              value: fvalue
            });

          }

        });

        if($('#'+calculator_id).find('input[name="rental_loan_por"]:checked').val() == 'refinance') {
          var rental_loan_por = 'Refinance';
        } else {
          var rental_loan_por = 'Purchase';
        }
        input_data.push({
          key: 'rental-loan-por',
          name: 'Purchase or Refinance',
          value: rental_loan_por
        });

        output_data.push({
          name: 'Loan Amount',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlLoanAmount').html()
        });
        output_data.push({
          name: 'Down Payment',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlDownPayment').html()
        });
        output_data.push({
          name: 'Mortgage Payment',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlMortgagePayment').html()
        });
        output_data.push({
          name: 'Monthly Payment',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlMonthlyPayment').html()
        });
        output_data.push({
          name: 'Origination Fee Amount',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlOriginationFeeAmount').html()
        });

        output_data.push({
          name: 'Total Closing Costs',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlTotalClosingCosts').html()
        });
        output_data.push({
          name: 'Cash Needed to Close',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlCashNeededToClose').html()
        });
        output_data.push({
          name: 'Price Per Unit',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlPricePerUnit').html()
        });
        output_data.push({
          name: 'Gross Rental Income',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlGrossRentalIncome').html()
        });
        output_data.push({
          name: 'Operating Expenses',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlOperatingExpenses').html()
        });
        output_data.push({
          name: 'Net Operating Income',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlNetOperatingIncome').html()
        });

        output_data.push({
          name: 'Cash Flow',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlCashFlow').html()
        });
        output_data.push({
          name: 'Cap Rate',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlCapRate').html()
        });
        output_data.push({
          name: 'Cash on Cash Return',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlCashOnCashReturn').html()
        });
        output_data.push({
          name: 'DSCR',
          value: $('div[data-id="#' + calculator_id + '"]').find('#rlDSCR').html()
        });

      }

      if( calculator_id == 'fix-and-flip') {

        let form_data = $('#'+calculator_id).find('.calulate-form-item').serializeArray();
        $.each(form_data, function(i, field) {
          let key = field.name;
          let name = key;
          let fvalue = field.value;

          if (!key.includes('_') && key !== "ffEnablePropertyAddress") {

            name = name.replace("FixAndFlip", "").trim();
            name = name.replace(/([A-Z])/g, ' $1').trim();

            if (key == "FixAndFlipPurchasePriceLTV") {
              name = 'Purchase Price LTV';
              fvalue += '%';
            }
            if (key == "FixAndFlipLengthOfLoan") {
              fvalue += ' Months';
            }
            if (key == "FixAndFlipIntrestRate") {
              fvalue += '%';
            }
            if (key == "FixAndFlipOriginationFee") {
              fvalue += '%';
            }
            if (key == "FixAndFlipOtherClosingCosts") {
              fvalue += '%';
            }
            if (key == "FixAndFlipCostToSell") {
              fvalue += '%';
            }

            input_data.push({
              key: key,
              name: name,
              value: fvalue
            });

          }

        });

        output_data.push({
          name: 'Loan Amount',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffLoanAmount').html()
        });
        output_data.push({
          name: 'Down Payment',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffDownPayment').html()
        });
        output_data.push({
          name: 'Monthly Interest Payment',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffMonthlyInterestPayment').html()
        });
        output_data.push({
          name: 'Total Interest Over Term',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffTotalInterestOverTerm').html()
        });
        output_data.push({
          name: 'Origination Fee Amount',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffOriginationFeeAmount').html()
        });
        output_data.push({
          name: 'Other Closing Costs Amount',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffOtherClosingCostsAmount').html()
        });
        output_data.push({
          name: 'Cost To Sell Amount',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffCostToSellAmount').html()
        });

        output_data.push({
          name: 'Closing Costs',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffClosingCosts').html()
        });
        output_data.push({
          name: 'Carrying Costs',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffCarryingCosts').html()
        });
        output_data.push({
          name: 'Borrower Equity Needed',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffBorrowerEquityNeeded').html()
        });
        output_data.push({
          name: 'Total Cash In Deal',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffTotalCashInDeal').html()
        });

        output_data.push({
          name: 'Net Profit',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffNetProfit').html()
        });
        output_data.push({
          name: 'Loan to After Repaired Value',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffLoantoAfterRepairedValue').html()
        });
        output_data.push({
          name: 'ROI',
          value: $('div[data-id="#' + calculator_id + '"]').find('#ffROI').html()
        });

      }

      jQuery.ajax({
          type: "POST",
          url: frontend.ajaxurl,
          dataType: "JSON",
          data:
          {
              action: 'afd_email_report',
              calculator_id: calculator_id,
              full_name: full_name,
              email_id: email_id,
              input_data: input_data,
              output_data: output_data,
              summary_data: summary_data
          },
          beforeSend: function() {
            this_item.html('Sending...');
          },
          success: function (response) {

            if(response.status) {
              this_item.parents('.afd-email-report-form').find('.afd-email-report-success').removeClass('hidden');
              this_item.parents('.afd-email-report-form').find('.afd-email-report-error').hide();
              this_item.attr('disabled', 'disabled');
            } else {
              this_item.parents('.afd-email-report-form').find('.afd-email-report-success').hide();
              this_item.parents('.afd-email-report-form').find('.afd-email-report-error').removeClass('hidden');
            }

            setTimeout(function(){ 
              $('.afd-email-report-container').slideUp();
              $(".afd-trigger-email-form-na").slideDown();
            }, 1600);
           
          },
          complete: function() {
            this_item.html('Send Email');
          }
      });

    });
    // Affordability End

});

//downpayment validation.
function validationForDownPayment(downPayment, homePrice) {
  if (jQuery("#mortageDownPayment").hasClass("percentage")) { 
    downPayment > 100 ? jQuery("#mortageDownPayment").addClass("mortgage-error") : jQuery("#mortageDownPayment").removeClass("mortgage-error");
  } else {
    downPayment > homePrice ? jQuery("#mortageDownPayment").addClass("mortgage-error") : jQuery("#mortageDownPayment").removeClass("mortgage-error");
  }
}

//downpayment validation.
function validationForVADownPayment(vaDownPayment, vaHomePrice) {
  if (jQuery("#VADownPayment").hasClass("percentage")) { 
    vaDownPayment > 100 ? jQuery("#VADownPayment").addClass("mortgage-error") : jQuery("#VADownPayment").removeClass("mortgage-error");
  } else {
    vaDownPayment > vaHomePrice ? jQuery("#VADownPayment").addClass("mortgage-error") : jQuery("#VADownPayment").removeClass("mortgage-error");
  }
}

// trigger all click.
function triggerAllElementChange() {
  jQuery("#mortageHomePrice").trigger("change");
  jQuery("#mortageDownPayment").trigger("change");
  jQuery("#mortageLoanAmount").trigger("change");
  jQuery("#mortageLoanTerm").trigger("change");
  jQuery("#mortageInterestRate").trigger("change");
  jQuery("#mortageHoaDues").trigger("change");
  jQuery("#mortagePMI").trigger("change");
  jQuery("#mortageExtraPayment").trigger("change");
  jQuery("#mortageHomeownersInsurence").trigger("change");
  jQuery("#mortagePropertyTax").trigger("change");
}

// trigger all click.
function vaTriggerAllElementChange() {
  jQuery("#VAHomePrice").trigger("change");
  jQuery("#VADownPayment").trigger("change");
  jQuery("#VAMortageAmount").trigger("change");
  jQuery("#VALoanTerm").trigger("change");
  jQuery("#VAInterestRate").trigger("change");
  jQuery("#VAPropertyTax").trigger("change");
  jQuery("#VAHomeInsurence").trigger("change");
  jQuery("#VAHoaDues").trigger("change");
  jQuery("#VAExtraPayment").trigger("change");
}

// chart Color
function chartColor() {
  jQuery(".payment-results-list .principle-interest-color").css("background-color", frontend.piColor);
  jQuery(".payment-results-list .taxes-color").css("background-color", frontend.taxes);
  jQuery(".payment-results-list .insurance-color").css("background-color", frontend.insurance);
  jQuery(".payment-results-list .hoa-dues-color").css("background-color", frontend.hoaDues);
  jQuery(".payment-results-list .pmi-color").css("background-color", frontend.pmi);
  jQuery(".payment-results-list .extra-payment-color").css("background-color", frontend.extraPay);
}

function vaChartColor() {
  jQuery(".va-payment-results-list .principle-interest-color").css("background-color", frontend.vaPiColor);
  jQuery(".va-payment-results-list .taxes-color").css("background-color", frontend.vaTaxesColor);
  jQuery(".va-payment-results-list .insurance-color").css("background-color", frontend.vaInsurance);
  jQuery(".va-payment-results-list .hoa-dues-color").css("background-color", frontend.vaHoaDues);
  jQuery(".va-payment-results-list .pmi-color").css("background-color", frontend.vaPMIColor);
  jQuery(".va-payment-results-list .extra-payment-color").css("background-color", frontend.vaExtraPay);
}

// all element format currency.
function allElementCurrencyRefresh() {
  if ( jQuery('.payment-calculator-main').length > 0 ) {
    mortgageFormatCurrency(jQuery("input#mortageHomePrice"));
    mortgageFormatCurrency(jQuery("input#mortageDownPayment"));
    mortgageFormatCurrency(jQuery("input#mortageLoanAmount"));
    mortgageFormatCurrency(jQuery("input#mortageHomeownersInsurence"));
    mortgageFormatCurrency(jQuery("input#mortagePropertyTax"));
    mortgageFormatCurrency(jQuery("input#mortageHoaDues"));
    mortgageFormatCurrency(jQuery("input#mortagePMI"));
    mortgageFormatCurrency(jQuery("input#mortageExtraPayment"));
    mortgageFormatCurrency(jQuery("#totalLoanAmount"));
    mortgageFormatCurrency(jQuery("#homeVal"));
    mortgageFormatCurrency(jQuery("#totalPrincipalAmount"));
    mortgageFormatCurrency(jQuery("#loanAmountVal"));
    mortgageFormatCurrency(jQuery("#totalDownPayment"));
    mortgageFormatCurrency(jQuery("#totalInterestPaid"));
    mortgageFormatCurrency(jQuery("#totalIntrestPaid"));
    mortgageFormatCurrency(jQuery("#principle"));
    mortgageFormatCurrency(jQuery("#allPayment"));
    mortgageFormatCurrency(jQuery("#totalAllPayment"));
    mortgageFormatCurrency(jQuery("#TaxesSpan"));
    mortgageFormatCurrency(jQuery("#propertTexVal"));
    mortgageFormatCurrency(jQuery("#homeownersInsurenceSpan"));
    mortgageFormatCurrency(jQuery("#houseInsuranceVal"));
    mortgageFormatCurrency(jQuery("#HOADuesSpan"));
    mortgageFormatCurrency(jQuery("#HOAVal"));
    mortgageFormatCurrency(jQuery("#PMIVal"));
    mortgageFormatCurrency(jQuery("#pmiSpan"));
    mortgageFormatCurrency(jQuery("#extraPaymentSpan"));
    mortgageFormatCurrency(jQuery("#extraPaymentVal"));
    mortgageFormatCurrency(jQuery("#totalInsuranceTex"));
    mortgageFormatCurrency(jQuery("#totalExtraPayment"));
    mortgageFormatCurrency(jQuery("#PrincipalIntrestVal"));
  }
}

function vaAllElementCurrencyRefresh() {
  if ( jQuery('.payment-calculator-main').length > 0 ) {
    mortgageFormatCurrency(jQuery("input#VAHomePrice"));
    mortgageFormatCurrency(jQuery("input#VADownPayment"));
    mortgageFormatCurrency(jQuery("input#VAMortageAmount"));
    mortgageFormatCurrency(jQuery("input#finalMortageLoanAmount"));
    mortgageFormatCurrency(jQuery("input#VAPropertyTax"));
    mortgageFormatCurrency(jQuery("input#VAHomeInsurence"));
    mortgageFormatCurrency(jQuery("input#VAHoaDues"));
    mortgageFormatCurrency(jQuery("#VAExtraPayment"));
    mortgageFormatCurrency(jQuery("#vaPrinciple"));
    mortgageFormatCurrency(jQuery("#vaTaxesSpan"));
    mortgageFormatCurrency(jQuery("#vaHomeownersInsurenceSpan"));
    mortgageFormatCurrency(jQuery("#vaHOADuesSpan"));
    mortgageFormatCurrency(jQuery("#vaExtraPaymentSpan"));
    mortgageFormatCurrency(jQuery("#vaHomeVal"));
    mortgageFormatCurrency(jQuery("#valoanAmountVal"));
    mortgageFormatCurrency(jQuery("#vaPrincipalIntrestVal"));
    mortgageFormatCurrency(jQuery("#vaExtraPaymentVal"));
    mortgageFormatCurrency(jQuery("#vaPropertyTex"));
    mortgageFormatCurrency(jQuery("#vaHouseInsurance"));
    mortgageFormatCurrency(jQuery("#vaHOAV"));
    mortgageFormatCurrency(jQuery("#vaTotalDownPayment"));
    mortgageFormatCurrency(jQuery("#vaTotalPrincipalAmount"));
    mortgageFormatCurrency(jQuery("#vaTotalExtraPayment"));
    mortgageFormatCurrency(jQuery("#vaTotalIntrestPaid"));
    mortgageFormatCurrency(jQuery("#vaTotalInsuranceTex"));
    mortgageFormatCurrency(jQuery("#vaTotalAllPayment"));
    mortgageFormatCurrency(jQuery("#vaAllPayment"));
    mortgageFormatCurrency(jQuery("#vatotalLoanAmount"));
    mortgageFormatCurrency(jQuery("#vaTotalInterestPaid"));
    mortgageFormatCurrency(jQuery("#additionalMonth"));
    mortgageFormatCurrency(jQuery("#vaPaymentAmount"));
  }
}

function refinanceAllElementCurrencyRefresh() {
  if ( jQuery('.payment-calculator-main').length > 0 ) {
    mortgageFormatCurrency(jQuery("input#originalLoanAmount"));
    mortgageFormatCurrency(jQuery("input#currentLoanBalance"));
    mortgageFormatCurrency(jQuery("input#newLoanAmount"));
    mortgageFormatCurrency(jQuery("input#cashOutAmount"));
    mortgageFormatCurrency(jQuery("input#refinanceFees"));
  }
}

function vaRefinanceAllElementCurrencyRefresh() {
  if ( jQuery('.payment-calculator-main').length > 0 ) {
    mortgageFormatCurrency(jQuery("input#VARefinanceOriginalLoanAmount"));
    mortgageFormatCurrency(jQuery("input#VARefinanceCurrentLoanBalance"));
    mortgageFormatCurrency(jQuery("input#VARefinanceNewLoanAmount"));
    mortgageFormatCurrency(jQuery("input#VARefinanceCashOutAmount"));
    mortgageFormatCurrency(jQuery("input#VARefinanceRefinanceFees"));
  }
}

//Custom Scrollbar Js start
(function ($) {
  $(window).load(function () {
    if ( $(".payment-calculator-main").length != 0 ) {
      if ( $( window).width() > 1258 ){
          $(".payment-calculator-main .calulate-form-item").mCustomScrollbar(); //apply scrollbar with your options 
        }else{
          $(".payment-calculator-main .calulate-form-item").mCustomScrollbar({autoHideScrollbar :true});
          //$(".calulate-form-item").mCustomScrollbar("destroy"); //destroy scrollbar 
        }
    }
  });
})(jQuery);

(function($){
  $(window).resize(function(){
    if ( $(".payment-calculator-main").length != 0 ) {
      if ( $( window).width() > 1258 ){
        $(".payment-calculator-main .calulate-form-item").mCustomScrollbar(); //apply scrollbar with your options 
      }else{
        $(".payment-calculator-main .calulate-form-item").mCustomScrollbar({autoHideScrollbar :true});
        //$(".calulate-form-item").mCustomScrollbar("destroy"); //destroy scrollbar 
      }
    }
  }).trigger("resize");
})(jQuery);

// Accordian
var $ = jQuery;
jQuery(document).ready(function() {
  jQuery('.rent-buy-list-item .rent-buy-list-title').on('click', function() {
      jQuery(this).next().slideToggle(300);
      jQuery(this).toggleClass('active');
  });
});

function initialVaRefinanceDatepicker(container) {
  // Destroy any existing datepickers within the specified container
  jQuery(".month-year-datepicker").datepicker("destroy");

  // Initialize the datepicker for the specified container
  jQuery(container + " .month-year-datepicker").each(function () {
    var $datepickerInput = $(this);

    $datepickerInput.datepicker({
      dateFormat: 'MM yy',
      changeMonth: true,
      changeYear: true,
      showButtonPanel: true,
      yearRange: '-30:+10',
      onClose: function (dateText, inst) {
        var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
        var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
        $datepickerInput.val($.datepicker.formatDate('MM yy', new Date(year, month, 1)));
        var dataName = $datepickerInput.data('name');
        if (dataName === 'refinance-calc') {
          refinanceCalculate();
        } else if (dataName === 'rent-vs-buy-calc') {
          rentVsBuy();
        } else if (dataName === 'va-refinance-calc') {
          vaRefinanceCalculate();
        }
      },
      onSelect: function (dateText, inst) {
        // Automatically set the selected date in the input field
        var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
        var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
        $datepickerInput.val($.datepicker.formatDate('MM yy', new Date(year, month, 1)));
      },
    });

    // Add focus event handler to position the datepicker
    $datepickerInput.focus(function () {
      $(".ui-datepicker-calendar").hide();
      $("#ui-datepicker-div").position({
        my: "center top",
        at: "center bottom",
        of: $datepickerInput,
      });
    });
  });
}

function numberWithCommas(x, decimals) {
  if (decimals === void 0) { decimals = 0; }
  return x.toFixed(decimals).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function calculateTotalInterests(principal, rate, term) {
   rate =  rate / 100 ;
  let monthlyRate = rate / 12;
  let totalPayments = term * 12;

  // Calculate monthly payment using formula
  let monthlyPayment = principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -totalPayments)));

  // Calculate total interest using formula
  let totalInterest = (monthlyPayment * totalPayments) - principal;

  return Math.round(totalInterest);
}

function getCurrentLoanRemainingInterest(loanAmount, orignalRate, monthlyPayment, startDate, currentLoanTerm, newLoanStartDate ) {
  
  var paymentRate = orignalRate / 100 / 12 ;
  var paymentInterest = 0 ;
  var numPayments = 0 ;
  var paindInterest = 0;
  var totalInterest = calculateTotalInterests(loanAmount, orignalRate, currentLoanTerm);

  // Get current date
  var currentDate = new Date(newLoanStartDate);

  // Extract current month and year
  var currentMonth = currentDate.getMonth() + 1; // add 1 because getMonth() returns a zero-based index (0 for January, 1 for February, etc.)
  var currentYear = currentDate.getFullYear();
 
  var startObjDate = new Date(startDate);
  var startMonth = startObjDate.getMonth() + 1; 
  var startYear = startObjDate.getFullYear();

  var monthDiff = (currentYear - startYear) * 12 + (currentMonth - startMonth);
  
  numPayments = monthDiff - 1;
  for (var i = 1; i <= numPayments; i++) { 
    paymentInterest = loanAmount * paymentRate;

    if (loanAmount > monthlyPayment) {
      paymentPrincipal = monthlyPayment - paymentInterest;
    }
    else {
        paymentPrincipal = loanAmount;
    }
    loanAmount -= paymentPrincipal;
    paindInterest += paymentInterest;
  }
  return Math.round(totalInterest - paindInterest);
}

var payments_per_year = 12;
var PaymentFrequency;
(function (PaymentFrequency) {
    PaymentFrequency[PaymentFrequency["Monthly"] = 0] = "Monthly";
    PaymentFrequency[PaymentFrequency["BiWeekly"] = 1] = "BiWeekly";
    PaymentFrequency[PaymentFrequency["AcceleratedBiWeekly"] = 2] = "AcceleratedBiWeekly";
})(PaymentFrequency = PaymentFrequency || (PaymentFrequency = {}));
var MortgageProductType;
(function (MortgageProductType) {
    MortgageProductType[MortgageProductType["ThirtyFixed"] = 1] = "ThirtyFixed";
    MortgageProductType[MortgageProductType["FifteenFixed"] = 2] = "FifteenFixed";
    MortgageProductType[MortgageProductType["ThirtyFha"] = 3] = "ThirtyFha";
    MortgageProductType[MortgageProductType["ThirtyJumbo"] = 4] = "ThirtyJumbo";
    MortgageProductType[MortgageProductType["FiveOneArm"] = 5] = "FiveOneArm";
    MortgageProductType[MortgageProductType["OneArm"] = 6] = "OneArm";
    MortgageProductType[MortgageProductType["ThirtyVa"] = 7] = "ThirtyVa";
})(MortgageProductType = MortgageProductType || (MortgageProductType = {}));
var PaymentDetails = (function () {
  function PaymentDetails() {
      this.paymentFrequency = PaymentFrequency.Monthly;
      this.monthlyPmi = 0;
      this.totalPmi = 0;
      this.pointsAmount = 0;
      this.prepaids = 0;
      this.aprCosts = 0;
      this.nonAprCosts = 0;
      this.effectiveRate = 0;
  }
  Object.defineProperty(PaymentDetails.prototype, "payment", {
      get: function () {
          var fixedPayment = this.monthlyPmi;
          switch (this.paymentFrequency) {
              case PaymentFrequency.BiWeekly:
              case PaymentFrequency.AcceleratedBiWeekly:
                  return (this.monthlyPayment / 2) + (fixedPayment / 2);
          }
          return this.monthlyPayment + fixedPayment;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentDetails.prototype, "total", {
      get: function () {
          return this.interest + this.principal + this.totalPmi +
              this.pointsAmount + this.prepaids + this.aprCosts + this.nonAprCosts;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentDetails.prototype, "totalAmountPaid", {
      get: function () {
          return this.total + this.downPayment;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentDetails.prototype, "downPayment", {
      get: function () {
          var _a, _b;
          return (((_a = this.input) === null || _a === void 0 ? void 0 : _a.homeValue) || 0) - (((_b = this.input) === null || _b === void 0 ? void 0 : _b.amount) || 0);
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentDetails.prototype, "totalLoanAmount", {
      get: function () {
          return this.input.financeUpfrontCosts ?
              this.input.amount + this.aprCosts + this.nonAprCosts + this.pointsAmount :
              this.input.amount;
      },
      enumerable: false,
      configurable: true
  });
  return PaymentDetails;
}());


var Payment = (function () {
  function Payment() {
      this.principal = 0;
      this.interest = 0;
      this.insurance = 0;
      this.tax = 0;
      this.hoa = 0;
      this.pmi = 0;
  }
  Object.defineProperty(Payment.prototype, "basePayment", {
      get: function () {
          return this.principalInterest + this.pmi;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(Payment.prototype, "totalPayment", {
      get: function () {
          return this.basePayment + this.insurance + this.hoa + this.tax;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(Payment.prototype, "pitiPayment", {
      get: function () {
          return this.principalInterest + this.insurance + this.tax;
      },
      enumerable: false,
      configurable: true
  });
  return Payment;
}());
var AmortizationSchedule = (function () {
  function AmortizationSchedule() {
  }
  Object.defineProperty(AmortizationSchedule.prototype, "firstPayment", {
      get: function () {
          if (this.payments != null && this.payments.length > 0) {
              return this.payments[0];
          }
          return null;
      },
      enumerable: false,
      configurable: true
  });
  return AmortizationSchedule;
}());
var PaymentInput = (function () {
  function PaymentInput() {
      this.paymentExtraAmount = 0;
      this.paymentFrequency = PaymentFrequency.Monthly;
      this.points = 0;
      this.prepaids = 0;
      this.aprCosts = 0;
      this.nonAprCosts = 0;
      this.interestOnlyTermYears = 0;
      this.financeUpfrontCosts = true;
      this.cashToClose = 0;
  }
  Object.defineProperty(PaymentInput.prototype, "numPayments", {
      get: function () {
          return this.years * this.paymentsPerYear;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentInput.prototype, "paymentRate", {
      get: function () {
          return this.rate / 100 / this.interestPeriodsPerYear;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentInput.prototype, "paymentInsurance", {
      get: function () {
          var _a;
          return ((_a = this.insurance) !== null && _a !== void 0 ? _a : 0) / this.paymentsPerYear;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentInput.prototype, "paymentTax", {
      get: function () {
          var _a;
          return ((_a = this.tax) !== null && _a !== void 0 ? _a : 0) / this.paymentsPerYear;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentInput.prototype, "paymentHoa", {
      get: function () {
          var _a;
          return ((_a = this.hoa) !== null && _a !== void 0 ? _a : 0) / this.paymentsPerYear;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentInput.prototype, "paymentsPerYear", {
      get: function () {
          switch (this.paymentFrequency) {
              case PaymentFrequency.Monthly:
                  return 12;
              case PaymentFrequency.BiWeekly:
              case PaymentFrequency.AcceleratedBiWeekly:
                  return 26;
          }
          return 0;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentInput.prototype, "interestPeriodsPerYear", {
      get: function () {
          switch (this.paymentFrequency) {
              case PaymentFrequency.Monthly:
                  return 12;
              case PaymentFrequency.BiWeekly:
                  return 26;
              case PaymentFrequency.AcceleratedBiWeekly:
                  return 24;
          }
          return 0;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(PaymentInput.prototype, "startDate", {
      get: function () {
          var startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          if (this.monthStart != null && this.yearStart != null) {
              if (this.monthStart < 1 || this.monthStart > 12) {
                  this.monthStart = startDate.getMonth();
              }
              if (this.yearStart < 1970) {
                  this.yearStart = startDate.getFullYear();
              }
              startDate = new Date(this.yearStart, this.monthStart - 1);
          }
          return startDate;
      },
      enumerable: false,
      configurable: true
  });
  PaymentInput.prototype.getPaymentDate = function (paymentNumber) {
      if (this.startDate == null) {
          return null;
      }
      var paymentDate = new Date(this.startDate.getTime());
      switch (this.paymentFrequency) {
          case PaymentFrequency.Monthly:
              paymentDate.setMonth(paymentDate.getMonth() + paymentNumber);
              break;
          case PaymentFrequency.BiWeekly:
          case PaymentFrequency.AcceleratedBiWeekly:
              paymentDate.setDate(paymentDate.getDate() + (paymentNumber * 14));
              break;
      }
      return paymentDate;
  };
  return PaymentInput;
}());
var ExtraPaymentInput = (function () {
  function ExtraPaymentInput() {
      this.extraPayment = 0;
  }
  return ExtraPaymentInput;
}());
var RentVsBuyPurchaseInput = (function () {
  function RentVsBuyPurchaseInput() {
      this.taxRate = 0.0;
      this.annualMaintenanceCostsPct = 0.0;
      this.sellingCostsPct = 0.0;
      this.annualAppreciationPct = 0.0;
  }
  return RentVsBuyPurchaseInput;
}());
var RentVsBuyRentInput = (function () {
  function RentVsBuyRentInput() {
      this.monthlyRent = 0.0;
      this.rentersInsurancePct = 0.0;
      this.rentDeposit = 0.0;
      this.rentAppreciation = 0.0;
  }
  return RentVsBuyRentInput;
}());
var RentVsBuyResultsData = (function () {
  function RentVsBuyResultsData() {
      this.paymentNumber = 0.0;
      this.interest = 0.0;
      this.principal = 0.0;
      this.totalPrincipal = 0.0;
      this.pmi = 0.0;
      this.totalPmi = 0.0;
      this.hoa = 0.0;
      this.totalHoa = 0.0;
      this.tax = 0.0;
      this.totalTax = 0.0;
      this.insurance = 0.0;
      this.totalInsurance = 0.0;
      this.purchaseExpense = 0.0;
      this.totalPurchaseExpense = 0.0;
      this.homeValue = 0.0;
      this.appreciation = 0.0;
      this.totalAppreciation = 0.0;
      this.rent = 0.0;
      this.totalRent = 0.0;
      this.rentExpense = 0.0;
      this.totalRentExpense = 0.0;
      this.taxRate = 0.0;
      this.loanBalance = 0.0;
      this.totalCashOut = 0.0;
      this.extraPayment = 0.0;
      this.closingCostsPct = 0.0;
  }
  Object.defineProperty(RentVsBuyResultsData.prototype, "netInterest", {
      get: function () {
          return this.interest * (1 - this.taxRate);
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "netTotalInterest", {
      get: function () {
          return this.totalInterest * (1 - this.taxRate);
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "netTax", {
      get: function () {
          return this.tax * (1 - this.taxRate);
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "netTotalTax", {
      get: function () {
          return this.totalTax * (1 - this.taxRate);
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "taxSavings", {
      get: function () {
          return (this.tax + this.interest + this.pmi ) * this.taxRate;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "totalTaxSavings", {
      get: function () {
          return (this.totalTax + this.totalInterest + this.totalPmi ) * this.taxRate;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "cashOut", {
      get: function () {
          return this.extraPayment +
              this.principal +
              this.interest +
              this.insurance +
              this.tax +
              this.pmi +
              this.hoa +
              this.purchaseExpense -
              this.taxSavings;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "homeNetValue", {
      get: function () {
          return this.homeValue * (1 - this.closingCostsPct);
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "homeClosingCosts", {
      get: function () {
          return this.homeValue * this.closingCostsPct;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "paidEquity", {
      get: function () {
          return this.homeValue - this.totalAppreciation - this.loanBalance;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "netEquity", {
      get: function () {
          return this.homeValue - this.loanBalance;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "payments", {
      get: function () {
          return this.principal + this.interest + this.extraPayment;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "totalRentPrincipal", {
      get: function () {
          return this.totalPrincipal - this.totalRent;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "buyNet", {
      get: function () {
          return this.totalCashOut - (this.homeNetValue - this.loanBalance);
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "rentNet", {
      get: function () {
          return this.totalRent + this.totalRentExpense;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "rentVsBuyNet", {
      get: function () {
          return this.rentNet - this.buyNet;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "rentBetter", {
      get: function () {
          return this.rentVsBuyNet < 0;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "buyBetter", {
      get: function () {
          return this.rentVsBuyNet > 0;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "rentVsBuyCashNet", {
      get: function () {
          return this.rentNet - this.totalCashOut;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "cashRentBetter", {
      get: function () {
          return this.rentVsBuyCashNet < 0;
      },
      enumerable: false,
      configurable: true
  });
  Object.defineProperty(RentVsBuyResultsData.prototype, "cashBuyBetter", {
      get: function () {
          return this.rentVsBuyCashNet > 0;
      },
      enumerable: false,
      configurable: true
  });
  return RentVsBuyResultsData;
}());

var RentVsBuyOutput = (function () {
  function RentVsBuyOutput() {
  }
  Object.defineProperty(RentVsBuyOutput.prototype, "buyProfitableYear", {
      get: function () {
          if (!this.yearlyData || this.yearlyData.length == 0) {
              return 0;
          }
          var profitableData = this.yearlyData.find(function (yd) { return yd.buyBetter; });
          if (profitableData) {
              return profitableData.paymentNumber;
          }
          return 0;
      },
      enumerable: false,
      configurable: true
  });
  return RentVsBuyOutput;
}());
var PmiAdjustment = (function () {
  function PmiAdjustment() {
  }
  return PmiAdjustment;
}());
var PmiRate = (function () {
  function PmiRate() {
  }
  return PmiRate;
}());
function getRentVsBuyResults(paymentInput, purchaseInput, rentInput) {
  var amortization = getAmortizationSchedule(paymentInput);
  var yearlyData = [];
  var paymentsPerYear = paymentInput.paymentsPerYear;
  if (paymentsPerYear != 12) {
      return null;
  }
  var homeValue = paymentInput.homeValue;
  var totalAppreciation = 0;
  var totalPurchaseExpense = 0;
  var totalRentExpense = 0;
  var totalRent = 0;
  var totalTax = 0;
  var totalInsurance = 0;
  var totalCashOut = 0;
  var yearlyPrincipal = 0;
  var yearlyInterest = 0;
  var yearlyPmi = 0;
  var yearlyHoa = 0;
  var totalHoa = 0;
  var yearlyRent = rentInput.monthlyRent * 12.0;
  var yearlyInsurancePct = paymentInput.insurance / homeValue;
  var yearlyTaxPct = paymentInput.tax / homeValue;
  var yearNumber = 1;
  var previousHomeValue = paymentInput.homeValue;
  for (var i = 0; i < amortization.payments.length; i++) {
      var payment = amortization.payments[i];
      yearlyPrincipal += payment.principal;
      yearlyInterest += payment.interest;
      yearlyPmi += payment.pmi;
      yearlyHoa += payment.hoa;
      if (payment.paymentNumber % paymentsPerYear == 0) {
          var crntYearData = new RentVsBuyResultsData();
          if (yearNumber == 1) {
              crntYearData.extraPayment = paymentInput.homeValue - paymentInput.amount;
          }
          crntYearData.paymentNumber = yearNumber;
          crntYearData.closingCostsPct = purchaseInput.sellingCostsPct;
          crntYearData.taxRate = purchaseInput.taxRate;
          crntYearData.interest = yearlyInterest;
          crntYearData.totalInterest = payment.totalInterest;
          crntYearData.principal = yearlyPrincipal;
          crntYearData.totalPrincipal = payment.totalPrincipal;
          crntYearData.pmi = yearlyPmi;
          crntYearData.totalPmi = payment.totalPmi;
          crntYearData.tax = homeValue * yearlyTaxPct;
          totalTax += crntYearData.tax;
          crntYearData.totalTax = totalTax;
          crntYearData.insurance = homeValue * yearlyInsurancePct;
          totalInsurance += crntYearData.insurance;
          crntYearData.totalInsurance = totalInsurance;
          crntYearData.hoa = yearlyHoa;
          totalHoa += crntYearData.hoa;
          crntYearData.totalHoa = totalHoa;
          crntYearData.rent = yearlyRent;
          totalRent += yearlyRent;
          crntYearData.totalRent = totalRent;
          crntYearData.rentExpense = yearlyRent * rentInput.rentersInsurancePct;
          totalRentExpense += crntYearData.rentExpense;
          crntYearData.totalRentExpense = totalRentExpense;
          crntYearData.purchaseExpense = homeValue * purchaseInput.annualMaintenanceCostsPct;
          totalPurchaseExpense += crntYearData.purchaseExpense;
          crntYearData.totalPurchaseExpense = totalPurchaseExpense;
          crntYearData.loanBalance = payment.balance;
          totalCashOut += crntYearData.cashOut;
          crntYearData.totalCashOut = totalCashOut;
          previousHomeValue = homeValue;
          homeValue = homeValue + (homeValue * purchaseInput.annualAppreciationPct);
          crntYearData.homeValue = homeValue;
          crntYearData.appreciation = homeValue - previousHomeValue;
          totalAppreciation += crntYearData.appreciation;
          crntYearData.totalAppreciation = totalAppreciation;
          yearlyData.push(crntYearData);
          yearNumber++;
          yearlyRent = yearlyRent + (yearlyRent * rentInput.rentAppreciation);
          yearlyPmi = 0;
          yearlyPrincipal = 0;
          yearlyInterest = 0;
          yearlyHoa = 0;
      }
  }
  var output = new RentVsBuyOutput();
  output.purchaseAmortization = amortization;
  output.yearlyData = yearlyData;
  return output;
}
function getAmortizationSchedule(input) {
  var paymentInfo = calcSimplePayment(input);
  var payments = Array();
  var paymentPrincipal = 0;
  var paymentInterest = 0;
  var totalPrincipal = 0;
  var totalPmi = 0;
  var balance = paymentInfo.totalLoanAmount;
  var totalInterest = 0;
  var payment = 0;
  var startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  var pmiPayments = [];
  var extraPayments = calculateExtraPayments(input);
  var homeValue = input.homeValue > 0 ? input.homeValue : input.amount;
  if (input.monthStart != null && input.yearStart != null) {
      startDate = new Date(input.yearStart, input.monthStart - 1);
  }
  var pmiPayment = 0;
  if (input.includePmi && input.pmiAdjustment && input.pmiAdjustment.pmiRate && input.pmiAdjustment.pmiRate.rate) {
      pmiPayment = getPmiPayment(input.pmiAdjustment, input.amount, input.paymentFrequency);
  }
  var interestOnlylMonths = input.interestOnlyTermYears > 0 ? input.interestOnlyTermYears * input.paymentsPerYear : 0;

  for (var i = 1; i <= input.numPayments; i++) {
      if (balance <= 0) {
          break;
      }
      
      paymentInterest = balance * input.paymentRate;
      payment = paymentInfo.payment;
      var extraPayment = 0;
      if (extraPayments[i] != null) {
          extraPayment = extraPayments[i];
      }
      
      if (i > interestOnlylMonths) {
          if (balance > payment) {
              paymentPrincipal = paymentInfo.payment + extraPayment - paymentInterest;
          }
          else {
              paymentPrincipal = balance;
          }
      }
      payment = paymentInterest + paymentPrincipal;
      var paymentDate = input.getPaymentDate(i);
      balance -= paymentPrincipal;
      totalInterest += paymentInterest;
      totalPrincipal += paymentPrincipal;
      var newLtv = balance / homeValue;
      if (balance <= 0) {
          balance = 0;
          var monthlyPayment = paymentInfo.monthlyPayment;
          paymentInfo = new PaymentDetails();
          paymentInfo.interest = totalInterest;
          paymentInfo.principal = totalPrincipal;
          paymentInfo.monthlyPayment = monthlyPayment;
          paymentInfo.startDate = startDate;
          paymentInfo.payoffDate = paymentDate;
          paymentInfo.paymentFrequency = input.paymentFrequency;
          paymentInfo.extraPayment = input.extraPayment;
          paymentInfo.input = input;
          paymentInfo.aprCosts = input.aprCosts;
          paymentInfo.nonAprCosts = input.nonAprCosts;
          paymentInfo.prepaids = input.prepaids;
          paymentInfo.pointsAmount = input.amount * (input.points / 100.0);
          paymentInfo.effectiveRate = calculateEffectiveRate(input.amount, input.numPayments, input.rate, paymentInfo.aprCosts + paymentInfo.pointsAmount, totalPmi);
      }
      
      var crntPayment = new Payment();
      crntPayment.paymentNumber = i;
      crntPayment.principal = paymentPrincipal;
      crntPayment.interest = paymentInterest;
      crntPayment.insurance = input.paymentInsurance;
      crntPayment.tax = input.paymentTax;
      crntPayment.hoa = input.paymentHoa;
      crntPayment.principalInterest = payment;
      crntPayment.balance = balance;
      crntPayment.paymentDate = paymentDate;
      crntPayment.totalInterest = totalInterest;
      crntPayment.totalPrincipal = totalPrincipal;
      crntPayment.extraAmount = extraPayment;
      if (pmiPayment > 0 && newLtv > .78) {
          pmiPayments.push(pmiPayment);
          crntPayment.pmi = pmiPayment;
          totalPmi += pmiPayment;
      }
      crntPayment.totalPmi = totalPmi;
      payments.push(crntPayment);
      if (balance <= 0) {
          break;
      }
  }
  if (pmiPayments.length > 0) {
      paymentInfo.monthlyPmi = pmiPayment;
      paymentInfo.totalPmi = pmiPayments.reduce(function (sum, current) { return sum + current; }, 0);
  }
  paymentInfo.effectiveRate = calculateEffectiveRate(input.amount, input.numPayments, input.rate, paymentInfo.aprCosts + paymentInfo.pointsAmount, paymentInfo.totalPmi);
  var schedule = new AmortizationSchedule();
  schedule.input = input;
  schedule.paymentInfo = paymentInfo;
  schedule.payments = payments;
return schedule;
}
function calcSimplePayment(input) {
  var monthsPerYear = 12;
  var monthlyPaymentRate = input.rate / 100 / monthsPerYear;
  var monthlyNumPayments = input.years * monthsPerYear;
  if (input.interestOnlyTermYears > 0) {
      monthlyNumPayments -= (input.interestOnlyTermYears * monthsPerYear);
  }

  var pointsAmount = input.amount * (input.points / 100.0);
  var totalLoanAmount = input.financeUpfrontCosts ?
      input.amount + input.aprCosts + input.nonAprCosts + pointsAmount:
      input.amount;
      
  var monthlyPaymentAmount = monthlyPaymentRate === 0 ? totalLoanAmount / input.paymentsPerYear :
      totalLoanAmount * monthlyPaymentRate * (Math.pow(1 + monthlyPaymentRate, monthlyNumPayments)) / (Math.pow(1 + monthlyPaymentRate, monthlyNumPayments) - 1);
  var total = monthlyPaymentAmount * monthlyNumPayments;
  var startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  if (input.monthStart != null && input.yearStart != null) {
      startDate = new Date(input.yearStart, input.monthStart - 1);
  }

  var payoffDate = input.getPaymentDate(input.numPayments);
  var paymentInfo = new PaymentDetails();
  paymentInfo.interest = total - totalLoanAmount;
  paymentInfo.principal = totalLoanAmount;
  paymentInfo.monthlyPayment = monthlyPaymentAmount;
  paymentInfo.startDate = startDate;
  paymentInfo.payoffDate = payoffDate;
  paymentInfo.paymentFrequency = input.paymentFrequency;
  paymentInfo.extraPayment = input.extraPayment;
  paymentInfo.input = input;
  paymentInfo.aprCosts = input.aprCosts;
  paymentInfo.nonAprCosts = input.nonAprCosts;
  paymentInfo.prepaids = input.prepaids;
  paymentInfo.pointsAmount = pointsAmount;
  paymentInfo.effectiveRate = calculateEffectiveRate(input.amount, input.numPayments, input.rate, paymentInfo.aprCosts + paymentInfo.pointsAmount);
return paymentInfo;
}
function calculateEffectiveRate(loanAmount, numPayments, baseAnnualRate, costs, totalPmi) {
if (totalPmi === void 0) { totalPmi = 0; }
  var rate = baseAnnualRate / 100 / 12;
  var totalmonthlypayment = (((loanAmount + costs) * rate * Math.pow((1.0 + rate), numPayments)) / (Math.pow((1.0 + rate), numPayments) - 1));
  if (totalPmi > 0) {
      totalmonthlypayment += (totalPmi / numPayments);
  }
  var testRate = rate;
  var iteration = 1;
  var testresult = 0.0;
  var testdiff = testRate;
  while (iteration <= 100) {
      testresult = ((testRate * Math.pow(1 + testRate, numPayments)) / (Math.pow(1 + testRate, numPayments) - 1)) - (totalmonthlypayment / loanAmount);
      if (Math.abs(testresult) < 0.0000001)
          break;
      if (testresult < 0) {
          testRate += testdiff;
      }
      else {
          testRate -= testdiff;
      }
      testdiff = testdiff / 2;
      iteration++;
  }
  testRate = testRate * 12.0;
  return testRate;
}
function calculateExtraPayments(input) {
  var payments = {};
  if (input.extraPayment == null) {
      return payments;
  }
  var startPayment = 1;
  if (input.monthStart != input.extraPayment.extraPaymentMonthStart || input.yearStart != input.extraPayment.extraPaymentYearStart) {
      var loanStartDate = new Date(input.yearStart, input.monthStart - 1);
      var epStartDate = new Date(input.extraPayment.extraPaymentYearStart, input.extraPayment.extraPaymentMonthStart - 1);
      var dateDiff = moment.duration(moment(epStartDate)
          .diff(moment(loanStartDate)));
      startPayment = Math.round(dateDiff.asDays() / (365.25 / 12));
  }
  var totalPayments = input.years * 12;
  var interval = 0;
  switch (input.extraPayment.extraPaymentFrequency) {
      case ExtraPaymentFrequency.annually:
          interval = 12;
          break;
      case ExtraPaymentFrequency.quarterly:
          interval = 4;
          break;
      case ExtraPaymentFrequency.monthly:
          interval = 1;
          break;
      case ExtraPaymentFrequency.oneTime:
          payments[startPayment] = input.extraPayment.extraPayment;
          return payments;
  }
  if (interval == 0) {
      return payments;
  }
  for (var i = startPayment; i <= totalPayments; i += interval) {
      payments[i] = input.extraPayment.extraPayment;
  }
  return payments;
}
function getPmiPayment(pmiAdjustment, loanAmount, paymentFrequency) {
  if (paymentFrequency === void 0) { paymentFrequency = PaymentFrequency.Monthly; }
  var yearlyPayments = 12.0;
  if (paymentFrequency == PaymentFrequency.BiWeekly || paymentFrequency == PaymentFrequency.AcceleratedBiWeekly) {
    yearlyPayments = 24.0;
  }
  return loanAmount * pmiAdjustment.pmiRate.rate / yearlyPayments;
}

$( document ).ready(function() {
  $(document).on("change", "#rentBuyDownPayment", function () {
    downPayment = $(this).val();
    $('.rent-buy-left-wrapper #slider1').attr('data-year',0);
    if ( downPayment == '') {
      $(this).val('$0');
    }
    downPayment = Number(downPayment.replace(/[^0-9.-]+/g, ""));
    validationForDownPayment(downPayment, homePrice);
    rentVsBuy();
  });
 
  $(document).on("change", " #rentHomePrice, #rentHomeInsurance, #rentTaxes, #rentHoaDues, #rentMonthlyAmount", function () {
    var newVal = $(this).val();
    newVal   = ( newVal != '' ) ? parseFloat( newVal.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
    var max = $(this).attr('max');
    max = parseFloat(max);
    $('.rent-buy-left-wrapper #slider1').attr('data-year',0);
    if ( newVal > max  ) {
      $(this).val(max);
    } else if ( isNaN(newVal)) {
      
      $(this).val(max);
    }
    rentVsBuy();
    
  });

  $(document).on("change", "#rentCurrentInterestRate, #rentBuyPMI, #marginalTaxBracket, #rentAnnualCosts, #rentSellingCosts, #annualAppreciation, #rentersInsurance, #rentAppreciation", function () {
    var number = $(this).val();
    var min = $(this).attr('min');
    var max = $(this).attr('max');
    min = parseFloat(min);
    max = parseFloat(max);
    $('.rent-buy-left-wrapper #slider1').attr('data-year',0);
    if ( parseFloat(number) < min ) {
        $(this).val(min);
    } else if ( parseFloat(number) > max ) {
      $(this).val(max);
    }
    rentVsBuy();
   
  });
  $(document).on("change", "#rentNewLoanTerm", function () {
    var newVal = $(this).val();
    $('.rent-buy-left-wrapper #slider1').attr('data-year',0);
    if ( newVal == '' ) {
        $(this).val(0);
    }
    rentVsBuy();
   
  });
  $(document).on("change", "#rentBuyDownPayment", function () {
    var rentHomePrice             = jQuery('#rentHomePrice').val();
    rentHomePrice           = ( rentHomePrice != '' ) ? parseFloat( rentHomePrice.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
    $('.rent-buy-left-wrapper #slider1').attr('data-year',0);
    downPayment = $(this).val();
    if ( downPayment == '') {
      $(this).val('$0');
    }
    downPayment = Number(downPayment.replace(/[^0-9.-]+/g, ""));
    validationForDownPayment(downPayment, rentHomePrice);
    rentVsBuy();
  });
});

function rentVsBuy(){
  var rentHomePrice             = jQuery('#rentHomePrice').val();
  var rentBuyDownPayment        = jQuery('#rentBuyDownPayment').val();
  var rentLoanPayment           = jQuery('#rentLoanPayment').val();
  var rentCurrentInterestRate   = jQuery('#rentCurrentInterestRate').val();
  var rentNewLoanTerm           = jQuery('#rentNewLoanTerm').val();
  var loanStartDate             = jQuery('.buy-loan-start-date').val();
  var rentBuyPMI                = jQuery('#rentBuyPMI').val();

  var rentHomeInsurance         = jQuery('#rentHomeInsurance').val();
  var rentTaxes                 = jQuery('#rentTaxes').val();
  var rentHoaDues               = jQuery('#rentHoaDues').val();

  var marginalTaxBracket        = jQuery('#marginalTaxBracket').val();
  var rentAnnualCosts           = jQuery('#rentAnnualCosts').val();
  var rentSellingCosts          = jQuery('#rentSellingCosts').val();
  var annualAppreciation        = jQuery('#annualAppreciation').val();

  var rentMonthlyAmount         = jQuery('#rentMonthlyAmount').val();
  var rentersInsurance          = jQuery('#rentersInsurance').val();
  var rentAppreciation          = jQuery('#rentAppreciation').val();
  var sliderYear                = jQuery('.rent-buy-left-wrapper #slider1').attr('data-year');
  
  rentHomePrice           = ( rentHomePrice != '' ) ? parseFloat( rentHomePrice.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentBuyDownPayment      = ( rentBuyDownPayment != '' ) ? parseFloat( rentBuyDownPayment.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentLoanPayment         = ( rentLoanPayment != '' ) ? parseFloat( rentLoanPayment.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentCurrentInterestRate = ( rentCurrentInterestRate != '' ) ? parseFloat( rentCurrentInterestRate.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentNewLoanTerm         = ( rentNewLoanTerm != '' ) ? parseFloat( rentNewLoanTerm.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentBuyPMI              = ( rentBuyPMI != '' ) ? parseFloat( rentBuyPMI.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;

  rentHomeInsurance       = ( rentHomeInsurance != '' ) ? parseFloat( rentHomeInsurance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentTaxes               = ( rentTaxes != '' ) ? parseFloat( rentTaxes.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentHoaDues             = ( rentHoaDues != '' ) ? parseFloat( rentHoaDues.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;

  marginalTaxBracket      = ( marginalTaxBracket != '' ) ? parseFloat( marginalTaxBracket.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentAnnualCosts         = ( rentAnnualCosts != '' ) ? parseFloat( rentAnnualCosts.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentSellingCosts        = ( rentSellingCosts != '' ) ? parseFloat( rentSellingCosts.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  annualAppreciation      = ( annualAppreciation != '' ) ? parseFloat( annualAppreciation.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;

  rentMonthlyAmount       = ( rentMonthlyAmount != '' ) ? parseFloat( rentMonthlyAmount.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentersInsurance        = ( rentersInsurance != '' ) ? parseFloat( rentersInsurance.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;
  rentAppreciation        = ( rentAppreciation != '' ) ? parseFloat( rentAppreciation.replace("$", "").replace(/[^0-9.-]+/g, "") ) : 0;

  sliderYear              = ( sliderYear != '' ) ? parseInt( sliderYear ) : 0;
  if (jQuery('#rentNewLoanTerm').hasClass("month")) {
    rentNewLoanTerm = rentNewLoanTerm / 12;
  }

  if (jQuery("#rentBuyDownPayment").hasClass("percentage")) {
    rentBuyDownPayment = (rentBuyDownPayment / 100) * rentHomePrice;
    rentBuyDownPayment = Math.round(rentBuyDownPayment);
  }

  rentLoanPayment = parseInt(Math.round(rentHomePrice - rentBuyDownPayment));
  jQuery('#rentLoanPayment').val(rentLoanPayment);
  
   
  loanStartDate = new Date(loanStartDate);
  // Extract  month and year
  var startMonth = loanStartDate.getMonth() + 1; 
  var startYear = loanStartDate.getFullYear();

  var input = new PaymentInput();
  input.amount = rentLoanPayment;
  input.homeValue = rentHomePrice;
  input.rate = rentCurrentInterestRate;
  input.years = rentNewLoanTerm;
  input.insurance = rentHomeInsurance;
  input.tax = rentTaxes;
  input.hoa = rentHoaDues;
  input.monthStart = startMonth;
  input.yearStart = startYear;
  input.productType = NaN;
  input.includePmi = true;
  if (input.includePmi) {
    if (rentBuyPMI) {
        input.pmiAdjustment = new PmiAdjustment();
        input.pmiAdjustment.pmiRate = new PmiRate();
        input.pmiAdjustment.pmiRate.rate = rentBuyPMI / 100.0;
    }
  }
  var purchaseInput = new RentVsBuyPurchaseInput();
  purchaseInput.annualAppreciationPct = annualAppreciation / 100.0;
  purchaseInput.annualMaintenanceCostsPct = rentAnnualCosts / 100.0;
  purchaseInput.taxRate = marginalTaxBracket / 100.0;
  purchaseInput.sellingCostsPct = rentSellingCosts / 100.0;

  var rentInput = new RentVsBuyRentInput();
  rentInput.monthlyRent = rentMonthlyAmount;
  rentInput.rentAppreciation = rentAppreciation / 100.0;
  rentInput.rentersInsurancePct = rentersInsurance / 100.0;
  var rentVsBuyOutput = getRentVsBuyResults( input, purchaseInput, rentInput );
  var paymentIndex = rentVsBuyOutput.buyProfitableYear;
  var newPaymentIndex = 0;
  if ( sliderYear !== 0 ) {
    newPaymentIndex = sliderYear;
  } else if (paymentIndex != null) { 
    newPaymentIndex = paymentIndex;
  }
  jQuery( ".rent-buy-left-wrapper #slider1" ).slider({
    value: newPaymentIndex
  });
  jQuery('.rent-buy-left-wrapper #slider-years').html((newPaymentIndex + ' years') );
  jQuery(".rent-buy-left-wrapper .ui-slider-handle").html(newPaymentIndex);
  jQuery(".rent-buy-right-wrapper .rvb-year h2").html(newPaymentIndex).counterUp({
    delay: 3,
    time: 400
  });
  jQuery(".rent-vs-buy-description>span .years").html(newPaymentIndex);
  jQuery(".rent-vs-buy-description>span .profit-year").html(paymentIndex);
  var rentVsBuyResults = rentVsBuyOutput.yearlyData;
  var paymentResult = rentVsBuyResults[newPaymentIndex - 1];
  var totalCashOut     = paymentResult.totalCashOut;
  var homeValue     = paymentResult.homeValue;
  var loanBalance  = paymentResult.loanBalance;
  var homeClosingCosts  = paymentResult.homeClosingCosts;
  var buyNet  = paymentResult.buyNet;
  var rentNet  = paymentResult.rentNet;
  var netEquity = paymentResult.netEquity
  var rentVsBuyCashNet = paymentResult.rentVsBuyCashNet
  var diffNet = parseInt(Math.round( rentNet )) - parseInt(Math.round( buyNet ));

  if ( !isNaN(totalCashOut) ) { 
    jQuery('.rent-vs-buy-table-data .cash-spent-value td:nth-child(2) .amount').html(refinanaceFormatter.format(parseInt(Math.round(totalCashOut)))).counterUp({
      delay: 6,
      time: 1000
    });
    jQuery('.rent-vs-buy-description>span .home').html(refinanaceFormatter.format(parseInt(Math.round(totalCashOut))));
  }

  if ( !isNaN(homeValue) ) { 
    jQuery('.rent-vs-buy-table-data .home-value td:nth-child(2) .amount').html(refinanaceFormatter.format(parseInt(Math.round(homeValue)))).counterUp({
      delay: 6,
      time: 1000
    });
  }

  if ( !isNaN(loanBalance) ) { 
    jQuery('.rent-vs-buy-table-data .balance-loan-value td:nth-child(2) .amount').html(refinanaceFormatter.format(parseInt(Math.round(loanBalance)))).counterUp({
      delay: 6,
      time: 1000
    });
  }

  if ( !isNaN(homeClosingCosts) ) { 
    jQuery('.rent-vs-buy-table-data .closing-costs-value td:nth-child(2) .amount').html(refinanaceFormatter.format(parseInt(Math.round(homeClosingCosts)))).counterUp({
      delay: 6,
      time: 1000
    });
  }
  if ( !isNaN(rentHomePrice) ) {  
    jQuery('.rent-vs-buy-description>span .homeownership').html(refinanaceFormatter.format(parseInt(Math.round(rentHomePrice))));
  }
  if ( !isNaN(rentVsBuyCashNet) ) {  
    rentVsBuyCashNet = Math.abs( rentVsBuyCashNet );
    jQuery('.rent-vs-buy-description>span .renting-cost').html(refinanaceFormatter.format(parseInt(Math.round(rentVsBuyCashNet))));
  }
  if ( !isNaN(netEquity) ) {  
    jQuery('.rent-vs-buy-description>span .home-balance').html(refinanaceFormatter.format(parseInt(Math.round(netEquity))));
  }
  if ( !isNaN(buyNet) && !isNaN(rentNet) ) { 
    jQuery('.rent-buy-right-wrapper .rvb-buy h2 .amount, .rent-vs-buy-table-data .cash-savings-value td:nth-child(2) .amount').html(refinanaceFormatter.format(parseInt(Math.round(buyNet)))).counterUp({
      delay: 6,
      time: 1000
    });
    jQuery('.rent-buy-right-wrapper .rvb-rent h2 .amount, .rent-vs-buy-table-data .cash-savings-value td:nth-child(3) .amount').html(refinanaceFormatter.format(parseInt(Math.round(rentNet)))).counterUp({
      delay: 6,
      time: 1000
    });
    jQuery('.rent-vs-buy-description>span .rent-cost').html(refinanaceFormatter.format(parseInt(Math.round(rentNet))));
    jQuery('.rent-vs-buy-table-data .cash-spent-value td:nth-child(3) .amount').html(refinanaceFormatter.format(parseInt(Math.round(rentNet)))).counterUp({
      delay: 6,
      time: 1000
    });
    var rentRowWidth = (rentNet) / buyNet * 100 * .76;
    var buyWidth = buyNet / (rentNet) * 100 * .76;
    if( rentNet < buyNet ) {
      jQuery('.rvb-rent-amount .myProgress-1 #myBar').css('width', rentRowWidth.toFixed(2) + '%');
    } else {
      jQuery('.rvb-rent-amount .myProgress-1 #myBar').css('width', '100%');
    }
    if( rentNet > buyNet ) {
      jQuery('.rvb-buy-amount .myProgress-2 #myBar').css({'width': buyWidth.toFixed(2) + '%', "background-color":"#5dc76f"});
    } else {
      jQuery('.rvb-buy-amount .myProgress-2 #myBar').css({'width':'100%', "background-color":"#f8d7da"});
    }
    jQuery('.rvb-rent-amount .rent-buy-loan-info>span .amount').html(refinanaceFormatter.format(parseInt(Math.round(rentNet))));
    jQuery('.rvb-buy-amount .rent-buy-loan-info span .amount').html(refinanaceFormatter.format(parseInt(Math.round(buyNet))));

  }

  if ( !isNaN(diffNet) ) { 
    if ( diffNet > 0 ) {
      jQuery('.rent-buy-right-wrapper .rvb-buy-gain>span span').html("BUY");
      jQuery('.rent-buy-right-wrapper .rvb-buy-gain span').css({'color':'#282828'});
      jQuery('.rent-buy-right-wrapper .rvb-buy-gain>h2 span').css({'color':'#5DC76F'});
      jQuery('.rent-buy-right-wrapper .rvb-buy-gain').css({'background-color':'#EDFDEF'});
    } else {
      diffNet = Math.abs( diffNet );
      jQuery('.rent-buy-right-wrapper .rvb-buy-gain>span span').html("RENT");
      jQuery('.rent-buy-right-wrapper .rvb-buy-gain span').css({'color':'#896C74'});
      jQuery('.rent-buy-right-wrapper .rvb-buy-gain>h2 span').css({'color':'#F85A85'});
      jQuery('.rent-buy-right-wrapper .rvb-buy-gain').css({'background-color':'#FDEDF1'});
    }
    jQuery('.rent-buy-right-wrapper .rvb-buy-gain h2 .amount').html(refinanaceFormatter.format(parseInt(Math.round(diffNet)))).counterUp({
      delay: 6,
      time: 1000
    });
  }
  rentVsBuyAllElementCurrencyRefresh();
}

function rentVsBuyAllElementCurrencyRefresh() {
  if ( jQuery('.payment-calculator-main').length > 0 ) {
    mortgageFormatCurrency(jQuery("input#rentHomePrice"));
    mortgageFormatCurrency(jQuery("input#rentBuyDownPayment"));
    mortgageFormatCurrency(jQuery("input#rentLoanPayment"));
    mortgageFormatCurrency(jQuery("input#rentHomeInsurance"));
    mortgageFormatCurrency(jQuery("input#rentTaxes"));
    mortgageFormatCurrency(jQuery("input#rentHoaDues"));
    mortgageFormatCurrency(jQuery("input#rentMonthlyAmount"));
  }
}