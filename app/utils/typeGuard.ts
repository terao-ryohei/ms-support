export const isHasUndefined = <T>(
  arr: Record<string, T | undefined | null>,
): arr is Record<string, T> => {
  return Object.values(arr).every(
    (item): item is T => item !== undefined && item !== null,
  );
};
