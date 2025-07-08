const ServerError = require('../../errors/InternalServerError');
const RunTimeExceptionError = require('../../errors/RunTimeExceptionError');
const { isObject } = require('../validator.data');

const isNullOrUndefined = value => value === null || value === undefined;

/**
 * Wraps an async execution and returns a standardized error or result.
 */
const handleAsyncRequest = async (execution) => {
  try {
    const result = await execution;
    return result;
  } catch (error) {
    console.error('Error while executing request:\n', JSON.stringify(error));
    throw new ServerError('Server error! Could not complete the request due to unknown error.');
  }
};

/**
 * Formats a Mongoose document by removing metadata and renaming fields.
 */
const handleResponseFormat = (data, projections = []) => {
  if (isNullOrUndefined(data)) return data;

  if (data.toObject) data = data.toObject({ getters: true });
  else if (data.toJSON) data = data.toJSON();

  projections.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      delete data[field];
    }
  });

  const { createdAt, updatedAt, _id, __v, ...rest } = data;

  return {
    ...rest,
    created_at: createdAt,
    updated_at: updatedAt,
    id: _id
  };
};

/**
 * Reassigns a field from one key to another.
 */
const handleReassignField = (record, currentFieldName, newFieldName) => {
  if (!isObject(record) || !currentFieldName || !newFieldName) {
    throw new RunTimeExceptionError('Invalid arguments. "record", "currentFieldName" and "newFieldName" are required.');
  }

  const copy = { ...record };
  copy[newFieldName] = copy[currentFieldName];
  delete copy[currentFieldName];
  return copy;
};

/**
 * Extracts only specific fields from an object.
 */
const extractFieldsFromObject = (inputObject, fieldList = []) => {
  const selectedFields = {};
  for (const field of fieldList) {
    if (Object.prototype.hasOwnProperty.call(inputObject, field)) {
      selectedFields[field] = inputObject[field];
    }
  }
  return selectedFields;
};

/**
 * Adds a new attribute with optional casting.
 */
const addAttribute = (build, value, attributeName, castTo) => {
  if (isNullOrUndefined(value) || isNullOrUndefined(attributeName) || !isObject(build)) return build;

  switch (castTo) {
    case 'uppercase':
      value = String(value).toUpperCase();
      break;
    case 'lowercase':
      value = String(value).toLowerCase();
      break;
    case 'number':
      value = Number(value);
      break;
  }

  build[attributeName] = value;
  return build;
};

module.exports = {
  handleAsyncRequest,
  handleResponseFormat,
  handleReassignField,
  extractFieldsFromObject,
  addAttribute
};
