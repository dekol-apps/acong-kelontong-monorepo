export const getNestedProperty = (obj: any, path?: string): any => {
  const properties = path?.split('.');
  let currentObject = obj;

  for (const property of properties||[]) {
    if (currentObject && currentObject.hasOwnProperty(property)) {
      currentObject = currentObject[property];
    } else {
      return undefined; // Property not found
    }
  }

  return currentObject;
}

export const trackByFn = (index: number, item: any): any => {
  return item.someUniqueIdentifier; // Replace with a unique identifier from your item
}

export function decimalToNumber(val?: any) {
  return parseFloat(val?.toString() ?? '0');
}