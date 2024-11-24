export {};
declare global {
	type Position = {
		startX: number;
		startY: number;

		endX: number;
		endY: number;
	};
	type Player = {
		pos: Position;
		speed: number;
		display: (state: State) => void;
	};

	type Enemy = {
		startX: number;
		startY: number;
		speed: number;
		currentPath: Tile[];
		update(state: State): void;
		display(state: State): void;
	};

	type GameLoop = (cb: () => void) => void;

	type Tile = {
		row: number;
		col: number;
		startX: number;

		startY: number;

		endX: number;
		endY: number;

		walkable: boolean;

		g: number;
		h: number;
		f: number;
		parent: Tile | null;
	};

	type TileMap = Tile[][];
	type MainMap = {
		tiles: TileMap;
		rows: number;
		cols: number;
		display: (ctx: State) => void;
	};

	type State = {
		canvas: HTMLCanvasElement;
		enemies: Enemy[];
		loopStartTime: number;
		map: MainMap;
		gameDelta: number;
		player: Player;
		gameStart: number;
		now: () => number;
		loopDelta: number;
		opts: {
			frameTimeMs: number;
		};
	};
}
