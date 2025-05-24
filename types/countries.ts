export type CountryCode = (typeof countries)[number];

export const countries = [
	'AF', // Afghanistan
	'AL', // Albania
	'DZ', // Algeria
	'AS', // American Samoa
	'AD', // Andorra
	'AO', // Angola
	'AI', // Anguilla
	'AQ', // Antarctica
	'AG', // Antigua and Barbuda
	'AR', // Argentina
	'AM', // Armenia
	'AW', // Aruba
	'AU', // Australia
	'AT', // Austria
	'AZ', // Azerbaijan
	'BS', // Bahamas
	'BH', // Bahrain
	'BD', // Bangladesh
	'BB', // Barbados
	'BY', // Belarus
	'BE', // Belgium
	'BZ', // Belize
	'BJ', // Benin
	'BM', // Bermuda
	'BT', // Bhutan
	'BO', // Bolivia
	'BA', // Bosnia and Herzegovina
	'BW', // Botswana
	'BR', // Brazil
	'IO', // British Indian Ocean Territory
	'BN', // Brunei
	'BG', // Bulgaria
	'BF', // Burkina Faso
	'BI', // Burundi
	'CV', // Cabo Verde
	'KH', // Cambodia
	'CM', // Cameroon
	'CA', // Canada
	'KY', // Cayman Islands
	'CF', // Central African Republic
	'TD', // Chad
	'CL', // Chile
	'CN', // China
	'CO', // Colombia
	'KM', // Comoros
	'CG', // Congo (Congo-Brazzaville)
	'CD', // Congo (Congo-Kinshasa)
	'CR', // Costa Rica
	'CI', // Côte d'Ivoire
	'HR', // Croatia
	'CU', // Cuba
	'CY', // Cyprus
	'CZ', // Czech Republic
	'DK', // Denmark
	'DJ', // Djibouti
	'DM', // Dominica
	'DO', // Dominican Republic
	'EC', // Ecuador
	'EG', // Egypt
	'SV', // El Salvador
	'GQ', // Equatorial Guinea
	'ER', // Eritrea
	'EE', // Estonia
	'SZ', // Eswatini
	'ET', // Ethiopia
	'FJ', // Fiji
	'FI', // Finland
	'FR', // France
	'GA', // Gabon
	'GM', // Gambia
	'GE', // Georgia
	'DE', // Germany
	'GH', // Ghana
	'GR', // Greece
	'GD', // Grenada
	'GU', // Guam
	'GT', // Guatemala
	'GN', // Guinea
	'GW', // Guinea-Bissau
	'GY', // Guyana
	'HT', // Haiti
	'HN', // Honduras
	'HU', // Hungary
	'IS', // Iceland
	'IN', // India
	'ID', // Indonesia
	'IR', // Iran
	'IQ', // Iraq
	'IE', // Ireland
	'IL', // Israel
	'IT', // Italy
	'JM', // Jamaica
	'JP', // Japan
	'JO', // Jordan
	'KZ', // Kazakhstan
	'KE', // Kenya
	'KI', // Kiribati
	'KP', // North Korea
	'KR', // South Korea
	'KW', // Kuwait
	'KG', // Kyrgyzstan
	'LA', // Laos
	'LV', // Latvia
	'LB', // Lebanon
	'LS', // Lesotho
	'LR', // Liberia
	'LY', // Libya
	'LI', // Liechtenstein
	'LT', // Lithuania
	'LU', // Luxembourg
	'MG', // Madagascar
	'MW', // Malawi
	'MY', // Malaysia
	'MV', // Maldives
	'ML', // Mali
	'MT', // Malta
	'MH', // Marshall Islands
	'MR', // Mauritania
	'MU', // Mauritius
	'MX', // Mexico
	'FM', // Micronesia
	'MD', // Moldova
	'MC', // Monaco
	'MN', // Mongolia
	'ME', // Montenegro
	'MA', // Morocco
	'MZ', // Mozambique
	'MM', // Myanmar (Burma)
	'NA', // Namibia
	'NR', // Nauru
	'NP', // Nepal
	'NL', // Netherlands
	'NZ', // New Zealand
	'NI', // Nicaragua
	'NE', // Niger
	'NG', // Nigeria
	'MK', // North Macedonia
	'NO', // Norway
	'OM', // Oman
	'PK', // Pakistan
	'PW', // Palau
	'PA', // Panama
	'PG', // Papua New Guinea
	'PY', // Paraguay
	'PE', // Peru
	'PH', // Philippines
	'PL', // Poland
	'PR', // Puerto Rico
	'PT', // Portugal
	'QA', // Qatar
	'RO', // Romania
	'RU', // Russia
	'RW', // Rwanda
	'KN', // Saint Kitts and Nevis
	'LC', // Saint Lucia
	'VC', // Saint Vincent and the Grenadines
	'WS', // Samoa
	'SM', // San Marino
	'ST', // São Tomé and Príncipe
	'SA', // Saudi Arabia
	'SN', // Senegal
	'RS', // Serbia
	'SC', // Seychelles
	'SL', // Sierra Leone
	'SG', // Singapore
	'SK', // Slovakia
	'SI', // Slovenia
	'SB', // Solomon Islands
	'SO', // Somalia
	'ZA', // South Africa
	'SS', // South Sudan
	'ES', // Spain
	'LK', // Sri Lanka
	'SD', // Sudan
	'SR', // Suriname
	'SE', // Sweden
	'CH', // Switzerland
	'SY', // Syria
	'TW', // Taiwan
	'TJ', // Tajikistan
	'TZ', // Tanzania
	'TH', // Thailand
	'TL', // Timor-Leste
	'TG', // Togo
	'TO', // Tonga
	'TT', // Trinidad and Tobago
	'TN', // Tunisia
	'TR', // Turkey
	'TM', // Turkmenistan
	'TV', // Tuvalu
	'UG', // Uganda
	'UA', // Ukraine
	'AE', // United Arab Emirates
	'UK', // United Kingdom
	'US', // United States
	'UY', // Uruguay
	'UZ', // Uzbekistan
	'VU', // Vanuatu
	'VE', // Venezuela
	'VN', // Vietnam
	'YE', // Yemen
	'ZM', // Zambia
	'ZW', // Zimbabwe
	'GB-WLS', // wales
] as const;

// The list of country codes and names as an object
const countryMap: Record<string, string> = {
	Afghanistan: 'AF',
	Albania: 'AL',
	Algeria: 'DZ',
	'American Samoa': 'AS',
	Andorra: 'AD',
	Angola: 'AO',
	Anguilla: 'AI',
	Antarctica: 'AQ',
	'Antigua and Barbuda': 'AG',
	Argentina: 'AR',
	Armenia: 'AM',
	Aruba: 'AW',
	Australia: 'AU',
	Austria: 'AT',
	Azerbaijan: 'AZ',
	Bahamas: 'BS',
	Bahrain: 'BH',
	Bangladesh: 'BD',
	Barbados: 'BB',
	Belarus: 'BY',
	Belgium: 'BE',
	Belize: 'BZ',
	Benin: 'BJ',
	Bermuda: 'BM',
	Bhutan: 'BT',
	Bolivia: 'BO',
	'Bosnia and Herzegovina': 'BA',
	Botswana: 'BW',
	Brazil: 'BR',
	'British Indian Ocean Territory': 'IO',
	Brunei: 'BN',
	Bulgaria: 'BG',
	'Burkina Faso': 'BF',
	Burundi: 'BI',
	'Cabo Verde': 'CV',
	Cambodia: 'KH',
	Cameroon: 'CM',
	Canada: 'CA',
	'Cayman Islands': 'KY',
	'Central African Republic': 'CF',
	Chad: 'TD',
	Chile: 'CL',
	China: 'CN',
	Colombia: 'CO',
	Comoros: 'KM',
	'Congo (Congo-Brazzaville)': 'CG',
	'Congo (Congo-Kinshasa)': 'CD',
	'Costa Rica': 'CR',
	"Côte d'Ivoire": 'CI',
	Croatia: 'HR',
	Cuba: 'CU',
	Cyprus: 'CY',
	'Czech Republic': 'CZ',
	Denmark: 'DK',
	Djibouti: 'DJ',
	Dominica: 'DM',
	'Dominican Republic': 'DO',
	Ecuador: 'EC',
	Egypt: 'EG',
	'El Salvador': 'SV',
	'Equatorial Guinea': 'GQ',
	Eritrea: 'ER',
	Estonia: 'EE',
	Eswatini: 'SZ',
	Ethiopia: 'ET',
	Fiji: 'FJ',
	Finland: 'FI',
	France: 'FR',
	Gabon: 'GA',
	Gambia: 'GM',
	Georgia: 'GE',
	Germany: 'DE',
	Ghana: 'GH',
	Greece: 'GR',
	Grenada: 'GD',
	Guam: 'GU',
	Guatemala: 'GT',
	Guinea: 'GN',
	'Guinea-Bissau': 'GW',
	Guyana: 'GY',
	Haiti: 'HT',
	Honduras: 'HN',
	Hungary: 'HU',
	Iceland: 'IS',
	India: 'IN',
	Indonesia: 'ID',
	Iran: 'IR',
	Iraq: 'IQ',
	Ireland: 'IE',
	Israel: 'IL',
	Italy: 'IT',
	Jamaica: 'JM',
	Japan: 'JP',
	Jordan: 'JO',
	Kazakhstan: 'KZ',
	Kenya: 'KE',
	Kiribati: 'KI',
	'North Korea': 'KP',
	'South Korea': 'KR',
	Kuwait: 'KW',
	Kyrgyzstan: 'KG',
	Laos: 'LA',
	Latvia: 'LV',
	Lebanon: 'LB',
	Lesotho: 'LS',
	Liberia: 'LR',
	Libya: 'LY',
	Liechtenstein: 'LI',
	Lithuania: 'LT',
	Luxembourg: 'LU',
	Madagascar: 'MG',
	Malawi: 'MW',
	Malaysia: 'MY',
	Maldives: 'MV',
	Mali: 'ML',
	Malta: 'MT',
	'Marshall Islands': 'MH',
	Mauritania: 'MR',
	Mauritius: 'MU',
	Mexico: 'MX',
	Micronesia: 'FM',
	Moldova: 'MD',
	Monaco: 'MC',
	Mongolia: 'MN',
	Montenegro: 'ME',
	Morocco: 'MA',
	Mozambique: 'MZ',
	'Myanmar (Burma)': 'MM',
	Namibia: 'NA',
	Nauru: 'NR',
	Nepal: 'NP',
	Netherlands: 'NL',
	'New Zealand': 'NZ',
	Nicaragua: 'NI',
	Niger: 'NE',
	Nigeria: 'NG',
	'North Macedonia': 'MK',
	Norway: 'NO',
	Oman: 'OM',
	Pakistan: 'PK',
	Palau: 'PW',
	Panama: 'PA',
	'Papua New Guinea': 'PG',
	Paraguay: 'PY',
	Peru: 'PE',
	Philippines: 'PH',
	Poland: 'PL',
	'Puerto Rico': 'PR',
	Portugal: 'PT',
	Qatar: 'QA',
	Romania: 'RO',
	Russia: 'RU',
	Rwanda: 'RW',
	'Saint Kitts and Nevis': 'KN',
	'Saint Lucia': 'LC',
	'Saint Vincent and the Grenadines': 'VC',
	Samoa: 'WS',
	'San Marino': 'SM',
	'São Tomé and Príncipe': 'ST',
	'Saudi Arabia': 'SA',
	Senegal: 'SN',
	Serbia: 'RS',
	Seychelles: 'SC',
	'Sierra Leone': 'SL',
	Singapore: 'SG',
	Slovakia: 'SK',
	Slovenia: 'SI',
	'Solomon Islands': 'SB',
	Somalia: 'SO',
	'South Africa': 'ZA',
	'South Sudan': 'SS',
	Spain: 'ES',
	'Sri Lanka': 'LK',
	Sudan: 'SD',
	Suriname: 'SR',
	Sweden: 'SE',
	Switzerland: 'CH',
	Syria: 'SY',
	Taiwan: 'TW',
	Tajikistan: 'TJ',
	Tanzania: 'TZ',
	Thailand: 'TH',
	'Timor-Leste': 'TL',
	Togo: 'TG',
	Tonga: 'TO',
	'Trinidad and Tobago': 'TT',
	Tunisia: 'TN',
	Turkey: 'TR',
	Turkmenistan: 'TM',
	Tuvalu: 'TV',
	Uganda: 'UG',
	Ukraine: 'UA',
	'United Arab Emirates': 'AE',
	'United Kingdom': 'UK',
	'United States': 'US',
	Uruguay: 'UY',
	Uzbekistan: 'UZ',
	Vanuatu: 'VU',
	Venezuela: 'VE',
	Vietnam: 'VN',
	Yemen: 'YE',
	Zambia: 'ZM',
	Zimbabwe: 'ZW',
} as const;

// Function to convert country name to abbreviation
export function getCountryAbbreviation(countryName: string): string | undefined {
	return countryMap[countryName] || undefined;
}
