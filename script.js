class Minesweeper {
    constructor() {
        // Constants
        this._MAXMINES = 99
        this._MAXROWS = 16
        this._MAXCOLUMNS = 30
        this._emtpyCell = 0
        this._bombCell = -1

        // HTML elements
        this._mines = document.getElementById("mines")
        this._maxMines = document.getElementById("max-mines")
        this._cells = document.querySelectorAll(".cell")
        this._face = document.getElementById("face")

        // Game elements
        this._currentGame
        this._solvedGame
        this._firstMove
        this._gameOver
        this._aroundCells = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ]
    }

    _isAWin() {
        let win = true

        for (let i = 0; i < this._MAXROWS; i++) {
            for (let j = 0; j < this._MAXCOLUMNS; j++) {
                if (this._currentGame[i][j] == null && this._solvedGame[i][j] != this._bombCell) {
                    win = false
                    break
                }
            }

            if (!win) break
        }

        return win
    }

    _getRowAndColum(cell) {
        let row = Math.floor(cell / 30)
        let column = cell - row * 30

        return [row, column]
    }

    _isAFlag(cell) {
        return this._cells[cell].classList.contains("cell--flag")
    }

    _makeAFlag(cell) {
        this._cells[cell].classList.add("cell--flag")
        this._mines.innerText = Number(this._mines.innerText) + 1
        return
    }

    _removeAFlag(cell) {
        this._cells[cell].classList.remove("cell--flag")
        this._mines.innerText = Number(this._mines.innerText) - 1
        return
    }

    _getCell(rowColumn) {
        let cell = (rowColumn[0] * 30) + rowColumn[1]
        return cell
    }

    _getCellValue(rowColumn, game = null) {
        game = game ?? this._solvedGame;
        return game[rowColumn[0]][rowColumn[1]]
    }

    _isAValidCell(rowColumn) {
        let row = rowColumn[0]
        let column = rowColumn[1]
        return (row >= 0) && (row < this._MAXROWS) && (column >= 0) && (column < this._MAXCOLUMNS)
    }

    _isABomb(rowColumn) {
        return this._solvedGame[rowColumn[0]][rowColumn[1]] == this._bombCell
    }

    _makeABomb(rowColumn) {
        this._solvedGame[rowColumn[0]][rowColumn[1]] = this._bombCell
        return
    }

    _getFlagsAround(rowColumn) {
        let flags = 0
        let row, column, cell

        for (let i = 0; i < this._aroundCells.length; i++) {
            row = rowColumn[0] + this._aroundCells[i][0]
            column = rowColumn[1] + this._aroundCells[i][1]

            if (this._isAValidCell([row, column])) {
                cell = this._getCell([row, column])

                if (this._isAFlag(cell)) {
                    flags++
                }
            }
        }

        return flags
    }

    _unlockCellsAround(rowColumn) {
        let row, column, cell, value, currentValue

        for (let i = 0; i < this._aroundCells.length; i++) {
            row = rowColumn[0] + this._aroundCells[i][0]
            column = rowColumn[1] + this._aroundCells[i][1]

            if (!this._isAValidCell([row, column])) {
                continue
            }

            cell = this._getCell([row, column])
            if (this._isAFlag(cell)) {
                continue
            }

            currentValue = this._getCellValue([row, column], this._currentGame)
            if (currentValue != null) {
                continue
            }

            value = this._getCellValue([row, column])
            if (value == this._bombCell) {
                this._resolve()
                this._face.classList.add("game__face--over")
                this._gameOver = true
                this.showEndGameAlert()
                return
            }

            if (value == this._emtpyCell) {
                this.unlockCell(cell)
            } else {
                this._currentGame[row][column] = value
                this._cells[cell].classList.add("cell--unlocked")
                this._cells[cell].classList.add("cell--" + value)
            }
        }

        return
    }

    resetGame() {
        // Reseting the face
        this._face.classList.remove("game__face--over")

        // Reseting the tags
        this._mines.innerText = "0"
        this._maxMines.innerText = this._MAXMINES

        // Reseting the game data
        this._gameOver = false
        this._firstMove = true  // False if the user has made the first move
        this._currentGame = []
        this._solvedGame = []

        for (let i = 0; i < this._MAXROWS; i++) {
            this._currentGame.push([])
            this._solvedGame.push([])

            for (let j = 0; j < this._MAXCOLUMNS; j++) {
                this._currentGame[i].push(null)
                this._solvedGame[i].push(this._emtpyCell)
            }
        }

        this._cells.forEach(function (cell) {
            cell.className = "cell"
        })

        return
    }

    setGame(firstCell) {
        let cellsLength = this._cells.length
        let randomCell
        let rowColumn
        let rowColumnFirst = this._getRowAndColum(firstCell)
        let row, column
        let valid

        // Setting bombs
        let mines = 0
        while (mines < this._MAXMINES) {
            // Select a valid random cell
            do {
                valid = true

                // Get a random cell different from the first cell clicked
                do {
                    randomCell = Math.floor(Math.random() * cellsLength)
                } while (randomCell == firstCell)


                // Check if the random cell it's not around the first cell
                rowColumn = this._getRowAndColum(randomCell)

                for (let cell = 0; cell < this._aroundCells.length; cell++) {
                    row = rowColumnFirst[0] + this._aroundCells[cell][0]
                    column = rowColumnFirst[1] + this._aroundCells[cell][1]

                    if (rowColumn[0] == row && rowColumn[1] == column) {
                        valid = false
                        break
                    }
                }
            } while (!valid);


            if (!this._isABomb(rowColumn)) {
                this._makeABomb(rowColumn)
                mines += 1
            }
        }

        // Setting numbers
        for (let i = 0; i < this._MAXROWS; i++) {
            for (let j = 0; j < this._MAXCOLUMNS; j++) {
                if (this._isABomb([i, j])) {
                    continue
                }

                let bombs = 0

                for (let cell = 0; cell < this._aroundCells.length; cell++) {
                    row = i + this._aroundCells[cell][0]
                    column = j + this._aroundCells[cell][1]

                    if (this._isAValidCell([row, column])) {
                        if (this._isABomb([row, column])) {
                            bombs += 1
                        }
                    }
                }

                this._solvedGame[i][j] = bombs
            }
        }

        return
    }

    showEndGameAlert(win = false) {
        let title, content

        if (win) {
            title = "¡Ganaste!"
            content = "Haz completado exitosamente el juego."
        } else {
            title = "Perdiste :("
            content = "La próxima te irá mejor."
        }
        content += " Para volver a jugar presiona la cara."

        const alert = document.getElementById("alert")
        alert.querySelector(".alert__title").innerText = title
        alert.querySelector(".alert__content").innerText = content

        alert.classList.remove("alert__hidden")
    }

    _resolve() {
        let rowColumn

        // Unlocking all cells
        for (let i = 0; i < this._cells.length; i++) {
            rowColumn = this._getRowAndColum(i)

            if (this._isABomb(rowColumn)) {
                this._cells[i].className = "cell cell--bomb"
            } else {
                let value = this._getCellValue(rowColumn)
                this._cells[i].className = "cell"

                if (value != this._emtpyCell) {
                    this._cells[i].classList.add("cell--" + value)
                }

                this._cells[i].classList.add("cell--unlocked")
            }
        }

        // Locking the flags
        this._mines.innerText = this._MAXMINES

        return
    }

    unlockCell(cell, visitedCells = []) {
        if (this._gameOver) {
            return
        }

        let rowColumn = this._getRowAndColum(cell)
        let rowColumnTemp
        let cellTemp
        let solvedValue = this._getCellValue(rowColumn)
        let currentValue = this._getCellValue(rowColumn, this._currentGame)

        // First move condition
        if (this._firstMove) {
            this.setGame(cell)
            this._firstMove = false
        }

        // Flag condition
        if (this._isAFlag(cell)) {
            return
        }

        // Lose condition
        if (solvedValue == this._bombCell) {
            this._resolve()
            this._face.classList.add("game__face--over")
            this._gameOver = true
            this.showEndGameAlert()
            return
        }

        this._currentGame[rowColumn[0]][rowColumn[1]] = solvedValue

        // Unlocking all the empty cells with recursion
        if (solvedValue == this._emtpyCell && currentValue == null && !visitedCells.includes(cell)) {
            visitedCells.push(cell)
            this._cells[cell].classList.add("cell--unlocked")

            for (let i = 0; i < this._aroundCells.length; i++) {
                rowColumnTemp = [
                    rowColumn[0] + this._aroundCells[i][0],
                    rowColumn[1] + this._aroundCells[i][1]
                ]

                if (this._isAValidCell(rowColumnTemp)) {
                    cellTemp = this._getCell(rowColumnTemp)

                    if (this._isAFlag(cellTemp)) {
                        this._removeAFlag(cellTemp)
                    }

                    this.unlockCell(cellTemp)
                }
            }
        }

        // Base case
        if (solvedValue != this._emtpyCell) {
            this._cells[cell].classList.add("cell--unlocked")
            this._cells[cell].classList.add("cell--" + solvedValue)
        }

        // When clicking on a unblocked number
        if (currentValue != null && currentValue != this._emtpyCell) {
            if (this._getFlagsAround(rowColumn) == currentValue) {
                this._unlockCellsAround(rowColumn);
            }
        }

        // Win condition
        if (this._isAWin()) {
            this._gameOver = true
            this.showEndGameAlert(true)
            return
        }

        return
    }

    toggleFlag(cell) {
        if (this._gameOver) {
            return
        }

        let rowColumn = this._getRowAndColum(cell)
        let value = this._getCellValue(rowColumn, this._currentGame)

        if (value != null) {
            return
        }

        if (this._isAFlag(cell)) {
            this._removeAFlag(cell)
            return
        }

        if (Number(this._mines.innerText) < this._MAXMINES) {
            this._makeAFlag(cell)
            return
        }

        const minesElement = document.querySelector(".game__mines")

        minesElement.addEventListener("animationend", function () {
            minesElement.classList.remove("game__mines--animated");
        });

        minesElement.classList.add("game__mines--animated")
    }
}

// Alert and tutorial close events
document.getElementById("alert-close").addEventListener("click", function() {
    document.getElementById("alert").classList.add("alert__hidden")
})

document.getElementById("tutorial-close").addEventListener("click", function() {
    document.getElementById("tutorial").classList.add("tutorial__hidden")
})


// DOMloaded
document.addEventListener("DOMContentLoaded", function() {
    let mineSweeperGame = new Minesweeper()
    mineSweeperGame.resetGame()

    // Show tutorial
    document.getElementById("tutorial").classList.remove("tutorial__hidden")

    // Adding game events
    document.getElementById("face").addEventListener("click", function () {
        mineSweeperGame.resetGame()
    })

    let i = 0
    let lastTap
    document.querySelectorAll(".cell").forEach(function (cell) {
        let pos = i++

        // Computer events
        cell.addEventListener("click", function () {
            mineSweeperGame.unlockCell(pos)
        })

        cell.addEventListener("contextmenu", function (event) {
            event.preventDefault()
            mineSweeperGame.toggleFlag(pos)
        })

        // Smartphones events
        cell.addEventListener("touchstart", function (event) {
            event.preventDefault()
            lastTap = Date.now()
        })

        cell.addEventListener("touchend", function() {
            if (Date.now() - lastTap > 300) {
                mineSweeperGame.toggleFlag(pos)
            } else {
                mineSweeperGame.unlockCell(pos)
            }
        })
    })
});