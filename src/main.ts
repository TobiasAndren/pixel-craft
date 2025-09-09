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
import { destroyTreeAtPosition } from './core/treeDestruction'

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

	window.addEventListener('keydown', (ev) => {
		if (ev.key === ' ') {
			const playerCenterX = player.x + player.width / 2
			const playerCenterY = player.y - player.height / 2
			
			const destroyed = destroyTreeAtPosition(playerCenterX, playerCenterY)
			
			if (!destroyed) {
				console.log('Inget träd att hacka - gå närmare!')
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