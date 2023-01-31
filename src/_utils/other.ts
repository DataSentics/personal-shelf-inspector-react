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

export function errorIfNotTrue(condition: boolean | any) {
  if (condition) throw new Error("Throwing error becase condition not true");
}
