let layer = 0;
let welded = false;


function m_to_mm(length) {
    return length * 1000;
}

function amount_to_length(amount, product_length) {
    return amount * product_length;
}

// Helper functions to check for integers and numeric values
function is_integer(value) {
    const num = parseInt(value, 10);
    return !isNaN(num) && (num.toString() === value);
}

function is_number(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
}

function validate_all_positive(obj) {
    for (let key in obj) {
        if (key !== 'selectedValue' && obj[key] < 0) {
            return false;
        }
    }
    return true;
}

function validate_none_zero(obj) {
    for (let key in obj) {
        if (key !== 'selectedValue' && obj[key] <= 0) {
            return false;
        }
    }
    return true;
}

// On Refresh page
window.onload = function () {
    reset_all()
};

function open_tab(element, tabName) {
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







