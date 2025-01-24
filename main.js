// Function to save the table data to localStorage
function saveTableData() {
    const tables = document.querySelectorAll("#tablesContainer table");
    const tableData = [];

    tables.forEach((table) => {
        const rows = [];
        table.querySelectorAll("tr").forEach((row) => {
            const cells = [];
            row.querySelectorAll("td").forEach((cell) => {
                cells.push(cell.innerHTML.trim()); // Save innerHTML to preserve formatting
            });
            rows.push(cells);
        });
        tableData.push(rows);
    });

    localStorage.setItem("tableData", JSON.stringify(tableData));
}

function attachClickEventToHeaders(table) {
    const headerCells = table.querySelectorAll("tr:first-child td");
    headerCells.forEach((cell, columnIndex) => {
        cell.addEventListener("click", function () {
            const tableRows = table.querySelectorAll("tr");

            tableRows.forEach((row, rowIndex) => {
                const columnCell = row.children[columnIndex];
                if (columnCell) {
                    const currentColor = window.getComputedStyle(columnCell).backgroundColor;
                    const newColor = currentColor === "rgb(243, 243, 243)" ? "rgb(253, 253, 253)" : "rgb(243, 243, 243)";
                    columnCell.style.backgroundColor = newColor;

                    // Save the state in localStorage
                    const tableClass = table.classList[0];
                    const cellKey = `${tableClass}_r${rowIndex}_c${columnIndex}`;
                    localStorage.setItem(cellKey, newColor);
                }
            });
        });
    });
}

function loadTableData() {
    const container = document.getElementById("tablesContainer");
    const savedData = localStorage.getItem("tableData");

    if (!savedData) return; // If no saved data, exit

    const tableData = JSON.parse(savedData);

    // Clear existing tables
    container.innerHTML = "";

    tableData.forEach((rows, index) => {
        const table = document.createElement("table");
        table.classList.add(`table${index + 1}`);

        rows.forEach((rowData, rowIndex) => {
            const row = document.createElement("tr");
            rowData.forEach((cellData, colIndex) => {
                const cell = document.createElement("td");
                cell.innerHTML = cellData; // Restore innerHTML to preserve formatting

                if (rows.indexOf(rowData) === 2) {
                    cell.contentEditable = "true"; // Make cell editable
                    cell.style.textTransform = "uppercase";
                    cell.style.fontWeight = "bold";
                    cell.style.textAlign = "right";
                }

                // Restore background color from localStorage
                const tableClass = `table${index + 1}`;
                const cellKey = `${tableClass}_r${rowIndex}_c${colIndex}`;
                const savedColor = localStorage.getItem(cellKey);
                if (savedColor) {
                    cell.style.backgroundColor = savedColor;
                }

                row.appendChild(cell);
            });
            table.appendChild(row);
        });

        // Attach event listeners to the first row
        attachClickEventToHeaders(table);

        container.appendChild(table);
    });
}

// Save form data and table data on form submission
document.querySelectorAll(".monthForm").forEach((form, formIndex) => {
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const formId = formIndex + 1; // Unique identifier for each form
        const days = parseInt(document.getElementById(`daysInput${formId}`).value);
        const startDayLetter = document.getElementById(`startDay${formId}`).value;
        const monthNumber = String(document.getElementById(`monthNumber${formId}`).value).padStart(2, "0");
        const container = document.getElementById("tablesContainer");

        const rowsNeeded = Math.ceil(days / 7); // Number of rows required for the table
        let currentDay = 1; // Initialize the day counter
        const headers = ["S", "s", "M", "T", "W", "R", "F"]; // Weekday headers
        const startIndex = headers.indexOf(startDayLetter); // Index of the starting day

        if (startIndex === -1) {
            alert("Invalid starting day. Please enter a valid day: S, M, T, W, or F.");
            return;
        }

        // Create a new table for this form
        const table = document.createElement("table");
        table.classList.add(`table${formId}`); // Add a unique class to the table

        for (let i = 0; i < rowsNeeded; i++) {
            const table = document.createElement("table");
            table.classList.add(`table${i + 1}`);
    
            for (let j = 0; j < 3; j++) {
                const row = document.createElement("tr");
    
                for (let k = 0; k < 7; k++) {
                    const cell = document.createElement("td");
    
                    if (j === 0) {
                        // Populate first row with the sequence 'S', 'S', 'M', 'T', 'W', 'F'
                        // Populate the first row with headers, converting to uppercase for consistency
                        cell.textContent = headers[k].toUpperCase();
                        cell.style.cursor = "pointer";
    
                        // Add click event for cycling column background color
                        cell.addEventListener("click", function () {
                            const columnIndex = k; // Index of the clicked column
                            const tableRows = table.querySelectorAll("tr");
                        
                            tableRows.forEach((row) => {
                                const columnCell = row.children[columnIndex];
                                if (columnCell) {
                                    const currentColor = window.getComputedStyle(columnCell).backgroundColor;
                                    // Toggle background color
                                    columnCell.style.backgroundColor =
                                        currentColor === "rgb(243, 243, 243)" ? "rgb(253, 253, 253)" : "rgb(243, 243, 243)";
                                }
                            });
                        });
                    } else if (j === 1) {
                        // Populate second row with day numbers followed by "/mm"
                        if (i === 0 && k < startIndex) {
                            // Leave cells blank to the left of the starting index
                            cell.textContent = "";
                        } else if (currentDay <= days) {
                            // Fill cells with day numbers followed by "/mm"
                            cell.textContent = `${currentDay}/${monthNumber}`;
                            currentDay++;
                        } else if (currentDay > days) {
                            // Leave cells blank after the last day of the month
                            cell.textContent = "";
                        }
                    } else if (j === 2) {
                        // Populate third row with empty <td> elements with attributes for capitalization, bolding, and right alignment
                        cell.contentEditable = "true"; // Make cell editable
                        cell.style.textTransform = "uppercase"; // Ensure capitalization
                        cell.style.fontWeight = "bold"; // Ensure bolding
                        cell.style.textAlign = "right"; // Right-align text
                        cell.textContent = ""; // Initially empty
                    }
                    row.appendChild(cell);
                }
                table.appendChild(row);
            }
            container.appendChild(table);
        }
    
        // Save the updated table data to localStorage
        saveTableData();

        // Clear the form fields
        form.reset();
    });
});

// Save table data on any cell change
document.getElementById("tablesContainer").addEventListener("input", function () {
    saveTableData();
});

// Load saved input values and table data when the page loads
window.addEventListener("load", function () {
    loadFormData();
    loadTableData();
});

function saveFormData() {
    document.querySelectorAll(".monthForm").forEach((form, index) => {
        const formId = index + 1; // Unique identifier for each form
        const days = document.getElementById(`daysInput${formId}`).value;
        const startDay = document.getElementById(`startDay${formId}`).value;
        const monthNumber = document.getElementById(`monthNumber${formId}`).value;

        localStorage.setItem(`daysInput${formId}`, days);
        localStorage.setItem(`startDay${formId}`, startDay);
        localStorage.setItem(`monthNumber${formId}`, monthNumber);
    });
}

function loadFormData() {
    document.querySelectorAll(".monthForm").forEach((form, index) => {
        const formId = index + 1; // Unique identifier for each form
        const days = localStorage.getItem(`daysInput${formId}`);
        const startDay = localStorage.getItem(`startDay${formId}`);
        const monthNumber = localStorage.getItem(`monthNumber${formId}`);

        if (days) document.getElementById(`daysInput${formId}`).value = days;
        if (startDay) document.getElementById(`startDay${formId}`).value = startDay;
        if (monthNumber) document.getElementById(`monthNumber${formId}`).value = monthNumber;
    });
}


// Reset form and table data
document.getElementById("resetButton").addEventListener("click", function () {
    // Clear form inputs for all forms
    document.querySelectorAll(".monthForm").forEach((form, index) => {
        const formId = index + 1; // Unique identifier for each form
        document.getElementById(`daysInput${formId}`).value = "";
        document.getElementById(`startDay${formId}`).value = "";
        document.getElementById(`monthNumber${formId}`).value = "";

        // Clear corresponding local storage keys
        localStorage.removeItem(`daysInput${formId}`);
        localStorage.removeItem(`startDay${formId}`);
        localStorage.removeItem(`monthNumber${formId}`);
    });

    // Clear table data from local storage
    localStorage.removeItem("tableData");

    // Clear tables
    document.getElementById("tablesContainer").innerHTML = "";

    alert("All calendars and form data have been reset!");
});