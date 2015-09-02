(function () {
    var BootstrapSimpleTablePaginator = function () {
        return constructor.apply(this, arguments);
    }
    var attr = BootstrapSimpleTablePaginator.prototype;

    attr.table = null; //tabla a la cual le aplicamos la paginacion;
    attr.body = null; //body de la tabla
    attr.div = null; //div que actua como wrapper de la pagacion
    attr.ul = null; //ul que actua como wrapper de los li de la paginacion

    attr.items = null; //array con todos los childs/elementos a paginar, es un array de obj de jquery.
    attr.total = 0; //total de elementos
    attr.current = 1;
    attr.total_pages = 0 //total de paginas

    attr.defaults = {
        current: 1, //current page, pagian a mostrar por defecto. cualquier numero entreo que este dentro de la cantidad de paginas
        style: 'full', //tipo de paginacion full(pag+next+prev+first+last), pager(solo next y prev) ,compact(paginas+next+prev),
        align: 'center', //alineacion de la paginacion left right center
        size: '', //tmano de los botones de la paginacion, nulo: normal lg: large sm: small
        show: '2', //cantidad de elementos a mostrar por pagina
        pages: '7', //cantidad de paginas a mostrar en la paginacion
        fill: true, //completa la tabla agregando filas vaciaspara que la ultima pagina este completa
        afterChange: null, //callback que se ejecuta antes de cambiar de pagina
        beforeChange: null //callback que se ejecuta despues de cambiar de pagina
    };

    attr.default_labels = {
        first: '&lt;&lt;',
        previous: '&lt;',
        next: '&gt;',
        last: '&gt;&gt;'
    };

    attr.options = null;

    function constructor(table, options, labels) {
        this.table = table;

        var dataOptions = {
            size: this.table.data('bstp-size'),
            style: this.table.data('bstp-style'),
            align: this.table.data('bstp-align'),
            show: this.table.data('bstp-show'),
            pages: this.table.data('bstp-pages'),
            fill: this.table.data('bstp-fill'),
            current: this.table.data('bstp-current')
        };

        var inlineOptions = $.extend({}, dataOptions, options);

        this.body = $('tbody', this.table);
        this.options = $.extend({}, this.defaults, inlineOptions);
        console.log(this.options);
        this.labels = $.extend({}, this.default_labels, labels);
        this.build();
    }

    attr.build = function () {
        this.items = $('tr', this.body);
        this.total = this.items.length;
        this._hideAll();
        if (this.total > this.options.show) {
            this.total_pages = Math.ceil(this.total / this.options.show);
            if (this.div && this.div.length) {
            } else {
                this.div = $('<div />', {
                    class: 'pagination-wrapper text-' + this.options.align
                });
                this.ul = $('<ul />', {
                    class: 'pagination ' + 'pagination-' + this.options.size
                });
                this.div.append(this.ul);
                this.div.insertAfter(this.table);
            }
            this._fill();
            if (this.options.current > this.total_pages) {
                this.options.current = this.total_pages;
            }
            this._goTo(this.options.current);
        } else {
            if (this.div && this.div.length) {
                this.div.remove();
            }
            this._showAll();
        }
    };

    attr._fill = function () {
        if (this.options.fill == true) {
            var tot_elem = this.total_pages * this.options.show;
            var fill = tot_elem - this.total;
            if (fill > 0) {
                var row = $('tr:last-child', this.body);
                var clo = row.clone();
                $('td', clo).html('&nbsp;');
                for (i = 0; i < fill; i++) {
                    var tmp = clo.clone();
                    this.body.append(tmp);
                }
                this.total = tot_elem;
                row = clo = null;
                this.items = $('tr', this.body);
            }
        }
    };

    attr._buildPagesList = function () {
        if (this.total_pages <= this.options.pages) {
            var pInit = 1;
            var pEnd = this.total_pages;
        } else {
            var pLeft = parseInt(this.total_pages - this.options.current);
            var pHalf = Math.floor(this.options.pages / 2);
            if (pLeft < pHalf) {
                var pInit = this.options.current - ( (pHalf * 2) - (this.total_pages - this.options.current) );
                var pEnd = this.total_pages;
            } else {
                if (this.options.current <= pHalf) {
                    var pInit = 1;
                    var pEnd = this.options.pages;
                } else {
                    var pInit = parseInt(this.options.current) - parseInt(pHalf);
                    var pEnd = parseInt(this.options.current) + parseInt(pHalf);
                }
            }
        }

        this.ul.empty();

        var prevDis = this.options.current == 1 ? 'disabled' : '';
        var nextDis = this.options.current == this.total_pages ? 'disabled' : '';

        var first = this._buildElement(1, this.labels.first, prevDis);
        var last = this._buildElement(this.total_pages, this.labels.last, nextDis);
        var next = this._buildElement((parseInt(this.options.current) + parseInt(1)), this.labels.next, nextDis);
        var previous = this._buildElement((this.options.current - 1), this.labels.previous, prevDis);

        switch (this.options.style) {
            case 'full':
                this.ul.append(first);
                this.ul.append(previous);
                break;
            case 'pager':
                this.ul.append(previous);
                break;
            default:
            case 'compact':
                this.ul.append(previous);
                break;
        }

        if (this.options.style != 'pager') {
            for (var i = pInit; i <= pEnd; i++) {
                if (i == this.options.current) {
                    var curr = 'active';
                } else {
                    var curr = "";
                }

                var elem = this._buildElement(i, i, curr);
                this.ul.append(elem);
            }
        }

        switch (this.options.style) {
            case 'full':
                this.ul.append(next);
                this.ul.append(last);
                break;
            case 'pager':
                this.ul.append(next);
                break;
            default:
            case 'compact':
                this.ul.append(next);
                break;
        }

        this._attachHandlers();
    };

    attr._attachHandlers = function () {
        var that = this;
        $('li:not(".disabled,.active")', this.ul).off('click', 'a').on('click', 'a', function (e) {
            e.preventDefault();
            var page = this.getAttribute("href");

            var current = that.options.current;

            var slice = that._getSlice(page);
            if (that.options.beforeChange) {
                that.options.beforeChange(current, page, slice, that.table);
            }

            that.goTo(page);

            if (that.options.afterChange) {
                that.options.afterChange(current, page, slice, that.table);
            }

        });
        $('li.active , li.disabled', this.ul).off('click', 'a').on('click', 'a', function (e) {
            e.preventDefault();
        });
    };

    attr._buildElement = function (page, string, current) {
        var li = $('<li />', {
            class: current
        });
        var a = $('<a />', {
            href: page,
            title: 'Go to page ' + page
        }).html(string);
        li.append(a);
        return li;
    }

    attr._getSlice = function (page) {
        if (page > 0 && page <= this.total_pages) {
            var resStart = ( page - 1 ) * this.options.show;
            var resEnd = parseInt(resStart) + parseInt(this.options.show);
            return this.items.slice(resStart, resEnd);
        }
        return this.items;
    };

    attr._goTo = function (page) {
        if (page > 0 && page <= this.total_pages) {
            this._hideAll();
            var slice = this._getSlice(page);
            slice.css("display", "");
            this.options.current = page;
            this._buildPagesList();
        }
    };

    attr._hideAll = function () {
        this.items.css("display", "none");
    };

    attr._showAll = function () {
        this.items.css("display", "");
    };

    attr.goTo = function (page) {
        this._goTo(page);
    };

    attr.moveFirst = function () {
        this._goTo(1);
    };

    attr.moveLast = function () {
        if (this.total_pages > 1) {
            this._goTo(this.total_pages);
        }
    };

    attr.moveNext = function () {
        var pp = this.options.current + 1;
        if (pp <= this.total_pages) {
            this._goTo(pp);
        }
    };

    attr.movePrev = function () {
        var pp = this.options.current - 1;
        if (pp > 0) {
            this._goTo(pp);
        }
    };

    attr.refresh = function () {
        this.build();
    };

    attr.get = function () {
        return this.table.data('BootstrapSimpleTablePaginator');
    };

    window.BootstrapSimpleTablePaginator = BootstrapSimpleTablePaginator;
})();


(function ($) {
    $.fn.bootstrapSimpleTablePaginator = function (options) {
        return this.each(function () {
            var $this = $(this);
            var daPage = $this.data('BootstrapSimpleTablePaginator');
            if (daPage && typeof daPage === 'object') {
                if (options && options != '') {
                    daPage[options]();
                } else {
                    return daPage['get']();
                }
            } else {
                var labels = null;
                if (options && options.labels && typeof options.labels === 'object') {
                    labels = options.labels
                }
                var daPage = new BootstrapSimpleTablePaginator($this, options, labels);
                $this.data('BootstrapSimpleTablePaginator', daPage);
            }
        });
    };

})(jQuery);

;
(function ($, doc, win) {
    "use strict";
    $(doc).on('ready', function (nodes) {
        $('table[data-bstp]').bootstrapSimpleTablePaginator();
    });
})(jQuery, document, window);