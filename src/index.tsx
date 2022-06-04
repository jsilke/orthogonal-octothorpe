import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { GameProps, GameState, Squares, MoveHistory } from './types';
import { Board } from './board';

/**
 * Manages the game's state.
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
    const current = this.getCurrentState();

    if (this.calculateWinner() || current.squares[i]) {
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
   * @param squareIndex - The index of the square that coordinates should be calculated for.
   * @returns - The coordinates of the square that was clicked in the format (row, column).
   */
  computeCoordinates(squareIndex: number) {
    return {
      row: Math.floor(squareIndex / this.props.boardSize),
      column: squareIndex % this.props.boardSize,
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

  /**
   * Reports whose turn it is or the outcome of the game.
   * @returns - A summary of the present game state as text.
   */
  reportGameStatus() {
    const winner = this.calculateWinner();

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

  /**
   * Renders a summary of a turn outcomes and navigation buttons to travel between game states.
   * @returns - A list of items including a button to navigate through the game history and a 
   * description of what happened that turn.
   */
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
   * Renders the game board based on the selected game state.
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

  /**
   * Determines whether the game should end in victory for either player.
   * @param squares - An array containing the current state of the board's values.
   * @returns - The winner of the game, if one exists, otherwise null.
   */
  calculateWinner() {
    //const numToWin = (this.props.boardSize < 5) ? 3 : 4;
    const currentState = this.getCurrentState();

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
      if (currentState.squares[a] && currentState.squares[a] === currentState.squares[b] && currentState.squares[a] === currentState.squares[c]) {
        return currentState.squares[a];
      }
    }
    return null;
  }

}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<Game boardSize={3} />); // Renders an nxn board.
