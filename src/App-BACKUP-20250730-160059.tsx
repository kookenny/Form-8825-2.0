import { useState, useEffect } from 'react'
import './App.css'
import AssignmentForm from './AssignmentForm'
import TaxAdjustment from './TaxAdjustment'
import Form8825 from './Form8825'
import TaxGroups from './TaxGroups'

function App() {
  const [currentView, setCurrentView] = useState('engagement-setup')
  const [taxYear, setTaxYear] = useState('2023')
  const [taxSoftware, setTaxSoftware] = useState('Axcess/ProSystem fx')
  const [isTaxOnlyEngagement, setIsTaxOnlyEngagement] = useState('')
  const [hasRentalAccounts, setHasRentalAccounts] = useState('')
  const [numberOfProperties, setNumberOfProperties] = useState('')
  
  // Property details state
  const [propertyDetails, setPropertyDetails] = useState<Array<{
    property: string
    propertyId: string
    propertyName: string
  }>>([])

  // Account data state for Assignment form
  const [accountData, setAccountData] = useState([
    { number: '401', name: 'Rental income', amount2023: '(505.00)', amount2022: '(252.50)', taxGroup: '', property: '' },
    { number: '405', name: 'Rental income - ThreeBears', amount2023: '(606.00)', amount2022: '(303.00)', taxGroup: '', property: '' },
    { number: '406', name: 'Rental income - BearForceOne', amount2023: '(707.00)', amount2022: '(353.50)', taxGroup: '', property: '' },
    { number: '501', name: 'Advertising', amount2023: '505.00', amount2022: '252.50', taxGroup: '', property: '' },
    { number: '505', name: 'Advertising - ThreeBears', amount2023: '606.00', amount2022: '303.00', taxGroup: '', property: '' },
    { number: '506', name: 'Advertising - BearForceOne', amount2023: '707.00', amount2022: '353.50', taxGroup: '', property: '' }
  ])

  // Tax adjustment data state
  const [adjustmentData, setAdjustmentData] = useState([
    { type: '', ref: '', description: 'Please enter the description' }
  ])

  const [scheduleData, setScheduleData] = useState([
    { schedule: 'Income and deductions', group: '', amount: '', property: '' },
    { schedule: '8825', group: '', amount: '', property: '' }
  ])

  const [isRecurring, setIsRecurring] = useState(true)

  // Update account data when tax-only engagement changes
  const updateAccountDataForTaxOnly = (isTaxOnly: boolean) => {
    if (!isTaxOnly) {
      // Set default tax groups for non-tax-only engagements
      setAccountData(prev => prev.map(account => ({
        ...account,
        taxGroup: account.number === '401' ? '5 Other income (loss) (see instructions—attach statement)' :
                  account.number.startsWith('40') ? '1a Gross receipts or sales' :
                  '16 Advertising'
      })))
    } else {
      // Clear tax groups for tax-only engagements
      setAccountData(prev => prev.map(account => ({
        ...account,
        taxGroup: ''
      })))
    }
  }

  // Update account data when tax-only engagement changes
  useEffect(() => {
    if (isTaxOnlyEngagement !== '') {
      updateAccountDataForTaxOnly(isTaxOnlyEngagement === 'Yes')
    }
  }, [isTaxOnlyEngagement])

  // Update property details when number of properties changes
  useEffect(() => {
    const numProps = parseInt(numberOfProperties) || 0
    if (numProps > 0) {
      setPropertyDetails(prev => {
        const newPropertyDetails = Array.from({ length: numProps }, (_, index) => ({
          property: `Property ${index + 1}`,
          propertyId: prev[index]?.propertyId || '',
          propertyName: prev[index]?.propertyName || ''
        }))
        return newPropertyDetails
      })
    } else {
      setPropertyDetails([])
    }
  }, [numberOfProperties])

  // Function to update property details
  const updatePropertyDetail = (index: number, field: 'propertyId' | 'propertyName', value: string) => {
    console.log('App.tsx - updatePropertyDetail called:', index, field, value)
    setPropertyDetails(prev => {
      const updated = prev.map((prop, i) => 
        i === index ? { ...prop, [field]: value } : prop
      )
      console.log('App.tsx - updated propertyDetails:', updated)
      return updated
    })
  }

  // Navigation handler
  const navigateToAssignment = () => {
    setCurrentView('assignment-form')
  }

  const navigateToEngagementSetup = () => {
    setCurrentView('engagement-setup')
  }

  const navigateToTaxAdjustment = () => {
    setCurrentView('tax-adjustment')
  }

  const navigateToForm8825 = () => {
    setCurrentView('form8825')
  }

  const navigateToTaxGroups = () => {
    setCurrentView('tax-groups')
  }

  // Render Assignment Form
  if (currentView === 'assignment-form') {
    console.log('App.tsx - Rendering AssignmentForm with propertyDetails:', propertyDetails)
    return <AssignmentForm 
      onBack={navigateToEngagementSetup} 
      showPropertyColumn={hasRentalAccounts === 'Yes'}
      numberOfProperties={parseInt(numberOfProperties) || 0}
      onNavigateToTaxGroups={navigateToTaxGroups}
      onNavigateToTaxAdjustment={navigateToTaxAdjustment}
      onNavigateToForm8825={navigateToForm8825}
      accountData={accountData}
      setAccountData={setAccountData}
      propertyDetails={propertyDetails}
    />
  }

  // Render Tax Adjustment Form
  if (currentView === 'tax-adjustment') {
    return <TaxAdjustment 
      onBack={navigateToEngagementSetup}
      onNavigateToAssignment={navigateToAssignment}
      onNavigateToForm8825={navigateToForm8825}
      onNavigateToTaxGroups={navigateToTaxGroups}
      showPropertyColumn={hasRentalAccounts === 'Yes'}
      numberOfProperties={parseInt(numberOfProperties) || 0}
      adjustmentData={adjustmentData}
      setAdjustmentData={setAdjustmentData}
      scheduleData={scheduleData}
      setScheduleData={setScheduleData}
      isRecurring={isRecurring}
      setIsRecurring={setIsRecurring}
      propertyDetails={propertyDetails}
    />
  }

  // Render Form 8825
  if (currentView === 'form8825') {
    return <Form8825 
      onBack={navigateToEngagementSetup}
      onNavigateToAssignment={navigateToAssignment}
      onNavigateToTaxAdjustment={navigateToTaxAdjustment}
      onNavigateToTaxGroups={navigateToTaxGroups}
      numberOfProperties={parseInt(numberOfProperties) || 3}
      accountData={accountData}
      scheduleData={scheduleData}
      propertyDetails={propertyDetails}
      formatAmount={(amount: number) => {
        if (amount < 0) {
          return `(${Math.abs(amount).toFixed(2)})`
        }
        return amount.toFixed(2)
      }}
    />
  }

  // Render Tax Groups
  if (currentView === 'tax-groups') {
    return <TaxGroups 
      onBack={navigateToEngagementSetup}
      onNavigateToEngagementSetup={navigateToEngagementSetup}
      onNavigateToAssignment={navigateToAssignment}
      onNavigateToTaxAdjustment={navigateToTaxAdjustment}
      onNavigateToForm8825={navigateToForm8825}
    />
  }

  // Render Engagement Setup (default)
  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <h1 className="engagement-title">1-100 Engagement set-up</h1>
        <button className="play-button">▶</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-btn" onClick={navigateToTaxGroups}>Tax groups</button>
          <button className="action-btn" onClick={navigateToAssignment}>Tax group assignment</button>
          <button className="action-btn" onClick={navigateToTaxAdjustment}>Tax adjustments</button>
          <button className="action-btn" onClick={navigateToForm8825}>Form 8825</button>
        </div>

        {/* Engagement Setup Section */}
        <div className="engagement-setup">
          <h2 className="section-title">Engagement set-up</h2>
          
          <div className="form-grid">
            {/* Entity Type Row */}
            <div className="form-row">
              <label className="form-label">Entity type:</label>
              <div className="form-value-container">
                <div className="form-value">S-Corporation</div>
              </div>
            </div>

            {/* Tax Year Row */}
            <div className="form-row">
              <label className="form-label">Tax year:</label>
              <div className="form-dropdown-container">
                <select 
                  className="form-dropdown"
                  value={taxYear}
                  onChange={(e) => setTaxYear(e.target.value)}
                >
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>
            </div>

            {/* Tax Software Row */}
            <div className="form-row">
              <label className="form-label">Tax software:</label>
              <div className="form-dropdown-container">
                <select 
                  className="form-dropdown"
                  value={taxSoftware}
                  onChange={(e) => setTaxSoftware(e.target.value)}
                >
                  <option value="Axcess/ProSystem fx">Axcess/ProSystem fx</option>
                  <option value="Lacerte">Lacerte</option>
                  <option value="GoSystem">GoSystem</option>
                  <option value="UltraTax CS">UltraTax CS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form 8825 Section */}
          <div className="form-8825-section">            
            {/* Tax-Only Engagement Question */}
            <div className="form-row">
              <label className="form-label">Indicate if this is a tax-only engagement:</label>
              <div className="form-button-container">
                <button
                  type="button"
                  className={`form-button ${isTaxOnlyEngagement === 'Yes' ? 'selected' : ''}`}
                  onClick={() => setIsTaxOnlyEngagement(isTaxOnlyEngagement === 'Yes' ? '' : 'Yes')}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`form-button ${isTaxOnlyEngagement === 'No' ? 'selected' : ''}`}
                  onClick={() => setIsTaxOnlyEngagement(isTaxOnlyEngagement === 'No' ? '' : 'No')}
                >
                  No
                </button>
              </div>
            </div>

            {/* Rental Accounts Question */}
            <div className="form-row">
              <label className="form-label">Does the trial balance contain rental income/expense accounts to be reported on Form 8825?</label>
              <div className="form-button-container">
                <button
                  type="button"
                  className={`form-button ${hasRentalAccounts === 'Yes' ? 'selected' : ''}`}
                  onClick={() => setHasRentalAccounts(hasRentalAccounts === 'Yes' ? '' : 'Yes')}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`form-button ${hasRentalAccounts === 'No' ? 'selected' : ''}`}
                  onClick={() => setHasRentalAccounts(hasRentalAccounts === 'No' ? '' : 'No')}
                >
                  No
                </button>
              </div>
            </div>

            {/* Conditional Follow-up Question */}
            {hasRentalAccounts === 'Yes' && (
              <>
                <div className="form-row">
                  <label className="form-label">Indicate the number of properties:</label>
                  <div className="form-input-container">
                    <input 
                      type="number"
                      className="form-input"
                      value={numberOfProperties}
                      onChange={(e) => setNumberOfProperties(e.target.value)}
                      placeholder="Enter number"
                      min="1"
                    />
                  </div>
                </div>

                {/* Property Details Table */}
                {parseInt(numberOfProperties) > 0 && (
                  <div className="property-table-container">
                    <table className="property-table">
                      <thead>
                        <tr>
                          <th className="property-column">Property</th>
                          <th className="property-id-column">Property ID (required)</th>
                          <th className="property-name-column">Property name (optional)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {propertyDetails.map((property, index) => (
                          <tr key={index}>
                            <td className="property-cell">{property.property}</td>
                            <td className="property-id-cell">
                              <input
                                type="text"
                                className="property-input property-id-input"
                                value={property.propertyId}
                                onChange={(e) => updatePropertyDetail(index, 'propertyId', e.target.value)}
                                placeholder="ID"
                                maxLength={4}
                                required
                              />
                            </td>
                            <td className="property-name-cell">
                              <input
                                type="text"
                                className="property-input property-name-input"
                                value={property.propertyName}
                                onChange={(e) => updatePropertyDetail(index, 'propertyName', e.target.value)}
                                placeholder="Property name"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Update Button */}
          <div className="update-button-container">
            <button className="update-button">
              Update engagement content
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
