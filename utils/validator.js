var validator = require('validator');
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var complexity = require('complexity');
var complexityOptions = {
  uppercase    : 1,  // A through Z
  lowercase    : 1,  // a through z
  special      : 1,  // ! @ # $ & *
  digit        : 1,  // 0 through 9
  min          : 8,  // minumum number of characters
  //alphaNumeric : 1  // a through Z
  //max          : 16, // silly idea to have maximum...
  //exact        : 20  // also kinda silly
};

// Custom Modules
var log = require('./logger.js');
var widget = 'validator';
log.registerWidget(widget);

//************************************************************ Sanitizers *************************************************************// 

exports.escape = function(str) {
	try {
		return validator.escape(str);
	} catch(error) {
		log.error('|validator.escape| Unknown -> ' + error, widget);
		return false;
	}
};

exports.unescape = function(str) {
	try {
		return validator.unescape(str);
	} catch(error) {
		log.error('|validator.unescape| Unknown -> ' + error, widget);
		return false;
	}
};

exports.ltrim = function(str, numChars) {
	try {
		return validator.ltrim(str, numChars);
	} catch(error) {
		log.error('|validator.ltrim| Unknown -> ' + error, widget);
		return false;
	}
};

exports.rtrim = function(str, numChars) {
	try {
		return validator.rtrim(str, numChars);
	} catch(error) {
		log.error('|validator.rtrim| Unknown -> ' + error, widget);
		return false;
	}
};


exports.trim = function(str, numChars /* Whitespace by default */) {
	try {
		return validator.trim(str, numChars);
	} catch(error) {
		log.error('|validator.trim| Unknown -> ' + error, widget);
		return false;
	}
};

//********************************************************** STRING CHECKS ***********************************************************// 

// Trims leading and trailing whitespace first
exports.checkNull = function(str) {
	try {
		return (str === undefined) || (str === null) || validator.isNull(this.trim(str));
	} catch(error) {
		log.error('|validator.checkNull| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkContains = function(str, seed) {
	try {
		return validator.contains(str, seed);
	} catch(error) {
		log.error('|validator.checkContains| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkEquals = function(str, comparison) {
	try {
		return validator.equals(str, comparison);
	} catch(error) {
		log.error('|validator.checkEquals| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkLength = function(str, min, max) {
	try {
		return validator.isLength(str, {min: min, max: max});
	} catch(error) {
		log.error('|validator.checkLength| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkLowercase = function(str) {
	try {
		return validator.isLowercase(str);
	} catch(error) {
		log.error('|validator.checkLowercase| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkUppercase = function(str) {
	try {
		return validator.isUppercase(str);
	} catch(error) {
		log.error('|validator.checkUppercase| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkNumeric = function(str) {
	try {
		return validator.isNumeric(str);
	} catch(error) {
		log.error('|validator.checkNumeric| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkAlpha = function(str) {
	try {
		return validator.isAlpha(str);
	} catch(error) {
		log.error('|validator.checkAlpha| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkAlphanumeric = function(str) {
	try {
		return validator.isAlphanumeric(str);
	} catch(error) {
		log.error('|validator.checkAlphanumeric| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkArrayContains = function(str, array) {
	try {
		return validator.isIn(str, array) ;
	} catch(error) {
		log.error('|validator.checkArrayContains| Unknown -> ' + error, widget);
		return false;
	}
};

//****************************************************** VARIABLE TYPE CHECKS ******************************************************// 

exports.checkDate = function(dateStr) {
	try {
		return validator.isDate(dateStr);
	} catch(error) {
		log.error('|validator.checkDate| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkInt = function(intStr) {
	try {
		return validator.isInt(intStr);
	} catch(error) {
		log.error('|validator.checkInt| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkIntRange = function(intStr, min, max) {
	try {
		return validator.isInt(intStr, {min: min, max: max});
	} catch(error) {
		log.error('|validator.checkIntRange| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkDecimal = function(decimalStr) {
	try {
		return validator.isDecimal(decimalStr);
	} catch(error) {
		log.error('|validator.checkDecimal| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkBoolean = function(booleanStr) {
	try {
		return validator.isBoolean(booleanStr);
	} catch(error) {
		log.error('|validator.checkBoolean| Unknown -> ' + error, widget);
		return false;
	}
};

//*********************************************************** DATE CHECKS **********************************************************// 

exports.checkAfter = function(firstDate, secondDate) {
	try {
		return validator.isAfter(firstDate, secondDate);
	} catch(error) {
		log.error('|validator.checkAfter| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkBefore = function(firstDate, secondDate) {
	try {
		return validator.isBefore(firstDate, secondDate);
	} catch(error) {
		log.error('|validator.checkBefore| Unknown -> ' + error, widget);
		return false;
	}
};

//********************************************************  SPECIAL CHECKS *********************************************************// 

exports.checkEmptyObject = function (object) {
	for(var i in object) { return false; } return true;
};

exports.checkJSON = function(jsonStr) {
	try {
		return validator.isJSON(jsonStr);
	} catch(error) {
		log.error('|validator.checkJSON| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkMongoId = function(mongoId) {
	try {
		return validator.isMongoId(mongoId);
	} catch(error) {
		log.error('|validator.checkMongoId| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkEmail = function(emailAddress) {
	try {
		return validator.isEmail(emailAddress, { allow_display_name: false, allow_utf8_local_part: true, require_tld: true });
	} catch(error) {
		log.error('|validator.checkEmail| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkMobilePhone = function(phoneNumber) {
	try {
		if (phoneNumber[0] != '+') {
			phoneNumber = '+' + phoneNumber;
		}

		return phoneUtil.isValidNumber(phoneUtil.parse(phoneNumber));
	} catch(error) {
		log.error('|validator.checkMobilePhone| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkCreditCard = function(creditCard) {
	try {
		return validator.isCreditCard(creditCard);
	} catch(error) {
		log.error('|validator.checkCreditCard| Unknown -> ' + error, widget);
		return false;
	}
};

exports.checkCurrency = function(currency) {
	try {
		return validator.isCurrency(currency, { symbol: '$', require_symbol: false, allow_space_after_symbol: false, symbol_after_digits: false, 
												allow_negatives: true, parens_for_negatives: false, negative_sign_before_digits: false, 
												negative_sign_after_digits: false, allow_negative_sign_placeholder: false, thousands_separator: ',', 
												decimal_separator: '.', allow_space_after_digits: false });
	} catch(error) {
		log.error('|validator.checkCurrency| Unknown -> ' + error, widget);
		return false;
	}
};

/* Returns object 
{
	uppercase : true,
	lowercase : true,
	special   : false,
	digit     : false,
	min       : true,
}
*/
exports.checkPasswordComplexity = function(password) {
	try {
		return complexity.checkError(password, complexityOptions);
	} catch (error) {
		log.error('|validator.checkPasswordComplexity| Unknown -> ' + error, widget);
		return { result: false };
	}
};



