import React from 'react';
import ReactDOM from 'react-dom';

var isSumPossible = function (arr, n) {
	if (arr.indexOf(n) >= 0) { return true; }
	if (arr[0] > n) { return false; }
	if (arr[arr.length - 1] > n) {
		arr.pop();
		return isSumPossible(arr, n);
	}
	var listSize = arr.length, combinationsCount = (1 << listSize)
	for (var i = 1; i < combinationsCount; i++) {
		var combinationSum = 0;
		for (var j = 0; j < listSize; j++) {
			if (i & (1 << j)) { combinationSum += arr[j]; }
		}
		if (n === combinationSum) { return true; }
	}

	return false;
};

const Stars = (props) => {
	return (
		<div className="col-5">
			{_.range(props.starCount).map(number => (<i key={number} className="fa fa-star"></i>))}
		</div>
	);
};

const Button = (props) => {
	let button;
	switch (props.isAnswerCorrect) {
		case true:
			button =
				<button className="btn btn-success" disabled={props.selectedNumbers.length === 0} onClick={() => { props.acceptAnswer() }}>
					<i className="fa fa-check" />
				</button>
			break;

		case false:
			button =
				<button className="btn btn-danger" disabled={props.selectedNumbers.length === 0} onClick={() => { props.checkAnswer() }}>
					<i className="fa fa-times" />
				</button>
			break;

		default:
			button = <button className="btn" disabled={props.selectedNumbers.length === 0} onClick={() => { props.checkAnswer() }}>=</button>
			break;

	}

	const getButtonClass = () => {
		if (props.isAnswerCorrect) {
			return "btn btn-success";
		}
		else {
			return "btn btn-danger";
		}
	}

	return (
		<div className="col-2">
			{button}
			<br />
			<br />
			<button class="btn" disabled={props.redraws === 0} onClick={() => { props.redraw() }}>Redraws left: {props.redraws}</button>
		</div>
	);
};

const Answer = (props) => {
	return (
		<div className="col-5">
			{props.selectedNumbers.map(number => (<span key={number} onClick={() => { props.unselectNumber(number) }}>{number}</span>))}
		</div>
	);
};

const Status = (props) => {
	return (
		<div className="text-center">
			<h2>{props.doneStatus}</h2>
			<button className="btn" onClick={() => { props.reset() }}>Play Again </button>
		</div>
	);
};

const Numbers = (props) => {

	const getNumberClass = (number) => {
		if (props.usedNumbers.indexOf(number) >= 0) {
			return "used";
		}
		if (props.selectedNumbers.indexOf(number) >= 0) {
			return "selected";
		}
	}

	const handleClick = (number) => {
		props.selectNumber(number)
	}

	return (
		<div className="card text-center">
			<div>
				{Number.list.map(number => (<span key={number} className={getNumberClass(number)} onClick={() => { props.selectNumber(number) }}>
					{number}</span>))}
			</div>
		</div>
	);
};

Number.list = _.range(1, 10);

class Game extends React.Component {
	static StarCount = () => 1 + Math.floor(Math.random() * 9);

	static InitialState = () => ({
		selectedNumbers: [],
		usedNumbers: [],
		starCount: Game.StarCount(),
		isAnswerCorrect: null,
		redraws: 5,
		doneStatus: null
	});

	state = Game.InitialState();

	selectNumber = (clickedNumber) => {
		if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0) return;
		this.setState(prevState =>
			({
				selectedNumbers: prevState.selectedNumbers.concat(clickedNumber),
				isAnswerCorrect: null
			})
		);
	}

	unselectNumber = (clickedNumber) => {
		this.setState(prevState =>
			({
				selectedNumbers: prevState.selectedNumbers.filter(number => (number !== clickedNumber)),
				isAnswerCorrect: null
			}));
	}

	checkAnswer = () => {
		this.setState({
			isAnswerCorrect: this.state.selectedNumbers.reduce((sum, number) => (sum + number), 0) === this.state.starCount
		});
	}


	acceptAnswer = () => {
		this.setState(prevState => ({
			usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
			selectedNumbers: [],
			isAnswerCorrect: null,
			starCount: Game.StarCount()
		}), this.updateDoneStatus);
	}

	redraw = () => {
		this.setState((prevState) => ({
			selectedNumbers: [],
			starCount: Game.StarCount(),
			isAnswerCorrect: null,
			redraws: prevState.redraws - 1
		}), this.updateDoneStatus);
	}

	updateDoneStatus = () => {
		this.setState((prevState) => {

			if (prevState.usedNumbers.length === 9) {
				return { doneStatus: 'Nice Win!' }
			}

			if (prevState.redraws === 0 && !this.isSoultionPossible(prevState)) {
				return { doneStatus: 'Game Over' }
			}
		});
	}

	isSoultionPossible = (state) => {
		const numbersAvailable = _.range(1, 10).filter(number => (state.usedNumbers.indexOf(number) === -1));
		return isSumPossible(numbersAvailable, state.starCount)
	}

	reset = () => {
		this.setState(Game.InitialState());
	}

	render() {
		const { selectedNumbers, usedNumbers, starCount, isAnswerCorrect, redraws, doneStatus } = this.state;
		return (
			<div className="container">
				<h3>Play Nine</h3>
				<hr />
				<div className="row">
					<Stars starCount={starCount} />
					<Button selectedNumbers={selectedNumbers} checkAnswer={this.checkAnswer} isAnswerCorrect={isAnswerCorrect}
						acceptAnswer={this.acceptAnswer} redraws={redraws} redraw={this.redraw} />
					<Answer selectedNumbers={selectedNumbers} unselectNumber={this.unselectNumber} />
				</div>
				<br />
				{
					doneStatus ? <Status doneStatus={doneStatus} reset={this.reset} /> :
						<Numbers selectedNumbers={selectedNumbers} usedNumbers={usedNumbers} selectNumber={this.selectNumber} />
				}
			</div>
		);
	}
}

class App extends React.Component {
	render() {
		return (
			<div>
				<Game />
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("app"));
