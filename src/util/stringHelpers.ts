export function pascalCase(str: string) {
    const ch = str[0].toUpperCase();

    return ch + str.substring(1);
}
