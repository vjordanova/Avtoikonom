describe('Create new partner', () => {
  let partnerData
  let partnerName

  before(() => {
    const now = new Date()
    const ts = now.toISOString().replace(/[T:.Z]/g, '').slice(0, 15)
    partnerName = `VJ${ts}`

    cy.fixture('init-data').then((data) => {
      partnerData = data.PARTNERS
    })

    cy.session('login', () => {
      cy.visit('https://dev.admin.avtoikonom.com')
      cy.get('input[type="login"]').type('test_qa_ex@example.com')
      cy.get('input[type="password"]').type('test_qa_ex@example.com')
      cy.get('button[type="submit"]').click()
      cy.url().should('not.include', '/login')
    })
  })

  it('opens New partner popup and fills all fields', () => {
    cy.visit('https://dev.admin.avtoikonom.com/partners')

    // Verify page loaded completely
    cy.contains(/Show \d+-\d+ from \d+ results/).should('be.visible')
    cy.get('tr.ant-table-row').should('have.length.greaterThan', 0)

    // Open popup
    cy.contains('button', 'New partner').click()

    // Verify popup is visible and loaded
    cy.get('[role="dialog"]').should('be.visible')
    cy.get('[role="dialog"]').contains('New partner').should('be.visible')
    cy.get('input[placeholder="Write partner name"]').should('be.visible')

    // Name: from fixture 
    cy.get('input[placeholder="Write partner name"]').type(partnerName)

    // Type: select first option (Service / carService)
    cy.get('#partner-type-field').closest('.ant-select').click()
    cy.get('.ant-select-dropdown:visible .ant-select-item-option').contains(partnerData.type).click()

    // Services: select first option, then close dropdown
    cy.get('#service-types-field').closest('.ant-select').click()
    cy.get('.ant-select-dropdown:visible .ant-select-item-option').first().click()
    cy.get('#service-types-field').type('{esc}')

    // Subscription plan: select first option
    cy.get('#subscription-tier-field').closest('.ant-select').click()
    cy.get('.ant-select-dropdown:visible .ant-select-item-option').first().click()

    // Address
    cy.get('input[placeholder="Enter a location"]').type(partnerData.address)
    cy.get('.pac-container .pac-item').first().should('be.visible').click()
   
    // Telephone
    cy.get('#phone-field').clear().type(partnerData.phone)

    // Contact person
    cy.get('input[placeholder="Names of contact person"]').type(partnerData.contactPerson)

    // Description
    cy.get('#description-field').type(partnerData.description)

    // Logo: upload file
    cy.get('input[type="file"]').selectFile(
      'cypress/fixtures/lego-logo.png',
      { force: true }
    )

    // Wait for 'Edit photo' popup and click its Save button
    cy.contains('.ant-modal', 'Edit photo').contains('button', 'Save').click()
    partnerData.name = partnerName

    cy.then(() => cy.savePartnerData(partnerData))
    cy.then(() => cy.verifyPartnerContent(partnerData.uuid))
  })
})
