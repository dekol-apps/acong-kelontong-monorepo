export const getNestedProperty = (obj: any, path?: string): any => {
  const properties = path?.split('.');
  let currentObject = obj;

  for (const property of properties || []) {
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

// Recursively transform any type of object into form data 
export const objToFormData = (
  body: any,
  options?: { fileFields?: string[] },
  formData: FormData = new FormData(),
  parentKey?: string
): FormData => {
  const fileFields = options?.fileFields ?? [];

  Object.entries(body).forEach(([key, value]) => {
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value === null || value === undefined) return;

    // FILE
    if (value instanceof File) {
      formData.append(formKey, value);
      return;
    }

    // DATE
    if (value instanceof Date) {
      formData.append(formKey, value.toISOString());
      return;
    }

    // ARRAY
    if (Array.isArray(value)) {
      // 🔥 If this key is declared as fileField → Multer mode: key[val,val,val]
      if (fileFields.includes(key)) {
        value.forEach(item => {
          if (item instanceof File) {
            formData.append(key, item); // repeated key
          } else {
            formData.append(key, String(item));
          }
        });
      }

      // 🔵 Otherwise → structured array mode: key[0], key[1], key[2]
      else {
        value.forEach((item, index) => {
          const arrayKey = `${formKey}[${index}]`;

          if (typeof item === 'object' && !(item instanceof File)) {
            objToFormData(item, options, formData, arrayKey);
          } else if (item instanceof File) {
            formData.append(arrayKey, item);
          } else {
            formData.append(arrayKey, String(item));
          }
        });
      }

      return;
    }

    // OBJECT
    if (typeof value === 'object') {
      objToFormData(value, options, formData, formKey);
      return;
    }

    // PRIMITIVE
    formData.append(formKey, String(value));
  });

  return formData;
};