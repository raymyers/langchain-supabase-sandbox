import { Triple } from "./mini-ontology";


const parseTriplesFromSexpr = (input: string) : Triple[] => {
    const sexprTripleRegex = /\(([^\s]+) ([^\s]+) ([^\s]+)\)/g
    const matches = Array.from(input.matchAll(sexprTripleRegex))
    return matches.map(match => [match[1], match[2], match[3]])
}
export default {parseTriplesFromSexpr};