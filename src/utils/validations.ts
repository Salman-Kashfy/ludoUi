export function decimalOnly(e:any) {
    let value = e.target.value;

    // Allow only numbers and a single decimal point
    value = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimals
    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1) {
        value =
            value.substring(0, decimalIndex + 1) +
            value.substring(decimalIndex + 1).replace(/\./g, '');
    }

    // Restrict to 6 digits before the decimal and 2 after
    const parts = value.split('.');
    if (parts[0].length > 6) {
        parts[0] = parts[0].slice(0, 6);
    }
    if (parts[1]?.length > 2) {
        parts[1] = parts[1].slice(0, 2);
    }

    e.target.value = parts.join('.');
}

export function upperAlphaOnly(e:any,limit = null) {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z]/g, '');
    if (limit && value.length > limit) {
        value = value.slice(0, limit);
    }
    e.target.value = value.toUpperCase();
}

export const isValidURL = (url:string) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

export const numberOnly = (e:any, max = null, leadingZero = true) => {
    let value = e.target.value.replace(/[^0-9]/g, '')
    if (max && value.length > max) {
        value = value.slice(0, max);
    }   
    if(!leadingZero){
        value = value.replace(/^0+/, '');
    }
    e.target.value = value
}

export const phoneNumberOnly = (e:any, max: number | null = null) => {
    // Get current value and remove non-numeric characters
    let value = e.target.value.replace(/[^0-9]/g, '');
    
    // If max is set and value exceeds it, truncate to max length
    // This prevents further input beyond the limit without clearing existing digits
    if (max !== null && value.length > max) {
        value = value.slice(0, max);
    }
    
    e.target.value = value;
}

export const phoneCodeOnly = (e:any, max: number | null = null) => {
    let value = e.target.value;
    
    // Allow only + and numbers
    value = value.replace(/[^+0-9]/g, '');
    
    // If user starts typing a number (not +), automatically prepend +
    if (value && !value.startsWith('+') && /^[0-9]/.test(value)) {
        value = '+' + value;
    }
    
    // Ensure + is only at the start
    if (value.includes('+')) {
        const plusIndex = value.indexOf('+');
        if (plusIndex > 0) {
            // Remove + if it's not at the start
            value = value.replace(/\+/g, '');
            // Add + at the start if we have numbers
            if (value) {
                value = '+' + value;
            }
        } else {
            // Keep + at start, remove any other +
            value = '+' + value.substring(1).replace(/\+/g, '');
        }
    }
    
    // Remove leading zeros after +
    if (value.startsWith('+')) {
        const afterPlus = value.substring(1);
        const cleanedAfterPlus = afterPlus.replace(/^0+/, '');
        value = '+' + cleanedAfterPlus;
    }
    
    // Apply max length limit
    if (max && value.length > max) {
        value = value.slice(0, max);
    }
    
    e.target.value = value;
}

export const isValidEmail = (email:string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password:string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
    return regex.test(password);
}