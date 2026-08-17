export function isAnswerCorrect(value: string, expected?: string, type?: string) {
  if (!expected) return false;

  const normalizedInput = value.trim();
  const normalizedExpected = expected.trim();

  if (type === "your-name") {
    if (!normalizedInput) return false;

    const validNamePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[\s'-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
    if (!validNamePattern.test(normalizedInput)) return false;

    const letterOnly = normalizedInput.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "");
    if (letterOnly.length < 2) return false;

    const vowels = (letterOnly.match(/[aeiouy]/gi) || []).length;
    if (vowels === 0) return false;

    const consonantRun = letterOnly.split(/[aeiouy]/gi).filter(Boolean).some((part) => part.length >= 4);
    const words = normalizedInput.split(/\s+/).filter(Boolean);

    if (words.length === 1 && letterOnly.length >= 6 && vowels <= 2 && consonantRun) {
      return false;
    }

    return true;
  }

  if (expected === "your-name") {
    return Boolean(normalizedInput) && normalizedInput.length >= 2;
  }

  const requiresExactCase = /[A-Z]/.test(normalizedExpected);
  if (requiresExactCase) {
    return normalizedInput === normalizedExpected;
  }

  return normalizedInput.toLowerCase() === normalizedExpected.toLowerCase();
}

export function isFileSafeForUpload(file?: { size?: number; name?: string }) {
  if (!file) return false;

  const name = file.name?.trim() ?? "";
  if (!name || name.length < 2) return false;

  if (typeof file.size === "number" && file.size > 10 * 1024 * 1024) {
    return false;
  }

  return true;
}
