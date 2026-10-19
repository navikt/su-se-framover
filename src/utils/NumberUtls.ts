export function parseStringAsInt(input: string, radix: number = 0): number {
    const inputUtenSpace = input.replace(/ /g, '');
    return parseInt(inputUtenSpace, radix);
}
