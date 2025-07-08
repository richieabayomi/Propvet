const trimString = (value) => {
    if (typeof value !== 'string') return value
    let val = value.replace(/\s/g, '');
    return val.trim()
}

const getInputValueString = (inputObj, field) => {
    return inputObj instanceof Object 
    && inputObj.hasOwnProperty(field)  
    && typeof inputObj[field] === 'string'
       ? inputObj[field].trim() : ''
 }
 
const getInputValueNumber = (inputObj, field) => {
    return inputObj instanceof Object 
    && inputObj.hasOwnProperty(field) 
    && typeof inputObj[field] === 'number'
       ? inputObj[field] : ''
 }
 
const getInputValueObject = (inputObj, field) => {
    return inputObj instanceof Object 
    && inputObj.hasOwnProperty(field) 
    && typeof inputObj[field] === 'object' ? inputObj[field] : ''
 }
 
const getInputValueArray = (inputObj, field) => {
    return inputObj instanceof Object 
    && inputObj.hasOwnProperty(field) 
    && inputObj[field] instanceof Array ? inputObj[field] : ''
 }

const removedEmptyFields = (inputObj) => {
    let obj = {};
    for (const key in inputObj) {
        if (inputObj.hasOwnProperty(key)) {
            const value = inputObj[key];
            if (value) {
                obj[key] = value;
            }
        }
    }
    return obj;
}

const removeOptionalFields = (inputObj, optionalFields) => {
    let obj = {};
    for (const key in inputObj) {
        if (inputObj.hasOwnProperty(key)) {
            const value = inputObj[key];
            if (value && !optionalFields.includes(key)) {
                obj[key] = value;
            }
        }
    }
    return obj;
}
 

module.exports.trimString = trimString;
module.exports.removeOptionalFields = removeOptionalFields;
module.exports.removedEmptyFields = removedEmptyFields;
module.exports.getInputValueString = getInputValueString;
module.exports.getInputValueNumber = getInputValueNumber;
module.exports.getInputValueObject = getInputValueObject;
module.exports.getInputValueArray = getInputValueArray;
