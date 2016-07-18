// FIXME: I have no idea what I'm doing :p
declare module 'random-seed' {
  type seedType = any;
  interface RandomGenerator {
    (range: number): number;
    range(range: number): number;
    random(): number;
    floatBetween(min: number, max: number): number;
    intBetween(min: number, max: number): number;
    seed(seed: seedType): void;
    string(count: number): string;
    cleanString(inStr: string): string;
    hashString(inStr: string): string;
    addEntropy(...args:any[]): void;
    initState(): void;
    done(): void;
  }
  interface RandomGeneratorConstructor {
    (seed?: seedType): RandomGenerator;
    create(seed?: seedType): RandomGenerator;
  }
  type GenFunction = RandomGenerator & RandomGeneratorConstructor;
  //class GenClass implements RandomGenerator, RandomGeneratorConstructor {}
  //type GenType = GenFunction | GenClass;

  // TODO: gen : GenFunction;

  // TODO: add support for class/`new` instantiation
}
