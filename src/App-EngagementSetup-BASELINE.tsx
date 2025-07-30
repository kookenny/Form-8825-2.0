import { useState } from 'react'
import './App.css'

function App() {
  const [taxYear, setTaxYear] = useState('2023')
  const [taxSoftware, setTaxSoftware] = useState('Axcess/ProSystem fx')
  const [isTaxOnlyEngagement, setIsTaxOnlyEngagement] = useState('')
  const [hasRentalAccounts, setHasRentalAccounts] = useState('')
  const [numberOfProperties, setNumberOfProperties] = useState('')

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
          <button className="action-btn">Print to PDF</button>
          <button className="action-btn">Tax group assignment</button>
          <button className="action-btn">S-Corporation tax group</button>
          <button className="action-btn dropdown-btn">
            Tax schedules
            <span className="dropdown-arrow">▼</span>
          </button>
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
