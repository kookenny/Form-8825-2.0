import './Form8825.css'

interface Form8825Props {
  onBack?: () => void
  onNavigateToEngagementSetup?: () => void
  onNavigateToAssignment?: () => void
  onNavigateToTaxAdjustment?: () => void
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
}

function Form8825({ 
  onBack, 
  onNavigateToEngagementSetup, 
  onNavigateToAssignment, 
  onNavigateToTaxAdjustment,
  numberOfProperties,
  formatAmount,
  propertyDetails = [],
  accountData = [],
  scheduleData = []
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
    
    const numericValue = parseFloat(amount.replace(/[(),]/g, ''))
    if (isNaN(numericValue) || numericValue === 0) return ''
    
    if (numericValue < 0) return `(${Math.round(Math.abs(numericValue))})`
    return Math.round(numericValue).toString()
  }

  // Function to get property display text with format "1-AAAA"
  const getPropertyDisplayText = (propertyIndex: number) => {
    const propertyNumber = propertyIndex + 1
    const property = propertyDetails[propertyIndex]
    const propertyId = property?.propertyId
    return propertyId ? `${propertyNumber}-${propertyId}` : `Property ${propertyNumber}`
  }

  // Function to get opening amount for a specific line and property from Assignment data
  const getOpeningAmount = (line: string, propertyNum: number, accountData: any[]) => {
    if (!accountData) return ''
    
    // Find account where taxGroup contains "8825.XX" pattern and matching property
    const matchingAccount = accountData.find(account => 
      account.taxGroup && 
      account.taxGroup.includes(`8825.${line}`) && 
      (account.property === propertyNum.toString() || 
       account.property === `Property ${propertyNum}` ||
       account.property === getPropertyDisplayText(propertyNum - 1))
    )
    
    return matchingAccount ? formatAmountToWholeNumber(matchingAccount.amount2023) : ''
  }

  // Function to get adjustment amount for a specific line and property from Tax Adjustment data
  const getAdjustmentAmount = (line: string, propertyNum: number, scheduleData: any[]) => {
    if (!scheduleData) return ''
    
    // Find schedule entries where schedule="8825" and group contains "8825.XX" pattern and matching property
    const matchingEntry = scheduleData.find(entry => 
      entry.schedule === '8825' &&
      entry.group && 
      entry.group.includes(`8825.${line}`) && 
      (entry.property === propertyNum.toString() || 
       entry.property === `Property ${propertyNum}` ||
       entry.property === getPropertyDisplayText(propertyNum - 1))
    )
    
    return matchingEntry ? formatAmountToWholeNumber(matchingEntry.amount) : ''
  }

  // Function to calculate ending amount (Opening + Adjustment)
  const calculateEndingAmount = (openingAmount: string, adjustmentAmount: string) => {
    const opening = parseFloat(openingAmount.replace(/[(),]/g, '')) || 0
    const adjustment = parseFloat(adjustmentAmount.replace(/[(),]/g, '')) || 0
    const ending = opening + adjustment
    
    if (ending === 0) return ''
    if (ending < 0) return `(${Math.round(Math.abs(ending))})`
    return Math.round(ending).toString()
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
          <button className="form8825-btn" onClick={onBack || onNavigateToEngagementSetup}>← Back to Engagement Setup</button>
          <button className="form8825-btn" onClick={onNavigateToAssignment}>Tax group assignment</button>
          <button className="form8825-btn" onClick={onNavigateToTaxAdjustment}>Tax adjustments</button>
          <button className="form8825-btn">Print to PDF</button>
          <button className="form8825-btn dropdown-btn">
            Options
            <span className="dropdown-arrow">▼</span>
          </button>
        </div>

        {/* Form 8825 Table */}
        <div className="form8825-table-container">
          <table className="form8825-table">
            <thead>
              <tr className="form8825-header-row">
                <th className="line-header">Line</th>
                <th className="description-header">Description</th>
                {Array.from({ length: propertyCount }, (_, index) => (
                  <th key={index + 1} className="property-header">
                    <div className="property-label">{getPropertyDisplayText(index)}</div>
                    <div className="amount-headers">
                      <div className="amount-header">Opening</div>
                      <div className="amount-header">Adj</div>
                      <div className="amount-header">Ending</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.line} className="form8825-row">
                  <td className="line-cell">{item.line}</td>
                  <td className="description-cell">{item.description}</td>
                  {Array.from({ length: propertyCount }, (_, propIndex) => {
                    const propertyNum = propIndex + 1
                    const openingAmount = getOpeningAmount(item.line, propertyNum, accountData)
                    const adjustmentAmount = getAdjustmentAmount(item.line, propertyNum, scheduleData)
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Form8825
