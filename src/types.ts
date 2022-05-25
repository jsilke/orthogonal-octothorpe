export interface SquareProps {
  value: Value;
  style: string;
  onClick: () => void; 
}

export interface BoardProps {
  onClick: (i: number) => void;
  boardSize: number;
  squares: Squares;
  coordinates: Position[];
}

export interface GameProps {
  // The number of rows and columns; boardSize is squared to get the board area.
  boardSize: number;
}

export interface GameState {
  history: Array<MoveHistory>;
  xIsNext: boolean;
  stepNumber: number;
}

export type Squares = Array<Value>

export type MoveHistory = {
  squares: Squares,
  movePosition: Position,
}

type Coordinate = number | null;

type Position = {
  row: Coordinate,
  column: Coordinate,
}

type Value = 'X' | 'O' | null;
