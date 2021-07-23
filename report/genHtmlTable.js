/**
 * 生成Html的Table
 */

export function genHtmlTable(columns, records){

    let tableHtml = "";
    tableHtml += `<table border="1">`;

    let fields = [];
    tableHtml += `<tr>`;
    for (const col of columns) {
        tableHtml += `<th>${col.caption}</th>`;
        fields.push(col.field);
    }
    tableHtml += `</tr>`;

    for (const rr of records) {
        tableHtml += `<tr>`;
        for (const ff of fields) {
            tableHtml += `<td>${rr.render ? rr.render(rr) : rr[ff]}</td>`;
        }
        tableHtml += `</tr>`;
    }

    tableHtml += `</table>`;
    return tableHtml;
}