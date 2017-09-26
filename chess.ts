export class Game {
	lastPosition : Position;
	moves : Move[];
	positions : Position[];

	private tagPairs : string[];
	private FEN : string;
	private _legalMoves : Move[];
	private moveCounter : number;
	private result : string;
	private _termination : string;

	constructor(board? : Position) {
		this.moveCounter = 0;
		this.positions = [];
		this.moves = [];
		if (board) {
			this.lastPosition = board;
			this.positions.push(board.clone());
		}
		else {
			this.lastPosition = new Position('start');
		}
		this.findMoves();
		this.tagPairs = ['Event','?','Site','?','Date','????.??.??',
		'Round','-','White','?','Black','?','Result','*'];
	}

	get legalMoves() : Move[] {
		return this._legalMoves;
	}

	get turn() : boolean {
		return this.lastPosition.turn;
	}

	get termination() : string {
		return this._termination;
	}

	setTagPairs(...arr : string[]) : void {
		if (!arr || arr.length%2 != 0) {throw "Invalid tag pairs!"};
		let i = 0;
		while (i < arr.length) {
			let present = false;
			for (let k = 0;k < this.tagPairs.length;k+=2) {
				if (arr[i] === this.tagPairs[k]) {
					this.tagPairs[k+1] = arr[i+1];
					present = true;
				}
			}
			if (!present) {
				this.tagPairs.push(arr[i],arr[i+1]);
			}
			i+=2;
		}
	}

	playRandomly() : void {
		this.playMove(this._legalMoves[Math.floor(Math.random() * this._legalMoves.length)]);
	}

	endGame(result? : string) {
		if (result) {
			this.result = result;
			switch (result) {
				case '1/2-1/2': {
					this._termination = 'Draw by agreement.';
					break;
				}
				case '0-1': {
					this._termination = 'White resigns.';
					break;
				}
				case '1-0': {
					this._termination = 'Black resigns.';
					break;
				}
				default: {
					throw 'Invalid result!';
				}
			}
		}
		else {
			if (this.fiftyMovesRule()) {
				this.result = '1/2-1/2';
				this._termination = '50 moves rule';
			}
			if (this.isCheckmate()) {
				if (this.lastPosition.turn) {
					this.result = '0-1';
				}
				else {
					this.result = '1-0';
				}
				this._termination = 'Checkmate';
			}
			if (this.isStalemate()) {
				this.result = '1/2-1/2';
				this._termination = 'Stalemate';
			}
			if (this.isInsufficientMaterial()) {
				this.result = '1/2-1/2';
				this._termination = 'Insufficient material';
			}
		}
		this.setTagPairs('Result',this.result);
	}

	pgn() : string {
		var pgn = '';
		let i = 0;
		while (i < this.tagPairs.length) {
			pgn += '['+this.tagPairs[i++]+' "'+this.tagPairs[i++]+'"]\n';
		}
		let turn = true;
		for (let i=0;i < this.moves.length;i++) {
			if (turn) {
				pgn += ((i/2)+1).toString() + '. '
			}
			pgn += this.moves[i].toString() + ' ';
			turn = !turn;
		}
		pgn += '{ '+this._termination+' } ';
		pgn += this.result;
		return pgn;
	}

	isOver() : boolean {
		if (this.lastPosition.isOver() || this.fiftyMovesRule()) {
			return true;
		}
		else {
			return false;
		}
	}

	isCheck() : boolean {
		if (this.lastPosition.kingThreat(this.lastPosition.turn)) {
			return true;
		}
		else {
			return false;
		}
	}

	isCheckmate() : boolean {
		return this.lastPosition.isCheckmate();
	}

	isStalemate() : boolean {
		return this.lastPosition.isStalemate();
	}

	isInsufficientMaterial() : boolean {
		return this.lastPosition.isInsufficientMaterial();
	}

	fiftyMovesRule() : boolean {
		return this.moveCounter == 50;
	}

	findMovesFromSquare(square : Square) : Move[] {
		var ret : Move[] = [];
		for (let move of this._legalMoves) {
			if (move.from == square) {
				ret.push(move);
			}
		}
		return ret;
	}

	findMoves() : void {
		this._legalMoves = this.lastPosition.findMoves();
	}

	rightToCastle(move : Move) : void {
		if (move.pieceType == 6) {
			if (this.lastPosition.turn) {
				this.lastPosition.whiteLong = false;
				this.lastPosition.whiteShort = false;
			}
			else {
				this.lastPosition.blackLong = false;
				this.lastPosition.blackShort = false;
			}
		}
		if (this.lastPosition.turn) {
			if (this.lastPosition.whiteLong && move.pieceType == 4 && move.from.x == 0 && move.from.y == 0) {
				this.lastPosition.whiteLong = false;
			}
			if (this.lastPosition.whiteShort && move.pieceType == 4 && move.from.x == 7 && move.from.y == 0) {
				this.lastPosition.whiteShort = false;
			}
		}
		else {
			if (this.lastPosition.blackLong && move.pieceType == 4 && move.from.x == 0 && move.from.y == 7) {
				this.lastPosition.blackLong = false;
			}
			if (this.lastPosition.blackShort && move.pieceType == 4 && move.from.x == 7 && move.from.y == 7) {
				this.lastPosition.blackShort = false;
			}
		}
	}

	playMove(move : Move) : void {
		if (move.isCapture || move.pieceType == 1) {this.moveCounter = 0}
		else {this.moveCounter++}
		this.moves.push(move);
		this.lastPosition.lastMove = move;
		this.rightToCastle(move);
		//before moving
		this.lastPosition.move(move);
		//after moving
		this.findMoves();
		this.positions.push(this.lastPosition.clone());
		if (this.isCheckmate()) {
			move.name += "#";
		}
		else {
			if (this.isCheck()) {
				move.name += "+";
			}
		}
		if (this.isOver()) {this.endGame()}
	}
}

export class Position {
	board : Square[][];
	turn : boolean;
	whiteLong : boolean;
	whiteShort : boolean;
	blackLong : boolean;
	blackShort : boolean;
	whiteKing : Square;
	blackKing : Square;
	lastMove : Move;
	legalMoves : Move[];

	constructor(mode? : string) {
		this.board = [];
		for (let i = 0; i < 8;i++) {
			this.board[i] = [];
			for (let j = 0; j < 8;j++) {
				this.board[i][j] = new Square(i,j);
			}
		}
		if (mode && mode === 'start') {
			this.startingPosition();
		}
	}



	isOver() : boolean {
		return this.isCheckmate() || this.isStalemate() || this.isInsufficientMaterial();
	}

	isCheck() : boolean {
		if (this.kingThreat(this.turn)) {
			return true;
		}
		else {
			return false;
		}
	}

	isCheckmate() : boolean {
		if (this.isCheck() && this.legalMoves.length == 0) {
			return true;
		}
		else {
			return false;
		}
	}

	isStalemate() : boolean {
		if (!this.isCheck() && this.legalMoves.length == 0) {
			return true;
		}
		else {
			return false;
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
		let wk = 0;
		let bk = 0;
		for(let a of this.board) {
			for (let b of a) {
				if (!b.isEmpty() && b.piece.type == 6) {
					if (b.piece.side) {
						if (wk > 0) {throw "More than one white king found!"}
						this.whiteKing = b;
						wk++;
					}
					else {
						if (bk > 0) {throw "More than one black king found!"}
						this.blackKing = b;
						bk++;
					}
				}
			}
		}
		if (wk == 0 || bk == 0) {
			throw "Put those kings man!";
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
				to.piece = move.promotionPiece;
				from.piece = undefined;
				break;
			}
			default : {
				to.piece = from.piece;
				from.piece = undefined;
				break;
			}
		}
		this.turn = !this.turn;
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
					if (from.piece.type == 1 && !squares[i].isEmpty() && (squares[i].y == 7 || squares[i].y == 0)) {
						moves.push(new Move(from,squares[i],'promotion',new Piece(this.turn,2)));
						moves.push(new Move(from,squares[i],'promotion',new Piece(this.turn,3)));
						moves.push(new Move(from,squares[i],'promotion',new Piece(this.turn,4)));
						moves.push(new Move(from,squares[i],'promotion',new Piece(this.turn,5)));
					}
					else {
						moves.push(new Move(from,squares[i],'normal'));
					}
				}
			}

			if (from.piece.type == 1) { // pawns moves
				if (from.piece.side) {
					//white pawns
					if (this.board[from.x][from.y+1].isEmpty()) {
						if (from.y == 6) {
							//promotion
							moves.push(new Move(from,this.board[from.x][7],'promotion',new Piece(this.turn,2)));
							moves.push(new Move(from,this.board[from.x][7],'promotion',new Piece(this.turn,3)));
							moves.push(new Move(from,this.board[from.x][7],'promotion',new Piece(this.turn,4)));
							moves.push(new Move(from,this.board[from.x][7],'promotion',new Piece(this.turn,5)));
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
							moves.push(new Move(from,this.board[from.x][0],'promotion',new Piece(this.turn,2)));
							moves.push(new Move(from,this.board[from.x][0],'promotion',new Piece(this.turn,3)));
							moves.push(new Move(from,this.board[from.x][0],'promotion',new Piece(this.turn,4)));
							moves.push(new Move(from,this.board[from.x][0],'promotion',new Piece(this.turn,5)));
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
			moves = this.testMoves(moves);
			return moves;
		}
	}

	findMoves() : Move[] {
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
		this.legalMoves = this.nameMoves(moves);
		return moves;
	}

	testMoves(cand : Move[]) : Move[] {
		var r : Move[] = [];
		for (let move of cand) {
			let newPosition = this.clone();
			newPosition.move(move);
			if (!newPosition.kingThreat(this.turn)) {
				r.push(move);
			}
		}
		return r;
	}

	nameMoves(moves : Move[]) : Move[] {
		let sameMoves : Move[][] = [];
		let escludi : number[] = [];
		for (let i=0; i < moves.length-1;i++) {
			if (!linearSearch(escludi,i)) {
				sameMoves.push([moves[i]]);
				for (let j=i+1; j < moves.length;j++) {
					if (moves[i].name === moves[j].name) {
						escludi.push(j);
						sameMoves[sameMoves.length-1].push(moves[j]);
					}
				}
			}
		}
		for (let x of sameMoves) {
			if (x.length > 1) {
				Move.changeName(x);
			}
		}
		return moves;
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
					if (Square.findSquare(this.controls(b),s)) {
						return true;
					}
				}
			}
		}
		return false;
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

	clone() : Position {
		var r = new Position();
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

	static findSquare(arr : Square[], s : Square) : boolean {
		var b = false;
		for (let i = 0; i < arr.length && !b;i++) {
			b = (arr[i] == s);
		}
		return b;
	}
}

export class Move {
	name : string;
	pieceType : number;
	isCapture : boolean;
	type : string;
	promotionPiece : Piece;
	//types: 'normal','longCastle','shortCastle','promotion','enPassant','doublePawn'

	constructor(public from : Square, public to : Square, t : string, piece? : Piece) {
		this.pieceType = from.piece.type;
		this.type = t;
		this.isCapture = !this.to.isEmpty() || this.type == 'enPassant';
		if (piece !== undefined) {
			this.promotionPiece = piece;
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
						name += ('='+this.promotionPiece.toString());
					}
				}
				else {
					name = this.to.toString();
					if (this.type == 'promotion') {
						name += ('='+this.promotionPiece.toString());
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

	static changeName(moves : Move[]) : void {
		for (let m1 of moves) {
			let file = false;
			let rank = false;
			for (let m2 of moves) {
				if (m1 !== m2) {
					if (m1.from.x == m2.from.x) {
						file = true;
					}
					if (m1.from.y == m2.from.y) {
						rank = true;
					}
				}
			}
			if (file && rank) {
				m1.name = m1.name.substring(0,1) + m1.from.toString() + m1.name.substring(1,m1.name.length);
			}
			else {
				if (file) {
					m1.name = m1.name.substring(0,1) + (m1.from.y+1) + m1.name.substring(1,m1.name.length);
				}
				if (rank) {
					m1.name = m1.name.substring(0,1) + m1.from.toString().substring(0,1) + m1.name.substring(1,m1.name.length);
				}
			}
		}
	}

	static searchMoveByName(moves : Move[], str : string) : Move {
		for (let move of moves) {
			if (move.name === str) {
				return move;
			}
		}
		return undefined;
	}
}

export class Piece {
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

	img : HTMLImageElement = new Image();

	constructor(public side: boolean, public type : number) {
		this.img.src = 'img/pieces/' + Piece.typeToImg(this.type,this.side) + '.png';
	}


	toString() : string {
		switch (this.type) {
			case 1:
				return 'P';
			case 2:
				return 'N';
			case 3:
				return 'B';
			case 4:
				return 'R';
			case 5:
				return 'Q';
			case 6:
				return 'K';
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

function linearSearch(array : number[], num : number) : boolean {
	for (let i = 0;i < array.length;i++) {
		if (array[i] == num) {
			return true;
		}
	}
	return false;
}
