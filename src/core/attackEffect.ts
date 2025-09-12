import { Container, Sprite, Graphics } from 'pixi.js'
import { PLAYER_HEIGHT, PLAYER_WIDTH } from './player'
const getSlashOffset = (animationKey: string, radius: number) => {
	const yAdjustment = 30
	switch (true) {
		case animationKey.includes('up'):
			return { x: PLAYER_WIDTH / 2, y: -radius - yAdjustment }
		case animationKey.includes('down'):
			return { x: PLAYER_WIDTH / 2, y: radius - yAdjustment }
		case animationKey.includes('left'):
			return { x: -radius, y: -PLAYER_HEIGHT / 2 }
		case animationKey.includes('right'):
			return { x: PLAYER_WIDTH + radius, y: -PLAYER_HEIGHT / 2 }
		default:
			return { x: PLAYER_WIDTH / 2, y: 0 }
	}
}

export const showAttackEffect = (
	player: Sprite,
	world: Container,
	app: any,
	animationKey: string
) => {
	const slash = new Graphics()
	const radius = 25

	let angle = 0
	if (animationKey.includes('up')) angle = -Math.PI / 2
	else if (animationKey.includes('down')) angle = Math.PI / 2
	else if (animationKey.includes('left')) angle = Math.PI
	else if (animationKey.includes('right')) angle = 0

	const startX = Math.cos(angle - 0.4) * radius
	const startY = Math.sin(angle - 0.4) * radius
	const endX = Math.cos(angle + 0.4) * radius
	const endY = Math.sin(angle + 0.4) * radius

	const ctrlX = Math.cos(angle) * (radius * 1.5)
	const ctrlY = Math.sin(angle) * (radius * 1.5)

	slash.moveTo(startX, startY)
	slash.quadraticCurveTo(ctrlX, ctrlY, endX, endY)
	slash.stroke({ width: 3, color: 0xffffff, alpha: 0.8 })

	const playerPos = player.getGlobalPosition()
	const localPos = world.toLocal(playerPos)
	const offset = getSlashOffset(animationKey, radius)

	slash.x = localPos.x + offset.x
	slash.y = localPos.y + offset.y

	world.addChild(slash)

	let alpha = 1
	let lifetime = 10
	const update = () => {
		lifetime--
		alpha -= 0.1
		slash.alpha = alpha

		slash.scale.x += 0.1
		slash.scale.y += 0.1

		if (lifetime <= 0) {
			world.removeChild(slash)
			slash.destroy()
			app.ticker.remove(update)
		}
	}

	app.ticker.add(update)
}
