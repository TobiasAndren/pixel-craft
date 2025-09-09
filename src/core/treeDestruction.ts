import { Sprite } from 'pixi.js'
import { getChunkByGlobalPosition, getChunk } from './tiles'
import { hasVegetationCollisions } from './vegetation'

export const destroyTreeAtPosition = (x: number, y: number, radius: number = 80): boolean => {
	const { row, col } = getChunkByGlobalPosition(x, y)

	for (let r = row - 1; r <= row + 1; r++) {
		for (let c = col - 1; c <= col + 1; c++) {
			const chunk = getChunk(r, c)
			if (!chunk?.surface) continue

			for (const child of chunk.surface.children) {
				const sprite = child as Sprite

				if (!hasVegetationCollisions(sprite)) continue

				const treeBaseX = sprite.x
				const treeBaseY = sprite.y - 30

				const dx = treeBaseX - x
				const dy = treeBaseY - y
				const distance = Math.sqrt(dx * dx + dy * dy)

				if (distance <= radius) {
					chunk.surface.removeChild(sprite)
					sprite.destroy()
					console.log('🪓 Träd förstört!')
					return true
				}
			}
		}
	}

	return false
}
