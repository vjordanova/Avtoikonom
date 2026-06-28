describe('Login', () => {
  beforeEach(() => {
    cy.visit('https://dev.admin.avtoikonom.com')
  })

  it('logs in successfully with valid credentials', () => {
    cy.url().should('include', '/login')

    cy.get('input[type="login"]').type('test_qa_ex@example.com')
    cy.get('input[type="password"]').type('test_qa_ex@example.com')
    cy.get('button[type="submit"]').click()

    cy.url().should('not.include', '/login')
  })
})
