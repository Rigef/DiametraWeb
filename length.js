
function tab2_visibility(selected_product) {
    const hidden_elements = ['totalSpoolDiameterWrapper', 'thicknessWrapper2', 'resultWrapper2'];
    const inputs = ['totalSpoolDiameter', 'thickness2'];
    hidden_elements.forEach(el => document.getElementById(el).style.display = 'none');
    inputs.forEach(el => document.getElementById(el).value = '');

    document.getElementById('result_label2').innerHTML = '';
    document.getElementById('count_label2').innerHTML = '';

    switch(selected_product) {
        case 'no_option':
            layer = 0
            welded = false;
            tab2_reset()
            break;
        case 'foil_option':
            layer = 2; // 1 layers * 2 sides
            welded = false;
            ['totalSpoolDiameterWrapper', 'thicknessWrapper2', 'submitWrapper2', 'resultWrapper2'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'tube_option':
            layer = 4; // 2 layers * 2 sides
            welded = false;
            ['totalSpoolDiameterWrapper', 'thicknessWrapper2', 'submitWrapper2', 'resultWrapper2'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'folded_tube_option':
            layer = 8; // 4 layers * 2 sides
            welded = false;
            ['totalSpoolDiameterWrapper', 'thicknessWrapper2', 'submitWrapper2', 'resultWrapper2'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'huv_option':
            layer = 4; // 2 layers * 2 sides
            welded = true;
            ['totalSpoolDiameterWrapper', 'thicknessWrapper2', 'submitWrapper2', 'resultWrapper2'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'folded_huv_option':
            layer = 8; // 4 layers * 2 sides
            welded = true;
            ['totalSpoolDiameterWrapper', 'thicknessWrapper2', 'submitWrapper2', 'resultWrapper2'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        case 'sheet_option':
            layer = 2; // 1 layers * 2 sides
            welded = true;
            ['totalSpoolDiameterWrapper', 'thicknessWrapper2', 'submitWrapper2', 'resultWrapper2'].forEach(el => document.getElementById(el).style.display = 'block');
            break;
        default:
            console.log("Unknown selection.");
    }
}

function tab2_submit() {
    const spool_diameter = document.getElementById("spool_diameter2").value;
    const thickness =  document.getElementById("thickness2").value.replace(',', '.');
    const total_spool_diameter = document.getElementById("totalSpoolDiameter").value;
    console.log(total_spool_diameter)

    try {
        validate_inputs(spool_diameter, thickness, total_spool_diameter)
        calculate_length(spool_diameter, total_spool_diameter, thickness);
    } catch (error) {
        document.getElementById('result_label2').innerHTML = error;
        document.getElementById('count_label2').innerHTML = '';
    }
}

function validate_inputs(spool_diameter, thickness, total_spool_diameter) {
    const MAXLENGTH = 10000;
    const MAXTHICKNESS = 50;

    if (thickness > MAXTHICKNESS) {
        throw new Error("Orimlig tjocklek");
    }

    if (total_spool_diameter > MAXLENGTH) {
        throw new Error("Orimlig diameter");
    }

    if (!isInteger(spool_diameter) || !isInteger(total_spool_diameter)) {
        throw new Error("Otillåtna värden");
    }

// Validate length to allow decimals
    if (!isNumber(thickness)) {
        throw new Error("Otillåtna värden");
    }

    return true;
}

function calculate_length(spool_diameter, total_spool_diameter, thickness) {
    let length = 0;
    let current_diameter = parseFloat(spool_diameter);
    const added_thickness = thickness * layer; // Total amount of mm added to the diameter per iteration
    let count = 0;
    while (current_diameter < parseFloat(total_spool_diameter)) {
        current_diameter += added_thickness;
        length += current_diameter * Math.PI;
        count++;
    }
    const length_m = (length / 1000).toFixed(2);
    const current_circumference = `${((current_diameter * Math.PI) / 1000).toFixed(2)}`
    document.getElementById('result_label2').innerHTML = 'Längd: ' + length_m + ' ± '  + current_circumference + ' m';
    document.getElementById('count_label2').innerHTML = 'Antal varv: ' + count.toString() + ' st';
}

function tab2_reset() {
    const productOptionSelect = document.getElementById('productOption2');
    productOptionSelect.value = 'no_option';
    // Set the spool diameter to 90
    const spoolDiameterInput = document.getElementById('spool_diameter2');
    spoolDiameterInput.value = 90;

    const inputs = ['totalSpoolDiameter', 'thickness2'];
    inputs.forEach(el => document.getElementById(el).value = '');

    ['totalSpoolDiameterWrapper', 'thicknessWrapper2', 'resultWrapper2'].forEach(el => document.getElementById(el).style.display = 'none');
    document.getElementById('result_label2').innerHTML = '';
    document.getElementById('count_label2').innerHTML = '';

}