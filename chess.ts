import { Canvas } from './graphics';
import { playClick } from './graphics';
import { canvas } from './graphics';


export class Game {
	board : Board;
	moves : Move[];
	positions : Board[];
	legalMoves : Move[];
	whitePlayer : string;
	blackPlayer : string;
	whiteRating : number;
	blackRating : number;
	moveCounter : number;


	constructor(white : string, black : string,) {
		this.whitePlayer = white;
		this.blackPlayer = black;
		this.moveCounter = 0;
		this.positions = [];
		this.moves = [];
		this.board = new Board();
		canvas.canvas.onclick = playClick;
	}

	isOver() : boolean {
		return this.isCheckmate() || this.isStalemate() || this.isInsufficientMaterial() || this.fiftyMovesRule();
	}
	// 
	// isThreefoldRepetition() : boolean  {
	// 	if (this.positions.length > )
	// }

	isCheck() : boolean {
		if (this.board.kingThreat(this.board.turn)) {
			return true;
		}
		else {
			return false;
		}
	}

	isCheckmate() : boolean {
		if (this.isCheck() && this.legalMoves.length == 0) {
			console.log('Checkmate!');
			return true;
		}
		else {
			return false;
		}
	}

	isStalemate() : boolean {
		if (!this.isCheck() && this.legalMoves.length == 0) {
			console.log('Draw for stalemate!');
			return true;
		}
		else {
			return false;
		}
	}

	isInsufficientMaterial() : boolean {
		if (this.board.isInsufficientMaterial()) {
			console.log('Draw for insufficient material.');
			return true;
		}
		else {
			return false;
		}
	}

	fiftyMovesRule() : boolean {
		if (this.moveCounter == 50) {
			console.log('50 move rule');
			return true;
		}
		else {
			return false;
		}
	}

	findMovesFromSquare(square : Square) : Move[] {
		var ret : Move[] = []
		for (let move of this.legalMoves) {
			if (move.from == square) {
				ret.push(move);
			}
		}
		return ret;
	}

	findMoves() : void {
		this.legalMoves = this.board.legalMoves();
	}

	playMove(move : Move) : void {
		if (move.isCapture || move.pieceType == 1) {this.moveCounter = 0}
		else {this.moveCounter++}
		this.positions.push(this.board.clone());
		this.moves.push(move);
		this.board.lastMove = move;
		//right to castle code
		if (move.pieceType == 6) {
			if (this.board.turn) {
				this.board.whiteLong = false;
				this.board.whiteShort = false;
			}
			else {
				this.board.blackLong = false;
				this.board.blackShort = false;
			}
		}
		if (this.board.turn) {
			if (this.board.whiteLong && move.pieceType == 4 && move.from.x == 0 && move.from.y == 0) {
				this.board.whiteLong = false;
			}
			if (this.board.whiteShort && move.pieceType == 4 && move.from.x == 7 && move.from.y == 0) {
				this.board.whiteShort = false;
			}
		}
		else {
			if (this.board.blackLong && move.pieceType == 4 && move.from.x == 0 && move.from.y == 7) {
				this.board.blackLong = false;
			}
			if (this.board.blackShort && move.pieceType == 4 && move.from.x == 7 && move.from.y == 7) {
				this.board.blackShort = false;
			}
		}
		//before moving
		this.board.move(move);
		//after moving
		this.board.turn = !this.board.turn;
		canvas.update();
		this.findMoves();
		if (this.isOver()) {canvas.canvas.onclick = undefined}
		else {
			if (this.isCheck()) {console.log('Check!')}
		}
	}

	startGame() : void {
		this.board.startingPosition();
		canvas.position = this.board;
		canvas.update();
		this.findMoves();
	}

	print() : void {
		document.write(this.blackPlayer + '<br><br>');
		this.board.print();
		document.write('<br>' + this.whitePlayer);

	}
}

export class Board {
	board : Square[][];
	turn : boolean;
	whiteLong : boolean;
	whiteShort : boolean;
	blackLong : boolean;
	blackShort : boolean;
	whiteKing : Square;
	blackKing : Square;
	lastMove : Move;

	constructor() {
		this.board = [];
		for (let i = 0; i < 8;i++) {
			this.board[i] = [];
			for (let j = 0; j < 8;j++) {
				this.board[i][j] = new Square(i,j);
			}
		}
	}

	isInsufficientMaterial() : boolean {
		var pieces : Piece[] = [];
		for (let a of this.board) {
			for (let b of a) {
				if (!b.isEmpty()) {
					pieces.push(b.piece);
				}
			}
		}
		if (pieces.length == 3) {
			for (let piece of pieces) {
				if (piece.type != 6 && (piece.type == 3 || piece.type == 2)) {
					return true;
				}
			}
		}
		if (pieces.length == 2) {
			return true;
		}
		else {
			return false;
		}
	}

	startingPosition() : void {
		for (let a of this.board) {
			for (let b of a) {
				b.startingPosition();
			}
		}
		this.whiteLong = true;
		this.whiteShort = true;
		this.blackLong = true;
		this.blackShort = true;
		this.turn = true;
		this.whiteKing = this.board[4][0];
		this.blackKing = this.board[4][7];
	}

	print() : void {
		for(let y = 7;y >= 0;y--) {
			for (let x = 0;x<8;x++) {
				document.write(this.board[x][y].print()+'\t');
			}
			document.write('<br>');
		}
	}

	searchForKings() : void {
		for(let a of this.board) {
			for (let b of a) {
				if (!b.isEmpty() && b.piece.type == 6) {
					if (b.piece.side) {
						this.whiteKing = b;
					}
					else {
						this.blackKing = b;
					}
				}
			}
		}
	}

	move(move : Move) : void {
		var from = this.board[move.from.x][move.from.y];
		var to = this.board[move.to.x][move.to.y];
		switch (move.type) {
			case 'enPassant' : {
 				to.piece = from.piece;
				from.piece = undefined;
				this.board[move.to.x][move.from.y].piece = undefined;
				break;
			}
			case 'longCastle' : {
				to.piece = from.piece;
				from.piece = undefined;
				this.board[3][move.from.y].piece = this.board[0][move.from.y].piece;
				this.board[0][move.from.y].piece = undefined;
				break;
			}
			case 'shortCastle' : {
				to.piece = from.piece;
				from.piece = undefined;
				this.board[5][move.from.y].piece = this.board[7][move.from.y].piece;
				this.board[7][move.from.y].piece = undefined;
				break;
			}
			case 'promotion' : {
				to.piece = from.piece;
				to.piece.type = 5;
				from.piece = undefined;
				break;
			}
			default : {
				to.piece = from.piece;
				from.piece = undefined;
				break;
			}
		}
		this.searchForKings();
	}

	printControlledSquares(x : number, y : number) : void {
		var a = this.controls(this.board[x][y]);
	}

	kingThreat(side : boolean) : boolean {	// returns true if specified king is in danger
		var threat = false;
		var king : Square;
		if (side) {
			king = this.whiteKing;
		}
		else {
			king = this.blackKing;
		}
		for (let a of this.board) {
			for (let b of a) {
				if (b.piece != undefined && b.piece.side != side) {
					let controlledSquares : Square[] = this.controls(b);
					for (let c of controlledSquares) {
						if (c == king) {
							threat = true;
						}
					}
				}
			}
			if (threat) break;
		}
		return threat;
	}

	legalMovesOf(from : Square) : Move[] {
		if (from.isEmpty() || from.piece.side != this.turn) {
			return undefined;
		}
		else {
			var squares : Square[] = this.controls(from);
			var moves : Move[] = [];
			for (let i = 0; i < squares.length;i++) {
				if ((!squares[i].isEmpty() && squares[i].piece.side == this.turn) || (from.piece.type == 1 && squares[i].isEmpty())) {
					// non-legal moves
				}
				else {
					moves.push(new Move(from,squares[i],'normal'));
				}
			}

			if (from.piece.type == 1) { // pawns moves
				if (from.piece.side) {
					// white pawns
					if (this.board[from.x][from.y+1].isEmpty()) {
						if (from.y == 6) {
							//promotion
							moves.push(new Move(from,this.board[from.x][7],'promotion'));
						}
						else {
							moves.push(new Move(from,this.board[from.x][from.y+1],'normal'));
								if (from.y == 1 && this.board[from.x][from.y+2].isEmpty()) {
								// double push
								moves.push(new Move(from,this.board[from.x][from.y+2],'doublePawn'));
							}
						}

					}

					if (from.y == 4 && this.lastMove != undefined && this.lastMove.pieceType == 1 && this.lastMove.type == 'doublePawn' && (this.lastMove.from.x == from.x-1 || this.lastMove.from.x == from.x+1)) {
						// en passant
						if (this.lastMove.from.x == from.x-1) {
							moves.push(new Move(from,this.board[from.x-1][from.y+1],'enPassant'));
						}
						else {
							moves.push(new Move(from,this.board[from.x+1][from.y+1],'enPassant'));
						}
					}
				}
				else {
					// black pawns
					if (this.board[from.x][from.y-1].isEmpty()) {
						if (from.y == 1) {
							moves.push(new Move(from,this.board[from.x][0],'promotion'));
						}
						else {
							moves.push(new Move(from,this.board[from.x][from.y-1],'normal'));
								if (from.y == 6 && this.board[from.x][from.y-2].isEmpty()) {
								// double push
								moves.push(new Move(from,this.board[from.x][from.y-2],'doublePawn'));
							}
						}

					}

					if (from.y == 3 && this.lastMove != undefined && this.lastMove.pieceType == 1 && this.lastMove.type == 'doublePawn' && (this.lastMove.from.x == from.x-1 || this.lastMove.from.x == from.x+1)) {
						// en passant
						if (this.lastMove.from.x == from.x-1) {
							moves.push(new Move(from,this.board[from.x-1][from.y-1],'enPassant'));
						}
						else {
							moves.push(new Move(from,this.board[from.x+1][from.y-1],'enPassant'));
						}
					}
				}
			}
			if (from.piece.type == 6) { // castle
				if (this.turn) {
					if (this.canCastle(true)) {
						moves.push(new Move(from,this.board[6][0],'shortCastle'));
					}
					if (this.canCastle(false)) {
						moves.push(new Move(from,this.board[2][0],'longCastle'));
					}
				}
				else {
					if (this.canCastle(true)) {
						moves.push(new Move(from,this.board[6][7],'shortCastle'));
					}
					if (this.canCastle(false)) {
						moves.push(new Move(from,this.board[2][7],'longCastle'));
					}
				}
			}
			return this.testMoves(moves);
		}
	}

	legalMoves() : Move[] {
		var moves : Move[] = [];
		for (let a of this.board) {
			for (let b of a) {
				let bmoves = this.legalMovesOf(b);
				if (bmoves) {
					for (let m of bmoves) {
						moves.push(m);
					}
				}
			}
		}
		return moves;
	}

	testMoves(cand : Move[]) : Move[] {
		var r : Move[] = [];
		for (let move of cand) {
			let newBoard = this.clone();
			newBoard.move(move);
			if (!newBoard.kingThreat(this.turn)) {
				r.push(move);
			}
		}
		return r;
	}

	canCastle(side : boolean) : boolean { // true = kingside & false = queenside
		if (this.turn) {
			if (side) {
				if (this.whiteShort) {
					return (this.board[5][0].isEmpty() && this.board[6][0].isEmpty() && !this.kingThreat(this.turn) && !this.isControlled(this.board[5][0],!this.turn) && !this.isControlled(this.board[6][0],!this.turn));
				}
				else {
					return false;
				}
			}
			else {
				if (this.whiteLong) {
					return (this.board[3][0].isEmpty() && this.board[2][0].isEmpty() && !this.kingThreat(this.turn) && !this.isControlled(this.board[3][0],!this.turn) && !this.isControlled(this.board[2][0],!this.turn));
				}
				else {
					return false;
				}
			}
		}
		else {
			if (side) {
				if (this.blackShort) {
					return (this.board[5][7].isEmpty() && this.board[6][7].isEmpty() && !this.kingThreat(this.turn) && !this.isControlled(this.board[5][7],!this.turn) && !this.isControlled(this.board[6][7],!this.turn));
				}
				else {
					return false;
				}
			}
			else {
				if (this.blackLong) {
					return (this.board[3][7].isEmpty() && this.board[2][7].isEmpty() && !this.kingThreat(this.turn) && !this.isControlled(this.board[3][7],!this.turn) && !this.isControlled(this.board[2][7],!this.turn));
				}
				else {
					return false;
				}
			}
		}
	}

	isControlled(s : Square,side : boolean) : boolean {		// returns true if square 's' is controlled by white/black
		for (let a of this.board) {
			for (let b of a) {
				if (!b.isEmpty() && b.piece.side == side) {
					if (this.findSquare(this.controls(b),s)) {
						return true;
					}
				}
			}
		}
		return false;
	}

	findSquare(arr : Square[], s : Square) : boolean {
		var b = false;
		for (let i = 0; i < arr.length && !b;i++) {
			b = (arr[i] == s);
		}
		return b;
	}

	static pop(arr : any[],index : number) : any[] {
		var r = [];
		for (let i = 0; i < index;i++) {
			r.push(arr[i]);
		}
		for (let i = index+1; i < arr.length;i++) {
			r.push(arr[i]);
		}
		return r;
	}

	controls(from : Square) : Square[] {	// returns every square that the piece of the 'from' square controls
		var to : Square[] = [];
		if (from.isEmpty()) {
			return undefined;
		}
		else {
			if (from.piece.type == 1) { // pawn
				if (from.piece.side) { // white pawn
					if (from.x == 0) {
						to.push(this.board[from.x+1][from.y+1]);
						return to;
					}
					if (from.x == 7) {
						to.push(this.board[from.x-1][from.y+1]);
						return to;
					}
					else {
						to.push(this.board[from.x+1][from.y+1]);
						to.push(this.board[from.x-1][from.y+1]);
						return to;
					}
				}
				else {					// black pawn
					if (from.x == 0) {
						to.push(this.board[from.x+1][from.y-1]);
						return to;
					}
					if (from.x == 7) {
						to.push(this.board[from.x-1][from.y-1]);
						return to;
					}
					else {
						to.push(this.board[from.x+1][from.y-1]);
						to.push(this.board[from.x-1][from.y-1]);
						return to;
					}
				}
			}
			if (from.piece.type == 2) { // knight
				this.push(from.x+1,from.y+2,to);
				this.push(from.x+1,from.y-2,to);
				this.push(from.x-1,from.y+2,to);
				this.push(from.x-1,from.y-2,to);
				this.push(from.x+2,from.y+1,to);
				this.push(from.x+2,from.y-1,to);
				this.push(from.x-2,from.y+1,to);
				this.push(from.x-2,from.y-1,to);
				return to;
			}
			if (from.piece.type == 3) {	// bishop
				let x = from.x+1;
				let y = from.y+1;
				// diagonal x++ y++
				while (x < 8 && y < 8 && this.board[x][y].isEmpty()) {
					to.push(this.board[x][y]);
					x++;
					y++;
				}
				this.push(x,y,to); // la prima casella non vuota la aggiunge
				x = from.x+1;
				y = from.y-1;
				// diagonal x++ y--
				while (x < 8 && y >= 0 && this.board[x][y].isEmpty()) {
					to.push(this.board[x][y]);
					x++;
					y--;
				}
				this.push(x,y,to);
				x = from.x-1;
				y = from.y-1;
				// diagonal x-- y--
				while (x >= 0 && y >= 0 && this.board[x][y].isEmpty()) {
					to.push(this.board[x][y]);
					x--;
					y--;
				}
				this.push(x,y,to);
				x = from.x-1;
				y = from.y+1;
				// diagonal x-- y++
				while (x >= 0 && y < 8 && this.board[x][y].isEmpty()) {
					to.push(this.board[x][y]);
					x--;
					y++;
				}
				this.push(x,y,to);
				return to;
			}
			if (from.piece.type == 4) {	// rook
				let x,y;
				x = from.x+1;
				y = from.y;
				while (x < 8 && this.board[x][y].isEmpty()) { // x++
					to.push(this.board[x][y]);
					x++;
				}
				this.push(x,y,to);
				x = from.x-1;
				while (x >= 0 && this.board[x][y].isEmpty()) { // x--
					to.push(this.board[x][y]);
					x--;
				}
				this.push(x,y,to);
				x = from.x;
				y = from.y+1;
				while (y < 8 && this.board[x][y].isEmpty()) { // y++
					to.push(this.board[x][y]);
					y++;
				}
				this.push(x,y,to);
				y = from.y-1;
				while (y >= 0 && this.board[x][y].isEmpty()) { // y--
					to.push(this.board[x][y]);
					y--;
				}
				this.push(x,y,to);
				return to;
			}
			if (from.piece.type == 5) {	// queen
				if (true) { 	// bishop moves
					let x = from.x+1;
					let y = from.y+1;
					// diagonal x++ y++
					while (x < 8 && y < 8 && this.board[x][y].isEmpty()) {
						to.push(this.board[x][y]);
						x++;
						y++;
					}
					this.push(x,y,to); // adds first
					x = from.x+1;
					y = from.y-1;
					// diagonal x++ y--
					while (x < 8 && y >= 0 && this.board[x][y].isEmpty()) {
						to.push(this.board[x][y]);
						x++;
						y--;
					}
					this.push(x,y,to);
					x = from.x-1;
					y = from.y-1;
					// diagonal x-- y--
					while (x >= 0 && y >= 0 && this.board[x][y].isEmpty()) {
						to.push(this.board[x][y]);
						x--;
						y--;
					}
					this.push(x,y,to);
					x = from.x-1;
					y = from.y+1;
					// diagonal x-- y++
					while (x >= 0 && y < 8 && this.board[x][y].isEmpty()) {
						to.push(this.board[x][y]);
						x--;
						y++;
					}
					this.push(x,y,to);
				}
				if (true) {		// rook moves
					let x,y;
					x = from.x+1;
					y = from.y;
					while (x < 8 && this.board[x][y].isEmpty()) { // x++
						to.push(this.board[x][y]);
						x++;
					}
					this.push(x,y,to);
					x = from.x-1;
					while (x >= 0 && this.board[x][y].isEmpty()) { // x--
						to.push(this.board[x][y]);
						x--;
					}
					this.push(x,y,to);
					x = from.x;
					y = from.y+1;
					while (y < 8 && this.board[x][y].isEmpty()) { // y++
						to.push(this.board[x][y]);
						y++;
					}
					this.push(x,y,to);
					y = from.y-1;
					while (y >= 0 && this.board[x][y].isEmpty()) { // y--
						to.push(this.board[x][y]);
						y--;
					}
					this.push(x,y,to);
				}
				return to;
			}
			if (from.piece.type == 6) {	// king
				this.push(from.x+1,from.y+1,to);
				this.push(from.x+1,from.y,to);
				this.push(from.x+1,from.y-1,to);
				this.push(from.x,from.y+1,to);
				this.push(from.x,from.y-1,to);
				this.push(from.x-1,from.y+1,to);
				this.push(from.x-1,from.y,to);
				this.push(from.x-1,from.y-1,to);
				return to;
			}
		}
	}

	push(x : number, y : number, array : Square[]) : void {
		if (x < 8 && x >= 0 && y < 8 && y >= 0) {
			array.push(this.board[x][y]);
		}
	}

	clone() : Board {
		var r = new Board();
		for (let a in r.board) {
			for (let b in r.board[a]) {
				r.board[a][b].piece = this.board[a][b].piece;
			}
		}
		r.turn = this.turn;
		r.blackLong = this.blackLong;
		r.blackShort = this.blackShort;
		r.whiteLong = this.whiteLong;
		r.whiteShort = this.whiteShort;
		r.searchForKings();
		return r;
	}
}

export class Square {
	piece : Piece;

	constructor(public x : number, public y : number, p? : Piece) {
		if (p) {
			this.piece = p;
		}
	}

	isEmpty() : boolean {
		return this.piece == undefined;
	}

	toString() : string {
		var y : string = (this.y+1).toString();
		var x : string = '';
		if (this.x == 0) {
			x = 'a';
		}
		if (this.x == 1) {
			x = 'b';
		}
		if (this.x == 2) {
			x = 'c';
		}
		if (this.x == 3) {
			x = 'd';
		}
		if (this.x == 4) {
			x = 'e';
		}
		if (this.x == 5) {
			x = 'f';
		}
		if (this.x == 6) {
			x = 'g';
		}
		if (this.x == 7) {
			x = 'h';
		}
		return x+y;
	}

	print() : string {
		if (this.piece == undefined) {
			return 'x';
		}
		else {
			return this.piece.toString();
		}
	}

	startingPosition() : void {
		if (this.y == 1) {
			this.piece = new Piece(true,1);
		}
		if (this.y == 6) {
			this.piece = new Piece(false,1);
		}
		if (this.y == 0) {
			if (this.x == 0 || this.x == 7) {
				this.piece = new Piece(true,4);
			}
			if (this.x == 1 || this.x == 6) {
				this.piece = new Piece(true,2);
			}
			if (this.x == 2 || this.x == 5) {
				this.piece = new Piece(true,3);
			}
			if (this.x == 3) {
				this.piece = new Piece(true,5);
			}
			if (this.x == 4) {
				this.piece = new Piece(true,6);
			}
		}
		if (this.y == 7) {
			if (this.x == 0 || this.x == 7) {
				this.piece = new Piece(false,4);
			}
			if (this.x == 1 || this.x == 6) {
				this.piece = new Piece(false,2);
			}
			if (this.x == 2 || this.x == 5) {
				this.piece = new Piece(false,3);
			}
			if (this.x == 3) {
				this.piece = new Piece(false,5);
			}
			if (this.x == 4) {
				this.piece = new Piece(false,6);
			}
		}
	}
}

export class Move {
	name : string;
	pieceType : number;
	//types: 'normal','longCastle','shortCastle','promotion','enPassant','doublePawn'
	isCapture : boolean;
	type : string;
	promotionPiece : number;


	constructor(public from : Square, public to : Square, t : string) {
		this.pieceType = from.piece.type;
		this.isCapture = !this.to.isEmpty() || this.type == 'enPassant';
		this.type = t;
		if (this.pieceType == 1 && (to.y == 0 || to.y == 7)) {
			this.type = 'promotion';
		}
		this.name = this.giveName();
	}


	giveName() : string {
		var name;
		switch (this.pieceType) {
			case 1: {
				if (this.isCapture) {
					name = (this.from.toString()).substring(0,1) + 'x' + this.to.toString();
					if (this.type == 'promotion') {
						name += '=';
					}
				}
				else {
					name = this.to.toString();
					if (this.type == 'promotion') {
						name += '=';
					}
				}
				return name;
			}

			case 2: {
				name = 'N';
				if (this.isCapture) {
					name += 'x';
				}
				name += this.to.toString();
				return name;
			}
			case 3: {
				name = 'B';
				if (this.isCapture) {
					name += 'x';
				}
				name += this.to.toString();
				return name;
			}
			case 4: {
				name = 'R';
				if (this.isCapture) {
					name += 'x';
				}
				name += this.to.toString();
				return name;
			}
			case 5: {
				name = 'Q';
				if (this.isCapture) {
					name += 'x';
				}
				name += this.to.toString();
				return name;
			}
			case 6: {
				if (this.type == 'longCastle') {
					return 'O-O-O';
				}
				if (this.type == 'shortCastle') {
					return 'O-O';
				}
				name = 'K';
				if (this.isCapture) {
					name += 'x';
				}
				name += this.to.toString();
				return name;
			}
		}
	}

	toString() : string {
		return this.name;
	}
}

export class Piece {
	/* types:
	pawn = 1;
	knight = 2;
	bishop = 3;
	rook = 4;
	queen = 5;
	king = 6;
	*/
	img : HTMLImageElement = new Image();

	constructor(public side: boolean, public type : number) {
		this.img.src = 'img/pieces/' + Piece.typeToImg(this.type,this.side) + '.png';
	}

	/*
	white = true;
	black = false;
	pawn = 1;
	knight = 2;
	bishop = 3;
	rook = 4;
	queen = 5;
	king = 6;
	*/
	toString() : string {
		if (this.side) {
			if (this.type == 1) {
				return 'P';
			}
			if (this.type == 2) {
				return 'N';
			}
			if (this.type == 3) {
				return 'B';
			}
			if (this.type == 4) {
				return 'R';
			}
			if (this.type == 5) {
				return 'Q';
			}
			if (this.type == 6) {
				return 'K';
			}

		}
		else {
			if (this.type == 1) {
				return '<b>' + 'P' + '</b>';
			}
			if (this.type == 2) {
				return '<b>' + 'N' + '</b>';
			}
			if (this.type == 3) {
				return '<b>' + 'B' + '</b>';
			}
			if (this.type == 4) {
				return '<b>' + 'R' + '</b>';
			}
			if (this.type == 5) {
				return '<b>' + 'Q' + '</b>';
			}
			if (this.type == 6) {
				return '<b>' + 'K' + '</b>';
			}
		}
	}

	static typeToImg(type : number, side : boolean) : string {
		if (side) {
			switch(type) {
			    case 1:
			        return "WhitePawn";
			    case 2:
			        return "WhiteKnight";
			    case 3:
			        return "WhiteBishop";
			    case 4:
			        return "WhiteRook";
			    case 5:
			        return "WhiteQueen";
			    case 6:
			    	return "WhiteKing";
			}
		}
		else {
			switch(type) {
			    case 1:
			        return "BlackPawn";
			    case 2:
			        return "BlackKnight";
			    case 3:
			        return "BlackBishop";
			    case 4:
			        return "BlackRook";
			    case 5:
			        return "BlackQueen";
			    case 6:
			    	return "BlackKing";
			}
		}
	}
}

function clone(obj) {
	if (obj === undefined) {
		return undefined;
	}
	else {
		var r;
		for (let att in obj) {
			if (typeof(obj[att]) == 'object') {
				r[att] = clone(obj[att]);
			}
			else {
				r[att] = obj[att];
			}
		}
		return r;
	}
}
