(function($) {
    var KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40, KEY_ENTER = 13, KEY_ESCAPE = 27;
    
    $('<style>.cellEditor:focus { outline: none; }</style>').appendTo('head');


    $.fn.cellEditor = function(customOptions) {
        var options = {
            editKey: [13],
            selectClassName: 'select',
            editClassName: 'edit'
        };
        $.extend(options, customOptions);

        return this.each(function() {
            var $this = $(this);
            var currentTable = this;
            var currentRow = 0, currentCol = 0;
            var currentEditing = false;
            var holdBlurEvent = false;

            function goToCell(rowIndex, colIndex) {
                if (currentRow>=0 && currentCol>=0) {
                    if (currentEditing)
                        closeCurrentCell();
                    else
                        unselectCurrentCell();
                }
                if (options.editKey) 
                    selectCell(rowIndex, colIndex);
                else 
                    editCell(rowIndex, colIndex);
            }

            function getColumns() {
                return currentTable.tBodies[0].rows[0].cells.length;
            }

            function getRows() {
                return currentTable.tBodies[0].rows.length;
            }

            function getCell(rowIndex, colIndex) {
                var row = currentTable.tBodies[0].rows[rowIndex];
                return $(row.cells[colIndex]);
            }

            function getIndex(cell) {
                return {
                    row: (cell.parentNode.rowIndex - currentTable.tHead.rows.length), 
                    col: cell.cellIndex
                };
            }

            function selectCell(rowIndex, colIndex) {
                var $cell = getCell(rowIndex, colIndex);
                $cell.addClass(options.selectClassName);
                currentRow = rowIndex;
                currentCol = colIndex;
                currentEditing = false;
            }

            function unselectCurrentCell() {
                var $cell = getCell(currentRow, currentCol);
                $cell.removeClass(options.selectClassName);
            }

            function editCell(rowIndex, colIndex) {
                var $cell = getCell(rowIndex, colIndex);
                $cell.removeClass(options.selectClassName);
                $cell.addClass(options.editClassName);
                var $input = $('<input type="text" />');
                $input.blur(function(ev) {
                });
                $input.val($cell.text());
                $input.attr('original', $cell.text());
                $cell.empty().append($input);
                currentRow = rowIndex;
                currentCol = colIndex;
                currentEditing = true;
                holdBlurEvent = true;
                $input.select().focus();
            }

            function closeCurrentCell(useValue) {
                var $cell = getCell(currentRow, currentCol);
                $cell.removeClass(options.editClassName);
                var $input = $cell.find('input');
                var value = useValue===false ? $input.attr('original') : $input.val();
                $cell.text(value);
                currentTable.focus();
            }

            $this.addClass('cellEditor');
            $this.attr('tabindex', 0);
            $this.focus(function(ev) {
                if (ev.target===currentTable && currentRow>=0 && currentCol>=0) {
                    goToCell(currentRow, currentCol);
                }
            });
            $this.blur(function(ev) {
                if (holdBlurEvent) {
                    holdBlurEvent = false;
                    return;
                }
                if (currentRow>=0 && currentCol>=0) {
                    if (currentEditing)
                        closeCurrentCell();
                    else
                        unselectCurrentCell();
                }
            });
            $this.keydown(function(ev) {
                if (ev.keyCode == KEY_LEFT) {
                    if (currentCol > 0) 
                        goToCell(currentRow, currentCol-1);
                }
                else if (ev.keyCode == KEY_RIGHT) {
                    if (currentCol < (getColumns() - 1)) 
                        goToCell(currentRow, currentCol+1);
                }
                else if (ev.keyCode == KEY_UP) {
                    if (currentRow > 0) 
                        goToCell(currentRow-1, currentCol);
                }
                else if (ev.keyCode == KEY_DOWN) {
                    if (currentRow < (getRows() - 1)) 
                        goToCell(currentRow+1, currentCol);
                }
                else if (ev.keyCode == KEY_ENTER) {
                    if (currentRow>=0 && currentCol>=0) {
                        if (!currentEditing)
                            editCell(currentRow, currentCol);
                        else
                            closeCurrentCell();
                    }
                }
                else if (ev.keyCode == KEY_ESCAPE) {
                    if (currentRow>=0 && currentCol>=0 && currentEditing) {
                        closeCurrentCell(false);
                    }
                }
            });
            $this.click(function(ev) {
                var cellIndex = getIndex(ev.target);
                goToCell(cellIndex.row, cellIndex.col);
            });
        });
    }
})(jQuery);

