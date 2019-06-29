import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  let className = 'square';
  if (props.highlight) {
    className += ' highlight';
  }
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winRow = this.props.winRow;
    return (
      <Square 
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={winRow && winRow.includes(i)}
      />
    );
  }

  render() {
    var rows = [];
    for (let i = 0; i < 3; i++) {
      let squares = [];
      for (let j = 0; j < 3; j++) {
        squares.push(this.renderSquare(3 * i + j));
      }
      rows.push(<div className="board-row">{squares}</div>);
    }
    return (<div>{rows}</div>);
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastMove: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      descendingList: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(current.squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        lastMove: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleList() {
    this.setState({
      descendingList: !this.state.descendingList,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winCalc = calculateWinner(current.squares);
    const winner = winCalc.winner;
    const descending = this.state.descendingList;

    const toggle = (
      <button
        onClick={() => this.toggleList()}>
        {'Sort ' + (descending ? '\u25BC' : '\u25B2')}
      </button>
    );

    const moves = history.map((step, move) => {
      const row = Math.floor(step.lastMove / 3);
      const col = step.lastMove % 3;
      const desc = move ? 
        `${move % 2 ? 'X': 'O'} - (${row}, ${col})` :
        'Go to game start';
      return (
        <li key={move} value={move}>
          <button
            className={move === this.state.stepNumber ? "selected-move" : ""} 
            onClick={() => this.jumpTo(move)}>{desc}
          </button>
        </li>
      );
    });

    if (!descending) {
      moves.reverse();  // in place, works with const
    }
    
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber === 9) {
      status = 'The game has ended in a draw.';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winRow={winCalc.row}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <br></br>{toggle}
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
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
      return ({
        winner: squares[a],
        row: lines[i],
      });
    }
  }
  return { winner: null };
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
