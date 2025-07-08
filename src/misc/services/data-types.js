const { default: TValidator } = require('validator');

const isObject = (value) => typeof value === 'object'
    && value !== null 
    && !Array.isArray(value);

const isArray = (value) => Array.isArray(value);

const isInteger = (value) => Number.isInteger(Number(value));

const isFloat = (value) => Number(value) === Number(value) 
&& Number(value) % 1 !== 0;

const isNumber = (value) => typeof value === 'number' 
&& isInteger(value) 
|| isFloat(value);

const isString = (value) => typeof value === 'string';

const isDate = (dateString) => {
    // Attempt to parse the date string into a date
    const parsedDate = Date.parse(dateString);
    // Check if the parsed date is a valid date
    return !isNaN(parsedDate);
}

const isBoolean = (value) => {
    if (isString(value)) {
        return value === 'true' || value === 'false';
    }
    return typeof value === 'boolean';
}

const isEmail = (email) => isString(email) && !TValidator.isEmail(email)

const isURL = (url) =>  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(url);

const isID = value => TValidator.isMongoId(value);

const toString = value => String(value);

const toInteger = value => Number.parseInt(value, 10);

const toBoolean = value => !value;

const toFloat = value => Number.parseFloat(value);

const toArray = value => isArray(value) ? value : [value];

const toObject = value => isObject(value) ? value : { value };

const toLowerCase = (str) => str && isString(str) ? str.toLowerCase() : str;

const toUpperCase = (str) => str && isString(str) ? str.toUpperCase() : str;

const capitalize = (str) => str && isString(str) ? str.charAt(0).toUpperCase() + str.slice(1) : str; 


module.exports = {
    isEmail,
    isURL,
    isObject,
    isArray,
    isInteger,
    isFloat,
    isNumber,
    isString,
    isDate,
    isBoolean,
    toString,
    toInteger,
    toBoolean,
    toFloat,
    toArray,
    toObject,
    isID,
    toLowerCase,
    toUpperCase,
    capitalize
}
  