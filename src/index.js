import { InTile, getVector, getDistance, getVacant } from './map/position.js';
import { createMap, findPath, getTileByPos } from './map/map.js';
import assert from './assert/assert.js';

/** @returns { Enemy}  */
function createEnemy() {
	return {
		speed: 10,
		startX: 1,
		startY: 1,
		currentPath: [],
		update: function (state) {
			const player = state.player;
			assert(player, 'player needs to exist');
			if (this.currentPath.length === 0) {
				const tile = getTileByPos(state, this.startX, this.startY);
				assert(tile, 'enemy needs to be in a tile');

				const playerTile = getTileByPos(state, player.pos.startX, player.pos.startY);
				assert(playerTile, 'enemy needs to be in a tile');

				const path = findPath(tile, playerTile, state.map);
				this.currentPath = path;
			}

			let t = this.currentPath[0];

			const dirX = t.startX - this.startX;
			const dirY = t.startY - this.startY;
			const dist = Math.hypot(dirX, dirY);
			if (InTile(this.startX, this.startY, t) || dist < 10) {
				this.currentPath.shift();
				t = this.currentPath[0];
			}

			// Calculate direction vector

			// Normalize direction vector
			const normX = dirX / dist;
			const normY = dirY / dist;

			// Move enemy towards player
			this.startX += normX * this.speed;
			this.startY += normY * this.speed;
			console.log(this.startX, this.startY, normX, normY, dist);
		},

		display: function () {
			renderCircle(state, this.startX, this.startY, 5);
		},
	};
}

/** @returns { Player} */
function createPlayer() {
	return {
		display(state) {
			renderCircle(state, this.pos.startX, this.pos.startY, 5);
		},
		speed: 1,
		pos: {
			startX: 0,
			endX: 0,
			endY: 0,
			startY: 0,
		},
	};
}

const now = Date.now;

/** @type {State} */
const state = {
	gameStart: now(),
	enemies: [createEnemy()],
	player: createPlayer(),
	map: createMap(2000, 2000, 100, 100),
	gameDelta: 0,
	canvas: /** @type {HTMLCanvasElement} */ (document.querySelector('#canvas')),
	loopStartTime: now(),
	now: now,
	loopDelta: 0,
	opts: {
		frameTimeMs: 16,
	},
};

assert(state.canvas, 'canvas not found');

/**
 *
 *
 * @param {State} state
 * @param {number}x
 * @param {number}y
 * @param {number} radius
 */
function renderCircle(state, x, y, radius) {
	const ctx = state.canvas.getContext('2d');
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = 'red';
	ctx.stroke();
}

state.loopStartTime = state.now();

/** @param { State} state */
function animate(state) {
	/** @param {() => void} cb */
	function callback(cb) {
		const now = state.now();

		state.gameDelta = now - state.gameStart;

		const goal = state.loopStartTime + state.opts.frameTimeMs;
		if (now > goal) {
			cb();
			requestAnimationFrame(() => callback(cb));
		} else {
			setTimeout(() => callback(cb), goal - now);
		}
	}
	return callback;
}

const loop = animate(state);

function resizeCanvas() {
	state.canvas.width = window.innerWidth;
	state.canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

resizeCanvas();

state.player.pos.startX = state.canvas.width / 2;
state.player.pos.startY = state.canvas.height / 2;

// setInterval(() => {
// 	state.enemies.push(createEnemy());
// }, 1000);

loop(() => {
	const canvas = state.canvas;
	canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

	for (const enemy of state.enemies) {
		enemy.update(state);
	}

	state.map.display(state);
	state.player.display(state);
	for (const enemy of state.enemies) {
		enemy.display(state);
	}
});
