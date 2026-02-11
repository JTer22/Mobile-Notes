/**
 * Utility functions for note management
 */

export interface Note {
  type: "free" | "preaching";
  title: string;
  content: string;
  speaker?: string;
  date?: string;
  lastEdited?: number;
  color?: string;
}

/**
 * Calculates the contrast color (black or white) based on background color
 * Uses the relative luminance formula (WCAG)
 */
export const getContrastColor = (bgColor: string): string => {
  try {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate relative luminance
    const luminance = r * 0.299 + g * 0.587 + b * 0.114;

    // Return black for light backgrounds, white for dark
    return luminance > 186 ? "#000" : "#fff";
  } catch {
    return "#000"; // Default to black if parsing fails
  }
};

/**
 * Validates if a note has required fields for saving
 */
export const isValidNote = (note: Partial<Note>): boolean => {
  if (!note.type) return false;

  const title = note.title?.trim() ?? "";
  const content = note.content?.trim() ?? "";

  if (note.type === "preaching") {
    // Preaching notes require both title and content
    return title.length > 0 && content.length > 0;
  }

  // Free notes require either title or content
  return title.length > 0 || content.length > 0;
};

/**
 * Sanitizes note content before saving
 */
export const sanitizeNote = (note: Note): Note => {
  return {
    ...note,
    title: note.title?.trim() ?? "",
    content: note.content?.trim() ?? "",
    speaker: note.speaker?.trim() ?? undefined,
    date: note.date?.trim() ?? undefined,
  };
};

/**
 * Formats date for display
 */
export const formatDate = (timestamp?: number): string => {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};
/**
 * Strips HTML tags from content for plain text display
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return "";

  try {
    // Remove script and style tags with content
    let text = html.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

    // Replace common HTML tags with newlines for readability
    text = text.replace(/<\/(p|div|li|br|h[1-6])>/gi, "\n");
    text = text.replace(/<li>/gi, "• ");

    // Remove remaining HTML tags
    text = text.replace(/<[^>]*>/g, "");

    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, "\n\n").trim();

    return text;
  } catch {
    return html;
  }
};

/**
 * Wraps HTML content with styling for display
 */
export const wrapHtmlContent = (
  html: string,
  backgroundColor: string,
  textColor: string,
): string => {
  if (!html) return "";

  try {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              background-color: ${backgroundColor};
              color: ${textColor};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              font-size: 16px;
              line-height: 1.5;
              margin: 8px;
              padding: 0;
            }
            p, div { margin: 0 0 8px 0; }
            li { margin-left: 20px; }
            strong, b { font-weight: 600; }
            em, i { font-style: italic; }
            u { text-decoration: underline; }
            s, strike { text-decoration: line-through; }
            h1, h2, h3, h4, h5, h6 { margin: 12px 0 8px 0; font-weight: 600; }
            h1 { font-size: 24px; }
            h2 { font-size: 20px; }
            h3 { font-size: 18px; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  } catch {
    return html;
  }
};
