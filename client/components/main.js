import { element } from "../_runtime/virtual"

function t(i) { console.log(i) }


// @DONE
function _token(buffer, length) {

    function _generate() {  

        const digit = 48
        const upper = 65
        const lower = 97
        
        let id = ""

        for (let i=0; i < length; i++) {
            const type = Math.random() * 3
            let code
        
            if (type < 1) { code = digit + Math.round(Math.random() * 9) }
            else if (type < 2) { code = upper + Math.round(Math.random() * 25) }
            else { code = lower + Math.round(Math.random() * 25) }

            id += String.fromCharCode(code)
        }
        return id
    }

    let id = _generate()
    while (buffer.includes(id)) {
        id = _generate()
    }
    return id
}


function _string_style() {}
function _number_style() {}
function _object_style() {}
function _ref_style() {}
function _add_button(element, previous) {

}


const type = {
    string: 0,
    number: 1,
    object: 2,
    ref: 3
}

function _field_style(top) {}

// @DONE
function _setup_fields(bounds, data) {

    const elements = []

    for (let i=0; i < data.field_id.length; i++) {

        if (data.field_type[i] === type.string) { elements.push(bounds.element(data.field_id[i], "input")) }
        else if (data.field_type[i] === type.number) { elements.push(bounds.element(data.field_id[i], "input")) }
        else if (data.field_type[i] === type.object) { elements.push(bounds.element(data.field_id[i], "div")) }
        else if (data.field_type[i] === type.ref) { elements.push(bounds.element(data.field_id[i], "div")) }
    }

    return elements
}

function _create_field() {}
function _delete_field() {}


const data = {
    field_id: ["A1", "A2", "A3", "A4", "A5"],
    field_type: [type.string, type.ref, type.object, type.string, type.number],
    field_key: ["name", "person", "other", "nested", "age"],
    field_value: ["Emanuel", "_#1", null, "test", 31],
    field_parent: [null, null, null, "_#3", null],
    field_index: [0,1,2,0,3]
}

let elements = []
let main

export default (app) => {

    if (app.SETUP) {
        main = app.view("main")
        elements = _setup_fields(main, data, elements)
        t(elements)
    }

    // 
    for (let i=0; i < data.field_id.length; i++) {

        if (data.field_type[i] === type.string) {}
        
        if (data.field_parent[i] !== null) {}

        if (data.field_parent.includes(data.field_id[i])) {
            // find all children

            let previous_slot

            for (let j=0; j < data.field_id.length; j++) {
                // set top to p
            }
        }
    }
}