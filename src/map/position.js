import assert from '../assert/assert.js';
/**
 * @param {number} x
 * @param {number} y
 * @param {Tile} tile
 */
export function InTile(x, y, tile) {
	return x >= tile.startX && x <= tile.endX && y >= tile.startY && y <= tile.endY;
}

/**
 *  @param {number} startX
 *  @param {number} startY
 *  @param {number} endX
 *  @param {number} endY
 * @returns {number}
 */
export function getDistance(startX, startY, endX, endY) {
	const dirX = endX - startX;
	const dirY = endY - startY;
	return Math.hypot(dirX, dirY);
}

/**
 *  @param {{startX: number, startY: number}} start
 *  @param {{startX: number, startY: number}} end
 * @returns {[number, number]}
 */
export function getVector(start, end) {
	// Calculate direction vector
	const dirX = end.startX - start.startX;
	const dirY = end.startY - start.startY;
	const dist = Math.hypot(dirX, dirY);

	// Normalize direction vector
	const normX = dirX / dist;
	const normY = dirY / dist;

	return [normX, normY];
}

/**
 *
 *
 * @export
 * @param {Tile} tile
 * @param {MainMap} map
 * @returns {Tile | undefined}
 */
export function getVacant(tile, map) {
	const { tiles, rows, cols } = map;

	const directions = [
		{ dx: 0, dy: -1 }, // Up
		{ dx: 0, dy: 1 }, // Down
		{ dx: -1, dy: 0 }, // Left
		{ dx: 1, dy: 0 }, // Right
	];

	for (const { dx, dy } of directions) {
		const newX = tile.row + dx;
		const newY = tile.col + dy;

		if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
			assert(tiles[newY], `col came undefined at ${newY}, max of ${rows}`);
			const tile = tiles[newY][newX];
			assert(tile, `tile came undefined at x: ${newX} y: ${newY}`);
			return tile;
		}
	}
}
