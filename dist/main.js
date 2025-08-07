// DOM Element References
const tipCalculatorInputFields = document.querySelectorAll("input[type=number]")

// Core calculator elements
const billInputElement = document.querySelector(".tip-calculator__input-field--dollar");
const peopleInputElement = document.querySelector(".tip-calculator__input-field--person");
const tipButtons = document.querySelectorAll(".tip-calculator__tip-button");
const customTipInput = document.querySelector(".tip-calculator__tip-custom");
const resetButton = document.querySelector(".tip-calculator__reset-button");
const calculationOutputs = document.querySelectorAll("output");
const errorMessageElement = document.querySelector(".tip-calculator__error-message");

// State management variables
let activeTipButton = null;
let currentTipPercentage = 0;

// ==========================================================================
// Input Validation and Formatting
// ==========================================================================

// Add input validation to prevent excessive digits
tipCalculatorInputFields.forEach(inputFieldElement => {
    inputFieldElement.addEventListener("input", (inputEvent) => {
        // Limit input to 12 digits to prevent overflow and maintain performance
        const maximumAllowedDigits = 12
        if (inputFieldElement.value.length > maximumAllowedDigits) {
            inputFieldElement.value = inputFieldElement.value.slice(0, maximumAllowedDigits)
        }
    })
})

// ==========================================================================
// Event Listeners Setup
// ==========================================================================

// Bind input events to calculation function
billInputElement.addEventListener("input", handleCalculationUpdate);
peopleInputElement.addEventListener("input", handleCalculationUpdate);
customTipInput.addEventListener("input", handleCalculationUpdate);

// Bind tip button events
tipButtons.forEach(tipButton => tipButton.addEventListener("click", handleTipButtonSelection));

// Bind reset button event
resetButton.addEventListener("click", handleResetCalculator);

// ==========================================================================
// Core Calculation Functions
// ==========================================================================

/**
 * Main calculation handler - triggered by input changes
 * Validates inputs and updates calculations accordingly
 */
function handleCalculationUpdate() {
    const billAmount = parseFloat(billInputElement.value) || 0;
    const numberOfPeople = parseInt(peopleInputElement.value);

    // Update active tip button reference
    activeTipButton = document.querySelector(".tip-calculator__tip-button--active");

    // Handle custom tip input priority over preset buttons
    if (customTipInput.value) {
        // Remove active state from preset buttons when custom tip is used
        if (activeTipButton) {
            activeTipButton.classList.remove("tip-calculator__tip-button--active");
        }
        currentTipPercentage = parseFloat(customTipInput.value) / 100;
    }

    // Validate people count and show error if needed
    validatePeopleCount(numberOfPeople);

    // Perform calculation if all required data is valid
    if (isCalculationDataValid(billAmount, numberOfPeople, currentTipPercentage)) {
        clearErrorMessage();
        const calculationResults = calculateTipAndTotal(billAmount, numberOfPeople, currentTipPercentage);
        updateCalculationOutputs(calculationResults.tipAmount, calculationResults.totalAmount);
    }
}

/**
 * Handles tip button selection and updates calculation state
 * @param {Event} event - Click event from tip button
 */
function handleTipButtonSelection(event) {
    // Clear custom tip input when preset button is selected
    customTipInput.value = "";

    // Remove active state from previously selected button
    if (activeTipButton) {
        activeTipButton.classList.remove("tip-calculator__tip-button--active");
    }

    // Handle button deselection (clicking same button)
    if (event.target === activeTipButton) {
        activeTipButton = null;
        currentTipPercentage = 1;
    } else {
        // Set new active button and calculate tip percentage
        event.target.classList.add("tip-calculator__tip-button--active");
        activeTipButton = event.target;
        currentTipPercentage = parseFloat(event.target.innerText) / 100;
    }

    // Recalculate with new tip percentage
    handleCalculationUpdate();
}

/**
 * Resets calculator to initial state
 */
function handleResetCalculator() {


    // Remove active state from tip buttons
    if (activeTipButton) {
        activeTipButton.classList.remove("tip-calculator__tip-button--active");
    }

    // Reset state variables
    activeTipButton = null;
    currentTipPercentage = 0;

    // Clear error message
    clearErrorMessage();

    // Reset outputs to default values
    updateCalculationOutputs(0, 0);
}

// ==========================================================================
// Validation and Utility Functions
// ==========================================================================

/**
 * Validates the number of people and displays error if invalid
 * @param {number} peopleCount - Number of people to validate
 */
function validatePeopleCount(peopleCount) {
    if (peopleCount == 0) {
        errorMessageElement.innerText = "Can't be zero";
        errorMessageElement.style.display = "block";
        peopleInputElement.classList.add("tip-calculator__input-field--invalid");
    } else {
        clearErrorMessage();

    }
}

/**
 * Clears the error message display
 */
function clearErrorMessage() {
    errorMessageElement.innerText = "";
    errorMessageElement.style.display = "none";
    peopleInputElement.classList.remove("tip-calculator__input-field--invalid");

}

/**
 * Validates if all required data is present for calculation
 * @param {number} billAmount - Bill amount
 * @param {number} peopleCount - Number of people
 * @param {number} tipPercentage - Tip percentage (0-1)
 * @returns {boolean} - True if all data is valid for calculation
 */
function isCalculationDataValid(billAmount, peopleCount, tipPercentage) {
    return peopleCount > 0 &&
        !isNaN(peopleCount) &&
        !isNaN(billAmount) &&
        billAmount > 0 &&
        tipPercentage > 0;
}

/**
 * Calculates tip amount and total per person
 * @param {number} billAmount - Total bill amount
 * @param {number} peopleCount - Number of people splitting the bill
 * @param {number} tipPercentage - Tip percentage as decimal (0-1)
 * @returns {Object} - Object containing tipAmount and totalAmount per person
 */
function calculateTipAndTotal(billAmount, peopleCount, tipPercentage) {
    const tipAmountPerPerson = (billAmount * tipPercentage) / peopleCount;
    const totalAmountPerPerson = (billAmount + (billAmount * tipPercentage)) / peopleCount;

    return {
        tipAmount: tipAmountPerPerson,
        totalAmount: totalAmountPerPerson
    };
}

/**
 * Updates the calculation output displays with formatted currency values
 * @param {number} tipAmount - Tip amount per person
 * @param {number} totalAmount - Total amount per person
 */
function updateCalculationOutputs(tipAmount, totalAmount) {
    const formattedTipAmount = formatCurrency(tipAmount);
    const formattedTotalAmount = formatCurrency(totalAmount);

    // Update tip amount output (first output element)
    calculationOutputs[0].textContent = formattedTipAmount;

    // Update total amount output (second output element)
    calculationOutputs[1].textContent = formattedTotalAmount;
}

/**
 * Formats a number as currency string with dollar sign and 2 decimal places
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
    return "$" + parseFloat(amount).toFixed(2);
}