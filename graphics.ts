import { Piece } from "./chess";
import { Game } from "./chess";
import { Board } from "./chess";
import { Square } from "./chess";
import { Move } from './chess';

export class Point {
	constructor(public x : number, public y : number){}
}

export class Canvas {
	canvas : any = document.getElementById("board");
	ctx = this.canvas.getContext("2d");
	dist = this.canvas.clientWidth/8;
	position : Board;
	mode : string;
	selectedSquare : Square;
	moves : Move[];
	//mode : 'setting','game'
	static selectedPiece : Piece;

	constructor(setting : string){
		this.canvas.height = 500;
		this.canvas.width = 500;
		this.mode = setting;
		this.position = new Board();
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
	canvas = new Canvas('game');
	game = new Game('Marco','Luca');
	document.getElementById("form").style.display = 'none';
	game.startGame();
}

function setPosition() {
	canvas = new Canvas('setting');
	canvas.canvas.onclick = settingClick;
	var x = 2;
	canvas.drawBoard();
	var div = document.getElementById("form");
	div.style.display = 'inline';
	var pieces = document.getElementById("set");
	pieces.style.display = "inline-block";
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
	canvas.mode = 'game';
	startGame(canvas.position);
}

function startGame(board : Board)  {
	game = new Game('x','y');
	game.board = board;
	game.board.searchForKings();
	document.getElementById("form").style.display = 'none';
	game.findMoves();
	if (game.isOver()) {
		canvas.canvas.onclick = undefined;
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

export function playClick() {
	var p = getMousePos(window.event);
	var square = canvas.pxToSquare(p.x,p.y);
	canvas.update();
	var move = canvas.isAMove(square);
	if (move) {
		game.playMove(move);
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

document.getElementById("create").onclick = setPosition;
document.getElementById("start").onclick = startNewGame;
document.getElementById("submit").onclick = createPosition;
export var canvas : Canvas;
var game : Game;
