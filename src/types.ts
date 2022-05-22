export interface SquareProps {
  value: Value;
  onClick: () => void; 
}

export interface BoardProps {
  onClick: (i: number) => void;
  boardSize: BoardSize;
  squares: Squares;
}

export interface GameProps {
  boardSize: BoardSize;
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

type BoardSize = {
  rowLength: number,
  columnLength: number,
};

type Position = number | null;

type Coordinates = {
  row: Position,
  column: Position,
}

type Value = 'X' | 'O' | null;
