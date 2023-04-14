import parser from '../src/lib/parser'
import { expect, test } from 'vitest'


test('home', () => {
  
  const actual = parser.parseTriplesFromSexpr(`
  (Node calls ImageRegistry)
  (Node partOf KubernetesCluster)
  (ImageRegistry partOf KubernetesCluster)
  `)
  expect(actual).toEqual([['Node', 'calls', 'ImageRegistry'],['Node', 'partOf', 'KubernetesCluster'], ['ImageRegistry', 'partOf', 'KubernetesCluster']])
})