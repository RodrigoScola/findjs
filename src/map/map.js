import { InTile as inTile } from './position.js';
import assert from '../assert/assert.js';

let ids = 0;

/** @returns {Tile} */
function createTile() {
	ids++;
	return {
		startX: 0,
		row: 0,
		col: 0,
		walkable: true,
		startY: 0,
		endX: 0,
		endY: 0,
		f: 0,
		g: 0,
		h: 0,
		parent: null,
	};
}

/**
 * @param {number} width
 * @param {number} height
 * @param {number} cols
 * @param {number} rows
 * @returns {MainMap} */
export function createMap(width, height, cols, rows) {
	/**@type {MainMap} */
	const map = {
		cols: cols,
		rows: rows,
		tiles: new Array(rows),
		display: (ctx) => {
			const canvas = ctx.canvas.getContext('2d');
			const map = ctx.map;

			for (let i = 0; i < map.cols; i++) {
				const line = map.tiles[i];
				assert(line, `line ${i} of ${map.tiles.length} is undefined`);

				for (let j = 0; j < map.rows; j++) {
					const tile = line[j];
					// canvas.fillStyle = 'orange';
					// canvas.fillRect(
					// 	tile.startX,
					// 	tile.startY,
					// 	tile.endX - tile.startX,
					// 	tile.endY - tile.startY
					// );
					canvas.strokeStyle = 'black';
					canvas.strokeRect(
						tile.startX,
						tile.startY,
						tile.endX - tile.startX,
						tile.endY - tile.startY
					);
				}
			}
		},
	};

	const colSize = Math.floor(width / cols);
	const rowSize = Math.floor(height / rows);

	let size = 0;
	for (let i = 0; i < cols; i++) {
		map.tiles[i] = /** @type {Tile[]} */ ([]);

		for (let j = 0; j < rows; j++) {
			const tile = createTile();
			size++;

			tile.col = i;
			tile.row = j;

			tile.startX = colSize * i;
			tile.startY = rowSize * j;

			tile.endX = colSize * i + colSize;
			tile.endY = rowSize * j + rowSize;
			assert(tile, 'no tile?');
			map.tiles[i].push(tile);
			// map.tiles[i][j] = tile;
		}
		assert(map.tiles[i].length === rows, 'mismatch in col creation');
	}

	assert(ids === size, `there is size difference, expected: ${size} received: ${ids}`);
	return map;
}

/**
 * @description this is disgusting.... fix it later
 * @param {State} state
 * @param {number} x
 * @param {number} y
 *  @returns {Tile | undefined} */
export function getTileByPos(state, x, y) {
	for (let i = 0; i < state.map.cols; i++) {
		const row = state.map.tiles[i];
		for (const tile of row) {
			if (inTile(x, y, tile)) {
				return tile;
			}
		}
	}
}

/**
 * @param {Tile} startTile
 * @param {Tile} endTile
 * @param {MainMap} mainMap
 * @returns {Tile[]} */
export function findPath(startTile, endTile, mainMap) {
	/** @type {Tile[]} */
	const openList = []; // Tiles to be evaluated
	/** @type { Set<Tile>} */
	const closedList = new Set(); // Tiles already evaluated

	// Initialize the start tile
	startTile.g = 0;
	startTile.h = heuristic(startTile, endTile);
	startTile.f = startTile.g + startTile.h;

	openList.push(startTile);

	while (openList.length > 0) {
		// Get the tile with the lowest 'f' score
		const currentTile = openList.sort((a, b) => a.f - b.f).shift();

		// If the current tile is the end tile, build and return the path
		if (currentTile === endTile) {
			return reconstructPath(currentTile);
		}

		closedList.add(currentTile);

		// Get neighbors
		const neighbors = getNeighbors(currentTile, mainMap);

		for (const neighbor of neighbors) {
			if (!neighbor.walkable || closedList.has(neighbor)) {
				continue; // Skip non-walkable or already evaluated tiles
			}

			const tentativeG = currentTile.g + 1; // Assuming uniform cost for moving to a neighbor

			if (tentativeG < neighbor.g || !openList.includes(neighbor)) {
				// Update neighbor's scores
				neighbor.g = tentativeG;
				neighbor.h = heuristic(neighbor, endTile);
				neighbor.f = neighbor.g + neighbor.h;
				neighbor.parent = currentTile;

				if (!openList.includes(neighbor)) {
					openList.push(neighbor);
				}
			}
		}
	}

	// If the loop ends, no path was found
	return [];
}

// Heuristic function (Manhattan distance)
/**
 *  @param {Tile} start
 *  @param {Tile} end
 * @returns {number}
 */
function heuristic(start, end) {
	return Math.abs(start.endX - end.endX) + Math.abs(start.endY - end.endY);
}

/**
 * param {Tile} tile 
/**@returns {Tile[]} */
function reconstructPath(tile) {
	/**@type {Tile[]} */
	const path = [];
	/**@type {Tile | null} */
	let current = tile;

	while (current) {
		path.push(current);
		current = current.parent;
	}

	return path.reverse(); // Reverse to get path from start to end
}

/**
 * @param {Tile} tile
 * @param {MainMap} map
 * @returns {Tile[]}
 *
 */
function getNeighbors(tile, map) {
	/**@type {Tile[]} */
	const neighbors = [];
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
			if (tile.walkable) {
				neighbors.push(tile);
			}
		}
	}

	return neighbors;
}
