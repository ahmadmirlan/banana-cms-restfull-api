class PageBuilder {
    constructor (data, size, totalElements, number) {
        this._data = data;
        this._size = size;
        this._totalElements = totalElements;
        this._number = number;
    }

    get data() {
        return this._data;
    }

    get size() {
        return this._size;
    }

    get totalElements() {
        return this._totalElements;
    }

    get number() {
        return this._number;
    }

    /*Render data, Return all this.properties as json object*/
    get renderData() {
        return {
            data: this.data,
            page: {
                size: this.size,
                totalElements: this.totalElements,
                totalPage: Math.ceil(this.totalElements / this.size),
                number: this.number
            }
        }
    }
}

module.exports = PageBuilder;