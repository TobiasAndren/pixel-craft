import { Application, Container, Culler, Rectangle } from 'pixi.js'
import {
	chunkCreationList,
	createChunk,
	setInitalTiles,
	setNewChunksToRender,
	setRenderDistance,
	updateVisibleChunks
} from './core/tiles'
import { loadAllinitialAssets } from './core/assets'
import {
	createPlayer,
	isPlayerMoving,
	isPlayerStopping,
	movePlayerPosition,
	putPlayerInChunk,
	registerPlayerMovement,
	removePlayerMovement,
	setPlayerAnimation
} from './core/player'
import { handleWindowResize } from './lib/utils/window'
import { destroyTreeAtPosition, findTreeAtPosition } from './core/treeDestruction'

let view = new Rectangle(0, 0, window.innerWidth, window.innerHeight)

const init = async () => {
	const app = new Application()
	await app.init({
		resizeTo: window,
		antialias: false,
		background: '#4a80ff'
	})
	document.body.appendChild(app.canvas)
	// @ts-ignore
	globalThis.__PIXI_APP__ = app

	setRenderDistance()
	await loadAllinitialAssets()

	const world = new Container({
		isRenderGroup: true,
		eventMode: 'static',
		label: 'world'
	})

	app.stage.addChild(world)

	const surface = new Container({ label: 'surface' })

	const ground = new Container({ label: 'ground' })
	setInitalTiles(world, ground, surface)
	world.addChild(ground, surface)

	const player = createPlayer(world)
	putPlayerInChunk(player)

	window.addEventListener('click', (event) => {
		const rect = app.canvas.getBoundingClientRect()
		const mouseX = event.clientX - rect.left
		const mouseY = event.clientY - rect.top
		
		const worldX = mouseX - world.x
		const worldY = mouseY - world.y
		
		const treeDestroyed = destroyTreeAtPosition(worldX, worldY, 80)
		
		if (treeDestroyed) {
			console.log('🌳 Träd förstört!')
		} else {
			console.log('Inget träd vid klick-position')
		}
	})

	window.addEventListener('keydown', (ev) => {
		if (ev.key === ' ') {
			const playerCenterX = player.x + player.width / 2
			const playerCenterY = player.y - player.height / 2
			
			const destroyed = destroyTreeAtPosition(playerCenterX, playerCenterY, 60)
			
			if (destroyed) {
				console.log('🪓 Hackade ner träd!')
			} else {
				console.log('Inget träd att hacka')
			}
		}
		
		if (ev.key === 'x') {
			const playerCenterX = player.x + player.width / 2
			const playerCenterY = player.y - player.height / 2
			
			const tree = findTreeAtPosition(playerCenterX, playerCenterY, 100)
			
			if (tree) {
				console.log(`🌲 Träd hittat på (${tree.x}, ${tree.y})`)
				tree.alpha = 0.5
				setTimeout(() => tree.alpha = 1, 1000)
			} else {
				console.log('Inget träd i närheten')
			}
		}
		
		registerPlayerMovement(ev.key)
	})

	window.addEventListener('keyup', (ev) => removePlayerMovement(ev.key))

	app.ticker.add((ticker) => {
		if (isPlayerMoving()) {
			movePlayerPosition(player, world, ticker)
			setNewChunksToRender(world)

			if (chunkCreationList.length > 0) {
				createChunk(chunkCreationList[0])
			}

			updateVisibleChunks(world, ground, surface)
		} else if (isPlayerStopping()) {
			setPlayerAnimation(player, null, 0)
		}

		Culler.shared.cull(world, view)
	})

	window.addEventListener('resize', () => {
		handleWindowResize(world, ground, surface)

		view = new Rectangle(0, 0, window.innerWidth, window.innerHeight)
	})
}

window.addEventListener('DOMContentLoaded', init)