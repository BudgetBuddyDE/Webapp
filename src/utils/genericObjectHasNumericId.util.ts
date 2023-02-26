/** Function to check if an generic type is an object and has an valid numeric id-property */
export function genericObjectHasNumericId<T>(obj: T): boolean {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    // Object.hasOwn(obj, "id") &&
    'id' in obj &&
    typeof (obj as any).id === 'number'
  );
}
