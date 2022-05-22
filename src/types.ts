export interface SquareProps {
  value: Value;
  onClick: () => void; 
}

export interface BoardProps {
  onClick: (i: number) => void;
  boardSize: number;
  squares: Squares;
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
  moveCoordinates: Coordinates,
}

type Position = number | null;

type Coordinates = {
  row: Position,
  column: Position,
}

type Value = 'X' | 'O' | null;
