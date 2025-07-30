import { useState, useRef, useEffect } from 'react'
import './AssignmentForm.css'

interface AssignmentFormProps {
  onBack?: () => void
  showPropertyColumn?: boolean
  numberOfProperties?: number
}

function AssignmentForm({ onBack, showPropertyColumn = false, numberOfProperties = 0 }: AssignmentFormProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [accountData, setAccountData] = useState([
    { number: '401', name: 'Rental income', amount2023: '(505.00)', amount2022: '(252.50)', taxGroup: '5 Other income (loss) (see instructions—attach statement)', property: '' },
    { number: '405', name: 'Rental income - ThreeBears', amount2023: '(606.00)', amount2022: '(303.00)', taxGroup: '1a Gross receipts or sales', property: '' },
    { number: '406', name: 'Rental income - BearForceOne', amount2023: '(707.00)', amount2022: '(353.50)', taxGroup: '1a Gross receipts or sales', property: '' },
    { number: '501', name: 'Advertising', amount2023: '505.00', amount2022: '252.50', taxGroup: '16 Advertising', property: '' },
    { number: '505', name: 'Advertising - ThreeBears', amount2023: '606.00', amount2022: '303.00', taxGroup: '16 Advertising', property: '' },
    { number: '506', name: 'Advertising - BearForceOne', amount2023: '707.00', amount2022: '353.50', taxGroup: '16 Advertising', property: '' }
  ])
  
  // Generate property options based on number of properties
  const propertyOptions = ['', ...Array.from({ length: numberOfProperties }, (_, i) => (i + 1).toString())]
  
  const taxGroupOptions = [
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
    '20 Other deductions (attach statement)',
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
  
  const [columnWidths, setColumnWidths] = useState({
    accountNumber: 120,
    accountName: 300,
    amount2023: 140,
    amount2022: 140,
    taxGroup: 180,
    ...(showPropertyColumn && { property: 150 })
  })
  
  const tableRef = useRef<HTMLTableElement>(null)
  const isResizing = useRef(false)
  const currentColumn = useRef<string | null>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleTaxGroupChange = (index: number, newTaxGroup: string) => {
    setAccountData(prev => 
      prev.map((account, i) => 
        i === index ? { 
          ...account, 
          taxGroup: newTaxGroup,
          // Clear property if tax group doesn't start with 8825
          property: newTaxGroup.startsWith('8825') ? account.property : ''
        } : account
      )
    )
  }

  const handlePropertyChange = (index: number, newProperty: string) => {
    setAccountData(prev => 
      prev.map((account, i) => 
        i === index ? { ...account, property: newProperty } : account
      )
    )
  }

  const toggleRowSelection = (index: number) => {
    setSelectedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const handleMouseDown = (e: React.MouseEvent, column: string) => {
    isResizing.current = true
    currentColumn.current = column
    startX.current = e.clientX
    startWidth.current = columnWidths[column as keyof typeof columnWidths] || 150
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current || !currentColumn.current) return
    
    const diff = e.clientX - startX.current
    const newWidth = Math.max(50, startWidth.current + diff)
    
    setColumnWidths(prev => ({
      ...prev,
      [currentColumn.current!]: newWidth
    }))
  }

  const handleMouseUp = () => {
    isResizing.current = false
    currentColumn.current = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div className="assignment-container">
      {/* Header */}
      <div className="assignment-header">
        <h1 className="assignment-title">Tax group assignment</h1>
        <button className="play-button">▶</button>
      </div>

      {/* Main Content */}
      <div className="assignment-content">
        {/* Action Buttons */}
        <div className="assignment-buttons">
          <button className="assignment-btn" onClick={onBack}>← Back to Engagement Setup</button>
          <button className="assignment-btn">Print to PDF</button>
          <button className="assignment-btn">S-Corporation tax group</button>
          <button className="assignment-btn dropdown-btn">
            Tax schedules
            <span className="dropdown-arrow">▼</span>
          </button>
        </div>

        {/* Assignment Table */}
        <div className="assignment-table-container">
          <table className="assignment-table" ref={tableRef}>
            <thead>
              <tr>
                <th style={{ width: columnWidths.accountNumber }}>
                  Account number
                  <div 
                    className="column-resizer"
                    onMouseDown={(e) => handleMouseDown(e, 'accountNumber')}
                  />
                </th>
                <th style={{ width: columnWidths.accountName }}>
                  Account name
                  <div 
                    className="column-resizer"
                    onMouseDown={(e) => handleMouseDown(e, 'accountName')}
                  />
                </th>
                <th style={{ width: columnWidths.amount2023 }}>
                  CY
                  <div 
                    className="column-resizer"
                    onMouseDown={(e) => handleMouseDown(e, 'amount2023')}
                  />
                </th>
                <th style={{ width: columnWidths.amount2022 }}>
                  PY
                  <div 
                    className="column-resizer"
                    onMouseDown={(e) => handleMouseDown(e, 'amount2022')}
                  />
                </th>
                <th style={{ width: columnWidths.taxGroup }}>
                  Tax group
                  <div 
                    className="column-resizer"
                    onMouseDown={(e) => handleMouseDown(e, 'taxGroup')}
                  />
                </th>
                {showPropertyColumn && (
                  <th style={{ width: columnWidths.property }}>
                    Property
                    <div 
                      className="column-resizer"
                      onMouseDown={(e) => handleMouseDown(e, 'property')}
                    />
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {accountData.map((account, index) => (
                <tr 
                  key={account.number}
                  className={`table-row ${selectedRows.includes(index) ? 'selected' : ''}`}
                  onClick={() => toggleRowSelection(index)}
                >
                  <td className="account-number" style={{ width: columnWidths.accountNumber }}>{account.number}</td>
                  <td className="account-name" style={{ width: columnWidths.accountName }}>{account.name}</td>
                  <td className="amount" style={{ width: columnWidths.amount2023 }}>{account.amount2023}</td>
                  <td className="amount" style={{ width: columnWidths.amount2022 }}>{account.amount2022}</td>
                  <td className="tax-group" style={{ width: columnWidths.taxGroup }}>
                    <select 
                      className="tax-group-dropdown"
                      value={account.taxGroup}
                      onChange={(e) => handleTaxGroupChange(index, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {taxGroupOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  {showPropertyColumn && (
                    <td className="property-cell" style={{ width: columnWidths.property }}>
                      <select 
                        className="property-dropdown"
                        value={account.property}
                        onChange={(e) => handlePropertyChange(index, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={!account.taxGroup.startsWith('8825')}
                      >
                        {propertyOptions.map((option) => (
                          <option key={option} value={option}>
                            {option === '' ? '-- Select Property --' : option}
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
      </div>
    </div>
  )
}

export default AssignmentForm
