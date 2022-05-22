import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {GameProps, SquareProps, BoardProps, GameState, Squares, MoveHistory} from './types';

/**
 * Renders one of the 9 squares on the board.
 * @param props - Includes a value (`Value` = 'X' | 'O' | null) and a click handler (`onClick`).
 * @returns - A button displaying the `Value` of the square.
 */
const Square = (props: SquareProps) => {
  return (
    <button className="square" onClick={props.onClick}>
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
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  /**
   * Renders the entire board.
   */
  render() {
    /* TODO: Refactor board production into a modular process based on board size. Rows should be
     * components based on this layout where `rowLength` rows are generated containing `columnLength`
     * squares.
     */
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);
    this.state = {
      history: [{
        squares: Array(this.calculateBoardArea()).fill(null),
        moveCoordinates: {row: null, column: null},
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

  fillSquareAndUpdateHistory(i: number) {
    const history = this.getHistoryCopy();
    const squares = this.getCurrentBoardLayoutCopy();
    
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    
    this.updateState(history, squares, i);
  }

  jumpTo(step: number) {
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
        moveCoordinates: this.computeCoordinates(i),
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
 
  /**
   * TODO: This method does way too much. It must be broken up into smaller methods.
   * @returns - A `Board` component.
   */
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        `Go to move # ${move}` :
        'Go to game start.';
      const coordinates = step.moveCoordinates;
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
          <span>{` Occupied position: (${coordinates?.row}, ${coordinates?.column})`}</span>
        </li>
      );
    });

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            boardSize={this.props.boardSize}
            onClick={(i: number) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
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
root.render(<Game boardSize={3} />); // Renders a 3x3 board.
