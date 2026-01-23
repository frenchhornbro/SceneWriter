import type { CreateHighlightRequest, SceneHighlight, HighlightSegment } from "@shared/highlight";

const CONTEXT_LENGTH = 50;

/**
 * Captures the current text selection and returns highlight data
 */
export function captureTextSelection(
  containerElement: HTMLElement,
  sceneText: string,
  sceneId: number,
  sceneVersion: number,
  color: string
): CreateHighlightRequest | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);

  // Check if selection is within the container
  if (!containerElement.contains(range.commonAncestorContainer)) {
    return null;
  }

  const selectedText = selection.toString().trim();
  if (selectedText.length === 0) {
    return null;
  }

  // Find the offsets in the full text
  const startOffset = getTextOffset(containerElement, range.startContainer, range.startOffset, sceneText);
  const endOffset = startOffset + selectedText.length;

  if (startOffset === -1) {
    console.error("Could not determine text offset");
    return null;
  }

  // Get context before and after the selection
  const prefixStart = Math.max(0, startOffset - CONTEXT_LENGTH);
  const prefixContext = sceneText.slice(prefixStart, startOffset);

  const suffixEnd = Math.min(sceneText.length, endOffset + CONTEXT_LENGTH);
  const suffixContext = sceneText.slice(endOffset, suffixEnd);

  return {
    sceneId,
    sceneVersion,
    startOffset,
    endOffset,
    exactText: selectedText,
    prefixContext,
    suffixContext,
    color,
  };
}

/**
 * Calculates the character offset of a position within the container
 */
function getTextOffset(
  container: HTMLElement,
  targetNode: Node,
  targetOffset: number,
  fullText: string
): number {
  // Get all text content from the container
  const containerText = container.textContent || "";

  // Create a range from the start of the container to the target position
  const range = document.createRange();
  range.setStart(container, 0);
  range.setEnd(targetNode, targetOffset);

  // Get the text content of this range
  const textBeforeTarget = range.toString();

  // Find this text in the full scene text
  const offset = fullText.indexOf(textBeforeTarget);

  if (offset === -1) {
    // Fallback: try to find the text at the position
    return fullText.indexOf(containerText.slice(0, textBeforeTarget.length));
  }

  return offset + textBeforeTarget.length;
}

/**
 * Splits scene text into segments based on highlight boundaries
 * Handles overlapping highlights by creating segments where boundaries change
 */
export function segmentTextWithHighlights(
  sceneText: string,
  highlights: SceneHighlight[]
): HighlightSegment[] {
  if (highlights.length === 0) {
    return [{
      text: sceneText,
      startOffset: 0,
      endOffset: sceneText.length,
      highlights: [],
    }];
  }

  // Collect all unique boundary points
  const boundaries = new Set<number>([0, sceneText.length]);
  highlights.forEach(h => {
    boundaries.add(h.startOffset);
    boundaries.add(h.endOffset);
  });

  // Sort boundaries
  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

  // Create segments
  const segments: HighlightSegment[] = [];
  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const start = sortedBoundaries[i];
    const end = sortedBoundaries[i + 1];

    // Find all highlights that apply to this segment
    const applicableHighlights = highlights.filter(
      h => h.startOffset <= start && h.endOffset >= end && h.isValid
    );

    segments.push({
      text: sceneText.slice(start, end),
      startOffset: start,
      endOffset: end,
      highlights: applicableHighlights,
    });
  }

  return segments;
}

/**
 * Calculates the relative luminance of a color
 * Returns a value between 0 (darkest) and 1 (brightest)
 */
function getLuminance(hexColor: string): number {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Determines whether to use dark or light text based on background color
 * Returns dark text for light backgrounds, light text for dark backgrounds
 */
export function getTextColorForBackground(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);
  // Use dark text if luminance is above 0.5 (light background)
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

/**
 * Gets the color to display for a segment with multiple highlights
 * Uses a layered approach with the most recent highlight on top
 */
export function getSegmentColor(highlights: SceneHighlight[]): string | null {
  if (highlights.length === 0) return null;
  if (highlights.length === 1) return highlights[0].color;

  // Return the color of the most recently created highlight
  const sorted = [...highlights].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return sorted[0].color;
}

/**
 * Gets a CSS style string for rendering overlapping highlights
 */
export function getSegmentStyle(highlights: SceneHighlight[]): React.CSSProperties {
  if (highlights.length === 0) {
    return {};
  }

  if (highlights.length === 1) {
    const bgColor = highlights[0].color;
    return {
      backgroundColor: bgColor,
      color: getTextColorForBackground(bgColor),
      cursor: 'pointer',
    };
  }

  // For multiple highlights, use a striped background or border
  const primaryColor = getSegmentColor(highlights);
  const allColors = highlights.map(h => h.color);

  return {
    backgroundColor: primaryColor || undefined,
    color: primaryColor ? getTextColorForBackground(primaryColor) : undefined,
    borderBottom: `3px solid ${allColors[allColors.length - 1]}`,
    cursor: 'pointer',
    position: 'relative',
  };
}

/**
 * Clears the current text selection
 */
export function clearSelection() {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
}
