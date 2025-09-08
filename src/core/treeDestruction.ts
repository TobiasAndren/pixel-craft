// src/core/treeDestruction.ts
import { Sprite } from 'pixi.js'
import { getChunkByGlobalPosition, getChunk } from './tiles'
import { hasVegetationCollisions } from './vegetation'

export const findTreeAtPosition = (x: number, y: number, radius: number = 50): Sprite | null => {
  const { row, col } = getChunkByGlobalPosition(x, y)
  
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      const chunk = getChunk(r, c)
      if (!chunk?.surface) continue

      for (const child of chunk.surface.children) {
        const sprite = child as Sprite
        
        if (!hasVegetationCollisions(sprite)) continue

        const dx = sprite.x - x
        const dy = sprite.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= radius) {
          return sprite
        }
      }
    }
  }
  
  return null
}

export const destroyTree = (treeSprite: Sprite) => {
  const { row, col } = getChunkByGlobalPosition(treeSprite.x, treeSprite.y)
  const chunk = getChunk(row, col)
  
  if (chunk?.surface) {
    chunk.surface.removeChild(treeSprite)
    treeSprite.destroy()
    console.log(`Träd förstört på position (${treeSprite.x}, ${treeSprite.y})`)
    return true
  }
  
  return false
}

export const destroyTreeAtPosition = (x: number, y: number, radius: number = 50): boolean => {
  const tree = findTreeAtPosition(x, y, radius)
  
  if (tree) {
    return destroyTree(tree)
  }
  
  return false
}

export const findAllTreesInRadius = (x: number, y: number, radius: number): Sprite[] => {
  const trees: Sprite[] = []
  const { row, col } = getChunkByGlobalPosition(x, y)
  
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      const chunk = getChunk(r, c)
      if (!chunk?.surface) continue

      for (const child of chunk.surface.children) {
        const sprite = child as Sprite
        
        if (!hasVegetationCollisions(sprite)) continue

        const dx = sprite.x - x
        const dy = sprite.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= radius) {
          trees.push(sprite)
        }
      }
    }
  }
  
  return trees
}

export const destroyAllTreesInRadius = (x: number, y: number, radius: number): number => {
  const trees = findAllTreesInRadius(x, y, radius)
  let destroyedCount = 0
  
  trees.forEach(tree => {
    if (destroyTree(tree)) {
      destroyedCount++
    }
  })
  
  return destroyedCount
}