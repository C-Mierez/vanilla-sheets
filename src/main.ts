import "./style.css";
import { $, range, toASCII } from "./utils";

// Spreadsheet dimensions
const COLUMNS = 26;
const ROWS = 40;

// Spreadsheet state
type Cell = {
    inputValue: string;
    computedValue: string;
};

let STATE: Cell[][];

// Spreadsheet elements
const $table = $("table") as HTMLTableElement;
const $thead = $("thead") as HTMLTableSectionElement;
const $tbody = $("tbody") as HTMLTableSectionElement;

function start() {
    createState();
    renderSpreadsheet();
    bindEvents();
}

function createState() {
    STATE = range(ROWS).map((_) => range(COLUMNS).map((_) => ({ inputValue: "", computedValue: "" })));
}

// Create the spreadsheet
function renderSpreadsheet() {
    if (!$table || !$thead || !$tbody) return;

    const headerHTML = `<tr>
        <th></th>
        ${range(COLUMNS)
            .map((i) => `<th>${toASCII(i).toUpperCase()}</th>`)
            .join("")}
    </tr>`;

    const bodyHTML = `${range(ROWS)
        .map(
            (i) => `<tr>
            <td>${i + 1}</td>
            ${range(COLUMNS)
                .map(
                    (j) => `<td data-x="${i}" data-y="${j}">
                    <span>${STATE[i][j].computedValue}</span>
                    <input type="text" value="${STATE[i][j].inputValue}" />
                </td>`
                )
                .join("")}
        </tr>`
        )
        .join("")}`;

    $thead.innerHTML = headerHTML;
    $tbody.innerHTML = bodyHTML;
}

function bindEvents() {
    if (!$table || !$thead || !$tbody) return;

    $tbody.addEventListener("dblclick", (event: MouseEvent) => {
        const $span = event.target as HTMLSpanElement;
        if (!$span) return;

        const $td = $span.closest("td") as HTMLTableCellElement;
        if (!$td) return;

        const $input = $td.querySelector("input") as HTMLInputElement;
        if (!$input) return;

        // Set the cursor position to the end of the input
        const inputEnd = $input.value.length;
        $input.setSelectionRange(inputEnd, inputEnd);
        $input.focus();

        // Update the cell value after the user has finished editing
        $input.addEventListener(
            "blur",
            () => {
                const { x, y } = $td.dataset;
                if (!x || !y) return;

                if ($input.value === STATE[Number(x)][Number(y)].inputValue) return;

                updateCell({
                    x: Number(x),
                    y: Number(y),
                    value: $input.value,
                });
            },
            { once: true }
        );

        // Handle the Enter key for blurring the input
        const handleEnterKey = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                $input.blur();
                $input.removeEventListener("keydown", handleEnterKey);
            }
        };
        $input.addEventListener("keydown", handleEnterKey);
    });
}

function updateCell({ x, y, value }: { x: number; y: number; value: string }) {
    const newState = structuredClone(STATE);

    const cell = newState[x][y];

    cell.inputValue = value;
    cell.computedValue = _computeValue(value).toString();

    newState[x][y] = cell;
    STATE = newState;

    renderSpreadsheet();
}

// Formula evaluation using eval()
// This is not meant to be used in a production environment and is only for demonstration purposes.
function _computeValue(value: string) {
    if (!value.startsWith("=")) return value;

    const formula = value.substring(1);
    try {
        return eval(`
        (() => {
            ${_createCellInjections()}
            return ${formula};
        })()    
        `);
    } catch (error) {
        return `!SYNTAX-ERROR: ${error}!`;
    }
}

function _createCellInjections(): string {
    return STATE.map((row, y) =>
        row.map((cell, x) => `const ${toASCII(x).toUpperCase()}${y + 1} = ${cell.computedValue || null};`).join("\n")
    ).join("\n");
}

start();
