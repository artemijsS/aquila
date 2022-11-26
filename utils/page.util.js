module.exports = class Page {

    constructor(req, size) {
        this.page = 0
        this.size = size
        this.count = 0
        this.search = ''

        this.data = []

        if (req.query.page) {
            this.page = req.query.page
        }
        if (req.query.search) {
            this.search = req.query.search
        }
    }

    get Page() { return this.page }
    get Search() { return this.search }
    get Size() { return this.size }
    get Count() { return this.count }
    get Data() { return this.data }

    setCount(count) {
        this.count = count
    }

    setData(data) {
        this.data = data
    }

    pageResponse() {
        return {
            page: this.page,
            pages: Math.ceil(this.count/this.size),
            data: this.data
        }
    }
}
