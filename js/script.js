function fmt(n, d = 6) {
    return isFinite(n) ? Number(n).toLocaleString(undefined, { maximumFractionDigits: d }) : "0";
}

const posListEl = document.getElementById("posList");
const splitCheck = document.getElementById("splitCheck");
const splitPanel = document.getElementById("splitPanel");
const splitStatus = document.getElementById("splitStatus");
const splitQtyEl = document.getElementById("splitQty");
const splitAvgEl = document.getElementById("splitAvg");

function onToggleSplit(e) {
    const on = e.target.checked;
    splitPanel.style.display = on ? "flex" : "none";
    splitPanel.setAttribute("aria-hidden", (!on).toString());
    splitStatus.style.display = on ? "flex" : "none";

    if (on && posListEl.children.length === 0) {
        addPos("", "");
        addPos("", "");
    } else if (!on) {
        posListEl.innerHTML = "";
    }
    recalc();
}

function addPos(q = "", p = "") {
    const row = document.createElement("div");
    row.className = "pos-row";

    const qtyField = document.createElement("fieldset");
    const qtyLegend = document.createElement("legend");
    qtyLegend.textContent = "数量";
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.placeholder = "例: 100";
    qtyInput.value = q;
    qtyInput.oninput = updateSplit;
    qtyField.append(qtyLegend, qtyInput);

    const priceField = document.createElement("fieldset");
    const priceLegend = document.createElement("legend");
    priceLegend.textContent = "価格";
    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.placeholder = "例: 380.9";
    priceInput.value = p;
    priceInput.oninput = updateSplit;
    priceField.append(priceLegend, priceInput);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn-small";
    del.innerHTML = "✕";
    del.onclick = () => {
        row.remove();
        updateSplit();
    };

    row.append(qtyField, priceField, del);
    row.style.justifyContent = "space-between";
    posListEl.append(row);
    updateSplit();
}

function updateSplit() {
    const rows = [...posListEl.children];
    let totalQty = 0,
        totalVal = 0;
    rows.forEach((r) => {
        const q = parseFloat(r.children[0].querySelector("input").value) || 0;
        const p = parseFloat(r.children[1].querySelector("input").value) || 0;
        totalQty += q;
        totalVal += q * p;
    });
    const avg = totalQty ? totalVal / totalQty : 0;
    splitQtyEl.textContent = "合計数量: " + fmt(totalQty, 8);
    splitAvgEl.textContent = "平均取得単価: " + (avg ? fmt(avg, 2) : "-");

    if (splitCheck.checked) {
        document.getElementById("entry").value = avg ? avg.toFixed(2) : "";
        document.getElementById("qty").value = totalQty ? totalQty.toFixed(8) : "";
    }
    recalc();
}

function onManualEntryChange() {
    if (!splitCheck.checked) recalc();
}
function onManualQtyChange() {
    if (!splitCheck.checked) recalc();
}

function recalc() {
    const side = document.getElementById("side").value;
    const e = parseFloat(document.getElementById("entry").value) || 0;
    const x = parseFloat(document.getElementById("exit").value) || 0;
    const q = parseFloat(document.getElementById("qty").value) || 0;
    const f = (parseFloat(document.getElementById("fee").value) || 0) / 100;
    const t = (parseFloat(document.getElementById("target").value) || 0) / 100;

    const notionalEntry = e * q;
    const notionalExit = x * q;
    const grossPnL = side === "long" ? (x - e) * q : (e - x) * q;
    const feeAmt = (notionalEntry + notionalExit) * f;
    const netPnL = grossPnL - feeAmt;
    const netReturn = notionalEntry ? (netPnL / notionalEntry) * 100 : 0;
    const breakeven = side === "long" ? (e * (1 + f)) / (1 - f) : (e * (1 - f)) / (1 + f);
    const targetExitVal = side === "long" ? (e * (t + 1 + f)) / (1 - f) : (e * (1 - f - t)) / (1 + f);

    const out = document.getElementById("result");
    out.innerHTML = `
    <div>ポジション数量: <strong>${fmt(q, 8)}</strong></div>
    <div>評価額(エントリー時): <strong>${fmt(notionalEntry, 2)}</strong></div>
    <div>評価額(エグジット時): <strong>${fmt(notionalExit, 2)}</strong></div>
    <div>粗損益: <strong>${fmt(grossPnL, 2)}</strong></div>
    <div>手数料合計: <strong>${fmt(feeAmt, 2)}</strong></div>
    <div class="${netPnL > 0 ? "profit" : netPnL < 0 ? "loss" : ""}">純損益: <strong>${fmt(netPnL, 2)}</strong>（${fmt(
        netReturn,
        2
    )}%）</div>
    <div>損益分岐エグジット: <strong>${fmt(breakeven, 2)}</strong></div>
    <div>目標利回り(${fmt(t * 100, 2)}%)エグジット: <strong>${fmt(targetExitVal, 2)}</strong></div>`;
}

// 初期計算
recalc();
