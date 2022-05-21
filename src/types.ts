export interface SquareProps {
  value: Value;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export interface BoardProps extends MoveHistory {
  onClick: any; // The current architecture causes an error if this type is made more specific.
}

export interface GameState {
  history: Array<MoveHistory>;
  xIsNext: boolean;
  stepNumber: number;
}

export type Squares = Array<Value>

type MoveHistory = {
  squares: Squares,
  moveCoordinates?: Coordinates, // Optional to allow board props to extend Squares.
}

type Position = number | null;

type Coordinates = {
  row: Position,
  column: Position,
}

type Value = 'X' | 'O' | null;
