import { VocabularyEntry } from '../types';
import { HIRAGANA_ORDER } from '../constants';

/**
 * Sorts vocabulary cyclically based on the hiragana starting character.
 * 
 * Logic:
 * 1. Identifies which Hiragana groups (lines) actually contain vocabulary items.
 * 2. Filters out empty groups from the rotation cycle.
 * 3. Rotates the order of these non-empty groups based on rotationCount.
 * 4. Sorts the vocabulary list according to this rotated group order.
 *    Items not in HIRAGANA_ORDER (e.g. unknown chars) are placed at the end.
 */
export const getCyclicSortedVocabulary = (
  vocabulary: VocabularyEntry[],
  rotationCount: number
): VocabularyEntry[] => {
  if (vocabulary.length === 0) return [];

  // 1. Identify which groups from HIRAGANA_ORDER are present in the dataset
  const presentChars = new Set<string>();
  vocabulary.forEach((entry) => {
    // Get the first character. 
    // Note: This logic assumes standard hiragana inputs.
    const char = entry.hiragana.charAt(0);
    if (HIRAGANA_ORDER.includes(char)) {
      presentChars.add(char);
    }
  });

  // 2. Build the list of active groups, preserving the original dictionary order
  const groupsWithData = HIRAGANA_ORDER.filter((char) => presentChars.has(char));

  // If no standard kana groups found, just return basic alphabetical sort
  if (groupsWithData.length === 0) {
     return [...vocabulary].sort((a, b) => a.hiragana.localeCompare(b.hiragana, 'ja'));
  }

  // 3. Determine the rotated order of groups
  // rotationCount is treated as the number of "steps" to shift the starting group
  const effectiveRotation = rotationCount % groupsWithData.length;
  
  // e.g. groups=[A, B, C], rot=1 => [B, C, A]
  // We slice at the index equal to the rotation
  const partBefore = groupsWithData.slice(0, effectiveRotation);
  const partAfter = groupsWithData.slice(effectiveRotation);
  const rotatedGroups = [...partAfter, ...partBefore];

  // Map each char to its new rank (0 being the first group to show)
  const groupRank = new Map<string, number>();
  rotatedGroups.forEach((char, index) => {
    groupRank.set(char, index);
  });

  // 4. Perform the sort
  return [...vocabulary].sort((a, b) => {
    const charA = a.hiragana.charAt(0);
    const charB = b.hiragana.charAt(0);

    // Items in known groups get their rank. Others get a high rank (end of list).
    const rankA = groupRank.has(charA) ? groupRank.get(charA)! : 999;
    const rankB = groupRank.has(charB) ? groupRank.get(charB)! : 999;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // Secondary sort: Alphabetical within the same group
    return a.hiragana.localeCompare(b.hiragana, 'ja');
  });
};
