/*
基本DOM
================================================ */
const side = document.querySelector('#side')
const entry = document.querySelector('#entry')
const exit = document.querySelector('#exit')
const qty = document.querySelector('#qty')
const fee = document.querySelector('#fee')
const target = document.querySelector('#target')
const result = document.querySelector('#result')
/*
分割エントリーDOM
================================================ */
const entryList = document.querySelector('#entry-list')
const splitCheckbox = document.querySelector('#split-checkbox')
const splitPanel = document.querySelector('#split-panel')
const addEntryBtn = document.querySelector('#add-entry-btn')
const splitStatus = document.querySelector('#split-status')
const sumQty = document.querySelector('#sum-qty')
const entryAvg = document.querySelector('#entry-avg')
/*
関数定義
================================================ */
const formatNumber = (n, d = 6) => {
    return isFinite(n) ? Number(n).toLocaleString(undefined, { maximumFractionDigits: d }) : '0'
}

const recalc = () => {
    const e = parseFloat(entry.value) || 0
    const x = parseFloat(exit.value) || 0
    const q = parseFloat(qty.value) || 0
    const f = (parseFloat(fee.value) || 0) / 100
    const t = (parseFloat(target.value) || 0) / 100

    const notionalEntry = e * q
    const notionalExit = x * q
    const grossPnL = side.value === 'long' ? (x - e) * q : (e - x) * q
    const feeAmt = (notionalEntry + notionalExit) * f
    const netPnL = grossPnL - feeAmt
    const netReturn = notionalEntry ? (netPnL / notionalEntry) * 100 : 0
    const breakeven = side.value === 'long' ? (e * (1 + f)) / (1 - f) : (e * (1 - f)) / (1 + f)
    const targetExitVal = side.value === 'long' ? (e * (t + 1 + f)) / (1 - f) : (e * (1 - f - t)) / (1 + f)

    const resultHtml = `
        <div>ポジション数量: <strong>${formatNumber(q, 8)}</strong></div>
        <div>評価額(エントリー時): <strong>${formatNumber(notionalEntry, 2)}</strong></div>
        <div>評価額(エグジット時): <strong>${formatNumber(notionalExit, 2)}</strong></div>
        <div>粗損益: <strong>${formatNumber(grossPnL, 2)}</strong></div>
        <div>手数料合計: <strong>${formatNumber(feeAmt, 2)}</strong></div>
        <div class="${netPnL > 0 ? 'profit' : netPnL < 0 ? 'loss' : ''}">純損益: <strong>${formatNumber(
        netPnL,
        2
    )}</strong>（${formatNumber(netReturn, 2)}%）</div>
        <div>損益分岐エグジット: <strong>${formatNumber(breakeven, 2)}</strong></div>
        <div>目標利回り(${formatNumber(t * 100, 2)}%)エグジット: <strong>${formatNumber(
        targetExitVal,
        2
    )}</strong></div>
    `

    result.textContent = ''
    result.insertAdjacentHTML('beforeend', resultHtml)
}

const updateSplit = () => {
    const rows = [...entryList.children]
    let totalQty = 0,
        totalVal = 0
    rows.forEach((r) => {
        const q = parseFloat(r.children[0].querySelector('input').value) || 0
        const p = parseFloat(r.children[1].querySelector('input').value) || 0
        totalQty += q
        totalVal += q * p
    })
    const avg = totalQty ? totalVal / totalQty : 0
    sumQty.textContent = '合計数量: ' + formatNumber(totalQty, 8)
    entryAvg.textContent = '平均参入価格: ' + (avg ? formatNumber(avg, 2) : '-')

    if (splitCheckbox.checked) {
        entry.value = avg ? avg.toFixed(2) : ''
        qty.value = totalQty ? totalQty.toFixed(8) : ''
    }
    recalc()
}

const addPos = (q = '', p = '') => {
    const splitEntryRowHtml = `
        <div class="split-entry-row">
            <fieldset>
                <legend>数量</legend>
                <input class="split-qty" type="number" value="${q}" placeholder="例: 100" />
            </fieldset>
            <fieldset>
                <legend>価格</legend>
                <input class="split-price" type="number" value="${p}" placeholder="例: 380.9" />
            </fieldset>
            <button class="split-del-btn">✕</button>
        </div>
    `
    entryList.insertAdjacentHTML('beforeend', splitEntryRowHtml)

    const newRow = entryList.lastElementChild
    const splitQty = newRow.querySelector('.split-qty')
    const splitPrice = newRow.querySelector('.split-price')
    const splitDelBtn = newRow.querySelector('.split-del-btn')

    splitQty.addEventListener('input', updateSplit)
    splitPrice.addEventListener('input', updateSplit)
    splitDelBtn.addEventListener('click', () => {
        newRow.remove()
        updateSplit()
    })

    updateSplit()
}

const handleSplitToggle = (e) => {
    const on = e.target.checked
    splitPanel.style.display = on ? 'flex' : 'none'
    splitPanel.setAttribute('aria-hidden', (!on).toString())
    splitStatus.style.display = on ? 'flex' : 'none'

    if (on && entryList.children.length === 0) {
        addPos('', '')
        addPos('', '')
    } else if (!on) {
        entryList.innerHTML = ''
    }
    recalc()
}
/*
初回
================================================ */
recalc()
/*
イベントリスナー
================================================ */
splitCheckbox.addEventListener('change', handleSplitToggle)
addEntryBtn.addEventListener('click', addPos)

side.addEventListener('change', recalc)
entry.addEventListener('input', recalc)
exit.addEventListener('input', recalc)
qty.addEventListener('input', recalc)
fee.addEventListener('input', recalc)
target.addEventListener('input', recalc)
