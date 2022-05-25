import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { GameProps, SquareProps, BoardProps, GameState, Squares, MoveHistory } from './types';

/**
 * Renders one of the 9 squares on the board.
 * @param props - Includes a value (`Value` = 'X' | 'O' | null) and a click handler (`onClick`).
 * @returns - A button displaying the `Value` of the square.
 */
const Square = (props: SquareProps) => {
  return (
    <button className={`square${props.style}`} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

/**
 * Renders the entire board row by row
 */
class Board extends React.Component<BoardProps> {
  /**
   * Renders a single square component.
   * @param i - The index of the square to render.
   * @returns - A `Square` component.
   */
  renderSquare(i: number) {
    const assignClass = (i: number) => {
      let squareClass = '';
      if (this.props.coordinates[i].row === 0) {
        squareClass += ' board__top-edge';
      }
      if (this.props.coordinates[i].row === this.props.boardSize - 1) {
        squareClass += ' board__bottom-edge';
      }
      if (this.props.coordinates[i].column === 0) {
        squareClass += ' board__left-edge';
      }
      if (this.props.coordinates[i].column === this.props.boardSize - 1) {
        squareClass += ' board__right-edge';
      }
      return squareClass;
    };

    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        style={assignClass(i)}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  /**
   * Generates an array of indices for the row using an offset calculated from the `boardSize`
   * and maps the indices to rendered `Square` components.
   * @param offset - The board array index of the first square in the row.
   * @returns - A `Row` componenet (a div of of `Square` components).
   */
  renderRow(offset: number) {
    const squareIndices = [...Array(this.props.boardSize).keys()].map(i => i + offset);
    const row = squareIndices.map(i => this.renderSquare(i));
    return (
      <div key={offset / 3}>
        {row}
      </div>
    );
  }

  /**
   * Renders the entire board.
   */
  render() {
    const board = [];
    for (let i = 0; i < this.props.boardSize; i++) {
      board.push(this.renderRow(i * this.props.boardSize));
    }

    return (
      <div>
        {board}
      </div>
    );
  }
}

/**
 * Renders the game's current state.
 */
class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);
    this.state = {
      history: [{
        squares: Array(this.calculateBoardArea()).fill(null),
        movePosition: { row: null, column: null },
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  /**
   * Calculates the size of the array of squares needed to represent the board.
   */
  calculateBoardArea() {
    return Math.pow(this.props.boardSize, 2);
  }

  /**
   * Called in response to a click on one of the game board squares. Returns early if the clicked
   * square is already occupied or if a winner has been declared, otherwise updates the square's
   * state and the game history.
   * @param i - The index of the square that was clicked. 
   */
  handleClick(i: number) {
    const squares = this.getCurrentBoardLayoutCopy();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    this.fillSquareAndUpdateHistory(i);
  }

  /**
   * Returns a copy of the game history leading up to the selected move/state.
   */
  getHistoryCopy() {
    return this.state.history.slice(0, this.state.stepNumber + 1);
  }

  /**
   * Returns the state of the game for the selected move number.
   */
  getCurrentState() {
    const history = this.getHistoryCopy();
    return history[history.length - 1];
  }

  /**
   * Returns a copy of the current board layout from the selected game state.
   */
  getCurrentBoardLayoutCopy() {
    return this.getCurrentState().squares.slice();
  }

  /**
   * Fills the clicked square with the appropriate value and updates the game history.
   * @param i - The index of the square that was filled this move.
   */
  fillSquareAndUpdateHistory(i: number) {
    const history = this.getHistoryCopy();
    const squares = this.getCurrentBoardLayoutCopy();

    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.updateState(history, squares, i);
  }

  /**
   * Reverts the state of the game to the selected move and appropriately styles the button to
   * indicate the current state to the user. 
   * @param step - The move number to which the game state will be reverted.
   */
  jumpToStateInMoveHistory(step: number) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  /**
   * Calculates the coordinates of the square that was clicked indexed from 0. 
   * @param squareClicked - The index of the square that was clicked.
   * @returns - The coordinates of the square that was clicked in the format (row, column).
   */
  computeCoordinates(squareClicked: number) {
    return {
      row: Math.floor(squareClicked / this.props.boardSize),
      column: squareClicked % this.props.boardSize,
    }
  }

  /**
   * Updates the state of the game with the new move.
   * @param history - An array containing previous game states up until this move.
   * @param squares - An array containing the current state of the board.
   * @param i - The index of the square that was filled this move.
   */
  updateState(history: MoveHistory[], squares: Squares, i: number) {
    this.setState({
      history: history.concat([{
        squares: squares,
        movePosition: this.computeCoordinates(i),
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  reportGameStatus() {
    const current = this.getCurrentState();
    const winner = calculateWinner(current.squares);

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else if (this.state.stepNumber === this.calculateBoardArea()) {
      status = 'Draw';
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }

    return status;
  }

  renderDescription() {
    const moves = this.state.history.map((step, move) => {
      const description = move ?
        `Go to move # ${move}` :
        'Go to game start.';
      const coordinates = step.movePosition;
      return (
        <li key={move}>
          <button
            className={`button${move === this.state.stepNumber ? ' button--active' : ''}`}
            onClick={() => this.jumpToStateInMoveHistory(move)}
          >
            {description}
          </button>
          <span>
            {
              coordinates.row !== null && coordinates.column !== null ?
                ` ${move % 2 === 0 ? 'O' : 'X'} occupied position (${coordinates.row}, ${coordinates.column})` :
                ''
            }
          </span>
        </li>
      )
    });

    return moves;
  }

  /**
   * 
   * @returns - A `Board` component.
   */
  render() {
    const current = this.state.history[this.state.stepNumber];
    const moves = this.renderDescription();

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            boardSize={this.props.boardSize}
            coordinates={[...Array(this.calculateBoardArea()).keys()].map((square, i) => this.computeCoordinates(i))}
            onClick={(i: number) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{this.reportGameStatus()}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

/**
 * Determines whether the game should end in victory.
 * @param squares - An array containing the current state of the board's values.
 * @returns - The winner of the game, if one exists, otherwise null.
 */
const calculateWinner = (squares: Squares) => {
  // TODO: Algorithmically generalize this win strategy instead of hard-coding it to accommodate
  // arbitrary board sizes.
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<Game boardSize={3} />); // Renders an nxn board.
