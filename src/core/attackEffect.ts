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
	const radius = 30

	let startAngle = -Math.PI / 2.5
	let endAngle = Math.PI / 2.5

	switch (true) {
		case animationKey.includes('up'):
			startAngle = -Math.PI + Math.PI / 5
			endAngle = -Math.PI / 5
			break
		case animationKey.includes('down'):
			startAngle = Math.PI / 5
			endAngle = Math.PI - Math.PI / 5
			break
		case animationKey.includes('left'):
			startAngle = Math.PI * 0.6
			endAngle = Math.PI * 1.4
			break
		case animationKey.includes('right'):
			startAngle = -Math.PI * 0.4
			endAngle = Math.PI * 0.4
			break
	}

	slash.pivot.set(0, 0)
	slash.arc(0, 0, radius, startAngle, endAngle)
	slash.stroke({ width: 6, color: 0xffffff, alpha: 0.8 })

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

		slash.scale.x += 0.05
		slash.scale.y += 0.05

		if (lifetime <= 0) {
			world.removeChild(slash)
			slash.destroy()
			app.ticker.remove(update)
		}
	}

	app.ticker.add(update)
}
