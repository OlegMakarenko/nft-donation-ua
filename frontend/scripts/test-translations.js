const languages = {
	'English': require('../src/i18n/en.json'),
	'Українська': require('../src/i18n/ua.json'),
	'日本語': require('../src/i18n/ja.json'),
	'中文': require('../src/i18n/zh.json'),
};

const base = languages.English;

console.log('Available languages:', Object.keys(languages));

Object.keys(languages).forEach((lang) => {
    console.log('Testing', lang);
    const locale = languages[lang];

    Object.keys(base).forEach(key => {
        if (!locale.hasOwnProperty(key)) {
            throw new Error('Locale "' + lang + '" is incorrect. Failed to find key "' + key + '"');
        }
    })
});