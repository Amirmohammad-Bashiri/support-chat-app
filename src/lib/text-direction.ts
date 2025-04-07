/**
 * Detects the text direction (RTL or LTR) based on the content
 * @param text The text to analyze
 * @returns "rtl" for right-to-left text or "ltr" for left-to-right text
 */
export function detectTextDirection(text: string): "rtl" | "ltr" {
  if (!text || text.trim() === "") {
    return "rtl"; // Default to RTL for empty text (Persian UI)
  }

  // Regular expression to match RTL characters
  const rtlChars =
    /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;

  // Regular expression to match LTR characters
  const ltrChars =
    /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF]/;

  // Check the first few characters to determine direction
  const firstFewChars = text.trim().substring(0, Math.min(text.length, 10));

  // Count RTL and LTR characters in the first few characters
  let rtlCount = 0;
  let ltrCount = 0;

  for (let i = 0; i < firstFewChars.length; i++) {
    const char = firstFewChars[i];
    if (rtlChars.test(char)) {
      rtlCount++;
    } else if (ltrChars.test(char)) {
      ltrCount++;
    }
  }

  // If there are more RTL characters or equal, use RTL direction
  // This gives preference to RTL which is appropriate for a primarily Persian app
  return rtlCount >= ltrCount ? "rtl" : "ltr";
}

/**
 * Alternative implementation using the first strong character algorithm
 * This is closer to how browsers determine text direction
 */
export function detectTextDirectionFirstStrong(text: string): "rtl" | "ltr" {
  if (!text || text.trim() === "") {
    return "rtl"; // Default to RTL for empty text
  }

  // Remove spaces, numbers, and punctuation to find the first strong character
  const cleanText = text.replace(
    /[\s0-9!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g,
    ""
  );

  if (cleanText.length === 0) {
    return "rtl"; // Default to RTL if no strong characters
  }

  // Check if the first character is RTL
  const rtlChars =
    /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(cleanText[0]) ? "rtl" : "ltr";
}
