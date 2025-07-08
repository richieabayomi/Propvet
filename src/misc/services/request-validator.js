const BadRequestError = require('../errors/BadRequestError');
const {
    isURL,
    isObject,
    isArray,
    isInteger,
    isFloat,
    isString,
    isDate,
    isBoolean,
    toString,
    toInteger,
    toBoolean,
    toFloat,
    toArray,
    toObject,
    isEmail,
    isID,
    toLowerCase,
    toUpperCase,
    capitalize
} = require('./data-types');

const joinAndFormatList = (list) => {
    let listItems = list.join(', ');
    return listItems.replace(/,([^,]*)$/, ', or$1');
}

const validateDataType = (name, valueType, value) => {
    switch (valueType) {
        case 'array':
            if (!isArray(value)) {
                throw new BadRequestError(`Invalid ${name}! It should be a string.`);
            }
            break;
        case 'object':
            if (!isObject(value)) {
                throw new BadRequestError(`Invalid ${name}! It should be an object.`);
            }
            break;
        case 'integer':
            if (!isInteger(value)) {
                throw new BadRequestError(`Invalid ${name}! It should be an integer value.`);
            }
            break;
        case 'float':
            if (!isFloat(value)) {
                throw new BadRequestError(`Invalid ${name}! It should be a float value.`);
            }
            break;
        case 'string':
            if (!isString(value)) {
                throw new BadRequestError(`Invalid ${name}! It should be a string.`);
            }
            break;
        case 'id':
            if (!isID(value)) {
                throw new BadRequestError(`Invalid ${name}! It should be a valid mongo ID.`);
            }
            break;
        case 'date':
            if (!isDate(value) && !(new Date(value) instanceof Date)) {
                throw new BadRequestError(`Invalid ${name}! It should be valid date such as 2023-01-10, 2023-01-10T10:30:00 etc.`);
            }
            break;
        case 'url':
            if (!isURL(value)) {
                throw new BadRequestError(`Invalid ${name}! It should be a valid URL.`);
            }
            break;
        default:
            throw new BadRequestError(`Invalid ${name}! Unknown value type.`);
    }
}

const parseAndSerialize = (value) => {
    if (isString(value)) {
        return toString(value);
    }
    if (isInteger(value)) {
        return toInteger(value);
    }
    if (isFloat(value)) {
        return toFloat(value);
    }
    if (isBoolean(value)) {
        return toBoolean(value);
    }
    if (isArray(value)) {
        return toArray(value);
    }
    if (isObject(value)) {
        return toObject(value);
    }
    if (isDate(value)) {
        return new Date(value);
    }

    return value;
}


/**
 * The `parser` function is a utility function that provides a fluent interface for parsing and validating input values.
 * It allows for setting default values, specifying data types, checking for required values, and applying various validation rules.
 *
 * @param {string} name - The name of the input value.
 * @param {*} value - The input value to be parsed and validated.
 * @returns {Object} - An object containing methods for parsing and validating the input value.
 *
 * @throws {BadRequestError} - If the input value does not meet the specified rules and conditions.
 *
 * @example
 * const parsedValue = parser('name', inputValue)
 *   .required()
 *   .type('string')
 *   .min(3)
 *   .max(10)
 *   .parseAndBuild(args);
 */
function parser(name, value){
    let inputValue = value && isString(value) ? value.trim() : value;

    const setDefault = (val) => {
        if (inputValue === undefined || inputValue === null) {
            inputValue = val;
        }
        return parser(name, inputValue);
    } 

    const type = (dataType) => {
        if (inputValue) {
            validateDataType(name, dataType, value);
        }
        return parser(name, inputValue);
    }

    const bool = () => {
        if (inputValue && isBoolean(inputValue)) {
            inputValue =  toBoolean(inputValue);
        }
        return parser(name, inputValue);
    }

    const required = (message) => {
        if (!inputValue || inputValue === undefined || inputValue === null) {
            throw new BadRequestError(message ||`${name} is required.`);
        }
        return parser(name, inputValue);
    }

    const email = (message) => {
        if (inputValue && isEmail(inputValue)) {
            throw new BadRequestError(message ||`${name} is not a valid email.`);
        } 
        return parser(name, inputValue);
    }

    const min = (minValue, message) => {
        if (inputValue && inputValue < minValue) {
            throw new BadRequestError(message ||`${name} cannot be less than ${minValue}.`);
        } 
        return parser(name, inputValue);
    }

    const max = (maxValue, message) => {
        if (inputValue && inputValue > maxValue) {
            throw new BadRequestError(message ||`${name} cannot be greater than ${maxValue}.`);
        }
        return parser(name, inputValue);
    }
    
    const shortLen = (minLengthValue, message) => {
        if (inputValue && inputValue.length < minLengthValue) {
            throw new BadRequestError(message ||`${name} cannot be lesser than ${lengthValue} characters.`);
        }
        return parser(name, inputValue);
    }

    const longLen = (maxLengthValue, message) => {
        if (inputValue && inputValue.length > maxLengthValue) {
            throw new BadRequestError(message ||`${name} cannot be greater than ${maxLengthValue} characters.`);
        }
        return parser(name, inputValue);
    }

    const stringList = (message) => {
        if (inputValue && !isArray(inputValue)) {
            throw new BadRequestError(message ||`${name} should be an array.`);
        }
        if (inputValue && !inputValue.every(item => isString(item))) {
            throw new BadRequestError(`${name} should be an array of strings only.`);
        }
        return parser(name, inputValue);
    }

    const intList = (message) => {
        if (inputValue && !isArray(inputValue)) {
            throw new BadRequestError(message ||`${name} should be an array.`);
        }
        if (inputValue && !inputValue.every(item => isInteger(item))) {
            throw new BadRequestError(`${name} should be an array of integers only.`);
        }
        return parser(name, inputValue);
    }

    const floatList = (message) => {
        if (inputValue && !isArray(inputValue)) {
            throw new BadRequestError(message ||`${name} should be an array.`);
        }
        if (inputValue && !inputValue.every(item => isFloat(item))) {
            throw new BadRequestError(`${name} should be an array of floating numbers only.`);
        }
        return parser(name, inputValue);
    }

    const mixedNumbersList = (message) => {
        if (inputValue && !isArray(inputValue)) {
            throw new BadRequestError(message ||`${name} should be an array.`);
        }
        if (inputValue && !inputValue.every(item => isInteger(item) || isFloat(item))) {
            throw new BadRequestError(`${name} should be an array of integers or floating numbers only.`);
        }
        return parser(name, inputValue);
    }

    const containedInList = (list, message) => {
        if (inputValue && !list.includes(inputValue)) {
            let listItemsWithOr = joinAndFormatList(list);
            message = message || `${name} should be ${listItemsWithOr}.`;
            throw new BadRequestError(message);
        }
        return parser(name, inputValue);
    }

    const mustInclude = (condName, condRequiredValue) => {
        if (inputValue && !condRequiredValue) {
            throw new BadRequestError(`${name} is requires ${condName}.`);
        }
        return parser(name, inputValue);
    }

    feature-create-user-usecase
        //functon thats checks for special character
        const noSpecialCharacters = (message) => {

            const regex = /^[a-zA-Z0-9]+$/;
    
            if (!regex.test(inputValue)) {
                throw new BadRequestError(`${name} contains special characters.`);
              }
              return parser(name, inputValue);
        }



    //function that loops through a list and each item is a the checkList
    const eachInList = (checkList, message) => {
        if (inputValue && isArray(inputValue)) {
            for (let i = 0; i < inputValue.length; i++) {
                if (!checkList.includes(inputValue[i])) {
                    let listItemsWithOr = joinAndFormatList(checkList);
                    throw new BadRequestError(message || `Each record in ${name} should be one of ${listItemsWithOr}.`);
                }
            }
        }
        return parser(name, inputValue);
    }

    const useCallbackCustomFunction = (callbackFunction) => {
        if (inputValue && typeof callbackFunction !== 'function') {
            callbackFunction()
        }
        return parser(name, inputValue);
    }

    //if the value is available set is a $gte the date query
    const parseAsStartDate = (args, optionalFieldName) => {
        if (value) {
            if (!isDate(inputValue)) {
                throw new BadRequestError(`Invalid ${name}.`);
            }
            if (!isObject(args)) {
                throw new BadRequestError(`args object is required to use ${name}.`);
            }
            const fieldName =  optionalFieldName|| 'createdAt';
            args[fieldName] = { $gte: new Date(inputValue) };
        }
        return parser(name, inputValue);
    }

    //if the value is available set is a $lte the date query
    const parseAsEndDate = (startDate, args, optionalFieldName) => {
        if (value) {
            if (!isDate(startDate) || !isDate(inputValue)) {
                throw new BadRequestError(`start and end dates are required to use ${name}.`);
            }
            if (!isObject(args)) {
                throw new BadRequestError(`args object is required to use ${name}.`);
            }

            const fieldName =  optionalFieldName|| 'createdAt';
            args[fieldName] = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        return parser(name, inputValue);
    }

    const parseDateRange = (args, startDate, endDate, optionalFieldName) => {
        if (isDate(inputValue) && isDate(startDate) && isDate(endDate) && isObject(args)) {
            const fieldName =  optionalFieldName|| 'createdAt';
            args[fieldName] = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        return parser(name, inputValue);
    }

    const shortTimestamp = (date) => {
        if (inputValue && new Date(date) > new Date(inputValue)) {
            throw new BadRequestError(`${name} cannot be less than ${date}.`);
        }
        return parser(name, inputValue);
    }

    const shortDate = (date) => {
        if (!/^\d{4}-\d{2}-\d{2}/.test(date)) {
            throw new BadRequestError(`Invalid ${name}! must be in the formate YYYY-MM-DD.`)
        }
        return parser(name, inputValue);
    }

    const longTimestamp = (date) => {
        if (inputValue && new Date(inputValue) > new Date(date)) {
            throw new BadRequestError(`${name} cannot be more than ${date}.`);
        }
        return parser(name, inputValue);
    }

    const ensureParsedResponse = (args) => {
        if (isObject(args) && Object.keys(args).length === 0) {
            throw new BadRequestError('No data were provided for update.');
        } 
    }    

    const lowerCase = () => {
        if (inputValue) {
            inputValue = toLowerCase(inputValue);
        }
        return parser(name, inputValue);
    }

    const upperCase = () => {
        if (inputValue) {
            inputValue = toUpperCase(inputValue);
        }
        return parser(name, inputValue);
    }

    const minCount = (count) => {
        if (inputValue && Object.keys(inputValue).length < count) {
            throw new BadRequestError(`${name} must have at least ${count} properties.`);
        }
        return parser(name, inputValue);
    } 

    const parseAndBuild = (args) => {
        inputValue = parseAndSerialize(inputValue);
        if (value && isObject(args)) {
            args[name] = isString(inputValue) ? inputValue.trim() : inputValue;
        }
        return args;
    }

    return {
        email,
        lowerCase,
        upperCase,
        min,
        max,
        bool,
        shortLen,
        longLen,
        required,
        type,
        shortTimestamp,
        longTimestamp,
        stringList,
        intList,
        floatList,
        minCount,
        setDefault,
        mixedNumbersList,
        containedInList,
        mustInclude,
        noSpecialCharacters,
        eachInList,
        useCallbackCustomFunction,
        shortDate,
        parseAsStartDate,
        parseAsEndDate,
        parseDateRange,
        parseAndBuild,
        ensureParsedResponse,
    }
}

module.exports = parser