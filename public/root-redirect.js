const lang = navigator.language || navigator.userLanguage || "";
const isFrench = lang.toLowerCase().startsWith("fr");

window.location.replace(isFrench ? "/fr/" : "/en/");
