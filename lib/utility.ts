
export function NaNSafeParse(number) {
  const maybeInt = parseInt(number);
  if (Number.isNaN(maybeInt)) {
    return 0;
  } else {
    return maybeInt;
  }
}

export function nullParse(number) {
  if (number == null ||
    number == "" ||
    number == undefined) {
    return null;
  }
  return NaNSafeParse(number);
}

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/// takes an array of objects and returns a map based on the given fields
/// @array array to search through
/// @keyField the field to use as the key
/// @valueField the field to use as the value
/// @nullValueField the field to use as the value if the value field is null
/// example:
///   const data = [
///     { id: 1, name: 'John', age: 20 },
///     { id: 2, name: 'Jane', age: 30 },
///     { id: 3, name: null, age: 40 }
///   ];
///   const map = objectArrayToMap(data, 'id', 'name', 'age');
///   console.log(map);
///   // {
///   //   1: 'John',
///   //   2: 'Jane',
///   //   3: 40.
///   // }
export function objectArrayToMap(array, keyField, valueField, nullValueField = null): Map<string, string> {
  const map = new Map();
  for (let i = 0; i < array?.length; i++) {
    if (array[i][valueField] != null) {
      map.set(array[i][keyField].toString(), array[i][valueField].toString())
    } else {
      map.set(array[i][keyField].toString(), array[i][nullValueField].toString())
    }
  }
  return map;
}