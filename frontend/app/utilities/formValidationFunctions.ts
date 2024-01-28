// Contains functions for validating form inputs.

export const validateUsername = (username: string): boolean => {
    return username.length > 3;
}

export const validateEmail = (email: string): boolean => {
    const eReg: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return eReg.test(email.toLowerCase());
}

// Returns an empty string if the password is valid, or a string containing an error message if the password is invalid.
export const validatePassword = (password: string): string => {
    let invalidMessage: string = "";
    if (password.length <= 8) {
        invalidMessage = "Must be at least 8 characters";
    } else if (!/[A-Za-z]/.test(password)) {
        invalidMessage = "Must contain at least one letter";
    } else if (!/[A-Z]/.test(password)) {
        invalidMessage = "At least one letter must be uppercase";
    } else if (!/\d/.test(password)) {
        invalidMessage = "Must contain at least one number";
    } else if (!/[.,!@#$%^&*]/.test(password)) {
        invalidMessage = "Must contain one of .,!@#$%^&*";
    }
    return invalidMessage;
}