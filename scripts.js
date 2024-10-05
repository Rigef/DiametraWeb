let layer = 0;
let welded = false;

function adjustVisibility(choosed_product) {
            // Hide all elements initially
            const hidden_elements = ['lengthWrapper', 'thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'sheetAmountWrapper', 'sheetLengthWrapper', 'submitWrapper'];
            const inputs = ['length', 'thickness', 'huv_amount', 'huv_length', 'sheet_amount', 'sheet_length'];
            hidden_elements.forEach(el => document.getElementById(el).style.display = 'none');
            inputs.forEach(el => document.getElementById(el).value = '');

            document.getElementById('spoolDiameterWrapper').style.display = 'block'; // Bobin diameter always visible.

            document.getElementById('result_label').innerHTML = '';
            document.getElementById('count_label').innerHTML = '';

            // Show elements based on selection
            switch(choosed_product) {
                case 'no_option':
                    layer = 0
                    welded = false;
                    tab1_reset()
                    break;
                case 'foil_option':
                    layer = 2; // 1 layers * 2 sides
                    welded = false;
                    ['lengthWrapper', 'thicknessWrapper', 'submitWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
                    break;
                case 'tube_option':
                    layer = 4; // 2 layers * 2 sides
                    welded = false;
                    ['lengthWrapper', 'thicknessWrapper', 'submitWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
                    break;
                case 'folded_tube_option':
                    layer = 8; // 4 layers * 2 sides
                    welded = false;
                    ['lengthWrapper', 'thicknessWrapper', 'submitWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
                    break;
                case 'huv_option':
                    layer = 4; // 2 layers * 2 sides
                    welded = true;
                    ['thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'submitWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
                    break;
                case 'folded_huv_option':
                    layer = 8; // 4 layers * 2 sides
                    welded = true;
                    ['thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'submitWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
                    break;
                case 'sheet_option':
                    layer = 2; // 1 layers * 2 sides
                    welded = true;
                    ['thicknessWrapper', 'sheetAmountWrapper', 'sheetLengthWrapper', 'submitWrapper'].forEach(el => document.getElementById(el).style.display = 'block');
                    break;
                default:
                    console.log("Unknown selection.");
            }
        }

function m_to_mm(length) {
    return length * 1000;
}

function amount_to_length(amount, product_length) {
    return amount * product_length;
}

function tab1_submit() {
    let input = 0;
    try {
        input = getInputValues()
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

    if (!validateNoneZero(resultObj)) {
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

function getInputValues() {
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
    if (!isInteger(spoolDiameter) || !isInteger(amount) || !isInteger(length)) {
        console.log('One or more fields are not valid integers.');
        throw new Error("Otillåtna värden");
    }

// Validate length to allow decimals
    if (!isNumber(length_m) || !isNumber(thickness)) {
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

    if (validateAllPositive(resultObject)) {
        return resultObject;
    } else {
        throw new Error("Negativa värden är ej tillåtna");
    }
}

// Helper functions to check for integers and numeric values
function isInteger(value) {
    const num = parseInt(value, 10);
    return !isNaN(num) && (num.toString() === value);
}

function isNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
}

function validateAllPositive(obj) {
    for (let key in obj) {
        if (key !== 'selectedValue' && obj[key] < 0) {
            return false;
        }
    }
    return true;
}

function validateNoneZero(obj) {
    for (let key in obj) {
        if (key !== 'selectedValue' && obj[key] <= 0) {
            return false;
        }
    }
    return true;
}

function validateLength(obj) {

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

// Page
window.onload = function () {
    reset_all()
};

function openTab(element, tabName) {
    reset_all();
    // Hide all tab content
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove the "active" class from all tablinks
    var tablinks = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show the selected tab content
    document.getElementById(tabName).style.display = "block";

    // Add the "active" class to the clicked tab
    element.classList.add("active");
}
function reset_all() {
    tab1_reset()
    tab2_reset()
}

function tab1_reset() {
    // Set the spool diameter to 90
    const spoolDiameterInput = document.getElementById('spool_diameter');
    spoolDiameterInput.value = 90;

    // Hide all elements initially
    const wrappers = ['lengthWrapper', 'thicknessWrapper', 'huvAmountWrapper', 'huvLengthWrapper', 'sheetAmountWrapper', 'sheetLengthWrapper'];
    const inputs = ['length', 'thickness', 'huv_amount', 'huv_length', 'sheet_amount', 'sheet_length'];
    const productOptionSelect = document.getElementById('productOption');
    wrappers.forEach(el => document.getElementById(el).style.display = 'none');
    inputs.forEach(el => document.getElementById(el).value = '');
    document.getElementById('submitWrapper').style.display = 'none'; // Make sure to handle submit button visibility correctly.
    productOptionSelect.value = 'no_option';
    document.getElementById('result_label').innerHTML = '';
    document.getElementById('count_label').innerHTML = '';

}





