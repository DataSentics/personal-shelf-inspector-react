export function assertDefined<T>(args: T): asserts args is Defined<T> {
  //   for (const arg of args) {
  //     if (arg === undefined) {
  //       throw new Error("Unexpected undefined argument");
  //     }
  //   }
}

type Defined<T> = { [K in keyof T]: Exclude<T[K], undefined> };
