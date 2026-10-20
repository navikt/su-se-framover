export function parseStringOrIntAsInt(input: string | number, radix: number = 0): number {
    if (typeof input === 'string') {
        return parseStringAsInt(input, radix);
    }
    return input;
}
export function parseStringAsInt(input: string, radix: number = 0): number {
    const inputUtenSpace = input.replace(/ /g, '');
    return parseInt(inputUtenSpace, radix);
}
