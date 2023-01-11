export function isValidText(value: string | number | undefined) {
  // check if value is string or number
  return value || value === 0;
}

// import { performance } from "perf_hooks";

// Decorator - works only with Classes
// export const executionTime = (
//   _target: any,
//   _propertyKey: string,
//   descriptor: PropertyDescriptor
// ) => {
//   const originalMethod = descriptor.value;

//   descriptor.value = function (...args: any) {
//     const start = performance.now();
//     const result = originalMethod.apply(this, args);
//     const finish = performance.now();
//     console.log(`Execution time: ${finish - start} milliseconds`);
//     return result;
//   };

//   return descriptor;
// };
