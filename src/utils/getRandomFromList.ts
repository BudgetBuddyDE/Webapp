export function getRandomFromList<T>(list: T[]) {
    return list[Math.floor(Math.random() * list.length)];
}
