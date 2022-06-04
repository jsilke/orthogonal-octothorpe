import React from 'react';
import './index.css';
import { SquareProps, BoardProps } from './types';

/**
 * Renders one of the 9 squares on the board.
 * @param props - {
 *   value: The value of the square (X, O, or null).
 *   style: A string containing the CSS class(es) to be added to the square.
 *   onClick: The function to call when the square is clicked.
 * }
 * @returns - A styled button that displays its value.
 */
const Square = (props: SquareProps) => {
    return (
        <button className={`square${props.style}`} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

/**
 * Renders the entire board row by row.
 */
export class Board extends React.Component<BoardProps> {
    /**
     * Renders a single `Square` component.
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
     * Renders the entire board row by row.
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