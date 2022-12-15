export function reverseArray(arr: number[]) {
  const reversed = [];
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    reversed.push(arr[i]);
  }

  return reversed;
}

const x = [1, 2, 3, 4, 5];

const c = reverseArray(x);

// c



const LEFT = "(";
const RIGHT = ")";

const sampleOk = '(()))('
const sampleFail = '()())'

function minimumSwaps(brackets: string): number|undefined {
    const leftCount = brackets.match(/\(/g || [])?.length;

    return leftCount;
}


const a1 = minimumSwaps(sampleOk)+'a'
const a2 = minimumSwaps(sampleFail)

a1
a2