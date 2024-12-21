function calculateVolume(length, width, thickness) {
    // Dimensions in centimeters
    return length * width * thickness;
}

function getDensity() {
    return 0.923;
}

function toCm(length, fromUnit) {
    const conversions = {
        m: 100, // m * 100 -> cm
        mm: 1/10, // mm * (1/10) -> cm
    };
    return length * (conversions[fromUnit.toLowerCase()] || 1);
}

function toKg(weight, fromUnit) {
    const conversions = {
        g: 1 / 1000, // g / 1000-> kg
        mg: 1 / 1000000, // mg / 1000000 -> kg
    };
    return weight * (conversions[fromUnit.toLowerCase()] || 1);
}

function calculateOrderWeight(length, width, thickness, quantity= 1, isBag = false, isBottomWelded = false) {
    const extra_length = isBottomWelded ? 15 : 0;
    length += extra_length;
    const volume = calculateVolume(toCm(length, 'mm'), toCm(width, 'mm'), toCm(thickness, 'mm'));
    const density = getDensity();
    const multiplier = isBag ? 2 : 1; // Double the volume for bags
    return volume * density * multiplier * quantity;
}

function calculateOrderPerRollWeight(length, width, thickness, quantity= 1, roll_quantity= 1, isBag = false, isBottomWelded = false) {
    const order_weight = calculateOrderWeight(length, width, thickness, quantity, isBag, isBottomWelded);
    return order_weight / roll_quantity;
}

/* Roll calculations */

function calculateRollWeight(rollLength, width, thickness, quantity= 1, isTube= false) {
    const volume = calculateVolume(toCm(rollLength, 'm'), toCm(width, 'mm'), toCm(thickness,'mm')); // Volume in cc
    const density = getDensity();
    const multiplier = isTube ? 2 : 1; // Double the volume for tubes
    console.log("Volume: " + volume);
    console.log("Density: " + density);
    console.log("Multiplier: " + multiplier);
    console.log("Quantity: " + quantity);
    return volume * density * multiplier * quantity;
}