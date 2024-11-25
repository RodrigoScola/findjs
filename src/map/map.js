import {InTile as inTile} from './position.js';
import assert from '../assert/assert.js';

let ids = 0;

/** @returns {Tile} */
function createTile() {
    return {
        id: ids++,
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
    const tiles = state.map.tiles;

    for (let i = 0; i < tiles.length; ++i) {
        for (let j = 0; j < tiles.length; ++j) {

            if (inTile(x, y, tiles[i][j])) {
                return tiles[i][j]
            }


        }

    }


}

/**
 * @see {@link https://www.youtube.com/watch?v=mZfyt03LDH4} for tutorial
 * @param {Tile} start
 * @param {Tile} end
 * @param {MainMap} mainMap
 * @returns {Tile[]} */
export function findPath(start, end, mainMap) {

    /** @type {Tile[]} */
    const openSet = [start]

    /** @type {Tile[]} */
    const closedSet = []



    while (openSet.length > 0) {
        let ind = 0;
        let current = openSet[ind];
        assert(current, `first node in open set is undefined with len: ${openSet.length}`)

        for (let i = 0; i < openSet.length; ++i) {
            if (openSet[i].f < current.f || openSet[i].f === current.f && openSet[i].h < current.h) {
                current = openSet[i];
                ind = i
            }
        }
        const node = openSet.splice(ind, 1);
        assert(node.length === 1,`only one at a time boi, received: ${node.length}`)
        closedSet.push(node[0])
        if( current.id === end.id) {

            return retrace(start,end).reverse()
        }

        for(const n of getNeighbors(current, mainMap)) {
            if (!n.walkable || closedSet.includes(n)) {
                continue;
            }

            const newMovementCost = current.g + getDist(current,n)
            if (newMovementCost < n.g || !openSet.includes(n)){

                n.g = newMovementCost;
                n.h = getDist(n,end)
                n.parent = current

                if (!openSet.includes(n)) {
                    openSet.push(n)
                }

            }

        }


    }
}

/** Gets the path from the start to the end, using the parent
 * need to figure a good way to object pool maybe?
 * @param {Tile} start
  @param {Tile} end */
function retrace(start,end) {
    /** @type {Tile[]} */
    const path = []
    let current = end
    while(current.id !== start.id){

        path.push(current)
        current = current.parent
    }

    return path

}

/** @param {Tile} start
 * @param {Tile} end
 @returns {number}
     */
function getDist(start,end) {
    //16:39
    const distX= Math.abs(start.col - end.col)
    const distY= Math.abs(start.row - end.row)

    if (distX > distY){
        return 14 * distY  + 10 * (distX - distY)
    }
    return 14 * distX + 10 * (distY - distX)

}

/** @param {Tile} node
 * @param {MainMap} map */
 function getNeighbors(node,map) {
    const nm = []

    for (let x = -1;x <= 1; x++) {
        for (let y = -1;y <=1; y++) {
            if(x === 0 && y === 0) {continue;}

            const checkX = node.col +x;
            const checkY = node.row  +y;

            if (checkX >= 0 && checkX < map.cols && checkY >= 0 && checkY < map.rows    ) {
                console.log(map)
                assert(map.tiles[checkX],'x came undefined on: ' + checkX)
                assert(map.tiles[checkX][checkY],`y came undefined on ${checkX} - ${checkY}`)
                const tileNode =map.tiles[checkX][checkY]
                assert(tileNode, `node at ${checkX} and ${checkY} is undefined`);
                nm.push(tileNode);
            }


        }
    }

    return nm

}

