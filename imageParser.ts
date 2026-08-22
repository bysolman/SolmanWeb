/**
 * Parses Google Drive share links and direct image URLs into an optimized renderable format.
 * Compatible with Firebase Spark Plan (no Firebase Storage required).
 */
export function parseImageUrl(inputUrl: string): string {
  if (!inputUrl) return '';
  const trimmed = inputUrl.trim();

  // Match Google Drive share links: /file/d/FILE_ID or id=FILE_ID
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  const driveIdParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdParamMatch && driveIdParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdParamMatch[1]}`;
  }

  return trimmed;
}
