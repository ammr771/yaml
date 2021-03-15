import { isCollection, isScalar, Node } from '../nodes/Node.js'

export class Anchors {
  map: Record<string, Node> = Object.create(null)
  private prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  /** The anchor name associated with `node`, if set. */
  getName(node: Node) {
    return Object.keys(this.map).find(a => this.map[a] === node)
  }

  /** List of all defined anchor names. */
  getNames() {
    return Object.keys(this.map)
  }

  /** The node associated with the anchor `name`, if set. */
  getNode(name: string) {
    return this.map[name]
  }

  /**
   * Find an available anchor name with the given `prefix` and a
   * numerical suffix.
   */
  newName(prefix?: string) {
    if (!prefix) prefix = this.prefix
    const names = Object.keys(this.map)
    for (let i = 1; true; ++i) {
      const name = `${prefix}${i}`
      if (!names.includes(name)) return name
    }
  }

  /**
   * Associate an anchor with `node`. If `name` is empty, a new name will be generated.
   * To remove an anchor, use `setAnchor(null, name)`.
   */
  setAnchor(node: Node | null, name?: string) {
    const { map } = this
    if (!node) {
      if (!name) return null
      delete map[name]
      return name
    }

    if (!isScalar(node) && !isCollection(node))
      throw new Error('Anchors may only be set for Scalar, Seq and Map nodes')
    if (name) {
      if (/[\x00-\x19\s,[\]{}]/.test(name))
        throw new Error(
          'Anchor names must not contain whitespace or control characters'
        )
      const prevNode = map[name]
      if (prevNode && prevNode !== node) map[this.newName(name)] = prevNode
    }

    const prevName = Object.keys(map).find(a => map[a] === node)
    if (prevName) {
      if (!name || prevName === name) return prevName
      delete map[prevName]
    } else if (!name) name = this.newName()
    map[name] = node
    return name
  }
}
