import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';

export const TranslationContext = createContext(null);

const FALLBACK_LOCALE = 'en';

const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const loadLocaleScript = (locale) => {
  return new Promise((resolve) => {
    window.__RADIALMENU_LOCALE__ = null;
    const script = document.createElement('script');
    script.src = `./locales/${locale}.js`;
    script.onload = () => {
      const data = window.__RADIALMENU_LOCALE__;
      window.__RADIALMENU_LOCALE__ = null;
      resolve(data || {});
    };
    script.onerror = () => resolve({});
    document.head.appendChild(script);
  });
};

export const TranslationProvider = ({ children }) => {
  const configLocale = window.__RADIALMENU_CONFIG__?.locale || FALLBACK_LOCALE;
  const [locale, setLocale] = useState(configLocale);
  const [customTranslations, setCustomTranslations] = useState({});
  const [fallbackTrans, setFallbackTrans] = useState({});
  const [localeTrans, setLocaleTrans] = useState({});

  // Load fallback locale (en.js)
  useEffect(() => {
    loadLocaleScript(FALLBACK_LOCALE).then(setFallbackTrans);
  }, []);

  // Load current locale when it changes
  useEffect(() => {
    if (locale === FALLBACK_LOCALE) {
      setLocaleTrans({});
      return;
    }
    loadLocaleScript(locale).then(setLocaleTrans);
  }, [locale]);

  const currentTranslations = useMemo(() => {
    const customTrans = customTranslations[locale] || {};
    // en.js -> locale.js -> custom (Lua)
    return deepMerge(
      deepMerge(fallbackTrans, localeTrans),
      customTrans
    );
  }, [locale, customTranslations, fallbackTrans, localeTrans]);

  const t = useCallback((key, fallback = key) => {
    const value = getNestedValue(currentTranslations, key);
    return value !== undefined ? value : fallback;
  }, [currentTranslations]);

  const tBodyPart = useCallback((partId) => {
    return t(`bodyParts.${partId}`, partId);
  }, [t]);

  const tCondition = useCallback((label) => {
    if (!label) return '';
    const key = label.toLowerCase().replace(/\s+/g, '');
    const translated = getNestedValue(currentTranslations, `conditions.${key}`);
    return translated !== undefined ? translated : label;
  }, [currentTranslations]);

  const setCustomTranslationsForLocale = useCallback((loc, trans) => {
    setCustomTranslations(prev => ({
      ...prev,
      [loc]: deepMerge(prev[loc] || {}, trans)
    }));
  }, []);

  const value = useMemo(() => ({
    locale,
    setLocale,
    t,
    tBodyPart,
    tCondition,
    setCustomTranslations: setCustomTranslationsForLocale,
    translations: currentTranslations
  }), [locale, t, tBodyPart, tCondition, setCustomTranslationsForLocale, currentTranslations]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
