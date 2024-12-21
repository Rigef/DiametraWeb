
function tab3_visibility(selected_product) {
    const hidden_elements = ['productInputWrapper3', 'sheetInputWrapper3', 'rollInputWrapper3', 'resultWrapper3'];
    hidden_elements.forEach(el => document.getElementById(el).style.display = 'none');

    document.getElementById('result_label3').innerHTML = '';
    document.getElementById('count_label3').innerHTML = '';

    switch (selected_product) {
        case 'no_option':
            tab3_reset()
            break;
        case 'bag_option':
            ['productInputWrapper3', 'resultWrapper3'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'sack_option':
            ['productInputWrapper3', 'resultWrapper3'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'huv_option':
            ['productInputWrapper3', 'resultWrapper3'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'top_sheet_option':
            ['sheetInputWrapper3', 'resultWrapper3'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'tube_option':
            ['rollInputWrapper3', 'resultWrapper3'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'foil_option':
            ['rollInputWrapper3', 'resultWrapper3'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        default:
            console.log("Unknown selection.");
    }
}

function tab3_submit() {
    document.getElementById('result_label3').innerHTML = '';
    document.getElementById('count_label3').innerHTML = '';
    const selected_product = document.getElementById("productOption3").value;
    getInputValues(selected_product);
}
function prettyPrintToLabel(values, labelId) {
    let prettyString = '';

    if (Array.isArray(values)) {
        // Format array as a list
        prettyString = values.map((val, index) => `<div>${index + 1}: ${val}</div>`).join('');
    } else if (typeof values === 'object' && values !== null) {
        // Format object as key-value pairs
        prettyString = Object.entries(values)
            .map(([key, val]) => `<div><strong>${key}:</strong> ${val}</div>`)
            .join('');
    } else {
        prettyString = String(values);
    }

    // Set the pretty-printed string to the label
    const label = document.getElementById(labelId);
    if (label) {
        label.innerHTML = prettyString;
    } else {
        document.getElementById('count_label3').innerHTML = `Label with id "${labelId}" not found.`;
        console.warn(`Label with id "${labelId}" not found.`);
    }
}

function getInputValues(selected_product) {
    divId = "";
    switch (selected_product) {
        case 'no_option':
            break;
        case 'bag_option':
        case 'sack_option':
        case 'huv_option':
            divId = "productInputWrapper3";
            printProduct(fetchFormValues(divId));
            break;
        case 'top_sheet_option':
            divId = "sheetInputWrapper3";
            printSheet(fetchFormValues(divId));
            break;
        case 'tube_option':
            divId = "rollInputWrapper3";
            printRoll(fetchFormValues(divId), true);
            break;
        case 'foil_option':
            divId = "rollInputWrapper3";
            printRoll(fetchFormValues(divId), false);
            break;
        default:
            console.log("Unknown selection.");
    }
}

function formatSwedishNumber(number) {
    // Create an Intl.NumberFormat object for Swedish locale
    const swedishFormatter = new Intl.NumberFormat('sv-SE', {
        style: 'decimal', // Use decimal style
        minimumFractionDigits: 2, // Always show at least 2 decimals
        maximumFractionDigits: 2, // Limit to 2 decimals
    });

    return swedishFormatter.format(number);
}

function printProduct(formValueMap) {
    const resultMap = {};
    let length = formValueMap['product_length3'];
    let width = formValueMap['product_width3'];
    let thickness = formValueMap['product_thickness3'];
    let amount = formValueMap['product_amount3'];
    let roll_amount = formValueMap['product_roll_amount3'];
    let bottom_weld = formValueMap['product_bottom_weld_checkbox3'];
    const weight_per_item = calculateOrderPerRollWeight(length, width, thickness, 1, 1, true, bottom_weld);
    const weight_per_roll = toKg(calculateOrderPerRollWeight(length, width, thickness, amount, roll_amount, true, bottom_weld), 'g');
    const weight_total =     toKg(calculateOrderPerRollWeight(length, width, thickness, amount, 1, true, bottom_weld), 'g');

    resultMap['Vikt per st(g): '] = formatSwedishNumber(weight_per_item);
    resultMap['Vikt per rulle(kg): '] = formatSwedishNumber(weight_per_roll);
    resultMap['Total vikt(kg): '] = formatSwedishNumber(weight_total);
    prettyPrintToLabel(resultMap, "result_label3");
}

function printSheet(formValueMap) {
    const resultMap = {};
    let length = formValueMap['sheet_length3'];
    let width = formValueMap['sheet_width3'];
    let thickness = formValueMap['sheet_thickness3'];
    let amount = formValueMap['sheet_amount3'];
    let roll_amount = formValueMap['sheet_roll_amount3'];
    const weight_per_item = calculateOrderPerRollWeight(length, width, thickness, 1, 1, true);
    const weight_per_roll = toKg(calculateOrderPerRollWeight(length, width, thickness, amount, roll_amount, false, false), 'g');
    const weight_total = toKg(calculateOrderPerRollWeight(length, width, thickness, amount, 1, false, false), 'g');

    resultMap['Vikt per st(g): '] = formatSwedishNumber(weight_per_item);
    resultMap['Vikt per rulle(kg): '] = formatSwedishNumber(weight_per_roll);
    resultMap['Total vikt(kg): '] = formatSwedishNumber(weight_total);
    prettyPrintToLabel(resultMap, "result_label3");
}

function printRoll(formValueMap, isTube) {
    const resultMap = {};
    let length = formValueMap['roll_length3'];
    let width = formValueMap['roll_width3'];
    let thickness = formValueMap['roll_thickness3'];
    let amount = formValueMap['roll_amount3'];
    let weight_total = toKg(calculateRollWeight(length, width, thickness, amount, isTube), 'g');
    resultMap['Total vikt(kg): '] = formatSwedishNumber(weight_total);
    prettyPrintToLabel(resultMap, "result_label3");
}

function fetchFormValues(divId) {
    const formValueMap = {};
    [divId].forEach(el => {
        const wrapper = document.getElementById(el);
        if (!wrapper) return;

        Array.from(wrapper.children).forEach(child => {
            if (child.id) {
                let child_id = child.id;
                let child_type = child.type;
                let child_checked = child.checked;
                let child_value = child.value.replace(",", ".");
                console.log(child.value.includes("/"));
                console.log(child_value);
                if (child.value.includes('/')) {
                    const tmp_split = child.value.split('/');
                    console.log(tmp_split);
                    if(tmp_split.length === 2 && is_number(tmp_split[0]) && is_number(tmp_split[1])) {
                        let fold1 = parseFloat(tmp_split[0]);
                        let fold2 = parseFloat(tmp_split[1]);
                        child_value = fold1 + fold2;
                    }
                }
                if (child_type === 'checkbox') {
                    formValueMap[child_id] = child_checked;
                } else if (child_type === 'text') {
                    console.log("text: " + child_value);
                    formValueMap[child_id] = parseFloat(child_value) || 0;
                } else if (child_type === 'number') {
                    console.log("flaot: " + child_value);
                    formValueMap[child_id] = child_value || 0;
                }
            }
        });
    });

    return formValueMap;
}

function tab3_reset() {
    const productOptionSelect = document.getElementById('productOption3');
    productOptionSelect.value = 'no_option';

    const inputs = ['product_length3', 'product_width3', 'product_thickness3', 'roll_length3', 'roll_width3', 'roll_thickness3'];
    inputs.forEach(el => document.getElementById(el).value = '');

    const hidden_elements = ['productInputWrapper3', 'sheetInputWrapper3', 'rollInputWrapper3', 'resultWrapper3'];
    hidden_elements.forEach(el => document.getElementById(el).style.display = 'none');

    document.getElementById('result_label3').innerHTML = '';
    document.getElementById('count_label3').innerHTML = '';

}