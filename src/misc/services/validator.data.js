const { default: TValidator } = require("validator");

const isArray = (value) => {
  return Array.isArray(value);
};

const isObject = (value) => {
  return typeof value === "object" && value !== null && !isArray(value);
};

const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

const isFloat = (value) => {
  return Number(value) === Number(value) && Number(value) % 1 !== 0;
};

const isNumber = (value) => {
  return (typeof value === "number" && isInteger(value)) || isFloat(value);
};

const isString = (value) => {
  return typeof value === "string";
};

const isDate = (value) => {
  const parsedDate = Date.parse(value);
  return !isNaN(parsedDate);
};

const isBoolean = (value) => {
  if (isString(value)) {
    return value === "true" || value === "false";
  }
  return typeof value === "boolean";
};

const isEmail = (email) => {
  isString(email) && !TValidator.isEmail(email);
};

const isURL = (url) =>
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(url);

const isID = (value) => TValidator.isMongoId(value);

/**
 * Checks if a value is empty or holds no meaningful data.
 *
 * This function examines various types of values and returns true if:
 * - The value is falsy (e.g., null, undefined, false, empty string, 0).
 * - For strings, it checks if the trimmed string length is 0.
 * - For numbers, it checks if the value is less than or equal to 0.
 * - For arrays, it checks if the array has no elements.
 * - For objects, it checks if the object has no properties.
 *
 * @param {*} value - The value to check for emptiness.
 * @returns {boolean} - True if the value is empty, otherwise false.
 */
const isEmpty = (value) => {
  if (!value) return true;
  if (isString(value) && value.trim().length === 0) return true;
  if (isNumber(value) && value <= 0) return true;
  if (isArray(value) && value.length === 0) return true;
  if (isObject(value) && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Checks if two values have the same type.
 *
 * @param {*} firstValue - The first value to be compared.
 * @param {*} secondValue - The second value to be compared.
 * @returns {boolean} - Returns true if the values have the same type, false otherwise.
 */
const isEqualType = (firstValue, secondValue) => {
  if (isString(firstValue) && isString(secondValue)) return true;
  if (isObject(firstValue) && isObject(secondValue)) return true;
  if (isArray(firstValue) && isArray(secondValue)) return true;
  if (isNumber(firstValue) && isNumber(secondValue)) return true;
  if (isDate(firstValue) && isDate(secondValue)) return true;
  return false;
};

/**
 * Checks if two values are deeply equal.
 *
 * @param {*} source - The first value to compare.
 * @param {*} target - The second value to compare.
 * @returns {boolean} - True if the values are deeply equal, false otherwise.
 */
const isDeepEqual = (source, target) => {
  if ((isEqualType(source, target) && isString(source)) || isNumber(source)) {
    return source === target;
  }
  if (isEqualType(source, target) && isArray(source)) {
    return (
      source.length === target.length &&
      source.every((item, index) => isDeepEqual(item, target[index]))
    );
  }
  if (isEqualType(source, target) && isObject(source)) {
    return (
      Object.keys(source).length === Object.keys(target).length &&
      Object.keys(source).every((key) => isDeepEqual(source[key], target[key]))
    );
  }
  if (isEqualType(source, target) && isDate(source)) {
    return source.getTime() === target.getTime();
  }
  return false;
};

module.exports = {
  isEmpty,
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
  isID,
  isEqualType,
  isDeepEqual,
};
