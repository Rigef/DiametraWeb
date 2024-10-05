function tab1_visibility(selected_product) {
    // Hide all elements initially
    const hidden_elements = ['lengthWrapper', 'thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'sheetAmountWrapper', 'sheetLengthWrapper', 'resultWrapper'];
    const inputs = ['length', 'thickness', 'huv_amount', 'huv_length', 'sheet_amount', 'sheet_length'];
    hidden_elements.forEach(el => document.getElementById(el).style.display = 'none');
    inputs.forEach(el => document.getElementById(el).value = '');

    document.getElementById('spoolDiameterWrapper').style.display = 'block'; // Bobin diameter always visible.

    document.getElementById('result_label').innerHTML = '';
    document.getElementById('count_label').innerHTML = '';

    // Show elements based on selection
    switch(selected_product) {
        case 'no_option':
            layer = 0
            welded = false;
            tab1_reset()
            break;
        case 'foil_option':
            layer = 2; // 1 layers * 2 sides
            welded = false;
            ['lengthWrapper', 'thicknessWrapper', 'submitWrapper', 'resultWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'tube_option':
            layer = 4; // 2 layers * 2 sides
            welded = false;
            ['lengthWrapper', 'thicknessWrapper', 'submitWrapper', 'resultWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'folded_tube_option':
            layer = 8; // 4 layers * 2 sides
            welded = false;
            ['lengthWrapper', 'thicknessWrapper', 'submitWrapper', 'resultWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'huv_option':
            layer = 4; // 2 layers * 2 sides
            welded = true;
            ['thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'submitWrapper', 'resultWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'folded_huv_option':
            layer = 8; // 4 layers * 2 sides
            welded = true;
            ['thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'submitWrapper', 'resultWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'sheet_option':
            layer = 2; // 1 layers * 2 sides
            welded = true;
            ['thicknessWrapper', 'sheetAmountWrapper', 'sheetLengthWrapper', 'submitWrapper', 'resultWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        default:
            console.log("Unknown selection.");
    }
}


function tab1_submit() {
    let input = 0;
    try {
        input = get_input_values()
    } catch (e) {
        document.getElementById('result_label').innerHTML = e.message;
        document.getElementById('count_label').innerHTML = '';
        return null;
    }

    document.getElementById('result_label').innerHTML = '';
    document.getElementById('count_label').innerHTML = '';

    let length = 0
    if (welded) {
        length = amount_to_length(input.amount, input.length)
    }else {
        length = m_to_mm(input.length_m);
    }

    const resultObj = {
        spoolDiameter: input.spoolDiameter,
        length: length,
        thickness: input.thickness
    };

    if (!validate_none_zero(resultObj)) {
        document.getElementById('result_label').innerHTML = "Error: Tomt fält";
        document.getElementById('count_label').innerHTML = '';
        return null;
    }

    if (input.spoolDiameter && input.thickness && length && layer) {
        calculate_diameter(length, input.thickness, input.spoolDiameter)
    }else {
        console.log("Value Error")
    }
}

function get_input_values() {
    const MAXLENGTH = 10000000000;
    const MAXTHICKNESS = 50;

    const selectedValue = document.getElementById('productOption').value || "0";
    let spoolDiameter = document.getElementById('spool_diameter').value || "0";
    const length_m = document.getElementById('length').value || "0";
    const thickness = document.getElementById('thickness').value || "0";
    let amount = 0;
    let length = 0;
    if(selectedValue.includes("huv")) {
        amount = document.getElementById('huv_amount').value || "0";
        length = document.getElementById('huv_length').value || "0";
    }else {
        amount = document.getElementById('sheet_amount').value || "0";
        length = document.getElementById('sheet_length').value || "0";
    }


// Validate integer values
    if (!is_integer(spoolDiameter) || !is_integer(amount) || !is_integer(length)) {
        console.log('One or more fields are not valid integers.');
        throw new Error("Otillåtna värden");
    }

// Validate length to allow decimals
    if (!is_number(length_m) || !is_number(thickness)) {
        console.log('One or more fields are not valid numbers.');
        throw new Error("Otillåtna värden");
    }

    let new_length_m = length_m.replace(',', '.');
    let new_thickness = thickness.replace(',', '.');

    const resultObject = {
        selectedValue: selectedValue,
        spoolDiameter: parseInt(spoolDiameter),
        length_m: parseFloat(new_length_m),
        thickness: parseFloat(new_thickness),
        amount: parseInt(amount),
        length: parseInt(length)
    };

    if (thickness > MAXTHICKNESS) {
        throw new Error("Orimlig tjocklek");
    }

    if ((amount * length > MAXLENGTH) || m_to_mm(length_m) > MAXLENGTH) {
        throw new Error("Orimligt lång");
    }

    if (validate_all_positive(resultObject)) {
        return resultObject;
    } else {
        throw new Error("Negativa värden är ej tillåtna");
    }
}

function calculate_diameter(length, thickness, spoolDiameter) {
    const totalMm = thickness * layer; // Total amount of mm added to the diameter per iteration
    const resultDict = {};
    const spoolDiameterCm = spoolDiameter / 10; // mm -> cm
    let lengthSum = 0;
    let count = 0;

    while (lengthSum + spoolDiameter < length) {
        const term = (spoolDiameter + totalMm * count) * Math.PI;
        lengthSum += term;
        count += 1;
    }

    resultDict.resultStr = `${((count * totalMm) / 10 + spoolDiameterCm).toFixed(2)} cm`;
    resultDict.result = (count * totalMm) / 10 + spoolDiameterCm;
    resultDict.count = count;

    document.getElementById('result_label').innerHTML = 'Diameter: ' + resultDict.resultStr;
    document.getElementById('count_label').innerHTML = 'Antal varv: ' + resultDict.count;

    return {
        result_string: resultDict.resultStr,
        result: resultDict.result,
        count: resultDict.count
    };
}

function tab1_reset() {
    // Set the spool diameter to 90
    const spoolDiameterInput = document.getElementById('spool_diameter');
    spoolDiameterInput.value = 90;

    // Hide all elements initially
    const wrappers = ['lengthWrapper', 'thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'sheetAmountWrapper', 'sheetLengthWrapper', 'resultWrapper'];
    const inputs = ['length', 'thickness', 'huv_amount', 'huv_length', 'sheet_amount', 'sheet_length'];
    const productOptionSelect = document.getElementById('productOption');
    wrappers.forEach(el => document.getElementById(el).style.display = 'none');
    inputs.forEach(el => document.getElementById(el).value = '');
    productOptionSelect.value = 'no_option';
    document.getElementById('result_label').innerHTML = '';
    document.getElementById('count_label').innerHTML = '';

}
