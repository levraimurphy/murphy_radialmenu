import { useContext } from 'react';
import { TranslationContext } from './TranslationContext';

/**
 * Hook to access translation functions
 * @returns {object} Translation context with t, tBodyPart, tCondition, locale, setLocale
 */
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default useTranslation;
