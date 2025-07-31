import React from 'react'
import './Form8825.css'

interface Form8825Props {
  onBack?: () => void
  onNavigateToEngagementSetup?: () => void
  onNavigateToAssignment?: () => void
  onNavigateToTaxAdjustment?: () => void
  onNavigateToTaxGroups?: () => void
  numberOfProperties?: number
  formatAmount?: (amount: number) => string
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
  }>
  customTaxGroups?: Array<{
    code: string
    name: string
    parentCode: string
  }>
}

function Form8825({ 
  onBack, 
  onNavigateToEngagementSetup, 
  onNavigateToAssignment, 
  onNavigateToTaxAdjustment,
  onNavigateToTaxGroups,
  numberOfProperties,
  formatAmount,
  propertyDetails = [],
  accountData = [],
  scheduleData = [],
  customTaxGroups = []
}: Form8825Props) {

  // Ensure we have a valid number of properties (minimum 1, default 3)
  const propertyCount = numberOfProperties && numberOfProperties > 0 ? numberOfProperties : 3

  // Form 8825 line items
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
    { line: '15', description: 'Other' }
  ]

  // Function to format amounts to whole numbers
  const formatAmountToWholeNumber = (amount: string) => {
    if (!amount || amount.trim() === '') return ''
    
    // Check if the amount is negative (wrapped in parentheses)
    const isNegative = amount.includes('(') && amount.includes(')')
    
    // Remove all non-numeric characters except decimal point and minus sign
    const cleanAmount = amount.replace(/[(),\s]/g, '')
    const numericValue = parseFloat(cleanAmount)
    
    if (isNaN(numericValue) || numericValue === 0) return ''
    
    // Apply negative sign if the original amount was in parentheses
    const finalValue = isNegative ? -Math.abs(numericValue) : numericValue
    
    if (finalValue < 0) return `(${Math.round(Math.abs(finalValue))})`
    return Math.round(finalValue).toString()
  }

  // Function to get property display text with format "1-AAAA (Property name)"
  const getPropertyDisplayText = (propertyIndex: number) => {
    const propertyNumber = propertyIndex + 1
    const property = propertyDetails[propertyIndex]
    const propertyId = property?.propertyId
    const propertyName = property?.propertyName
    
    let displayText = `Property ${propertyNumber}`
    if (propertyId) {
      displayText = `${propertyNumber}-${propertyId}`
      if (propertyName && propertyName.trim()) {
        displayText += ` (${propertyName})`
      }
    }
    
    return displayText
  }

  // Function to get opening amount for a specific line and property from Assignment data
  const getOpeningAmount = (line: string, propertyNum: number, accountData: any[], isChild: boolean = false, childCode: string = '') => {
    if (!accountData) return ''
    
    let targetTaxGroup = ''
    if (isChild && childCode) {
      // For children, look for exact tax group match
      targetTaxGroup = childCode
    } else {
      // For parent rows, look for the parent tax group
      targetTaxGroup = `8825.${line}`
    }
    
    // Find all accounts that match the target tax group and property
    const matchingAccounts = accountData.filter(account => {
      const accountTaxGroup = account.taxGroup
      const propertyMatches = account.property === propertyNum.toString() || 
                             account.property === `Property ${propertyNum}` ||
                             account.property === getPropertyDisplayText(propertyNum - 1)
      
      if (!accountTaxGroup || !propertyMatches) return false
      
      // Helper function to check if tax groups match (handles both code and full description)
      const taxGroupMatches = (saved: string, target: string) => {
        // Trim leading/trailing spaces for comparison
        const cleanSaved = saved.trim()
        const cleanTarget = target.trim()
        return cleanSaved === cleanTarget || cleanSaved.startsWith(cleanTarget + ' ')
      }
      
      if (isChild && childCode.endsWith('.00')) {
        // For default .00 children, only get amounts assigned exactly to the parent tax group
        // This prevents custom children amounts from rolling up into the .00 row
        const parentTaxGroup = childCode.replace('.00', '')
        return taxGroupMatches(accountTaxGroup, parentTaxGroup)
      } else if (!isChild) {
        // For parent rows, include both direct assignments and all child assignments
        // This rolls up all child amounts to the parent
        return taxGroupMatches(accountTaxGroup, targetTaxGroup) || 
               accountTaxGroup.trim().startsWith(targetTaxGroup + '.')
      } else {
        // For custom children, exact match only
        return taxGroupMatches(accountTaxGroup, targetTaxGroup)
      }
    })
    
    // Debug: Log matching process for line 02, property 1 only to reduce noise
    if (line === '02' && propertyNum === 1) {
      console.log(`Debug getOpeningAmount - line: ${line}, propertyNum: ${propertyNum}, targetTaxGroup: ${targetTaxGroup}, isChild: ${isChild}, childCode: ${childCode}`)
      accountData.forEach((acc, i) => {
        const propertyOption1 = propertyNum.toString()
        const propertyOption2 = `Property ${propertyNum}`
        const propertyOption3 = getPropertyDisplayText(propertyNum - 1)
        const taxGroupMatches = acc.taxGroup.trim() === targetTaxGroup || acc.taxGroup.trim().startsWith(targetTaxGroup + ' ')
        const isChildMatch = !isChild && acc.taxGroup.trim().startsWith(targetTaxGroup + '.')
        console.log(`Account ${i}: taxGroup="${acc.taxGroup}", property="${acc.property}"`)
        console.log(`  Property matching options: "${propertyOption1}", "${propertyOption2}", "${propertyOption3}"`)
        console.log(`  TaxGroup exact match: ${taxGroupMatches}`)
        console.log(`  Parent child rollup match: ${isChildMatch}`)
        console.log(`  Property match: ${acc.property === propertyOption1 || acc.property === propertyOption2 || acc.property === propertyOption3}`)
      })
      console.log('Matching accounts:', matchingAccounts)
    }
    
    // Debug child rows specifically for all lines
    if (isChild) {
      console.log(`=== CHILD ROW DEBUG ===`)
      console.log(`Line: ${line}, Property: ${propertyNum}`)
      console.log(`Child isChild: ${isChild}, childCode: ${childCode}`)
      console.log(`Target tax group: ${targetTaxGroup}`)
      console.log(`childCode.endsWith('.00'): ${childCode.endsWith('.00')}`)
      if (childCode.endsWith('.00')) {
        const parentTaxGroup = childCode.replace('.00', '')
        console.log(`Parent tax group extracted: "${parentTaxGroup}"`)
        console.log(`Looking for accounts with tax group matching: "${parentTaxGroup}"`)
      }
      console.log(`Total matching accounts found: ${matchingAccounts.length}`)
      console.log(`========================`)
    }
    
    // For child rows, we want to aggregate all matching amounts
    if (matchingAccounts.length === 0) return ''
    if (matchingAccounts.length === 1) return formatAmountToWholeNumber(matchingAccounts[0].amount2023)
    
    // Aggregate multiple amounts
    const total = matchingAccounts.reduce((sum, account) => {
      const amount = formatAmountToWholeNumber(account.amount2023)
      const numericAmount = parseFloat(amount.replace(/[(),]/g, '')) || 0
      const isNegative = amount.includes('(')
      return sum + (isNegative ? -numericAmount : numericAmount)
    }, 0)
    
    return total < 0 ? `(${Math.abs(total)})` : total.toString()
  }

  // Function to get adjustment amount for a specific line and property from Tax Adjustment data
  const getAdjustmentAmount = (line: string, propertyNum: number, scheduleData: any[], isChild: boolean = false, childCode: string = '') => {
    if (!scheduleData) return ''
    
    let targetTaxGroup = ''
    if (isChild && childCode) {
      // For children, look for exact tax group match
      targetTaxGroup = childCode
    } else {
      // For parent rows, look for the parent tax group
      targetTaxGroup = `8825.${line}`
    }
    
    // Find all schedule entries that match the criteria
    const matchingEntries = scheduleData.filter(entry => {
      const entryTaxGroup = entry.group
      const scheduleMatches = entry.schedule === '8825'
      const propertyMatches = entry.property === propertyNum.toString() || 
                             entry.property === `Property ${propertyNum}` ||
                             entry.property === getPropertyDisplayText(propertyNum - 1)
      
      if (!scheduleMatches || !entryTaxGroup || !propertyMatches) return false
      
      // Helper function to check if tax groups match (handles both code and full description)
      const taxGroupMatches = (saved: string, target: string) => {
        // Trim leading/trailing spaces for comparison
        const cleanSaved = saved.trim()
        const cleanTarget = target.trim()
        return cleanSaved === cleanTarget || cleanSaved.startsWith(cleanTarget + ' ')
      }
      
      if (isChild && childCode.endsWith('.00')) {
        // For default .00 children, only get amounts assigned exactly to the parent tax group
        // This prevents custom children amounts from rolling up into the .00 row
        const parentTaxGroup = childCode.replace('.00', '')
        return taxGroupMatches(entryTaxGroup, parentTaxGroup)
      } else if (!isChild) {
        // For parent rows, include both direct assignments and all child assignments
        // This rolls up all child amounts to the parent
        return taxGroupMatches(entryTaxGroup, targetTaxGroup) || 
               entryTaxGroup.trim().startsWith(targetTaxGroup + '.')
      } else {
        // For custom children, exact match only
        return taxGroupMatches(entryTaxGroup, targetTaxGroup)
      }
    })
    
    // For child rows, we want to aggregate all matching amounts
    if (matchingEntries.length === 0) return ''
    if (matchingEntries.length === 1) return formatAmountToWholeNumber(matchingEntries[0].amount)
    
    // Aggregate multiple amounts
    const total = matchingEntries.reduce((sum, entry) => {
      const amount = formatAmountToWholeNumber(entry.amount)
      const numericAmount = parseFloat(amount.replace(/[(),]/g, '')) || 0
      const isNegative = amount.includes('(')
      return sum + (isNegative ? -numericAmount : numericAmount)
    }, 0)
    
    return total < 0 ? `(${Math.abs(total)})` : total.toString()
  }

  // Function to calculate ending amount (Opening + Adjustment)
  const calculateEndingAmount = (openingAmount: string, adjustmentAmount: string) => {
    // Helper function to parse amounts correctly (handles parentheses as negative)
    const parseAmount = (amount: string) => {
      if (!amount || amount.trim() === '') return 0
      
      // Check if the amount is negative (wrapped in parentheses)
      const isNegative = amount.includes('(') && amount.includes(')')
      
      // Remove all non-numeric characters except decimal point
      const cleanAmount = amount.replace(/[(),\s]/g, '')
      const numericValue = parseFloat(cleanAmount) || 0
      
      return isNegative ? -numericValue : numericValue
    }
    
    const opening = parseAmount(openingAmount)
    const adjustment = parseAmount(adjustmentAmount)
    const total = opening + adjustment
    
    // Format the result
    return total < 0 ? `(${Math.abs(total)})` : total.toString()
  }

  // Function to calculate parent ending amount by aggregating all child ending amounts
  const calculateParentEndingAmount = (line: string, propertyNum: number) => {
    const childrenGroups = getChildrenGroups(line)
    let totalEnding = 0
    
    // Sum up ending amounts from all children (including default .00)
    childrenGroups.forEach(child => {
      const childOpeningAmount = child.isDefault 
        ? getOpeningAmount(line, propertyNum, accountData, true, `8825.${line}.00`)
        : getOpeningAmount(line, propertyNum, accountData, true, child.code)
      
      const childAdjustmentAmount = child.isDefault
        ? getAdjustmentAmount(line, propertyNum, scheduleData, true, `8825.${line}.00`)
        : getAdjustmentAmount(line, propertyNum, scheduleData, true, child.code)
      
      const childEndingAmount = calculateEndingAmount(childOpeningAmount, childAdjustmentAmount)
      
      // Parse and add to total
      const parseAmount = (amount: string) => {
        if (!amount || amount.trim() === '') return 0
        const isNegative = amount.includes('(') && amount.includes(')')
        const cleanAmount = amount.replace(/[(),\s]/g, '')
        const numericValue = parseFloat(cleanAmount) || 0
        return isNegative ? -numericValue : numericValue
      }
      
      totalEnding += parseAmount(childEndingAmount)
    })
    
    // Format the result
    return totalEnding < 0 ? `(${Math.abs(totalEnding)})` : totalEnding.toString()
  }

  // Function to get children groups for a specific parent line
  const getChildrenGroups = (parentLine: string) => {
    const parentCode = `8825.${parentLine}`
    const allChildren = customTaxGroups.filter(group => group.parentCode === parentCode)
    
    // If no custom children exist, return empty array
    if (allChildren.length === 0) {
      return []
    }
    
    // Group children by unique code+name combination to handle duplicates
    const uniqueChildren: {[key: string]: any} = {}
    
    allChildren.forEach(child => {
      const uniqueKey = `${child.code}-${child.name}`.toLowerCase().trim()
      if (!uniqueChildren[uniqueKey]) {
        uniqueChildren[uniqueKey] = {
          code: child.code,
          name: child.name,
          parentCode: child.parentCode,
          count: 1,
          isCustom: true
        }
      } else {
        uniqueChildren[uniqueKey].count++
      }
    })
    
    // Create the default .00 child group for parent-level entries
    const defaultChild = {
      code: `${parentCode}.00`,
      name: `Default ${parentLine}`,
      parentCode: parentCode,
      count: 1,
      isCustom: false,
      isDefault: true
    }
    
    // Return array with default .00 child first, then custom children
    const result = [defaultChild, ...Object.values(uniqueChildren)]
    return result
  }

  return (
    <div className="form8825-container">
      {/* Header */}
      <div className="form8825-header">
        <h1 className="form8825-title">Form 8825 - Rental Real Estate Income and Expenses of a Partnership or an S Corporation</h1>
        <button className="play-button">▶</button>
      </div>

      {/* Main Content */}
      <div className="form8825-content">
        {/* Action Buttons */}
        <div className="form8825-buttons">
          <button className="form8825-btn" onClick={onBack || onNavigateToEngagementSetup}>Engagement setup</button>
          <button className="form8825-btn" onClick={onNavigateToTaxGroups}>Tax groups</button>
          <button className="form8825-btn" onClick={onNavigateToAssignment}>Tax group assignment</button>
          <button className="form8825-btn" onClick={onNavigateToTaxAdjustment}>Tax adjustments</button>
        </div>

        {/* Form 8825 Table */}
        <div className="form8825-table-container">
          <table className="form8825-table">
            <thead>
              <tr className="form8825-header-row">
                <th className="line-column">Line</th>
                <th className="description-column">Description</th>
                {Array.from({ length: propertyCount }, (_, index) => (
                  <th key={index + 1} className="property-group-column">
                    <div className="property-header">{getPropertyDisplayText(index)}</div>
                    <div className="sub-headers">
                      <div className="sub-header">Opening</div>
                      <div className="sub-header">Adj</div>
                      <div className="sub-header">Ending</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => {
                const childrenGroups = getChildrenGroups(item.line)
                
                return (
                  <React.Fragment key={item.line}>
                    {/* Parent row */}
                    <tr className="form8825-row">
                      <td className="line-cell">{item.line}</td>
                      <td className="description-cell">{item.description}</td>
                      {Array.from({ length: propertyCount }, (_, propIndex) => {
                        const propertyNum = propIndex + 1
                        const openingAmount = getOpeningAmount(item.line, propertyNum, accountData)
                        const adjustmentAmount = getAdjustmentAmount(item.line, propertyNum, scheduleData)
                        // For parent rows, calculate ending amount by aggregating all child ending amounts
                        const endingAmount = calculateParentEndingAmount(item.line, propertyNum)
                        
                        return (
                          <td key={propertyNum} className="property-cell">
                            <div className="property-amounts">
                              <input 
                                type="text" 
                                className="amount-input opening-input"
                                defaultValue={openingAmount}
                                placeholder=""
                              />
                              <input 
                                type="text" 
                                className="amount-input adj-input"
                                defaultValue={adjustmentAmount}
                                placeholder=""
                              />
                              <input 
                                type="text" 
                                className="amount-input ending-input"
                                defaultValue={endingAmount}
                                placeholder=""
                              />
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                    
                    {/* Children rows */}
                    {childrenGroups.map((child, childIndex) => (
                      <tr key={`${item.line}-child-${child.code}-${child.name}-${childIndex}`} className={`form8825-row child-row ${child.isDefault ? 'default-child-row' : ''}`}>
                        <td className="line-cell child-line">
                          {child.isDefault ? '00' : child.code.split('.').pop()}
                        </td>
                        <td className="description-cell child-description">
                          {child.isDefault ? `Parent-level ${item.line}` : `  ${child.name}`}
                        </td>
                        {Array.from({ length: propertyCount }, (_, propIndex) => {
                          const propertyNum = propIndex + 1
                          
                          // For child rows, determine what tax group to look for
                          let openingAmount = ''
                          let adjustmentAmount = ''
                          
                          if (child.isDefault) {
                            // For .00 default children, get amounts that match the parent tax group exactly
                            // These are amounts assigned to "8825.02" that should flow to "8825.02.00"
                            openingAmount = getOpeningAmount(item.line, propertyNum, accountData, true, `8825.${item.line}.00`)
                            adjustmentAmount = getAdjustmentAmount(item.line, propertyNum, scheduleData, true, `8825.${item.line}.00`)
                          } else {
                            // For custom children, get amounts that match their specific code
                            // These are amounts assigned to "8825.02.1", "8825.02.2", etc.
                            openingAmount = getOpeningAmount(item.line, propertyNum, accountData, true, child.code)
                            adjustmentAmount = getAdjustmentAmount(item.line, propertyNum, scheduleData, true, child.code)
                          }
                          
                          const endingAmount = calculateEndingAmount(openingAmount, adjustmentAmount)
                          
                          return (
                            <td key={propertyNum} className="property-cell">
                              <div className="property-amounts">
                                <input 
                                  type="text" 
                                  className="amount-input opening-input"
                                  defaultValue={openingAmount}
                                  placeholder=""
                                />
                                <input 
                                  type="text" 
                                  className="amount-input adj-input"
                                  defaultValue={adjustmentAmount}
                                  placeholder=""
                                />
                                <input 
                                  type="text" 
                                  className="amount-input ending-input"
                                  defaultValue={endingAmount}
                                  placeholder=""
                                />
                              </div>
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
    </div>
  )
}

export default Form8825
