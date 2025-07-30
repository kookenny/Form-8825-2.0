import React, { useState, useEffect } from 'react'
import './TaxGroups.css'

interface TaxGroupsProps {
  onBack?: () => void
  onNavigateToEngagementSetup?: () => void
  onNavigateToAssignment?: () => void
  onNavigateToTaxAdjustment?: () => void
  onNavigateToForm8825?: () => void
  customTaxGroups?: Array<{
    code: string
    name: string
    parentCode: string
  }>
  onUpdateCustomTaxGroups?: (taxGroups: Array<{ code: string; name: string; parentCode: string }>) => void
}

function TaxGroups({ 
  onBack, 
  onNavigateToEngagementSetup, 
  onNavigateToAssignment,
  onNavigateToTaxAdjustment,
  onNavigateToForm8825,
  customTaxGroups = [],
  onUpdateCustomTaxGroups
}: TaxGroupsProps) {

  // State for active tab
  const [activeTab, setActiveTab] = useState('1125A')
  
  // State for expanded tax groups (only for 8825 tab)
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({})
  
  // State for sub-rows under each tax group (only for 8825 tab)
  const [subRows, setSubRows] = useState<{[key: string]: Array<{id: string, field1: string, field2: string}>}>({})

  // Initialize sub-rows from existing customTaxGroups when component mounts
  useEffect(() => {
    if (customTaxGroups.length > 0 && Object.keys(subRows).length === 0) {
      const initialSubRows: {[key: string]: Array<{id: string, field1: string, field2: string}>} = {}
      
      customTaxGroups.forEach((group, index) => {
        const parentCode = group.parentCode
        if (!initialSubRows[parentCode]) {
          initialSubRows[parentCode] = []
        }
        
        initialSubRows[parentCode].push({
          id: `${parentCode}_${index + 1}`,
          field1: group.code,
          field2: group.name
        })
        
        // Also expand the parent group to show the existing sub-rows
        setExpandedGroups(prev => ({
          ...prev,
          [parentCode]: true
        }))
      })
      
      setSubRows(initialSubRows)
    }
  }, [customTaxGroups, subRows])
  const toggleExpanded = (groupCode: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupCode]: !prev[groupCode]
    }))
    
    // Initialize with one empty row if expanding for the first time
    if (!expandedGroups[groupCode] && !subRows[groupCode]) {
      setSubRows(prev => ({
        ...prev,
        [groupCode]: [{id: `${groupCode}_1`, field1: '', field2: ''}]
      }))
    }
  }

  // Function to add a new sub-row
  const addSubRow = (groupCode: string) => {
    setSubRows(prev => {
      const currentRows = prev[groupCode] || []
      const newId = `${groupCode}_${currentRows.length + 1}`
      return {
        ...prev,
        [groupCode]: [...currentRows, {id: newId, field1: '', field2: ''}]
      }
    })
  }

  // Function to remove a sub-row
  const removeSubRow = (groupCode: string, rowId: string) => {
    setSubRows(prev => {
      const newSubRows = {
        ...prev,
        [groupCode]: (prev[groupCode] || []).filter(row => row.id !== rowId)
      }
      return newSubRows
    })
    // Sync after removing a row
    setTimeout(() => syncCustomTaxGroups(), 100)
  }

  // Function to update sub-row field
  const updateSubRowField = (groupCode: string, rowId: string, field: 'field1' | 'field2', value: string) => {
    setSubRows(prev => ({
      ...prev,
      [groupCode]: (prev[groupCode] || []).map(row => 
        row.id === rowId ? {...row, [field]: value} : row
      )
    }))
  }

  // Function to handle field blur - sync when user finishes editing
  const handleFieldBlur = () => {
    syncCustomTaxGroups()
  }

  // Function to handle Number field blur (format tax group number)
  const handleNumberFieldBlur = (groupCode: string, rowId: string, value: string) => {
    // Only process if there's a value
    if (!value.trim()) return

    // Extract just the number part and validate
    const numberValue = parseInt(value.replace(/[^0-9]/g, ''))
    
    // Validate range 1-79
    if (isNaN(numberValue) || numberValue < 1 || numberValue > 79) {
      // Clear invalid values
      updateSubRowField(groupCode, rowId, 'field1', '')
      return
    }

    // Format as tax group number (e.g., "8825.02.1")
    const formattedValue = `${groupCode}.${numberValue}`
    updateSubRowField(groupCode, rowId, 'field1', formattedValue)
  }

  // Function to sync sub-rows data with parent component
  const syncCustomTaxGroups = () => {
    const customGroups: Array<{ code: string; name: string; parentCode: string }> = []
    
    Object.entries(subRows).forEach(([parentCode, rows]) => {
      rows.forEach(row => {
        if (row.field1 && row.field2) { // Only include rows with both code and name
          customGroups.push({
            code: row.field1,
            name: row.field2,
            parentCode: parentCode
          })
        }
      })
    })
    
    onUpdateCustomTaxGroups?.(customGroups)
  }

  // Tax group data based on the screenshot
  const taxGroups1125A = [
    { code: '1125A01', name: 'CGS - Beginning Inventory' },
    { code: '1125A02', name: 'CGS - Purchases' },
    { code: '1125A03', name: 'CGS - Cost of labor' },
    { code: '1125A04', name: 'CGS - Additional Sec 263A costs' },
    { code: '1125A05', name: 'CGS - Other costs' },
    { code: '1125A05A', name: 'COPS: Other Costs' },
    { code: '1125A07', name: 'CGS - Ending Inventory' }
  ]

  // Form 8825 tax groups data
  const taxGroups8825 = [
    { code: '8825.02', name: 'Gross rents' },
    { code: '8825.03', name: 'Advertising' },
    { code: '8825.04', name: 'Auto and travel' },
    { code: '8825.05', name: 'Cleaning and maintenance' },
    { code: '8825.06', name: 'Commissions' },
    { code: '8825.07', name: 'Insurance' },
    { code: '8825.08', name: 'Legal and other professional fees' },
    { code: '8825.09', name: 'Interest' },
    { code: '8825.10', name: 'Repairs' },
    { code: '8825.11', name: 'Taxes' },
    { code: '8825.12', name: 'Utilities' },
    { code: '8825.13', name: 'Wages and salaries' },
    { code: '8825.14', name: 'Depreciation' },
    { code: '8825.15', name: 'Other' }
  ]

  return (
    <div className="tax-groups-container">
      {/* Header */}
      <div className="tax-groups-header">
        <h1 className="tax-groups-title">1-565 S-Corporation - Tax groups</h1>
        <button className="play-button">▶</button>
      </div>

      {/* Tab Navigation */}
      <div className="tax-groups-tabs">
        <button className="tab-button">Income and deductions</button>
        <button className="tab-button">Schedule K - Shareholders' pro rata share items</button>
        <button className="tab-button">Schedule L - Balance sheet per books</button>
        <button className="tab-button">Schedule M-1 - Reconciliation of income (loss) per...</button>
        <button className="tab-button">Schedule M-2 - Analysis of accumulated adjustme...</button>
        <button 
          className={`tab-button ${activeTab === '1125A' ? 'active' : ''}`}
          onClick={() => setActiveTab('1125A')}
        >
          Schedule 1125-A - Cost of goods sold
        </button>
        <button 
          className={`tab-button ${activeTab === '8825' ? 'active' : ''}`}
          onClick={() => setActiveTab('8825')}
        >
          Form 8825 - Rental real estate income and expenses
        </button>
      </div>

      {/* Main Content */}
      <div className="tax-groups-content">
        {/* Action Buttons */}
        <div className="tax-groups-buttons">
          <button className="tax-groups-btn" onClick={onBack || onNavigateToEngagementSetup}>Engagement Setup</button>
          <button className="tax-groups-btn" onClick={onNavigateToAssignment}>Tax group assignment</button>
          <button className="tax-groups-btn" onClick={onNavigateToTaxAdjustment}>Tax adjustments</button>
          <button className="tax-groups-btn" onClick={onNavigateToForm8825}>Form 8825</button>
        </div>

        {/* Form Section */}
        <div className="tax-groups-form-section">
          <div className="section-header">
            <h2 className="section-title">
              {activeTab === '1125A' ? 'Schedule 1125-A - Cost of goods sold' : 'Form 8825 - Rental real estate income and expenses'}
            </h2>
            <button className="expand-button">▲</button>
          </div>

          {/* Tax Groups Table */}
          <div className="tax-groups-table-container">
            <table className="tax-groups-table">
              <thead>
                <tr className="tax-groups-header-row">
                  <th className="tax-group-column">Tax group</th>
                  <th className="tax-group-name-column">Tax group name</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === '1125A' ? taxGroups1125A : taxGroups8825).map((group) => (
                  <React.Fragment key={group.code}>
                    <tr className="tax-groups-row">
                      <td className="tax-group-cell">
                        <button 
                          className="expand-row-button"
                          onClick={() => activeTab === '8825' ? toggleExpanded(group.code) : undefined}
                          style={{
                            transform: activeTab === '8825' && expandedGroups[group.code] ? 'rotate(90deg)' : 'rotate(0deg)',
                            cursor: activeTab === '8825' ? 'pointer' : 'default'
                          }}
                        >
                          ▶
                        </button>
                        <span className="tax-group-code">{group.code}</span>
                      </td>
                      <td className="tax-group-name-cell">{group.name}</td>
                    </tr>
                    {/* Expandable sub-rows for 8825 tab only */}
                    {activeTab === '8825' && expandedGroups[group.code] && (
                      <tr className="sub-row-container">
                        <td colSpan={2} className="sub-row-cell">
                          <div className="sub-rows-wrapper">
                            {(subRows[group.code] || []).map((subRow) => (
                              <div key={subRow.id} className="sub-row">
                                <input
                                  type="text"
                                  className="sub-row-input"
                                  placeholder="Type number between 1 to 79"
                                  value={subRow.field1}
                                  onChange={(e) => updateSubRowField(group.code, subRow.id, 'field1', e.target.value)}
                                  onBlur={(e) => handleNumberFieldBlur(group.code, subRow.id, e.target.value)}
                                />
                                <input
                                  type="text"
                                  className="sub-row-input"
                                  placeholder="Name"
                                  value={subRow.field2}
                                  onChange={(e) => updateSubRowField(group.code, subRow.id, 'field2', e.target.value)}
                                  onBlur={handleFieldBlur}
                                />
                                <div className="sub-row-buttons">
                                  <button
                                    className="sub-row-btn add-btn"
                                    onClick={() => addSubRow(group.code)}
                                    title="Add row"
                                  >
                                    +
                                  </button>
                                  <button
                                    className="sub-row-btn remove-btn"
                                    onClick={() => removeSubRow(group.code, subRow.id)}
                                    disabled={subRows[group.code]?.length === 1}
                                    title="Remove row"
                                  >
                                    -
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxGroups
