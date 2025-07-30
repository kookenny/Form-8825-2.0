import './TaxAdjustment.css'

interface TaxAdjustmentProps {
  onBack?: () => void
  onNavigateToAssignment?: () => void
  onNavigateToForm8825?: () => void
  showPropertyColumn?: boolean
  numberOfProperties?: number
  propertyDetails?: Array<{
    property: string
    propertyId: string
    propertyName: string
  }>
  adjustmentData: Array<{
    type: string
    ref: string
    description: string
  }>
  setAdjustmentData: React.Dispatch<React.SetStateAction<Array<{
    type: string
    ref: string
    description: string
  }>>>
  scheduleData: Array<{
    schedule: string
    group: string
    amount: string
    property: string
  }>
  setScheduleData: React.Dispatch<React.SetStateAction<Array<{
    schedule: string
    group: string
    amount: string
    property: string
  }>>>
  isRecurring: boolean
  setIsRecurring: React.Dispatch<React.SetStateAction<boolean>>
}

function TaxAdjustment({ 
  onBack, 
  onNavigateToAssignment,
  onNavigateToForm8825, 
  showPropertyColumn = false, 
  numberOfProperties = 0,
  propertyDetails = [],
  adjustmentData,
  setAdjustmentData,
  scheduleData,
  setScheduleData,
  isRecurring,
  setIsRecurring
}: TaxAdjustmentProps) {
  
  // Debug: Log property details to see what's being passed
  console.log('TaxAdjustment - propertyDetails:', propertyDetails, 'numberOfProperties:', numberOfProperties)
  
  const typeOptions = [
    '',
    'Tax reclassifying - Income and deductions',
    'Tax reclassifying - Balance sheet',
    'Book-to-tax reconciliation',
    'Tax reclassifying - 8825'
  ]

  const handleTypeChange = (index: number, newType: string) => {
    setAdjustmentData(prev => 
      prev.map((adjustment, i) => 
        i === index ? { ...adjustment, type: newType } : adjustment
      )
    )
  }

  const handleRefChange = (index: number, newRef: string) => {
    setAdjustmentData(prev => 
      prev.map((adjustment, i) => 
        i === index ? { ...adjustment, ref: newRef } : adjustment
      )
    )
  }

  // Tax group options from Assignment form
  const incomeAndDeductionsOptions = [
    '1a Gross receipts or sales',
    '1b Less returns and allowances',
    '1c Balance',
    '2 Cost of goods sold (attach Form 1125-A)',
    '3 Gross profit. Subtract line 2 from line 1c',
    '4 Net gain (loss) from Form 4797, Part II, line 17 (attach Form 4797)',
    '5 Other income (loss) (see instructions—attach statement)',
    '6 Total income (loss). Add lines 3 through 5',
    '7 Compensation of officers (see instructions—attach Form 1125-E)',
    '8 Salaries and wages (less employment credits)',
    '9 Repairs and maintenance',
    '10 Bad debts',
    '11 Rents',
    '12 Taxes and licenses',
    '13 Interest (see instructions)',
    '14 Depreciation from Form 4562 not claimed on Form 1125-A or elsewhere on return (attach Form 4562)',
    '15 Depletion (do not deduct oil and gas depletion)',
    '16 Advertising',
    '17 Pension, profit-sharing, etc., plans',
    '18 Employee benefit programs',
    '19 Energy efficient commercial buildings deduction (attach Form 7205)',
    '20 Other deductions (attach statement)'
  ]

  const form8825Options = [
    '8825.02 Gross rents',
    '8825.03 Advertisting',
    '8825.04 Auto and travel',
    '8825.05 Cleaning and maintenance',
    '8825.06 Commissions',
    '8825.07 Insurance',
    '8825.08 Legal and other professional fees',
    '8825.09 Interest',
    '8825.10 Repairs',
    '8825.11 Taxes',
    '8825.12 Utilities',
    '8825.13 Wages and salaries',
    '8825.14 Depreciation',
    '8825.15 Other'
  ]

  const getGroupOptions = (schedule: string) => {
    if (schedule === '8825') {
      return form8825Options
    } else if (schedule === 'Income and deductions') {
      return incomeAndDeductionsOptions
    }
    return []
  }

  const handleScheduleChange = (index: number, newSchedule: string) => {
    setScheduleData(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, schedule: newSchedule, group: '' } : item // Clear group when schedule changes
      )
    )
  }

  const handleGroupChange = (index: number, newGroup: string) => {
    setScheduleData(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, group: newGroup } : item
      )
    )
  }
  
  const handleAmountChange = (index: number, newAmount: string) => {
    // Allow numbers, decimal points, parentheses, and minus sign
    let validAmount = newAmount.replace(/[^0-9.()-]/g, '')
    
    setScheduleData(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, amount: validAmount } : item
      )
    )
  }
  
  const handleAmountBlur = (index: number, amount: string) => {
    // Convert negative numbers to parentheses format when user finishes editing
    let formattedAmount = amount
    
    if (amount.startsWith('-') && amount.length > 1) {
      // Remove the minus sign and wrap in parentheses
      const numberPart = amount.substring(1)
      formattedAmount = `(${numberPart})`
      
      setScheduleData(prev => 
        prev.map((item, i) => 
          i === index ? { ...item, amount: formattedAmount } : item
        )
      )
    }
  }
  
  const handlePropertyChange = (index: number, newProperty: string) => {
    setScheduleData(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, property: newProperty } : item
      )
    )
  }
  
  // Generate property options based on propertyDetails with format "1-AAAA", fallback to numberOfProperties
  const getPropertyOptions = () => {
    console.log('TaxAdjustment - propertyDetails:', propertyDetails, 'numberOfProperties:', numberOfProperties)
    
    const options = ['']
    
    // Use numberOfProperties as the base, then enhance with propertyDetails if available
    const propertyCount = Math.max(numberOfProperties, propertyDetails?.length || 0)
    
    console.log('TaxAdjustment - propertyCount:', propertyCount)
    
    for (let i = 1; i <= propertyCount; i++) {
      const property = propertyDetails?.[i - 1]
      const propertyId = property?.propertyId
      console.log(`TaxAdjustment - Property ${i}:`, property, 'propertyId:', propertyId)
      const displayText = propertyId ? `${i}-${propertyId}` : `Property ${i}`
      options.push(displayText)
    }
    
    console.log('TaxAdjustment - final options:', options)
    return options
  }
  
  const addScheduleRow = () => {
    setScheduleData(prev => [
      ...prev,
      { schedule: 'Income and deductions', group: '', amount: '', property: '' }
    ])
  }
  
  const removeScheduleRow = (index: number) => {
    if (scheduleData.length > 1) {
      setScheduleData(prev => prev.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="tax-adjustment-container">
      {/* Header */}
      <div className="tax-adjustment-header">
        <h1 className="tax-adjustment-title">Tax adjustments</h1>
        <button className="play-button">▶</button>
      </div>

      {/* Main Content */}
      <div className="tax-adjustment-content">
        {/* Action Buttons */}
        <div className="tax-adjustment-buttons">
          <button className="tax-adjustment-btn" onClick={onBack}>← Back to Engagement Setup</button>
          <button className="tax-adjustment-btn">Print to PDF</button>
          <button className="tax-adjustment-btn" onClick={onNavigateToAssignment}>Tax group assignment</button>
          <button className="tax-adjustment-btn" onClick={onNavigateToForm8825}>Form 8825</button>
          <button className="tax-adjustment-btn">S-Corporation tax group</button>
          <button className="tax-adjustment-btn dropdown-btn">
            Tax schedules
            <span className="dropdown-arrow">▼</span>
          </button>
        </div>

        {/* Recurring Checkbox */}
        <div className="recurring-section">
          <label className="recurring-checkbox">
            <input 
              type="checkbox" 
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <span className="checkbox-label">Recurring</span>
          </label>
        </div>

        {/* Upper Table - Type of adjustment */}
        <div className="adjustment-table-container">
          <table className="adjustment-table">
            <thead>
              <tr>
                <th className="type-column">Type of adjustment</th>
                <th className="ref-column">Ref</th>
                <th className="description-column">Description</th>
              </tr>
            </thead>
            <tbody>
              {adjustmentData.map((adjustment, index) => (
                <tr key={index}>
                  <td className="type-cell">
                    <select 
                      className="type-dropdown"
                      value={adjustment.type}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                    >
                      {typeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option === '' ? '-- Select Type --' : option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="ref-cell">
                    <input 
                      type="text" 
                      value={adjustment.ref}
                      placeholder="Enter ref number"
                      className="ref-input"
                      onChange={(e) => handleRefChange(index, e.target.value)}
                    />
                  </td>
                  <td className="description-cell">
                    <input 
                      type="text" 
                      value={adjustment.description}
                      placeholder="Please enter the description"
                      className="description-input"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lower Table - Schedule/Group/Amount - Only show when Tax reclassifying - 8825 is selected */}
        {adjustmentData.some(adjustment => adjustment.type === 'Tax reclassifying - 8825') && (
          <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="schedule-column">Schedule</th>
                <th className="group-column">Group</th>
                <th className="amount-column">Amount</th>
                {showPropertyColumn && <th className="property-column">Property</th>}
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((item, index) => (
                <tr key={index}>
                  <td className="schedule-cell">
                    <select 
                      className="schedule-dropdown"
                      value={item.schedule}
                      onChange={(e) => handleScheduleChange(index, e.target.value)}
                    >
                      <option value="Income and deductions">Income and deductions</option>
                      <option value="8825">8825</option>
                    </select>
                  </td>
                  <td className="group-cell">
                    <select 
                      className="group-dropdown"
                      value={item.group}
                      onChange={(e) => handleGroupChange(index, e.target.value)}
                    >
                      <option value="">-- Select Group --</option>
                      {getGroupOptions(item.schedule).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="amount-cell">
                    <div className="amount-input-container">
                      <input 
                        type="text" 
                        className="amount-input"
                        value={item.amount}
                        onChange={(e) => handleAmountChange(index, e.target.value)}
                        onBlur={(e) => handleAmountBlur(index, e.target.value)}
                      />
                      <div className="amount-controls">
                        <button 
                          className="amount-btn add-btn"
                          onClick={addScheduleRow}
                          title="Add row"
                        >
                          +
                        </button>
                        <button 
                          className="amount-btn remove-btn"
                          onClick={() => removeScheduleRow(index)}
                          disabled={scheduleData.length === 1}
                          title="Remove row"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </td>
                  {showPropertyColumn && (
                    <td className="property-cell">
                      <select 
                        className="property-dropdown"
                        value={item.property}
                        onChange={(e) => handlePropertyChange(index, e.target.value)}
                      >
                        {getPropertyOptions().map((option) => (
                          <option key={option} value={option}>
                            {option || '-- Select Property --'}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}

export default TaxAdjustment
