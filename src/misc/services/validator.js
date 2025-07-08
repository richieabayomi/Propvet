const BadRequestError = require('../errors/BadRequestError');
const { default: TValidator } = require('validator');

const validator = {}

validator.isValidMongoId = (id) => {
    return TValidator.isMongoId(id);
}

validator.isDate = (fieldName, date) => {
    if (!date) throw new BadRequestError(`${fieldName} is required.`)
    if (!TValidator.isDate(date))
        throw new BadRequestError(`${fieldName} is invalid.`)
}

validator.isStartDate = (startDate) => {
    if (!/^\d{4}-\d{2}-\d{2}/.test(startDate)) {
        throw new BadRequestError("Invalid start date. must be in the formate YYYY-MM-DD")
    }
    let sd = startDate.split("-")
    //check the day
    if (1 > parseInt(sd[2])) {
        throw new BadRequestError("start date day must be greater than zero")
    }
    //check the day
    if (parseInt(sd[2]) > 31) {
        throw new BadRequestError("start date day can not be greater than 31")
    }
    //check the month
    if (1 > parseInt(sd[1])) {
        throw new BadRequestError("start date month must be greater than zero")
    }
    //check the month
    if (parseInt(sd[1]) > 12) {
        throw new BadRequestError("start date can not be greater than 12")
    }
    //check the year
    if (2023 > parseInt(sd[0])) {
        throw new BadRequestError("start date year must be greater than 2020.")
    }
    //check the year
    if (parseInt(sd[0]) > new Date().getFullYear()) {
        throw new BadRequestError("start date year can not be greater than present year.")
    }
}

validator.isEndDate = (startDate, endDate) => {
    //if start date is not submitted
    if (!startDate) {
        throw new BadRequestError("end_date can only be used with start_date")
    }
    if (!/^\d{4}-\d{2}-\d{2}/.test(endDate)) {
        throw new BadRequestError("Invalid end date. must be in the formate YYYY-MM-DD")
    }
    let sd = endDate.split("-")
    //check the day
    if (1 > parseInt(sd[2])) {
        throw new BadRequestError("End date day must be greater than zero")
    }
    //check the day
    if (parseInt(sd[2]) > 31) {
        throw new BadRequestError("End date day can not be greater than 31")
    }
    //check the month
    if (1 > parseInt(sd[1])) {
        throw new BadRequestError("End date month must be greater than zero")
    }
    //check the month
    if (parseInt(sd[1]) > 12) {
        throw new BadRequestError("End date can not be greater than 12")
    }
    //check the year
    if (2023 > parseInt(sd[0])) {
        throw new BadRequestError("End date year must be greater than 2020.")
    }
    //check the year
    if (parseInt(sd[0]) > new Date().getFullYear()) {
        throw new BadRequestError("End date year can not be greater than present year.")
    }
    //check if the date are wrong
    if ((new Date(endDate) - new Date(startDate) < 0)) {
        throw new BadRequestError("start date can not be greater than end date")
    }
}

validator.isMongoId = (fieldName, id) => {
    if (!id) throw new BadRequestError(`${fieldName} is required.`)
    if (!TValidator.isMongoId(id)) throw new BadRequestError(`${fieldName} is invalid.`);
}

validator.isEmail = (email) => {
    if (!email) throw new BadRequestError('Email is missing or invalid.')
    if (!TValidator.isEmail(email)) throw new BadRequestError('Email is missing or invalid.')
}

validator.isPassword = (password, minimumLength = 8, maximumLength = 16) => {
    if (!password) throw new BadRequestError('password is required.')
    if (password.length < minimumLength)
        throw new BadRequestError(`Password is too short, the minimum length should be ${minimumLength}`);

    if (password.length > maximumLength)
        throw new BadRequestError(`Password is too long, the maximum length should be ${maximumLength}`);

    //check if password contains at least one uppercase letter
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/))
        throw new BadRequestError('Password should contain at least one number, one lowercase and one uppercase letter');
}

validator.isInput = (fieldName, value, minimumLength = null, maximumLength = null, validInputsOptions = []) => {
    if (!value) throw new BadRequestError(`${fieldName} is required.`);

    if (minimumLength) {
        if (value.length < minimumLength)
            throw new BadRequestError(`${fieldName} is too short. It should not be less than ${minimumLength} characters.`);
    }

    if (maximumLength) {
        if (value.length > maximumLength)
            throw new BadRequestError(`${fieldName} is too long. It should not be more than ${maximumLength} characters.`);
    }

    if (validInputsOptions && validInputsOptions.length > 0) {
        if (!validInputsOptions.includes(value)) {
            let errorValue
            if (validInputsOptions.length > 1) {
                errorValue = validInputsOptions.slice(0, -1).join(', ') + ', or ' + validInputsOptions.slice(-1)
            } else {
                errorValue = validInputsOptions[0];
            }
            throw new BadRequestError(`${fieldName} is invalid. It should be ${errorValue}.`);
        }
    }
}

validator.isURL = (fieldName, url) => {
    if (!url) throw new BadRequestError(`${fieldName} url is required`);
    if (TValidator.isURL(fieldName, url)) throw new BadRequestError(`${fieldName} url is invalid`);
}

validator.isNumber = (fieldName, value, min, max) => {
    if (!value) throw new BadRequestError(`${fieldName} is required.`);
    if (isNaN(value)) throw new BadRequestError(`${fieldName} is invalid. Its should be number.`);
    if (min && Number(min) > Number(value)) throw new BadRequestError(`${fieldName} is too small. It should not be less than ${min}.`);
    if (max && Number(max) < Number(value)) throw new BadRequestError(`${fieldName} is too large. It should not be more than ${max}.`);
}

validator.isPhoneNumber = (phone) => {
    if (!phone) throw new BadRequestError('Phone number is required.');
    if (phone.length < 11) throw new BadRequestError('Phone number is too short.');
    if (phone.length > 14) throw new BadRequestError('Phone number is too long.');
    if (!TValidator.isMobilePhone(phone)) throw new BadRequestError('Phone number is invalid.');
}

module.exports = validator