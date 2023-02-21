export function isValidText(value: string | number | undefined) {
  // check if value is string or number
  return value || value === 0;
}

export function uuid() {
  return crypto.randomUUID();
}

export class PerfMeter {
  private startTime: number;
  name: string;

  constructor(name = "PerfMeter") {
    this.name = name;
    this.startTime = performance.now();
  }

  public start(newName?: string) {
    if (newName) this.name = newName;
    this.startTime = performance.now();
  }

  public end() {
    const endTime = performance.now();
    const { startTime, name } = this;

    const execTime = Math.round(endTime - startTime);
    console.log(`${name}: execution time: ${execTime} ms`);
    return execTime;
  }
}

// export function errorIfNotTrue(condition: boolean | any) {
//   if (condition) throw new Error("Throwing error becase condition not true");
// }

// export function getValueFromObject<O, V>(obj: O, extractFn: (obj: O) => V): V {
//   return extractFn(obj);
// }

// export function getNumberFromObject<O, V extends number>(
//   obj: O,
//   extractFn: (obj: O) => V
// ): V {
//   return extractFn(obj);
// }

/**
 * sortBy function helper for Array.sort
 * @param extractFunc to extract number from given object
 * @returns function that can be use inside as "Array.sort(by(extractFunc)):
 */
/* eslint-disable indent */
export const sortBy =
  <T>(extractFunc: (obj: T) => number) =>
  (valueA: T, valueB: T): number =>
    extractFunc(valueA) - extractFunc(valueB);
/* eslint-enable indent */

export const mean = (values: number[]): number =>
  values.reduce((a, b) => a + b, 0) / values.length;

export function createPairingMap<TKey, TValue>(
  mapKeys: TKey[],
  mapValues: TValue[]
  // extractFunc: (item: TValue) => TKey
) {
  const thisMap = new Map<TKey, TValue>();

  mapKeys.forEach((key, keyIndex) => thisMap.set(key, mapValues[keyIndex]));
  // for (const item of list) {
  //   const itemExtract = extractFunc(item);
  //   thisMap.set(itemExtract, item);
  // }

  const get = (key: TKey) => thisMap.get(key) as TValue;
  // const getByList = (keyList: TKey[]) => keyList.map((item) => get(item));
  const keys = () => thisMap.keys();

  return { get, keys };
}

// const testData: [["a", "b"], [1, 2]] = [
//   ["a", "b"],
//   [1, 2],
// ];

// const testPair = createPairingMap(...testData);

// const x = testPair.get("c");
