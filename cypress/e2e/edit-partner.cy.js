let partnerData
let partnerName
let updatedDescription

describe('Edit partner', () => {
  before(() => {
    cy.fixture('expected-content').then((data) => {
      partnerData = data.PARTNERS[0]
    })

    // Field to be updated
    updatedDescription = "Updated test description here"

    cy.session('login', () => {
      cy.visit('https://dev.admin.avtoikonom.com')
      cy.get('input[type="login"]').type('test_qa_ex@example.com')
      cy.get('input[type="password"]').type('test_qa_ex@example.com')
      cy.get('button[type="submit"]').click()
      cy.url().should('not.include', '/login')
    })
  })

  it('searches for partner, opens Edit popup and updates description', () => {
    cy.visit('https://dev.admin.avtoikonom.com/partners')

    // Verify page loaded
    cy.contains(/Show \d+-\d+ from \d+ results/).should('be.visible')
    cy.get('tr.ant-table-row').should('have.length.greaterThan', 0)

    // Search for the partner
    cy.get('input[placeholder="Search by partners..."]').type(partnerData.name,'{enter}')

    // Verify the row with that exact name appears
    cy.contains('tr.ant-table-row', partnerData.name).should('be.visible')

    // Click three-dots on the matching row and select Edit
    cy.contains('tr.ant-table-row', partnerData.name)
      .find('[role="menuitem"]')
      .click()
    cy.contains('li.ant-menu-item', 'Edit').click()

    // Verify Edit partner popup is visible
    cy.contains('.ant-modal', 'Edit partner').should('be.visible')

    partnerData.description = updatedDescription

    // Update description
    cy.get('#description-field').clear().type(partnerData.description)

    cy.editPartnerData(partnerData, 'description')
    cy.then(() => cy.verifyPartnerContent(partnerData.uuid))
  })
})
