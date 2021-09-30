
export function NaNSafeParse(number) {
  var maybeInt = parseInt(number);
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

export function makeDropdownable(array, keyField, valueField) {
  const map = new Map();
  for (var i = 0; i < array.length; i++) {
    map.set(array[i][keyField], array[i][valueField])
  }
  return map;
}