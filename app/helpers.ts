/** Mutably move an element of `targetIdx` to index `toIdx`. */
export function moveArrayElement(arr: any[], targetIdx: number, toIdx: number) {
  return arr.splice(toIdx, 0, arr.splice(targetIdx, 1)[0]);
}

