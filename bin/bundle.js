(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = (function () {
    function Game(board) {
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
        var x = '?';
        this.event = x;
        this.site = x;
        this.date = '????.??.??';
        this.round = x;
        this.white = x;
        this.black = x;
        this.result = '*';
    }
    Object.defineProperty(Game.prototype, "legalMoves", {
        get: function () {
            return this._legalMoves;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "turn", {
        get: function () {
            return this.lastPosition.turn;
        },
        enumerable: true,
        configurable: true
    });
    Game.prototype.playRandomly = function () {
        this.playMove(this.legalMoves[Math.floor(Math.random() * this.legalMoves.length)]);
    };
    Game.prototype.endOfGame = function (result, termination) {
        if (result && termination) {
            this.result = result;
            this.termination = termination;
        }
        else {
            if (this.fiftyMovesRule()) {
                this.result = '1/2-1/2';
                this.termination = '50 moves rule';
            }
            if (this.isCheckmate()) {
                if (this.lastPosition.turn) {
                    this.result = '0-1';
                }
                else {
                    this.result = '1-0';
                }
                this.termination = 'Checkmate';
            }
            if (this.isStalemate()) {
                this.result = '1/2-1/2';
                this.termination = 'Stalemate';
            }
            if (this.isInsufficientMaterial()) {
                this.result = '1/2-1/2';
                this.termination = 'Insufficient material';
            }
        }
        this.createPGN();
    };
    Game.prototype.createPGN = function () {
        this.PGN = '';
        this.PGN += '[Event ' + this.event + ']\n';
        this.PGN += '[Site ' + this.site + ']\n';
        this.PGN += '[Date ' + this.date + ']\n';
        this.PGN += '[Round ' + this.round + ']\n';
        this.PGN += '[White ' + this.white + ']\n';
        this.PGN += '[Black ' + this.black + ']\n';
        this.PGN += '[Result ' + this.result + ']\n';
        if (this.time) {
            this.PGN += '[Time ' + this.time + ']\n';
        }
        if (this.termination) {
            this.PGN += '[Termination ' + this.termination + ']\n';
        }
        var turn = true;
        for (var i = 0; i < this.moves.length; i++) {
            if (turn) {
                this.PGN += ((i / 2) + 1).toString() + '. ';
            }
            this.PGN += this.moves[i].toString() + ' ';
            turn = !turn;
        }
    };
    Game.prototype.isOver = function () {
        if (this.lastPosition.isOver() || this.fiftyMovesRule()) {
            return true;
        }
        else {
            return false;
        }
    };
    Game.prototype.isCheck = function () {
        if (this.lastPosition.kingThreat(this.lastPosition.turn)) {
            return true;
        }
        else {
            return false;
        }
    };
    Game.prototype.isCheckmate = function () {
        return this.lastPosition.isCheckmate();
    };
    Game.prototype.isStalemate = function () {
        return this.lastPosition.isStalemate();
    };
    Game.prototype.isInsufficientMaterial = function () {
        return this.lastPosition.isInsufficientMaterial();
    };
    Game.prototype.fiftyMovesRule = function () {
        return this.moveCounter == 50;
    };
    Game.prototype.findMovesFromSquare = function (square) {
        var ret = [];
        for (var _i = 0, _a = this.legalMoves; _i < _a.length; _i++) {
            var move = _a[_i];
            if (move.from == square) {
                ret.push(move);
            }
        }
        return ret;
    };
    Game.prototype.findMoves = function () {
        this._legalMoves = this.lastPosition.findMoves();
    };
    Game.prototype.rightToCastle = function (move) {
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
    };
    Game.prototype.playMove = function (move) {
        if (move.isCapture || move.pieceType == 1) {
            this.moveCounter = 0;
        }
        else {
            this.moveCounter++;
        }
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
        if (this.isOver()) {
            this.endOfGame();
        }
    };
    Game.prototype.print = function () {
        document.write(this.black + '<br><br>');
        this.lastPosition.print();
        document.write('<br>' + this.white);
    };
    return Game;
}());
exports.Game = Game;
var Position = (function () {
    function Position(mode) {
        this.board = [];
        for (var i = 0; i < 8; i++) {
            this.board[i] = [];
            for (var j = 0; j < 8; j++) {
                this.board[i][j] = new Square(i, j);
            }
        }
        if (mode && mode === 'start') {
            this.startingPosition();
        }
    }
    Position.prototype.isOver = function () {
        return this.isCheckmate() || this.isStalemate() || this.isInsufficientMaterial();
    };
    Position.prototype.isCheck = function () {
        if (this.kingThreat(this.turn)) {
            return true;
        }
        else {
            return false;
        }
    };
    Position.prototype.isCheckmate = function () {
        if (this.isCheck() && this.legalMoves.length == 0) {
            return true;
        }
        else {
            return false;
        }
    };
    Position.prototype.isStalemate = function () {
        if (!this.isCheck() && this.legalMoves.length == 0) {
            return true;
        }
        else {
            return false;
        }
    };
    Position.prototype.isInsufficientMaterial = function () {
        var pieces = [];
        for (var _i = 0, _a = this.board; _i < _a.length; _i++) {
            var a = _a[_i];
            for (var _b = 0, a_1 = a; _b < a_1.length; _b++) {
                var b = a_1[_b];
                if (!b.isEmpty()) {
                    pieces.push(b.piece);
                }
            }
        }
        if (pieces.length == 3) {
            for (var _c = 0, pieces_1 = pieces; _c < pieces_1.length; _c++) {
                var piece = pieces_1[_c];
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
    };
    Position.prototype.startingPosition = function () {
        for (var _i = 0, _a = this.board; _i < _a.length; _i++) {
            var a = _a[_i];
            for (var _b = 0, a_2 = a; _b < a_2.length; _b++) {
                var b = a_2[_b];
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
    };
    Position.prototype.print = function () {
        for (var y = 7; y >= 0; y--) {
            for (var x = 0; x < 8; x++) {
                document.write(this.board[x][y].print() + '\t');
            }
            document.write('<br>');
        }
    };
    Position.prototype.searchForKings = function () {
        for (var _i = 0, _a = this.board; _i < _a.length; _i++) {
            var a = _a[_i];
            for (var _b = 0, a_3 = a; _b < a_3.length; _b++) {
                var b = a_3[_b];
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
    };
    Position.prototype.move = function (move) {
        var from = this.board[move.from.x][move.from.y];
        var to = this.board[move.to.x][move.to.y];
        switch (move.type) {
            case 'enPassant': {
                to.piece = from.piece;
                from.piece = undefined;
                this.board[move.to.x][move.from.y].piece = undefined;
                break;
            }
            case 'longCastle': {
                to.piece = from.piece;
                from.piece = undefined;
                this.board[3][move.from.y].piece = this.board[0][move.from.y].piece;
                this.board[0][move.from.y].piece = undefined;
                break;
            }
            case 'shortCastle': {
                to.piece = from.piece;
                from.piece = undefined;
                this.board[5][move.from.y].piece = this.board[7][move.from.y].piece;
                this.board[7][move.from.y].piece = undefined;
                break;
            }
            case 'promotion': {
                to.piece = move.promotionPiece;
                from.piece = undefined;
                break;
            }
            default: {
                to.piece = from.piece;
                from.piece = undefined;
                break;
            }
        }
        this.turn = !this.turn;
        this.searchForKings();
    };
    Position.prototype.printControlledSquares = function (x, y) {
        var a = this.controls(this.board[x][y]);
    };
    Position.prototype.kingThreat = function (side) {
        var threat = false;
        var king;
        if (side) {
            king = this.whiteKing;
        }
        else {
            king = this.blackKing;
        }
        for (var _i = 0, _a = this.board; _i < _a.length; _i++) {
            var a = _a[_i];
            for (var _b = 0, a_4 = a; _b < a_4.length; _b++) {
                var b = a_4[_b];
                if (b.piece != undefined && b.piece.side != side) {
                    var controlledSquares = this.controls(b);
                    for (var _c = 0, controlledSquares_1 = controlledSquares; _c < controlledSquares_1.length; _c++) {
                        var c = controlledSquares_1[_c];
                        if (c == king) {
                            threat = true;
                        }
                    }
                }
            }
            if (threat)
                break;
        }
        return threat;
    };
    Position.prototype.legalMovesOf = function (from) {
        if (from.isEmpty() || from.piece.side != this.turn) {
            return undefined;
        }
        else {
            var squares = this.controls(from);
            var moves = [];
            for (var i = 0; i < squares.length; i++) {
                if ((!squares[i].isEmpty() && squares[i].piece.side == this.turn) || (from.piece.type == 1 && squares[i].isEmpty())) {
                    // non-legal moves
                }
                else {
                    if (from.piece.type == 1 && !squares[i].isEmpty() && (squares[i].y == 7 || squares[i].y == 0)) {
                        moves.push(new Move(from, squares[i], 'promotion', new Piece(this.turn, 2)));
                        moves.push(new Move(from, squares[i], 'promotion', new Piece(this.turn, 3)));
                        moves.push(new Move(from, squares[i], 'promotion', new Piece(this.turn, 4)));
                        moves.push(new Move(from, squares[i], 'promotion', new Piece(this.turn, 5)));
                    }
                    else {
                        moves.push(new Move(from, squares[i], 'normal'));
                    }
                }
            }
            if (from.piece.type == 1) {
                if (from.piece.side) {
                    //white pawns
                    if (this.board[from.x][from.y + 1].isEmpty()) {
                        if (from.y == 6) {
                            //promotion
                            moves.push(new Move(from, this.board[from.x][7], 'promotion', new Piece(this.turn, 2)));
                            moves.push(new Move(from, this.board[from.x][7], 'promotion', new Piece(this.turn, 3)));
                            moves.push(new Move(from, this.board[from.x][7], 'promotion', new Piece(this.turn, 4)));
                            moves.push(new Move(from, this.board[from.x][7], 'promotion', new Piece(this.turn, 5)));
                        }
                        else {
                            moves.push(new Move(from, this.board[from.x][from.y + 1], 'normal'));
                            if (from.y == 1 && this.board[from.x][from.y + 2].isEmpty()) {
                                // double push
                                moves.push(new Move(from, this.board[from.x][from.y + 2], 'doublePawn'));
                            }
                        }
                    }
                    if (from.y == 4 && this.lastMove != undefined && this.lastMove.pieceType == 1 && this.lastMove.type == 'doublePawn' && (this.lastMove.from.x == from.x - 1 || this.lastMove.from.x == from.x + 1)) {
                        // en passant
                        if (this.lastMove.from.x == from.x - 1) {
                            moves.push(new Move(from, this.board[from.x - 1][from.y + 1], 'enPassant'));
                        }
                        else {
                            moves.push(new Move(from, this.board[from.x + 1][from.y + 1], 'enPassant'));
                        }
                    }
                }
                else {
                    // black pawns
                    if (this.board[from.x][from.y - 1].isEmpty()) {
                        if (from.y == 1) {
                            moves.push(new Move(from, this.board[from.x][0], 'promotion', new Piece(this.turn, 2)));
                            moves.push(new Move(from, this.board[from.x][0], 'promotion', new Piece(this.turn, 3)));
                            moves.push(new Move(from, this.board[from.x][0], 'promotion', new Piece(this.turn, 4)));
                            moves.push(new Move(from, this.board[from.x][0], 'promotion', new Piece(this.turn, 5)));
                        }
                        else {
                            moves.push(new Move(from, this.board[from.x][from.y - 1], 'normal'));
                            if (from.y == 6 && this.board[from.x][from.y - 2].isEmpty()) {
                                // double push
                                moves.push(new Move(from, this.board[from.x][from.y - 2], 'doublePawn'));
                            }
                        }
                    }
                    if (from.y == 3 && this.lastMove != undefined && this.lastMove.pieceType == 1 && this.lastMove.type == 'doublePawn' && (this.lastMove.from.x == from.x - 1 || this.lastMove.from.x == from.x + 1)) {
                        // en passant
                        if (this.lastMove.from.x == from.x - 1) {
                            moves.push(new Move(from, this.board[from.x - 1][from.y - 1], 'enPassant'));
                        }
                        else {
                            moves.push(new Move(from, this.board[from.x + 1][from.y - 1], 'enPassant'));
                        }
                    }
                }
            }
            if (from.piece.type == 6) {
                if (this.turn) {
                    if (this.canCastle(true)) {
                        moves.push(new Move(from, this.board[6][0], 'shortCastle'));
                    }
                    if (this.canCastle(false)) {
                        moves.push(new Move(from, this.board[2][0], 'longCastle'));
                    }
                }
                else {
                    if (this.canCastle(true)) {
                        moves.push(new Move(from, this.board[6][7], 'shortCastle'));
                    }
                    if (this.canCastle(false)) {
                        moves.push(new Move(from, this.board[2][7], 'longCastle'));
                    }
                }
            }
            moves = this.testMoves(moves);
            return moves;
        }
    };
    Position.prototype.findMoves = function () {
        var moves = [];
        for (var _i = 0, _a = this.board; _i < _a.length; _i++) {
            var a = _a[_i];
            for (var _b = 0, a_5 = a; _b < a_5.length; _b++) {
                var b = a_5[_b];
                var bmoves = this.legalMovesOf(b);
                if (bmoves) {
                    for (var _c = 0, bmoves_1 = bmoves; _c < bmoves_1.length; _c++) {
                        var m = bmoves_1[_c];
                        moves.push(m);
                    }
                }
            }
        }
        this.legalMoves = this.nameMoves(moves);
        return moves;
    };
    Position.prototype.testMoves = function (cand) {
        var r = [];
        for (var _i = 0, cand_1 = cand; _i < cand_1.length; _i++) {
            var move = cand_1[_i];
            var newPosition = this.clone();
            newPosition.move(move);
            if (!newPosition.kingThreat(this.turn)) {
                r.push(move);
            }
        }
        return r;
    };
    Position.prototype.nameMoves = function (moves) {
        var sameMoves = [];
        var escludi = [];
        for (var i = 0; i < moves.length - 1; i++) {
            if (!linearSearch(escludi, i)) {
                sameMoves.push([moves[i]]);
                for (var j = i + 1; j < moves.length; j++) {
                    if (moves[i].name === moves[j].name) {
                        escludi.push(j);
                        sameMoves[sameMoves.length - 1].push(moves[j]);
                    }
                }
            }
        }
        for (var _i = 0, sameMoves_1 = sameMoves; _i < sameMoves_1.length; _i++) {
            var x = sameMoves_1[_i];
            if (x.length > 1) {
                Move.changeName(x);
            }
        }
        return moves;
    };
    Position.prototype.canCastle = function (side) {
        if (this.turn) {
            if (side) {
                if (this.whiteShort) {
                    return (this.board[5][0].isEmpty() && this.board[6][0].isEmpty() && !this.kingThreat(this.turn) && !this.isControlled(this.board[5][0], !this.turn) && !this.isControlled(this.board[6][0], !this.turn));
                }
                else {
                    return false;
                }
            }
            else {
                if (this.whiteLong) {
                    return (this.board[3][0].isEmpty() && this.board[2][0].isEmpty() && !this.kingThreat(this.turn) && !this.isControlled(this.board[3][0], !this.turn) && !this.isControlled(this.board[2][0], !this.turn));
                }
                else {
                    return false;
                }
            }
        }
        else {
            if (side) {
                if (this.blackShort) {
                    return (this.board[5][7].isEmpty() && this.board[6][7].isEmpty() && !this.kingThreat(this.turn) && !this.isControlled(this.board[5][7], !this.turn) && !this.isControlled(this.board[6][7], !this.turn));
                }
                else {
                    return false;
                }
            }
            else {
                if (this.blackLong) {
                    return (this.board[3][7].isEmpty() && this.board[2][7].isEmpty() && !this.kingThreat(this.turn) && !this.isControlled(this.board[3][7], !this.turn) && !this.isControlled(this.board[2][7], !this.turn));
                }
                else {
                    return false;
                }
            }
        }
    };
    Position.prototype.isControlled = function (s, side) {
        for (var _i = 0, _a = this.board; _i < _a.length; _i++) {
            var a = _a[_i];
            for (var _b = 0, a_6 = a; _b < a_6.length; _b++) {
                var b = a_6[_b];
                if (!b.isEmpty() && b.piece.side == side) {
                    if (this.findSquare(this.controls(b), s)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    Position.prototype.findSquare = function (arr, s) {
        var b = false;
        for (var i = 0; i < arr.length && !b; i++) {
            b = (arr[i] == s);
        }
        return b;
    };
    Position.pop = function (arr, index) {
        var r = [];
        for (var i = 0; i < index; i++) {
            r.push(arr[i]);
        }
        for (var i = index + 1; i < arr.length; i++) {
            r.push(arr[i]);
        }
        return r;
    };
    Position.prototype.controls = function (from) {
        var to = [];
        if (from.isEmpty()) {
            return undefined;
        }
        else {
            if (from.piece.type == 1) {
                if (from.piece.side) {
                    if (from.x == 0) {
                        to.push(this.board[from.x + 1][from.y + 1]);
                        return to;
                    }
                    if (from.x == 7) {
                        to.push(this.board[from.x - 1][from.y + 1]);
                        return to;
                    }
                    else {
                        to.push(this.board[from.x + 1][from.y + 1]);
                        to.push(this.board[from.x - 1][from.y + 1]);
                        return to;
                    }
                }
                else {
                    if (from.x == 0) {
                        to.push(this.board[from.x + 1][from.y - 1]);
                        return to;
                    }
                    if (from.x == 7) {
                        to.push(this.board[from.x - 1][from.y - 1]);
                        return to;
                    }
                    else {
                        to.push(this.board[from.x + 1][from.y - 1]);
                        to.push(this.board[from.x - 1][from.y - 1]);
                        return to;
                    }
                }
            }
            if (from.piece.type == 2) {
                this.push(from.x + 1, from.y + 2, to);
                this.push(from.x + 1, from.y - 2, to);
                this.push(from.x - 1, from.y + 2, to);
                this.push(from.x - 1, from.y - 2, to);
                this.push(from.x + 2, from.y + 1, to);
                this.push(from.x + 2, from.y - 1, to);
                this.push(from.x - 2, from.y + 1, to);
                this.push(from.x - 2, from.y - 1, to);
                return to;
            }
            if (from.piece.type == 3) {
                var x = from.x + 1;
                var y = from.y + 1;
                // diagonal x++ y++
                while (x < 8 && y < 8 && this.board[x][y].isEmpty()) {
                    to.push(this.board[x][y]);
                    x++;
                    y++;
                }
                this.push(x, y, to); // la prima casella non vuota la aggiunge
                x = from.x + 1;
                y = from.y - 1;
                // diagonal x++ y--
                while (x < 8 && y >= 0 && this.board[x][y].isEmpty()) {
                    to.push(this.board[x][y]);
                    x++;
                    y--;
                }
                this.push(x, y, to);
                x = from.x - 1;
                y = from.y - 1;
                // diagonal x-- y--
                while (x >= 0 && y >= 0 && this.board[x][y].isEmpty()) {
                    to.push(this.board[x][y]);
                    x--;
                    y--;
                }
                this.push(x, y, to);
                x = from.x - 1;
                y = from.y + 1;
                // diagonal x-- y++
                while (x >= 0 && y < 8 && this.board[x][y].isEmpty()) {
                    to.push(this.board[x][y]);
                    x--;
                    y++;
                }
                this.push(x, y, to);
                return to;
            }
            if (from.piece.type == 4) {
                var x = void 0, y = void 0;
                x = from.x + 1;
                y = from.y;
                while (x < 8 && this.board[x][y].isEmpty()) {
                    to.push(this.board[x][y]);
                    x++;
                }
                this.push(x, y, to);
                x = from.x - 1;
                while (x >= 0 && this.board[x][y].isEmpty()) {
                    to.push(this.board[x][y]);
                    x--;
                }
                this.push(x, y, to);
                x = from.x;
                y = from.y + 1;
                while (y < 8 && this.board[x][y].isEmpty()) {
                    to.push(this.board[x][y]);
                    y++;
                }
                this.push(x, y, to);
                y = from.y - 1;
                while (y >= 0 && this.board[x][y].isEmpty()) {
                    to.push(this.board[x][y]);
                    y--;
                }
                this.push(x, y, to);
                return to;
            }
            if (from.piece.type == 5) {
                if (true) {
                    var x = from.x + 1;
                    var y = from.y + 1;
                    // diagonal x++ y++
                    while (x < 8 && y < 8 && this.board[x][y].isEmpty()) {
                        to.push(this.board[x][y]);
                        x++;
                        y++;
                    }
                    this.push(x, y, to); // adds first
                    x = from.x + 1;
                    y = from.y - 1;
                    // diagonal x++ y--
                    while (x < 8 && y >= 0 && this.board[x][y].isEmpty()) {
                        to.push(this.board[x][y]);
                        x++;
                        y--;
                    }
                    this.push(x, y, to);
                    x = from.x - 1;
                    y = from.y - 1;
                    // diagonal x-- y--
                    while (x >= 0 && y >= 0 && this.board[x][y].isEmpty()) {
                        to.push(this.board[x][y]);
                        x--;
                        y--;
                    }
                    this.push(x, y, to);
                    x = from.x - 1;
                    y = from.y + 1;
                    // diagonal x-- y++
                    while (x >= 0 && y < 8 && this.board[x][y].isEmpty()) {
                        to.push(this.board[x][y]);
                        x--;
                        y++;
                    }
                    this.push(x, y, to);
                }
                if (true) {
                    var x = void 0, y = void 0;
                    x = from.x + 1;
                    y = from.y;
                    while (x < 8 && this.board[x][y].isEmpty()) {
                        to.push(this.board[x][y]);
                        x++;
                    }
                    this.push(x, y, to);
                    x = from.x - 1;
                    while (x >= 0 && this.board[x][y].isEmpty()) {
                        to.push(this.board[x][y]);
                        x--;
                    }
                    this.push(x, y, to);
                    x = from.x;
                    y = from.y + 1;
                    while (y < 8 && this.board[x][y].isEmpty()) {
                        to.push(this.board[x][y]);
                        y++;
                    }
                    this.push(x, y, to);
                    y = from.y - 1;
                    while (y >= 0 && this.board[x][y].isEmpty()) {
                        to.push(this.board[x][y]);
                        y--;
                    }
                    this.push(x, y, to);
                }
                return to;
            }
            if (from.piece.type == 6) {
                this.push(from.x + 1, from.y + 1, to);
                this.push(from.x + 1, from.y, to);
                this.push(from.x + 1, from.y - 1, to);
                this.push(from.x, from.y + 1, to);
                this.push(from.x, from.y - 1, to);
                this.push(from.x - 1, from.y + 1, to);
                this.push(from.x - 1, from.y, to);
                this.push(from.x - 1, from.y - 1, to);
                return to;
            }
        }
    };
    Position.prototype.push = function (x, y, array) {
        if (x < 8 && x >= 0 && y < 8 && y >= 0) {
            array.push(this.board[x][y]);
        }
    };
    Position.prototype.clone = function () {
        var r = new Position();
        for (var a in r.board) {
            for (var b in r.board[a]) {
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
    };
    return Position;
}());
exports.Position = Position;
var Square = (function () {
    function Square(x, y, p) {
        this.x = x;
        this.y = y;
        if (p) {
            this.piece = p;
        }
    }
    Square.prototype.isEmpty = function () {
        return this.piece == undefined;
    };
    Square.prototype.toString = function () {
        var y = (this.y + 1).toString();
        var x = '';
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
        return x + y;
    };
    Square.prototype.print = function () {
        if (this.piece == undefined) {
            return 'x';
        }
        else {
            return this.piece.toString();
        }
    };
    Square.prototype.startingPosition = function () {
        if (this.y == 1) {
            this.piece = new Piece(true, 1);
        }
        if (this.y == 6) {
            this.piece = new Piece(false, 1);
        }
        if (this.y == 0) {
            if (this.x == 0 || this.x == 7) {
                this.piece = new Piece(true, 4);
            }
            if (this.x == 1 || this.x == 6) {
                this.piece = new Piece(true, 2);
            }
            if (this.x == 2 || this.x == 5) {
                this.piece = new Piece(true, 3);
            }
            if (this.x == 3) {
                this.piece = new Piece(true, 5);
            }
            if (this.x == 4) {
                this.piece = new Piece(true, 6);
            }
        }
        if (this.y == 7) {
            if (this.x == 0 || this.x == 7) {
                this.piece = new Piece(false, 4);
            }
            if (this.x == 1 || this.x == 6) {
                this.piece = new Piece(false, 2);
            }
            if (this.x == 2 || this.x == 5) {
                this.piece = new Piece(false, 3);
            }
            if (this.x == 3) {
                this.piece = new Piece(false, 5);
            }
            if (this.x == 4) {
                this.piece = new Piece(false, 6);
            }
        }
    };
    return Square;
}());
exports.Square = Square;
var Move = (function () {
    //types: 'normal','longCastle','shortCastle','promotion','enPassant','doublePawn'
    function Move(from, to, t, piece) {
        this.from = from;
        this.to = to;
        this.pieceType = from.piece.type;
        this.type = t;
        this.isCapture = !this.to.isEmpty() || this.type == 'enPassant';
        if (piece !== undefined) {
            this.promotionPiece = piece;
        }
        this.name = this.giveName();
    }
    Move.prototype.giveName = function () {
        var name;
        switch (this.pieceType) {
            case 1: {
                if (this.isCapture) {
                    name = (this.from.toString()).substring(0, 1) + 'x' + this.to.toString();
                    if (this.type == 'promotion') {
                        name += ('=' + this.promotionPiece.toString());
                    }
                }
                else {
                    name = this.to.toString();
                    if (this.type == 'promotion') {
                        name += ('=' + this.promotionPiece.toString());
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
    };
    Move.prototype.toString = function () {
        return this.name;
    };
    Move.changeName = function (moves) {
        for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
            var m1 = moves_1[_i];
            var file = false;
            var rank = false;
            for (var _a = 0, moves_2 = moves; _a < moves_2.length; _a++) {
                var m2 = moves_2[_a];
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
                m1.name = m1.name.substring(0, 1) + m1.from.toString() + m1.name.substring(1, m1.name.length);
            }
            else {
                if (file) {
                    m1.name = m1.name.substring(0, 1) + (m1.from.y + 1) + m1.name.substring(1, m1.name.length);
                }
                if (rank) {
                    m1.name = m1.name.substring(0, 1) + m1.from.toString().substring(0, 1) + m1.name.substring(1, m1.name.length);
                }
            }
        }
    };
    Move.searchMoveByName = function (moves, str) {
        for (var _i = 0, moves_3 = moves; _i < moves_3.length; _i++) {
            var move = moves_3[_i];
            if (move.name === str) {
                return move;
            }
        }
        return undefined;
    };
    return Move;
}());
exports.Move = Move;
var Piece = (function () {
    function Piece(side, type) {
        this.side = side;
        this.type = type;
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
        this.img = new Image();
        this.img.src = 'img/pieces/' + Piece.typeToImg(this.type, this.side) + '.png';
    }
    Piece.prototype.toString = function () {
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
    };
    Piece.typeToImg = function (type, side) {
        if (side) {
            switch (type) {
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
            switch (type) {
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
    };
    return Piece;
}());
exports.Piece = Piece;
function linearSearch(array, num) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == num) {
            return true;
        }
    }
    return false;
}

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chess_1 = require("./chess");
var chess_2 = require("./chess");
var chess_3 = require("./chess");
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
exports.Point = Point;
var Canvas = (function () {
    function Canvas() {
        this.position = new chess_3.Position();
    }
    Object.defineProperty(Canvas.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        set: function (canvas) {
            this._canvas = canvas;
            this.ctx = this._canvas.getContext("2d");
            this.dist = this._canvas.clientWidth / 8;
        },
        enumerable: true,
        configurable: true
    });
    Canvas.prototype.isAMove = function (square) {
        if (this.moves) {
            var r = undefined;
            for (var _i = 0, _a = this.moves; _i < _a.length; _i++) {
                var m = _a[_i];
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
    };
    Canvas.prototype.pxToSquare = function (x, y) {
        var xs = parseInt((x / this.dist).toString().substring(0, 1));
        var ys = 7 - parseInt((y / this.dist).toString().substring(0, 1));
        return this.position.board[xs][ys];
    };
    Canvas.prototype.squareToPx = function (square) {
        var xs = square.x * this.dist;
        var ys = (7 - square.y) * this.dist;
        return new Point(xs, ys);
    };
    Canvas.prototype.drawBoard = function () {
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
                this.ctx.fillRect(x, y, x + this.dist, y + this.dist);
                x += this.dist;
                col = !col;
            }
            col = !col;
            x = 0;
            y += this.dist;
        }
    };
    Canvas.prototype.drawPieces = function () {
        for (var _i = 0, _a = this.position.board; _i < _a.length; _i++) {
            var a = _a[_i];
            for (var _b = 0, a_1 = a; _b < a_1.length; _b++) {
                var b = a_1[_b];
                if (!b.isEmpty()) {
                    var p = this.squareToPx(b);
                    this.ctx.drawImage(b.piece.img, p.x, p.y, this.dist, this.dist);
                }
            }
        }
    };
    Canvas.prototype.drawMoves = function () {
        var img = new Image();
        img.src = 'img/circle.png';
        for (var _i = 0, _a = this.moves; _i < _a.length; _i++) {
            var m = _a[_i];
            var p = this.squareToPx(m.to);
            var x = Math.round(p.x + (this.dist / 3));
            var y = Math.round(p.y + (this.dist / 4));
            var dist = ((this.dist / 2) - (x % this.dist)) * 2;
            this.ctx.drawImage(img, x, y, dist, dist);
        }
    };
    Canvas.prototype.update = function () {
        this.drawBoard();
        this.drawPieces();
    };
    return Canvas;
}());
exports.Canvas = Canvas;
function settingClick() {
    var p = getMousePos(window.event);
    if (Canvas.selectedPiece != undefined) {
        var s = canvas.pxToSquare(p.x, p.y);
        s.piece = Canvas.selectedPiece;
        canvas.update();
    }
}
function getMousePos(ev) {
    var x = ev.offsetX;
    var y = ev.offsetY;
    return new Point(x, y);
}
function startNewGame() {
    console.log('start');
    game = new chess_2.Game();
    document.getElementById("form").style.display = 'none';
    canvas.position = game.lastPosition;
    canvas.update();
    canvas.canvas.onclick = playClick;
}
function setPosition() {
    canvas.canvas.onclick = settingClick;
    var x = 2;
    canvas.drawBoard();
    var div = document.getElementById("form");
    div.style.display = 'inline';
    var pieces = document.getElementById("set");
    pieces.style.display = "inline-block";
    var setImg = [];
    var selectedImg;
    for (var x_1 = 0; x_1 < 12; x_1++) {
        setImg.push(document.getElementById(x_1.toString()));
        setImg[x_1].onclick = function () {
            if (selectedImg != undefined) {
                selectedImg.style.borderStyle = "outset";
            }
            this.style.borderStyle = "inset";
            Canvas.selectedPiece = pieceById(parseInt(this.id));
            selectedImg = this;
        };
    }
}
function createPosition() {
    canvas.position.turn = document.getElementById('white').checked;
    canvas.position.whiteLong = document.getElementById('whiteLong').checked;
    canvas.position.whiteShort = document.getElementById('whiteShort').checked;
    canvas.position.blackLong = document.getElementById('blackLong').checked;
    canvas.position.blackShort = document.getElementById('blackShort').checked;
    startGame(canvas.position);
}
function startGame(lastPosition) {
    game = new chess_2.Game(lastPosition);
    game.lastPosition.searchForKings();
    document.getElementById("form").style.display = 'none';
    canvas.canvas.onclick = playClick;
    if (game.isOver()) {
        canvas.canvas.onclick = undefined;
    }
}
function pieceById(id) {
    if (id % 2 == 0) {
        return new chess_1.Piece(true, (id / 2) + 1);
    }
    else {
        return new chess_1.Piece(false, Math.round((id - 1) / 2) + 1);
    }
}
function playClick() {
    var p = getMousePos(window.event);
    var square = canvas.pxToSquare(p.x, p.y);
    canvas.update();
    var move = canvas.isAMove(square);
    if (move) {
        game.playMove(move);
        canvas.moves = undefined;
        canvas.update();
        if (game.isOver()) {
            canvas.canvas.onclick = undefined;
        }
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
function playAtSpeed(milliseconds) {
    if (!game.isOver()) {
        setTimeout(function () {
            game.playRandomly();
            canvas.update();
            playAtSpeed(milliseconds);
        }, milliseconds);
    }
    else {
        console.log(game.PGN);
    }
}
function playRandomly() {
    if (!game) {
        startNewGame();
    }
    playAtSpeed(40);
}
document.getElementById("create").onclick = setPosition;
document.getElementById("start").onclick = startNewGame;
document.getElementById("submit").onclick = createPosition;
document.getElementById("random").onclick = playRandomly;
var canvas = new Canvas();
canvas.canvas = document.getElementById("board");
var game;

},{"./chess":1}]},{},[2]);
