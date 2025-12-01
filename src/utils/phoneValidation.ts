/**
 * Phone number length limits based on country code
 * Format: country code (without +) -> max phone number length
 */
export const PHONE_NUMBER_LENGTHS: Record<string, number> = {
    '1': 10,      // US, Canada
    '7': 10,      // Russia, Kazakhstan
    '20': 10,     // Egypt
    '27': 9,      // South Africa
    '30': 10,     // Greece
    '31': 9,      // Netherlands
    '32': 9,      // Belgium
    '33': 9,      // France
    '34': 9,      // Spain
    '36': 9,      // Hungary
    '39': 10,     // Italy
    '40': 9,      // Romania
    '41': 9,      // Switzerland
    '43': 10,     // Austria
    '44': 10,     // UK
    '45': 8,      // Denmark
    '46': 9,      // Sweden
    '47': 8,      // Norway
    '48': 9,      // Poland
    '49': 11,     // Germany
    '51': 9,      // Peru
    '52': 10,     // Mexico
    '53': 8,      // Cuba
    '54': 10,     // Argentina
    '55': 11,     // Brazil
    '56': 9,      // Chile
    '57': 10,     // Colombia
    '58': 10,     // Venezuela
    '60': 9,      // Malaysia
    '61': 9,      // Australia
    '62': 10,     // Indonesia
    '63': 10,     // Philippines
    '64': 8,      // New Zealand
    '65': 8,      // Singapore
    '66': 9,      // Thailand
    '81': 10,     // Japan
    '82': 10,     // South Korea
    '84': 10,     // Vietnam
    '86': 11,     // China
    '90': 10,     // Turkey
    '91': 10,     // India
    '92': 10,     // Pakistan
    '93': 9,      // Afghanistan
    '94': 9,      // Sri Lanka
    '95': 9,      // Myanmar
    '98': 10,     // Iran
    '212': 9,     // Morocco
    '213': 9,     // Algeria
    '216': 8,     // Tunisia
    '218': 9,     // Libya
    '220': 7,     // Gambia
    '221': 9,     // Senegal
    '222': 8,     // Mauritania
    '223': 8,     // Mali
    '224': 9,     // Guinea
    '225': 10,    // Ivory Coast
    '226': 8,     // Burkina Faso
    '227': 8,     // Niger
    '228': 8,     // Togo
    '229': 8,     // Benin
    '230': 7,     // Mauritius
    '231': 8,     // Liberia
    '232': 8,     // Sierra Leone
    '233': 9,     // Ghana
    '234': 10,    // Nigeria
    '235': 8,     // Chad
    '236': 8,     // Central African Republic
    '237': 9,     // Cameroon
    '238': 7,     // Cape Verde
    '239': 7,     // São Tomé and Príncipe
    '240': 9,     // Equatorial Guinea
    '241': 8,     // Gabon
    '242': 9,     // Republic of the Congo
    '243': 9,     // DR Congo
    '244': 9,     // Angola
    '245': 7,     // Guinea-Bissau
    '246': 7,     // British Indian Ocean Territory
    '248': 7,     // Seychelles
    '249': 9,     // Sudan
    '250': 9,     // Rwanda
    '251': 9,     // Ethiopia
    '252': 8,     // Somalia
    '253': 8,     // Djibouti
    '254': 9,     // Kenya
    '255': 9,     // Tanzania
    '256': 9,     // Uganda
    '257': 8,     // Burundi
    '258': 9,     // Mozambique
    '260': 9,     // Zambia
    '261': 9,     // Madagascar
    '262': 9,     // Réunion/Mayotte
    '263': 9,     // Zimbabwe
    '264': 9,     // Namibia
    '265': 9,     // Malawi
    '266': 8,     // Lesotho
    '267': 8,     // Botswana
    '268': 8,     // Eswatini
    '269': 7,     // Comoros
    '290': 4,     // Saint Helena
    '291': 7,     // Eritrea
    '297': 7,     // Aruba
    '298': 6,     // Faroe Islands
    '299': 6,     // Greenland
    '350': 8,     // Gibraltar
    '351': 9,     // Portugal
    '352': 9,     // Luxembourg
    '353': 9,     // Ireland
    '354': 7,     // Iceland
    '355': 9,     // Albania
    '356': 8,     // Malta
    '357': 8,     // Cyprus
    '358': 9,     // Finland
    '359': 9,     // Bulgaria
    '370': 8,     // Lithuania
    '371': 8,     // Latvia
    '372': 7,     // Estonia
    '373': 8,     // Moldova
    '374': 8,     // Armenia
    '375': 9,     // Belarus
    '376': 6,     // Andorra
    '377': 8,     // Monaco
    '378': 10,    // San Marino
    '380': 9,     // Ukraine
    '381': 9,     // Serbia
    '382': 8,     // Montenegro
    '383': 8,     // Kosovo
    '385': 9,     // Croatia
    '386': 8,     // Slovenia
    '387': 8,     // Bosnia and Herzegovina
    '389': 8,     // North Macedonia
    '420': 9,     // Czech Republic
    '421': 9,     // Slovakia
    '423': 7,     // Liechtenstein
    '500': 5,     // Falkland Islands
    '501': 7,     // Belize
    '502': 8,     // Guatemala
    '503': 8,     // El Salvador
    '504': 8,     // Honduras
    '505': 8,     // Nicaragua
    '506': 8,     // Costa Rica
    '507': 8,     // Panama
    '508': 6,     // Saint Pierre and Miquelon
    '509': 8,     // Haiti
    '590': 9,     // Guadeloupe
    '591': 8,     // Bolivia
    '592': 7,     // Guyana
    '593': 9,     // Ecuador
    '594': 9,     // French Guiana
    '595': 9,     // Paraguay
    '596': 9,     // Martinique
    '597': 7,     // Suriname
    '598': 8,     // Uruguay
    '599': 7,     // Netherlands Antilles
    '670': 8,     // East Timor
    '672': 6,     // Australian External Territories
    '673': 7,     // Brunei
    '674': 7,     // Nauru
    '675': 8,     // Papua New Guinea
    '676': 7,     // Tonga
    '677': 7,     // Solomon Islands
    '678': 7,     // Vanuatu
    '679': 7,     // Fiji
    '680': 7,     // Palau
    '681': 6,     // Wallis and Futuna
    '682': 5,     // Cook Islands
    '683': 4,     // Niue
    '685': 5,     // Samoa
    '686': 5,     // Kiribati
    '687': 6,     // New Caledonia
    '688': 5,     // Tuvalu
    '689': 8,     // French Polynesia
    '850': 10,    // North Korea
    '852': 8,     // Hong Kong
    '853': 8,     // Macau
    '855': 9,     // Cambodia
    '856': 10,    // Laos
    '880': 10,    // Bangladesh
    '886': 9,     // Taiwan
    '960': 7,     // Maldives
    '961': 7,     // Lebanon
    '962': 9,     // Jordan
    '963': 9,     // Syria
    '964': 10,    // Iraq
    '965': 8,     // Kuwait
    '966': 9,     // Saudi Arabia
    '967': 9,     // Yemen
    '968': 8,     // Oman
    '970': 9,     // Palestine
    '971': 9,     // UAE
    '972': 9,     // Israel
    '973': 8,     // Bahrain
    '974': 8,     // Qatar
    '975': 8,     // Bhutan
    '976': 8,     // Mongolia
    '977': 9,     // Nepal
    '992': 9,     // Tajikistan
    '993': 8,     // Turkmenistan
    '994': 9,     // Azerbaijan
    '995': 9,     // Georgia
    '996': 9,     // Kyrgyzstan
    '998': 9,     // Uzbekistan
};

/**
 * Get the maximum phone number length for a given country code
 * @param phoneCode - Country code with or without + (e.g., "+1" or "1")
 * @returns Maximum phone number length, or 15 as default (ITU-T E.164 max)
 */
export const getPhoneNumberMaxLength = (phoneCode: string): number => {
    if (!phoneCode) return 15; // Default max length per ITU-T E.164
    
    // Remove + if present
    const code = phoneCode.replace(/^\+/, '');
    
    // Try exact match first
    if (PHONE_NUMBER_LENGTHS[code]) {
        return PHONE_NUMBER_LENGTHS[code];
    }
    
    // Try matching by prefix (for multi-digit codes)
    // Check codes from longest to shortest
    const sortedCodes = Object.keys(PHONE_NUMBER_LENGTHS).sort((a, b) => b.length - a.length);
    for (const key of sortedCodes) {
        if (code.startsWith(key)) {
            return PHONE_NUMBER_LENGTHS[key];
        }
    }
    
    // Default to 15 (ITU-T E.164 maximum)
    return 15;
};

/**
 * Validate phone number based on country code
 * @param phoneNumber - Phone number to validate
 * @param phoneCode - Country code with or without +
 * @returns true if valid, error message if invalid
 */
export const validatePhoneNumber = (phoneNumber: string, phoneCode: string): true | string => {
    if (!phoneNumber) return true; // Let required validation handle empty
    
    const maxLength = getPhoneNumberMaxLength(phoneCode);
    const minLength = Math.max(4, Math.floor(maxLength * 0.6)); // Minimum 60% of max or 4, whichever is higher
    
    if (phoneNumber.length < minLength) {
        return `Phone number must be at least ${minLength} digits`;
    }
    
    if (phoneNumber.length > maxLength) {
        return `Phone number must not exceed ${maxLength} digits`;
    }
    
    return true;
};

