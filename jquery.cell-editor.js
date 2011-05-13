(function($) {
    var KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40, KEY_ENTER = 13, KEY_ESCAPE = 27;
    var defaultOptions = {
        editKey: [13],
        selectClassName: 'select',
        editClassName: 'edit'
    };
    
    $('<style>.cellEditor:focus { outline: none; } .cellEditor td.select { background-color: #EED; }</style>').appendTo('head');

    function buildElementTree(startElement, topmostElement) {
        var elTree = [startElement];
        var el = startElement;
        while (el && el!==topmostElement) {
            el = el.parentNode
            elTree.splice(0, 0, el);
        }
        return el ? elTree : null;
    }

    function findFirstElementByTagName(elementTree, tagNames) {
        if (typeof tagNames==='string')
            tagNames = [tagNames];
        for (var i = 0; i<elementTree.length; i++) {
            if (elementTree[i].tagName && elementTree[i].tagName in tagNames)
                return elementTree[i];
        }
        return null;
    }

    $.fn.cellEditor = function(customOptions) {
        return this.each(function() {
            var $this = $(this);
            var options = $.extend(defaultOptions, customOptions);
            var currentTable = this;
            var currentRow = -1, currentCol = -1;
            var currentEditing = false;
            var holdBlurEvent = false;

            $this.addClass('cellEditor');
            $this.attr('tabindex', 0);

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

            function getHeadRows() {
                return currentTable.tHead ? currentTable.tHead.rows.length : 0;
            }

            function getCell(rowIndex, colIndex) {
                var row = currentTable.tBodies[0].rows[rowIndex];
                return $(row.cells[colIndex]);
            }

            function getIndex(cell) {
                var elTree = buildElementTree(cell, currentTable);
                if (!elTree || elTree.length<4)
                    return null;

                var sectionName = elTree[1].tagName;
                if (sectionName!=='TBODY')
                    return null;
                cell = elTree[3];

                return {
                    row: (cell.parentNode.rowIndex - getHeadRows()),
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

            function editCell(rowIndex, colIndex, replaceText) {
                var hasText = typeof replaceText==='string';
                var $cell = getCell(rowIndex, colIndex);
                $cell.removeClass(options.selectClassName);
                $cell.addClass(options.editClassName);
                var $input = $('<input type="text" />');
                $input.blur(function(ev) {
                    closeCurrentCell();
                });

                if (hasText)
                    $input.val(replaceText);
                else {
                    var value = $cell.text().trimRight();
                    $input.val(value);
                }
                
                var cellWidth = $cell.innerWidth();
                $input.data('original.cell-editor', $cell.text());
                $cell.empty().append($input);
                $input.outerWidth(cellWidth);
                currentRow = rowIndex;
                currentCol = colIndex;
                currentEditing = true;
                holdBlurEvent = true;
                if (typeof replaceText === 'string')
                    $input.focus();
                else
                    $input.select().focus();
            }

            function closeCurrentCell(useValue) {
                var $cell = getCell(currentRow, currentCol);
                $cell.removeClass(options.editClassName);
                var $input = $cell.find('input');
                var value = useValue===false ? $input.data('original.cell-editor') : $input.val();
                $cell.text(value);
            }

            $this.focus(function(ev) {
                if (ev.target==currentTable) {
                    if (currentRow==-1 || currentCol==-1) {
                        currentRow = 0;
                        currentCol = 0;
                    }
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
                    if (!currentEditing && currentCol > 0) 
                        goToCell(currentRow, currentCol-1);
                }
                else if (ev.keyCode == KEY_RIGHT) {
                    if (!currentEditing && currentCol < (getColumns() - 1)) 
                        goToCell(currentRow, currentCol+1);
                }
                else if (ev.keyCode == KEY_UP) {
                    if (!currentEditing && currentRow > 0) 
                        goToCell(currentRow-1, currentCol);
                }
                else if (ev.keyCode == KEY_DOWN) {
                    if (!currentEditing && currentRow < (getRows() - 1)) 
                        goToCell(currentRow+1, currentCol);
                }
                else if (ev.keyCode == KEY_ENTER) {
                    if (currentRow>=0 && currentCol>=0) {
                        if (!currentEditing)
                            editCell(currentRow, currentCol);
                        else {
                            closeCurrentCell();
                            currentTable.focus();
                        }
                    }
                }
                else if (ev.keyCode == KEY_ESCAPE) {
                    if (currentRow>=0 && currentCol>=0 && currentEditing) {
                        closeCurrentCell(false);
                        currentTable.focus();
                    }
                }
            });
            $this.keypress(function(ev) {
                if (!currentEditing && currentRow>=0 && currentCol>=0) {
                    if (ev.which!==0 && ev.charCode!==0)
                        editCell(currentRow, currentCol, String.fromCharCode(ev.charCode));
                }
            });
            $this.mousedown(function(ev) {
                var cellIndex = getIndex(ev.target);
                if (cellIndex)
                    goToCell(cellIndex.row, cellIndex.col);
            });
        });
    }
})(jQuery);

