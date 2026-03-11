import { Language } from './i18n';

// Simple in-memory cache to avoid redundant API calls during development/rendering
const cache: Record<string, string> = {};

export async function translateText(text: string, targetLang: Language): Promise<string> {
  if (!text) return text;

  // If the target language is English (which is the source data language), return as is
  if (targetLang === 'en') return text;

  const cacheKey = `${text}-${targetLang}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );

    if (!response.ok) {
      console.warn(`Translation failed with status: ${response.status}`);
      return text;
    }

    const data = await response.json();
    // The Google Translate API returns a nested array structure like: [[[ "안녕하세요", "Hello", ... ]]]
    const translatedText = data[0][0][0];

    if (translatedText) {
      cache[cacheKey] = translatedText;
      return translatedText;
    }

    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}
