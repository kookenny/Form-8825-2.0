import React, { useState } from 'react'
import './Form8825v2.css'

interface Form8825v2Props {
  onBack?: () => void
  onNavigateToEngagementSetup?: () => void
  onNavigateToAssignment?: () => void
  onNavigateToTaxAdjustment?: () => void
  onNavigateToTaxGroups?: () => void
  onNavigateToForm8825?: () => void
  numberOfProperties?: number
  propertyDetails?: Array<{
    property: string
    propertyId: string
    propertyName: string
  }>
  accountData?: Array<{
    number: string
    name: string
    amount2023: string
    amount2022: string
    taxGroup: string
    property: string
  }>
  scheduleData?: Array<{
    schedule: string
    group: string
    amount: string
    property: string
    adjustmentType?: string
  }>
  customTaxGroups?: Array<{
    code: string
    name: string
    parentCode: string
  }>
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

const lineItems = [
  { line: '02', description: 'Gross rents' },
  { line: '03', description: 'Advertising' },
  { line: '04', description: 'Auto and travel' },
  { line: '05', description: 'Cleaning and maintenance' },
  { line: '06', description: 'Commissions' },
  { line: '07', description: 'Insurance' },
  { line: '08', description: 'Legal and other professional fees' },
  { line: '09', description: 'Interest' },
  { line: '10', description: 'Repairs' },
  { line: '11', description: 'Taxes' },
  { line: '12', description: 'Utilities' },
  { line: '13', description: 'Wages and salaries' },
  { line: '14', description: 'Depreciation' },
  { line: '15', description: 'Other' },
]

function formatAmountToWholeNumber(amount: string) {
  if (!amount || amount.trim() === '') return ''
  const isNegative = amount.includes('(') && amount.includes(')')
  const cleanAmount = amount.replace(/[(),\s]/g, '')
  const numericValue = parseFloat(cleanAmount)
  if (isNaN(numericValue) || numericValue === 0) return ''
  const finalValue = isNegative ? -Math.abs(numericValue) : numericValue
  if (finalValue < 0) return `(${Math.round(Math.abs(finalValue))})`
  return Math.round(finalValue).toString()
}

function parseAmount(amount: string) {
  if (!amount || amount.trim() === '') return 0
  const isNegative = amount.includes('(') && amount.includes(')')
  const cleanAmount = amount.replace(/[(),\s]/g, '')
  const numericValue = parseFloat(cleanAmount) || 0
  return isNegative ? -numericValue : numericValue
}

function sumAmounts(...amounts: string[]) {
  const total = amounts.reduce((sum, a) => sum + parseAmount(a), 0)
  if (total === 0 && amounts.every(a => !a || a.trim() === '')) return ''
  return total < 0 ? `(${Math.abs(total)})` : total.toString()
}

// ─── Single-property detail view ─────────────────────────────────────────────

interface DetailTabProps {
  propertyCount: number
  propertyDetails: Form8825v2Props['propertyDetails']
  accountData: Form8825v2Props['accountData']
  scheduleData: Form8825v2Props['scheduleData']
  customTaxGroups: Form8825v2Props['customTaxGroups']
}

function DetailTab({ propertyCount, propertyDetails = [], accountData = [], scheduleData = [], customTaxGroups = [] }: DetailTabProps) {
  const [selectedPropertyIndex, setSelectedPropertyIndex] = useState(0)

  // ── helpers ──────────────────────────────────────────────────────────────

  const getPropertyDisplayText = (idx: number) => {
    const num = idx + 1
    const p = propertyDetails[idx]
    if (!p?.propertyId) return `Property ${num}`
    let text = `${num}-${p.propertyId}`
    if (p.propertyName?.trim()) text += ` (${p.propertyName})`
    return text
  }

  const getChildrenGroups = (parentLine: string) => {
    const parentCode = `8825.${parentLine}`
    const allChildren = customTaxGroups.filter(g => g.parentCode === parentCode)
    if (allChildren.length === 0) return []
    const unique: Record<string, any> = {}
    allChildren.forEach(child => {
      const key = `${child.code}-${child.name}`.toLowerCase().trim()
      if (!unique[key]) unique[key] = { ...child, count: 1, isCustom: true }
      else unique[key].count++
    })
    const defaultChild = {
      code: `${parentCode}.00`,
      name: `Parent-level ${parentLine}`,
      parentCode,
      count: 1,
      isCustom: false,
      isDefault: true,
    }
    return [defaultChild, ...Object.values(unique)]
  }

  const getOpeningAmount = (line: string, propertyNum: number, isChild = false, childCode = '') => {
    const targetTaxGroup = isChild && childCode ? childCode : `8825.${line}`
    const pDisplayText = getPropertyDisplayText(propertyNum - 1)
    const matching = accountData.filter(account => {
      const tg = account.taxGroup
      const prop = account.property
      if (!tg || !prop) return false
      const pm = prop === pDisplayText || prop === propertyNum.toString()
      if (!pm) return false
      const eq = (a: string, b: string) => a.trim() === b.trim() || a.trim().startsWith(b.trim() + ' ')
      if (isChild && childCode.endsWith('.00')) {
        return eq(tg, childCode.replace('.00', ''))
      } else if (!isChild) {
        return eq(tg, targetTaxGroup) || tg.trim().startsWith(targetTaxGroup + '.')
      } else {
        return eq(tg, targetTaxGroup)
      }
    })
    if (matching.length === 0) return ''
    if (matching.length === 1) return formatAmountToWholeNumber(matching[0].amount2023)
    const total = matching.reduce((s, a) => {
      const v = formatAmountToWholeNumber(a.amount2023)
      const n = parseFloat(v.replace(/[(),]/g, '')) || 0
      return s + (v.includes('(') ? -n : n)
    }, 0)
    return total < 0 ? `(${Math.abs(total)})` : total.toString()
  }

  const getAdjustmentAmount = (line: string, propertyNum: number, isChild = false, childCode = '') => {
    const targetTaxGroup = isChild && childCode ? childCode : `8825.${line}`
    const pDisplayText = getPropertyDisplayText(propertyNum - 1)
    const matching = scheduleData.filter(entry => {
      const tg = entry.group
      const prop = entry.property
      const sm = entry.schedule === '8825'
      if (!sm || !tg || !prop) return false
      const pm = prop === pDisplayText || prop === propertyNum.toString()
      if (!pm) return false
      const eq = (a: string, b: string) => a.trim() === b.trim() || a.trim().startsWith(b.trim() + ' ')
      if (isChild && childCode.endsWith('.00')) {
        return eq(tg, childCode.replace('.00', ''))
      } else if (!isChild) {
        return eq(tg, targetTaxGroup) || tg.trim().startsWith(targetTaxGroup + '.')
      } else {
        return eq(tg, targetTaxGroup)
      }
    })
    if (matching.length === 0) return ''
    if (matching.length === 1) return formatAmountToWholeNumber(matching[0].amount)
    const total = matching.reduce((s, e) => {
      const v = formatAmountToWholeNumber(e.amount)
      const n = parseFloat(v.replace(/[(),]/g, '')) || 0
      return s + (v.includes('(') ? -n : n)
    }, 0)
    return total < 0 ? `(${Math.abs(total)})` : total.toString()
  }

  const getTaxReclassifyingAmount = (line: string, propertyNum: number, isChild = false, childCode = '') =>
    getAdjustmentAmount(line, propertyNum, isChild, childCode)

  const getBookToTaxAmount = (_line: string, _propertyNum: number, _isChild = false, _childCode = '') => ''

  const propNum = selectedPropertyIndex + 1

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="v2-detail-tab">
      {/* Property selector */}
      <div className="v2-property-selector">
        <label htmlFor="property-select" className="v2-property-label">Property:</label>
        <select
          id="property-select"
          className="v2-property-dropdown"
          value={selectedPropertyIndex}
          onChange={e => setSelectedPropertyIndex(Number(e.target.value))}
        >
          {Array.from({ length: propertyCount }, (_, i) => (
            <option key={i} value={i}>{getPropertyDisplayText(i)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="v2-table-container">
        <table className="v2-table">
          <thead>
            <tr className="v2-header-row">
              <th className="v2-line-col">Line</th>
              <th className="v2-desc-col">Description</th>
              <th className="v2-amount-col">Final financial<br />balances</th>
              <th className="v2-amount-col v2-tax-reclass-col">Tax<br />reclassifying</th>
              <th className="v2-amount-col v2-adj-financial-col">Adjusted financial<br />balances</th>
              <th className="v2-amount-col v2-book-tax-col">Book-to-tax<br />reconciliation</th>
              <th className="v2-amount-col v2-final-tax-col">Final tax<br />balances</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map(item => {
              const children = getChildrenGroups(item.line)
              const openingAmt = getOpeningAmount(item.line, propNum)
              const taxReclassAmt = getTaxReclassifyingAmount(item.line, propNum)
              const adjFinancial = sumAmounts(openingAmt, taxReclassAmt)
              const bookToTaxAmt = getBookToTaxAmount(item.line, propNum)
              const finalTax = sumAmounts(adjFinancial, bookToTaxAmt)

              return (
                <React.Fragment key={item.line}>
                  <tr className="v2-row">
                    <td className="v2-line-cell">{item.line}</td>
                    <td className="v2-desc-cell">{item.description}</td>
                    {/* Final financial balances */}
                    <td className="v2-amount-cell">
                      <input type="text" className="v2-input v2-financial-input" defaultValue={openingAmt} />
                    </td>
                    {/* Tax reclassifying */}
                    <td className="v2-amount-cell">
                      <input type="text" className="v2-input v2-tax-reclass-input" defaultValue={taxReclassAmt} />
                    </td>
                    {/* Adjusted financial balances */}
                    <td className="v2-amount-cell">
                      <input type="text" className="v2-input v2-adj-financial-input" defaultValue={adjFinancial} />
                    </td>
                    {/* Book-to-tax reconciliation */}
                    <td className="v2-amount-cell">
                      <input type="text" className="v2-input v2-book-tax-input" defaultValue={bookToTaxAmt} />
                    </td>
                    {/* Final tax balances */}
                    <td className="v2-amount-cell">
                      <input type="text" className="v2-input v2-final-tax-input" defaultValue={finalTax} />
                    </td>
                  </tr>

                  {children.map((child, ci) => {
                    const childCode = child.isDefault ? `8825.${item.line}.00` : child.code
                    const cOpen = getOpeningAmount(item.line, propNum, true, childCode)
                    const cTaxReclass = getTaxReclassifyingAmount(item.line, propNum, true, childCode)
                    const cAdjFin = sumAmounts(cOpen, cTaxReclass)
                    const cBookToTax = getBookToTaxAmount(item.line, propNum, true, childCode)
                    const cFinalTax = sumAmounts(cAdjFin, cBookToTax)

                    return (
                      <tr key={`${item.line}-c-${ci}`} className={`v2-row v2-child-row ${child.isDefault ? 'v2-default-child' : ''}`}>
                        <td className="v2-line-cell v2-child-line">
                          {child.isDefault ? '00' : child.code.split('.').pop()}
                        </td>
                        <td className="v2-desc-cell v2-child-desc">
                          {child.isDefault ? `Parent-level ${item.line}` : `  ${child.name}`}
                        </td>
                        <td className="v2-amount-cell">
                          <input type="text" className="v2-input v2-financial-input" defaultValue={cOpen} />
                        </td>
                        <td className="v2-amount-cell">
                          <input type="text" className="v2-input v2-tax-reclass-input" defaultValue={cTaxReclass} />
                        </td>
                        <td className="v2-amount-cell">
                          <input type="text" className="v2-input v2-adj-financial-input" defaultValue={cAdjFin} />
                        </td>
                        <td className="v2-amount-cell">
                          <input type="text" className="v2-input v2-book-tax-input" defaultValue={cBookToTax} />
                        </td>
                        <td className="v2-amount-cell">
                          <input type="text" className="v2-input v2-final-tax-input" defaultValue={cFinalTax} />
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Summary view (all properties, Final tax balances only) ──────────────────

interface SummaryTabProps {
  propertyCount: number
  propertyDetails: Form8825v2Props['propertyDetails']
  accountData: Form8825v2Props['accountData']
  scheduleData: Form8825v2Props['scheduleData']
  customTaxGroups: Form8825v2Props['customTaxGroups']
}

function SummaryTab({ propertyCount, propertyDetails = [], accountData = [], scheduleData = [], customTaxGroups = [] }: SummaryTabProps) {

  const getPropertyDisplayText = (idx: number) => {
    const num = idx + 1
    const p = propertyDetails[idx]
    if (!p?.propertyId) return `Property ${num}`
    let text = `${num}-${p.propertyId}`
    if (p.propertyName?.trim()) text += ` (${p.propertyName})`
    return text
  }

  const getChildrenGroups = (parentLine: string) => {
    const parentCode = `8825.${parentLine}`
    const allChildren = customTaxGroups.filter(g => g.parentCode === parentCode)
    if (allChildren.length === 0) return []
    const unique: Record<string, any> = {}
    allChildren.forEach(child => {
      const key = `${child.code}-${child.name}`.toLowerCase().trim()
      if (!unique[key]) unique[key] = { ...child, count: 1, isCustom: true }
      else unique[key].count++
    })
    const defaultChild = { code: `${parentCode}.00`, name: `Parent-level ${parentLine}`, parentCode, count: 1, isCustom: false, isDefault: true }
    return [defaultChild, ...Object.values(unique)]
  }

  const getOpeningAmount = (line: string, propertyNum: number, isChild = false, childCode = '') => {
    const targetTaxGroup = isChild && childCode ? childCode : `8825.${line}`
    const pDisplayText = getPropertyDisplayText(propertyNum - 1)
    const matching = accountData.filter(account => {
      const tg = account.taxGroup
      const pm = account.property === propertyNum.toString() || account.property === `Property ${propertyNum}` || account.property === pDisplayText
      if (!tg || !pm) return false
      const eq = (a: string, b: string) => a.trim() === b.trim() || a.trim().startsWith(b.trim() + ' ')
      if (isChild && childCode.endsWith('.00')) return eq(tg, childCode.replace('.00', ''))
      else if (!isChild) return eq(tg, targetTaxGroup) || tg.trim().startsWith(targetTaxGroup + '.')
      else return eq(tg, targetTaxGroup)
    })
    if (matching.length === 0) return ''
    if (matching.length === 1) return formatAmountToWholeNumber(matching[0].amount2023)
    const total = matching.reduce((s, a) => { const v = formatAmountToWholeNumber(a.amount2023); const n = parseFloat(v.replace(/[(),]/g, '')) || 0; return s + (v.includes('(') ? -n : n) }, 0)
    return total < 0 ? `(${Math.abs(total)})` : total.toString()
  }

  const getAdjustmentAmount = (line: string, propertyNum: number, isChild = false, childCode = '') => {
    const targetTaxGroup = isChild && childCode ? childCode : `8825.${line}`
    const pDisplayText = getPropertyDisplayText(propertyNum - 1)
    const matching = scheduleData.filter(entry => {
      const tg = entry.group
      const sm = entry.schedule === '8825'
      const pm = entry.property === propertyNum.toString() || entry.property === `Property ${propertyNum}` || entry.property === pDisplayText
      if (!sm || !tg || !pm) return false
      const eq = (a: string, b: string) => a.trim() === b.trim() || a.trim().startsWith(b.trim() + ' ')
      if (isChild && childCode.endsWith('.00')) return eq(tg, childCode.replace('.00', ''))
      else if (!isChild) return eq(tg, targetTaxGroup) || tg.trim().startsWith(targetTaxGroup + '.')
      else return eq(tg, targetTaxGroup)
    })
    if (matching.length === 0) return ''
    if (matching.length === 1) return formatAmountToWholeNumber(matching[0].amount)
    const total = matching.reduce((s, e) => { const v = formatAmountToWholeNumber(e.amount); const n = parseFloat(v.replace(/[(),]/g, '')) || 0; return s + (v.includes('(') ? -n : n) }, 0)
    return total < 0 ? `(${Math.abs(total)})` : total.toString()
  }

  return (
    <div className="v2-summary-tab">
      <div className="v2-table-container">
        <table className="v2-table v2-summary-table">
          <thead>
            <tr className="v2-header-row">
              <th className="v2-line-col">Line</th>
              <th className="v2-desc-col">Description</th>
              {Array.from({ length: propertyCount }, (_, i) => (
                <th key={i} className="v2-summary-prop-col">
                  {getPropertyDisplayText(i)}
                  <div className="v2-summary-sub-header">Final tax balances</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map(item => {
              const children = getChildrenGroups(item.line)
              return (
                <React.Fragment key={item.line}>
                  <tr className="v2-row">
                    <td className="v2-line-cell">{item.line}</td>
                    <td className="v2-desc-cell">{item.description}</td>
                    {Array.from({ length: propertyCount }, (_, pi) => {
                      const pn = pi + 1
                      const opening = getOpeningAmount(item.line, pn)
                      const adj = getAdjustmentAmount(item.line, pn)
                      const finalTax = sumAmounts(opening, adj)
                      return (
                        <td key={pi} className="v2-amount-cell">
                          <input type="text" className="v2-input v2-final-tax-input" defaultValue={finalTax} />
                        </td>
                      )
                    })}
                  </tr>

                  {children.map((child, ci) => (
                    <tr key={`${item.line}-c-${ci}`} className={`v2-row v2-child-row ${child.isDefault ? 'v2-default-child' : ''}`}>
                      <td className="v2-line-cell v2-child-line">
                        {child.isDefault ? '00' : child.code.split('.').pop()}
                      </td>
                      <td className="v2-desc-cell v2-child-desc">
                        {child.isDefault ? `Parent-level ${item.line}` : `  ${child.name}`}
                      </td>
                      {Array.from({ length: propertyCount }, (_, pi) => {
                        const pn = pi + 1
                        const cCode = child.isDefault ? `8825.${item.line}.00` : child.code
                        const cOpen = getOpeningAmount(item.line, pn, true, cCode)
                        const cAdj = getAdjustmentAmount(item.line, pn, true, cCode)
                        const finalTax = sumAmounts(cOpen, cAdj)
                        return (
                          <td key={pi} className="v2-amount-cell">
                            <input type="text" className="v2-input v2-final-tax-input" defaultValue={finalTax} />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Form 8825 2.0 component ────────────────────────────────────────────

function Form8825v2({
  onBack,
  onNavigateToEngagementSetup,
  onNavigateToAssignment,
  onNavigateToTaxAdjustment,
  onNavigateToTaxGroups,
  onNavigateToForm8825,
  numberOfProperties,
  propertyDetails = [],
  accountData = [],
  scheduleData = [],
  customTaxGroups = [],
}: Form8825v2Props) {
  const [innerTab, setInnerTab] = useState<'detail' | 'summary'>('detail')
  const propertyCount = numberOfProperties && numberOfProperties > 0 ? numberOfProperties : 3

  return (
    <div className="v2-container">
      {/* Header */}
      <div className="v2-header">
        <h1 className="v2-title">Form 8825 2.0 - Rental Real Estate Income and Expenses</h1>
        <button className="play-button">▶</button>
      </div>

      {/* Nav buttons */}
      <div className="v2-content">
        <div className="v2-nav-buttons">
          <button className="v2-nav-btn" onClick={onBack || onNavigateToEngagementSetup}>Engagement setup</button>
          <button className="v2-nav-btn" onClick={onNavigateToTaxGroups}>Tax groups</button>
          <button className="v2-nav-btn" onClick={onNavigateToAssignment}>Tax group assignment</button>
          <button className="v2-nav-btn" onClick={onNavigateToTaxAdjustment}>Tax adjustments</button>
          <button className="v2-nav-btn" onClick={onNavigateToForm8825}>Form 8825</button>
        </div>

        {/* Inner tab bar */}
        <div className="v2-inner-tabs">
          <button
            className={`v2-inner-tab ${innerTab === 'detail' ? 'v2-inner-tab-active' : ''}`}
            onClick={() => setInnerTab('detail')}
          >
            Property Detail
          </button>
          <button
            className={`v2-inner-tab ${innerTab === 'summary' ? 'v2-inner-tab-active' : ''}`}
            onClick={() => setInnerTab('summary')}
          >
            Summary
          </button>
        </div>

        {/* Inner tab content */}
        <div className="v2-inner-content">
          {innerTab === 'detail' ? (
            <DetailTab
              propertyCount={propertyCount}
              propertyDetails={propertyDetails}
              accountData={accountData}
              scheduleData={scheduleData}
              customTaxGroups={customTaxGroups}
            />
          ) : (
            <SummaryTab
              propertyCount={propertyCount}
              propertyDetails={propertyDetails}
              accountData={accountData}
              scheduleData={scheduleData}
              customTaxGroups={customTaxGroups}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Form8825v2
