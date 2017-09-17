(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphics_1 = require("./graphics");
var graphics_2 = require("./graphics");
var Game = (function () {
    function Game(white, black) {
        this.whitePlayer = white;
        this.blackPlayer = black;
        this.moveCounter = 0;
        this.positions = [];
        this.moves = [];
        this.board = new Board();
        graphics_2.canvas.canvas.onclick = graphics_1.playClick;
    }
    Game.prototype.isOver = function () {
        return this.isCheckmate() || this.isStalemate() || this.isInsufficientMaterial() || this.fiftyMovesRule();
    };
    // 
    // isThreefoldRepetition() : boolean  {
    // 	if (this.positions.length > )
    // }
    Game.prototype.isCheck = function () {
        if (this.board.kingThreat(this.board.turn)) {
            return true;
        }
        else {
            return false;
        }
    };
    Game.prototype.isCheckmate = function () {
        if (this.isCheck() && this.legalMoves.length == 0) {
            console.log('Checkmate!');
            return true;
        }
        else {
            return false;
        }
    };
    Game.prototype.isStalemate = function () {
        if (!this.isCheck() && this.legalMoves.length == 0) {
            console.log('Draw for stalemate!');
            return true;
        }
        else {
            return false;
        }
    };
    Game.prototype.isInsufficientMaterial = function () {
        if (this.board.isInsufficientMaterial()) {
            console.log('Draw for insufficient material.');
            return true;
        }
        else {
            return false;
        }
    };
    Game.prototype.fiftyMovesRule = function () {
        if (this.moveCounter == 50) {
            console.log('50 move rule');
            return true;
        }
        else {
            return false;
        }
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
        this.legalMoves = this.board.legalMoves();
    };
    Game.prototype.playMove = function (move) {
        if (move.isCapture || move.pieceType == 1) {
            this.moveCounter = 0;
        }
        else {
            this.moveCounter++;
        }
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
        graphics_2.canvas.update();
        this.findMoves();
        if (this.isOver()) {
            graphics_2.canvas.canvas.onclick = undefined;
        }
        else {
            if (this.isCheck()) {
                console.log('Check!');
            }
        }
    };
    Game.prototype.startGame = function () {
        this.board.startingPosition();
        graphics_2.canvas.position = this.board;
        graphics_2.canvas.update();
        this.findMoves();
    };
    Game.prototype.print = function () {
        document.write(this.blackPlayer + '<br><br>');
        this.board.print();
        document.write('<br>' + this.whitePlayer);
    };
    return Game;
}());
exports.Game = Game;
var Board = (function () {
    function Board() {
        this.board = [];
        for (var i = 0; i < 8; i++) {
            this.board[i] = [];
            for (var j = 0; j < 8; j++) {
                this.board[i][j] = new Square(i, j);
            }
        }
    }
    Board.prototype.isInsufficientMaterial = function () {
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
    Board.prototype.startingPosition = function () {
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
    Board.prototype.print = function () {
        for (var y = 7; y >= 0; y--) {
            for (var x = 0; x < 8; x++) {
                document.write(this.board[x][y].print() + '\t');
            }
            document.write('<br>');
        }
    };
    Board.prototype.searchForKings = function () {
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
    Board.prototype.move = function (move) {
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
                to.piece = from.piece;
                to.piece.type = 5;
                from.piece = undefined;
                break;
            }
            default: {
                to.piece = from.piece;
                from.piece = undefined;
                break;
            }
        }
        this.searchForKings();
    };
    Board.prototype.printControlledSquares = function (x, y) {
        var a = this.controls(this.board[x][y]);
    };
    Board.prototype.kingThreat = function (side) {
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
    Board.prototype.legalMovesOf = function (from) {
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
                    moves.push(new Move(from, squares[i], 'normal'));
                }
            }
            if (from.piece.type == 1) {
                if (from.piece.side) {
                    // white pawns
                    if (this.board[from.x][from.y + 1].isEmpty()) {
                        if (from.y == 6) {
                            //promotion
                            moves.push(new Move(from, this.board[from.x][7], 'promotion'));
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
                            moves.push(new Move(from, this.board[from.x][0], 'promotion'));
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
            return this.testMoves(moves);
        }
    };
    Board.prototype.legalMoves = function () {
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
        return moves;
    };
    Board.prototype.testMoves = function (cand) {
        var r = [];
        for (var _i = 0, cand_1 = cand; _i < cand_1.length; _i++) {
            var move = cand_1[_i];
            var newBoard = this.clone();
            newBoard.move(move);
            if (!newBoard.kingThreat(this.turn)) {
                r.push(move);
            }
        }
        return r;
    };
    Board.prototype.canCastle = function (side) {
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
    Board.prototype.isControlled = function (s, side) {
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
    Board.prototype.findSquare = function (arr, s) {
        var b = false;
        for (var i = 0; i < arr.length && !b; i++) {
            b = (arr[i] == s);
        }
        return b;
    };
    Board.pop = function (arr, index) {
        var r = [];
        for (var i = 0; i < index; i++) {
            r.push(arr[i]);
        }
        for (var i = index + 1; i < arr.length; i++) {
            r.push(arr[i]);
        }
        return r;
    };
    Board.prototype.controls = function (from) {
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
    Board.prototype.push = function (x, y, array) {
        if (x < 8 && x >= 0 && y < 8 && y >= 0) {
            array.push(this.board[x][y]);
        }
    };
    Board.prototype.clone = function () {
        var r = new Board();
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
    return Board;
}());
exports.Board = Board;
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
    function Move(from, to, t) {
        this.from = from;
        this.to = to;
        this.pieceType = from.piece.type;
        this.isCapture = !this.to.isEmpty() || this.type == 'enPassant';
        this.type = t;
        if (this.pieceType == 1 && (to.y == 0 || to.y == 7)) {
            this.type = 'promotion';
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
    };
    Move.prototype.toString = function () {
        return this.name;
    };
    return Move;
}());
exports.Move = Move;
var Piece = (function () {
    function Piece(side, type) {
        this.side = side;
        this.type = type;
        /* types:
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
    Piece.prototype.toString = function () {
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
function clone(obj) {
    if (obj === undefined) {
        return undefined;
    }
    else {
        var r;
        for (var att in obj) {
            if (typeof (obj[att]) == 'object') {
                r[att] = clone(obj[att]);
            }
            else {
                r[att] = obj[att];
            }
        }
        return r;
    }
}

},{"./graphics":2}],2:[function(require,module,exports){
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
    function Canvas(setting) {
        this.canvas = document.getElementById("board");
        this.ctx = this.canvas.getContext("2d");
        this.dist = this.canvas.clientWidth / 8;
        this.canvas.height = 500;
        this.canvas.width = 500;
        this.mode = setting;
        this.position = new chess_3.Board();
    }
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
        var s = exports.canvas.pxToSquare(p.x, p.y);
        s.piece = Canvas.selectedPiece;
        exports.canvas.update();
    }
}
function getMousePos(ev) {
    var x = ev.offsetX;
    var y = ev.offsetY;
    return new Point(x, y);
}
function startNewGame() {
    exports.canvas = new Canvas('game');
    game = new chess_2.Game('Marco', 'Luca');
    document.getElementById("form").style.display = 'none';
    game.startGame();
}
function setPosition() {
    exports.canvas = new Canvas('setting');
    exports.canvas.canvas.onclick = settingClick;
    var x = 2;
    exports.canvas.drawBoard();
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
    exports.canvas.position.turn = document.getElementById('white').checked;
    exports.canvas.position.whiteLong = document.getElementById('whiteLong').checked;
    exports.canvas.position.whiteShort = document.getElementById('whiteShort').checked;
    exports.canvas.position.blackLong = document.getElementById('blackLong').checked;
    exports.canvas.position.blackShort = document.getElementById('blackShort').checked;
    exports.canvas.mode = 'game';
    startGame(exports.canvas.position);
}
function startGame(board) {
    game = new chess_2.Game('x', 'y');
    game.board = board;
    game.board.searchForKings();
    document.getElementById("form").style.display = 'none';
    game.findMoves();
    if (game.isOver()) {
        exports.canvas.canvas.onclick = undefined;
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
    var square = exports.canvas.pxToSquare(p.x, p.y);
    exports.canvas.update();
    var move = exports.canvas.isAMove(square);
    if (move) {
        game.playMove(move);
    }
    else {
        var moves = game.findMovesFromSquare(square);
        if (moves.length > 0 && square != exports.canvas.selectedSquare) {
            exports.canvas.moves = moves;
            exports.canvas.selectedSquare = square;
            exports.canvas.drawMoves();
        }
        else {
            if (square === exports.canvas.selectedSquare) {
                exports.canvas.moves = undefined;
                exports.canvas.selectedSquare = undefined;
            }
        }
    }
}
exports.playClick = playClick;
document.getElementById("create").onclick = setPosition;
document.getElementById("start").onclick = startNewGame;
document.getElementById("submit").onclick = createPosition;
var game;

},{"./chess":1}]},{},[2]);
