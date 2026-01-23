import type { SceneHighlight, TextEdit } from "@shared/highlight";

interface AdjustedHighlight {
  id: number;
  startOffset: number;
  endOffset: number;
  exactText: string;
  prefixContext: string;
  suffixContext: string;
  isValid: boolean;
}

/**
 * Adjusts a highlight's offsets based on a text edit operation
 */
export function adjustHighlightForEdit(
  highlight: SceneHighlight,
  edit: { position: number; charsInserted: number; charsDeleted: number },
  newSceneText: string
): AdjustedHighlight | null {
  const { position, charsInserted, charsDeleted } = edit;
  const delta = charsInserted - charsDeleted;

  // Case 1: Edit is entirely before highlight - shift highlight
  if (position + charsDeleted <= highlight.startOffset) {
    return {
      id: highlight.id,
      startOffset: Math.max(0, highlight.startOffset + delta),
      endOffset: Math.max(0, highlight.endOffset + delta),
      exactText: highlight.exactText,
      prefixContext: highlight.prefixContext,
      suffixContext: highlight.suffixContext,
      isValid: true,
    };
  }

  // Case 2: Edit is entirely after highlight - no change needed
  if (position >= highlight.endOffset) {
    return {
      id: highlight.id,
      startOffset: highlight.startOffset,
      endOffset: highlight.endOffset,
      exactText: highlight.exactText,
      prefixContext: highlight.prefixContext,
      suffixContext: highlight.suffixContext,
      isValid: true,
    };
  }

  // Case 3: Edit overlaps or is within highlight - attempt recovery
  const recovered = attemptRecovery(highlight, newSceneText);

  if (recovered) {
    return {
      id: highlight.id,
      ...recovered,
      isValid: true,
    };
  }

  // Case 4: Can't recover - mark as invalid
  return {
    id: highlight.id,
    startOffset: highlight.startOffset,
    endOffset: highlight.endOffset,
    exactText: highlight.exactText,
    prefixContext: highlight.prefixContext,
    suffixContext: highlight.suffixContext,
    isValid: false,
  };
}

/**
 * Attempts to recover a highlight's position after text has been edited
 */
function attemptRecovery(
  highlight: SceneHighlight,
  newSceneText: string
): {
  startOffset: number;
  endOffset: number;
  exactText: string;
  prefixContext: string;
  suffixContext: string;
} | null {
  // Strategy 1: Search for exact text with prefix/suffix context
  const searchPattern = highlight.prefixContext + highlight.exactText + highlight.suffixContext;
  const contextIndex = newSceneText.indexOf(searchPattern);

  if (contextIndex !== -1) {
    const newStart = contextIndex + highlight.prefixContext.length;
    const newEnd = newStart + highlight.exactText.length;

    // Verify the recovered text matches
    const recoveredText = newSceneText.slice(newStart, newEnd);
    if (recoveredText === highlight.exactText) {
      return {
        startOffset: newStart,
        endOffset: newEnd,
        exactText: highlight.exactText,
        prefixContext: highlight.prefixContext,
        suffixContext: highlight.suffixContext,
      };
    }
  }

  // Strategy 2: Search for just the exact text (no context)
  const exactIndex = newSceneText.indexOf(highlight.exactText);
  if (exactIndex !== -1) {
    // Found it, but context may have changed - update context
    const newPrefixContext = newSceneText.slice(
      Math.max(0, exactIndex - 50),
      exactIndex
    );
    const newSuffixContext = newSceneText.slice(
      exactIndex + highlight.exactText.length,
      Math.min(newSceneText.length, exactIndex + highlight.exactText.length + 50)
    );

    return {
      startOffset: exactIndex,
      endOffset: exactIndex + highlight.exactText.length,
      exactText: highlight.exactText,
      prefixContext: newPrefixContext,
      suffixContext: newSuffixContext,
    };
  }

  // Strategy 3: Try to find with partial context
  if (highlight.prefixContext.length > 10) {
    const shortPrefix = highlight.prefixContext.slice(-20); // Last 20 chars of prefix
    const shortPattern = shortPrefix + highlight.exactText;
    const shortIndex = newSceneText.indexOf(shortPattern);

    if (shortIndex !== -1) {
      const newStart = shortIndex + shortPrefix.length;
      const newEnd = newStart + highlight.exactText.length;
      const recoveredText = newSceneText.slice(newStart, newEnd);

      if (recoveredText === highlight.exactText) {
        const newPrefixContext = newSceneText.slice(
          Math.max(0, newStart - 50),
          newStart
        );
        const newSuffixContext = newSceneText.slice(
          newEnd,
          Math.min(newSceneText.length, newEnd + 50)
        );

        return {
          startOffset: newStart,
          endOffset: newEnd,
          exactText: highlight.exactText,
          prefixContext: newPrefixContext,
          suffixContext: newSuffixContext,
        };
      }
    }
  }

  return null; // Can't recover
}

/**
 * Calculates text edit operations between old and new text using a simple diff algorithm
 */
export function calculateTextEdits(oldText: string, newText: string): Array<{
  position: number;
  charsInserted: number;
  charsDeleted: number;
}> {
  const edits: Array<{ position: number; charsInserted: number; charsDeleted: number; }> = [];

  // Find first difference
  let i = 0;
  while (i < oldText.length && i < newText.length && oldText[i] === newText[i]) {
    i++;
  }

  // If texts are identical, no edits
  if (i === oldText.length && i === newText.length) {
    return [];
  }

  // Find last common character
  let oldEnd = oldText.length - 1;
  let newEnd = newText.length - 1;
  while (oldEnd >= i && newEnd >= i && oldText[oldEnd] === newText[newEnd]) {
    oldEnd--;
    newEnd--;
  }

  const charsDeleted = oldEnd - i + 1;
  const charsInserted = newEnd - i + 1;

  if (charsDeleted > 0 || charsInserted > 0) {
    edits.push({
      position: i,
      charsInserted: Math.max(0, charsInserted),
      charsDeleted: Math.max(0, charsDeleted),
    });
  }

  return edits;
}

/**
 * Adjusts all highlights for a scene based on text edits
 */
export function adjustAllHighlights(
  highlights: SceneHighlight[],
  edits: Array<{ position: number; charsInserted: number; charsDeleted: number }>,
  newSceneText: string
): Array<AdjustedHighlight> {
  return highlights.map((highlight) => {
    let adjusted: AdjustedHighlight | null = {
      id: highlight.id,
      startOffset: highlight.startOffset,
      endOffset: highlight.endOffset,
      exactText: highlight.exactText,
      prefixContext: highlight.prefixContext,
      suffixContext: highlight.suffixContext,
      isValid: highlight.isValid,
    };

    // Apply each edit sequentially
    for (const edit of edits) {
      if (adjusted) {
        const highlightForEdit: SceneHighlight = {
          ...highlight,
          startOffset: adjusted.startOffset,
          endOffset: adjusted.endOffset,
          exactText: adjusted.exactText,
          prefixContext: adjusted.prefixContext,
          suffixContext: adjusted.suffixContext,
          isValid: adjusted.isValid,
        };
        adjusted = adjustHighlightForEdit(highlightForEdit, edit, newSceneText);
      }
    }

    return adjusted || {
      id: highlight.id,
      startOffset: highlight.startOffset,
      endOffset: highlight.endOffset,
      exactText: highlight.exactText,
      prefixContext: highlight.prefixContext,
      suffixContext: highlight.suffixContext,
      isValid: false,
    };
  });
}
