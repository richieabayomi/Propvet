const crypto = require('crypto');

module.exports.generateRandomString = function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

/**
 * Formats the return value by updating certain properties and removing unwanted properties from an object.
 * 
 * @param {object} data - The object to be formatted.
 * @param {array} [exclude=[]] - An array of property names to be excluded from the formatted object.
 * @returns {object} - The formatted object with updated properties and removed unwanted properties.
 */
module.exports.formatReturnedMongoDoc = function formatReturnedMongoDoc(data, exclude = []) {
    
    if (!data) return data;

    if (data.toObject) {
        data = data.toObject();
    }
    
    if (data.toJSON) {
        data = data.toJSON();
    }
    
    const {__v, _id, createdAt, updatedAt, ...rest} = data;
    // data.id = data._id;
    // data.created_at = data.createdAt;
    // data.updated_at = data.updatedAt;

    // delete data._id;
    // delete data.__v;
    // delete data.createdAt;
    // delete data.updatedAt;

    const _data = {
        ...rest,
        id: _id,
        created_at: createdAt,
        updated_at: updatedAt
    }

    for (let i = 0; i < exclude.length; i++) {
        delete _data[exclude[i]];
    }

    // return data;
    return _data;
}

