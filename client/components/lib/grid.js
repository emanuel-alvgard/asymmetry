// @DONE
const _clamp = (num, min, max) => Math.min(Math.max(num, min), max)

let buffer = {}

// @
export default (bounds, data, type=null, update=()=>{}, virtual_limit=100) => { // grid(bounds, [[]], [[]], ()=>{}, 0)
    
    // SETUP
    bounds.overflow_y("auto")
    let id = bounds.id()
    let setup = false
    let clear = false




    function _setup() {
        
        setup = true

        buffer[id] = {
            row_count: data.length,
            row_offset: 0,
            last_row: null,
            column_count: [],
            virtual_top: null, 
            virtual_bottom: null,    
            rows: [], 
            columns: []
        }

        data.forEach(i => { buffer[id].column_count.push(i.length) })

        if (data.length > virtual_limit) { buffer[id].virtual_top = bounds.element("virtual_top", "div") }

        for (let i=0; i < data.length; i++) {

            if (i === virtual_limit) { 
                buffer[id].virtual_bottom = bounds.element("virtual_bottom", "div")
                break 
            }

            buffer[id].rows.push(bounds.element("row_" + i, "div"))

            let columns = []
            for (let j=0; j < data[i].length; j++) {
                let _type = "div"
                if (type !== null) { _type = type[i][j] }
                columns.push(bounds.element("row_" + i + "_column_" + j, _type))
            }
            buffer[id].columns.push(columns)
        }
    }
    
    // CHECK IF GRID SHAPE HAS CHANGED
    if (id in buffer) {
        if (buffer[id].row_count !== data.length) { clear = true }
        else { 
            for (let i=0; i < buffer[id].column_count.length; i++) {
                if (buffer[id].column_count[i] !== data[i].length) { 
                    clear = true
                    break
                }
            }
        }

        // CLEAR ELEMENTS
        if (clear) {
            for (let i=0; i < buffer[id].rows.length; i++) {
                buffer[id].rows[i].remove()
                for (let j=0; j < buffer[id].columns[i].length; j++) {
                    buffer[id].columns[i][j].remove()
                }
            }
            _setup()
        }
    }
    else { _setup() }

    




    // UPDATE
    let height = 50
    let grid = buffer[id]
    let top = bounds.top() + (grid.row_offset * height)
    let right = 0

    for (let i=0; i < grid.rows.length; i++) {

        let row = grid.rows[i]

        // VIRTUAL SCROLLING
        if (grid.virtual_top !== null && grid.virtual_bottom !== null) {

            let scroll = false

            // FIND LAST ROW
            if (buffer[id].last_row === null) {
                if (row.top() > bounds.bottom()) {
                    buffer[id].last_row = i
                }
            }

            // SCROLL DOWN
            else if (i === grid.last_row) {
                if (row.bottom() - bounds.scroll_top() < bounds.bottom()) {
                    if (grid.row_offset < (grid.row_count - grid.rows.length)) { scroll = true }
                }
            }

            // SCROLL UP
            else if (i === grid.last_row - 1) {
                if (row.top() - bounds.scroll_top() > bounds.bottom()) {
                    if (grid.row_offset > 0) { scroll = true }
                }
            }

            // GRID OFFSET
            if (scroll) { grid.row_offset = _clamp(Math.round(bounds.scroll_top() / height), 0, grid.row_count - grid.rows.length) }
            grid.virtual_bottom.height((grid.row_count - (grid.row_offset + grid.rows.length)) * height, 0)
            grid.virtual_top.height(grid.row_offset * height, 0)

        }

        row.height(height)
        row.top(top)
        row.left(bounds.left())

        let left = bounds.left()
        let k = i + grid.row_offset
        if (k > grid.row_count - 1) { k = grid.row_count - 1 }

        for (let j=0; j < grid.columns[i].length; j++) {
            
            let column = grid.columns[i][j]

            column.text(data[k][j])
            column.left(left)
            column.top(top)
            update({
                bounds: bounds,
                rows: grid.rows, 
                i: i, 
                columns: grid.columns[i], 
                j: j,
                k: k, 
                SETUP: setup
            })
            if (column.right() > right) { right = column.right() }
            if (column.bottom() > row.bottom()) { row.extend_bottom(column.bottom())}

            left = column.right()
        }
        top = row.bottom()
    }

    // GRID RIGHT
    for (let i=0; i < grid.rows.length; i++) {
        if (bounds.right() > right) { 
            grid.rows[i].extend_right(bounds.right())
            bounds.overflow_x("hidden") 
        }
        else { 
            grid.rows[i].extend_right(right)
            bounds.overflow_x("auto")  
        }
    }

    // VIRTUAL TOP / BOTTOM
    if (grid.virtual_top !== null) {
        
        const top = grid.virtual_top 
        
        top
            .top(bounds.top())
            .width(bounds.width())
            .x(bounds.x())
    }
    
    if (grid.virtual_bottom !== null) { 
        
        const bot = grid.virtual_bottom
        
        bot
            .top(grid.rows[grid.rows.length-1].bottom())
            .width(bounds.width())
            .x(bounds.x())  
    }

    return grid
    
}
