import { Piece } from "./chess";
import { Game } from "./chess";
import { Position } from "./chess";
import { Square } from "./chess";
import { Move } from './chess';

export class Point {
	constructor(public x : number, public y : number){}
}

export class Canvas {
	_canvas : any;
	ctx : any;
	dist : any;
	position : Position;
	selectedSquare : Square;
	moves : Move[];
	static selectedPiece : Piece;

	constructor(){
		this.position = new Position();
	}

	get canvas() {
		return this._canvas;
	}

	set canvas(canvas : HTMLCanvasElement) {
		this._canvas = canvas;
		this.ctx = this._canvas.getContext("2d");
		this.dist = this._canvas.clientWidth/8;
		this.update();
	}

	isAMove(square : Square) : Move {
		if (this.moves) {
			let r = undefined;
			for (let m of this.moves) {
				if (square === m.to) {
					r = m;
				}
				if (r) {
					break;
				}
			}
			return r;
		}
		else {
			return undefined;
		}
	}

	pxToSquare(x : number, y : number) : Square {
		var xs = parseInt((x/this.dist).toString().substring(0,1));
		var ys = 7 - parseInt((y/this.dist).toString().substring(0,1));
		return this.position.board[xs][ys];
	}

	squareToPx(square : Square) : Point {
		var xs = square.x*this.dist;
		var ys = (7-square.y)*this.dist;
		return new Point(xs,ys);
	}

	drawBoard() : void {
		var y = 0;
		var x = 0;
		var col = true;
		while (y < this.canvas.clientWidth) {
			while (x < this.canvas.clientWidth) {
				if (!col) {
					this.ctx.fillStyle = "#3333cc";
				}
				else {
					this.ctx.fillStyle = "#eaeafa";
				}
				this.ctx.fillRect(x,y,x+this.dist,y+this.dist);
				x += this.dist;
				col = !col;
			}
			col = !col;
			x = 0
			y += this.dist;
		}
	}

	drawPieces() : void {
		for (let a of this.position.board) {
			for (let b of a) {
				if (!b.isEmpty()) {
					let p = this.squareToPx(b);
					this.ctx.drawImage(b.piece.img,p.x,p.y,this.dist,this.dist);
				}
			}
		}
	}

	drawMoves() : void {
		var img : HTMLImageElement = new Image();
		img.src = 'img/circle.png';

		for (let m of this.moves) {
			let p = this.squareToPx(m.to);
			let x = Math.round(p.x+(this.dist/3));
			let y = Math.round(p.y+(this.dist/4));
			let dist = ((this.dist/2)-(x%this.dist))*2;
			this.ctx.drawImage(img,x,y,dist,dist);
		}
	}

	update() {
		this.drawBoard();
		this.drawPieces();
	}
}


function settingClick() : void {
	var p : Point = getMousePos(window.event);
	if (Canvas.selectedPiece != undefined) {
		var s = canvas.pxToSquare(p.x,p.y);
		s.piece = Canvas.selectedPiece;
		canvas.update();
	}
}

function getMousePos(ev) : Point {
    var x = ev.offsetX;
    var y = ev.offsetY;
    return new Point(x,y);
}

function startNewGame() {
	game = new Game();
	document.getElementById("form").style.display = 'none';
	document.getElementById("setWhite").style.visibility = 'hidden';
	document.getElementById("setBlack").style.visibility = 'hidden';
	canvas.position = game.lastPosition;
	canvas.update();
	canvas.canvas.onclick = playClick;
}

function setPosition() {
	deactivateButtons();
	document.getElementById("submit").onclick = createPosition;
	canvas.canvas.onclick = settingClick;
	var x = 2;
	canvas.drawBoard();
	var div = document.getElementById("form");
	div.style.display = 'inline';
	var pieces = document.getElementsByClassName("set");
	(<HTMLElement>pieces[0]).style.visibility = "visible";
	(<HTMLElement>pieces[1]).style.visibility = "visible";
	var setImg : HTMLElement[] = [];
	var selectedImg : HTMLElement;
	for (let x = 0;x < 12;x++) {
		setImg.push(document.getElementById(x.toString()));
		setImg[x].onclick = function() {
			if (selectedImg != undefined) {
				selectedImg.style.borderStyle = "outset";
			}
			this.style.borderStyle = "inset";
			Canvas.selectedPiece = pieceById(parseInt(this.id));
			selectedImg = this;
		}
	}
}

function createPosition() {
	canvas.position.turn = (<HTMLInputElement>document.getElementById('white')).checked;
	canvas.position.whiteLong = (<HTMLInputElement>document.getElementById('whiteLong')).checked;
	canvas.position.whiteShort = (<HTMLInputElement>document.getElementById('whiteShort')).checked;
	canvas.position.blackLong = (<HTMLInputElement>document.getElementById('blackLong')).checked;
	canvas.position.blackShort = (<HTMLInputElement>document.getElementById('blackShort')).checked;
	hideForms();
	activateButtons();
	startGame(canvas.position);
}

function startGame(position : Position)  {
	game = new Game(position);
	game.lastPosition.searchForKings();

	if (game.isOver()) {
		canvas.canvas.onclick = undefined;
	}
	else {
		canvas.canvas.onclick = playClick;
	}
}

function pieceById(id : number) : Piece{
	if (id%2 == 0) {
		return new Piece(true,(id/2)+1);
	}
	else {
		return new Piece(false,Math.round((id-1)/2)+1);
	}
}

function playClick() {
	var p = getMousePos(window.event);
	var square = canvas.pxToSquare(p.x,p.y);
	canvas.update();
	var move = canvas.isAMove(square);
	if (move) {
		game.playMove(move);
		canvas.moves = undefined;
		canvas.update();
		writeMoves();
		if (game.isOver()) {canvas.canvas.onclick = undefined}
	}
	else {
		var moves = game.findMovesFromSquare(square);
		if (moves.length > 0 && square != canvas.selectedSquare) {
			canvas.moves = moves;
			canvas.selectedSquare = square;
			canvas.drawMoves();
		}
		else {
			if (square === canvas.selectedSquare) {
				canvas.moves = undefined;
				canvas.selectedSquare = undefined;
			}
		}
	}
}

function playAtSpeed(milliseconds : number) {
	if (!game.isOver()) {
		setTimeout(function() {
			game.playRandomly();
			writeMoves();
			canvas.update();
			playAtSpeed(milliseconds);
		},milliseconds);
	}
	else {activateButtons()}
}

function playRandomly() {
	var speed = (<HTMLInputElement>document.getElementById('speed')).valueAsNumber;
	deactivateButtons();
	hideForms();
	playAtSpeed(speed);
}

function setRandomPlay() {
	hideForms();
	if (!game) {
		game = new Game();
		canvas.position = game.lastPosition;
		canvas.update();
	}
	document.getElementById("randomPlayForm").style.display = "inline";
}

function writeMoves() {
	if (!game.turn) {
		let n = (game.moves.length/2+0.5).toString() + '.\t';
		movesArea.value += n;
		movesArea.value += game.moves[game.moves.length-1].toString() + '\t\t';
	}
	else {
		movesArea.value += game.moves[game.moves.length-1].toString() + '\n';
	}
	if (game.isOver()) {
		gameOver();
	}
}

function writePGN() {
	pgnArea.value = game.pgn();
}

function hideForms() {
	document.getElementById("form").style.display = 'none';
	document.getElementById("setWhite").style.visibility = 'hidden';
	document.getElementById("setBlack").style.visibility = 'hidden';
	document.getElementById("randomPlayForm").style.display = "none";
}

function activateButtons() {
	document.getElementById("create").onclick = setPosition;
	document.getElementById("start").onclick = startNewGame;
	document.getElementById("submit").onclick = createPosition;
	document.getElementById("randomSet").onclick = setRandomPlay;
	document.getElementById("randomPlay").onclick = playRandomly;
}

function deactivateButtons() {
	document.getElementById("create").onclick = undefined;
	document.getElementById("start").onclick = undefined;
	document.getElementById("submit").onclick = undefined;
	document.getElementById("randomSet").onclick = undefined;
	document.getElementById("randomPlay").onclick = undefined;
}

function gameOver() {
	canvas.canvas.onclick = undefined;
	game.setTagPairs('WhiteELO','2456','BlackELO','1235','White','Garry Kasparov','Black','Anatoli Karpov');
	writePGN();
	movesArea.value += '\n'+game.termination;
}


var canvas : Canvas = new Canvas();
canvas.canvas = <HTMLCanvasElement>document.getElementById("board");
var game : Game;
var movesArea = <HTMLTextAreaElement>document.getElementById("movesArea");
var pgnArea = <HTMLTextAreaElement>document.getElementById("pgnArea");
activateButtons();
