
export type Triple = [string, string, string];
export interface MiniOntology {
    triples : Triple[]
    entityClasses: string[]
    entities : string[]
    relations : string[]
}

const extractEntities = (triples: Triple[]) : string[] => {
    return [...new Set([...triples.map(triple => triple[0]), ...triples.map(triple => triple[1])])];
}

const stringsRoughlyEqual = (a: string, b: string) => {
    return 0 === a.localeCompare(b, 'en', { sensitivity: 'base' })
}

const normalizeTriples = (triples: Triple[], ontology: MiniOntology) : void => {
    // Could be linear time instead of quadratic with maps, probably too small to care.
    for (let triple of triples) {
        for (let entity of ontology.entities) {
            if (stringsRoughlyEqual(triple[0], entity)) {
                triple[0] = entity
            }
            if (stringsRoughlyEqual(triple[2], entity)) {
                triple[2] = entity
            }
        }
        for (let relation of ontology.relations) {
            if (stringsRoughlyEqual(triple[1], relation)) {
                triple[1] = relation
            }
        }
    }
}

export default {normalizeTriples, extractEntities}