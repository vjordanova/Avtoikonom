Cypress.Commands.add('verifyPartnerContent', (uuid) => {
  cy.url().then((currentUrl) => {
    if (!currentUrl.includes('dev.admin.avtoikonom.com')) {
      cy.visit('https://dev.admin.avtoikonom.com')
    }
  })

  cy.window().then((win) => {
    const auth = JSON.parse(win.localStorage.getItem('auth') || '{}')
    const token = auth.accessToken

    cy.readFile('cypress/fixtures/expected-content.json').then((expectedContent) => {
      const expected = expectedContent.PARTNERS.find((p) => p.uuid === uuid)
      expect(expected, `Partner with uuid ${uuid} not found in expected-content.json`).to.exist

      cy.request({
        url: `https://dev.api.avtoikonom.com/admin/partner/${uuid}`,
        headers: { Authorization: token },
      }).then((response) => {
        expect(response.status).to.eq(200)
        const actual = response.body

        Object.keys(expected).forEach((field) => {
          if (field === 'logo') return
          if (field === 'address') {
            expect(actual[field], `field "address"`).to.include(expected[field])
          } else if (field === 'serviceTypes') {
            expect(actual[field][0]["id"], `field "serviceTypes"`).to.deep.equal(expected[field][0]["id"][0])
          } else if (field === "subscriptionTier") {
            expect (actual[field]["uuid"], `field "subscriptionTier"`).to.deep.equal(expected[field])
          } else if (typeof expected[field] === 'object' && expected[field] !== null) {
            expect(actual[field], `field "${field}"`).to.deep.equal(expected[field])
          } else {
            expect(actual[field], `field "${field}"`).to.equal(expected[field])
          }
        })
      })
    })
  })
})

Cypress.Commands.add('savePartnerData', (partnerData) => {//, partnerName, mode) => {
    cy.intercept('POST', 'https://dev.api.avtoikonom.com/admin/partner').as('createPartner')

    // Click Save on the 'New partner' popup
    cy.contains('.ant-modal', 'New partner').contains('button', 'Save').click()   

    // Extract fields from request body and uuid from response, update partnerData
    cy.wait('@createPartner').then(({ request, response }) => {
      const body = request.body
      partnerData.type             = body.type
      partnerData.subscriptionTier = body.subscriptionTier
      partnerData.phone            = body.phone
      partnerData.serviceTypes[0].id     = body.serviceTypes
      partnerData.uuid             = response.body.uuid
    })

    cy.task('appendPartnerToExpectedContent', {
      filePath: '/Users/vesselina/Projects/Avtoikonom/cypress/fixtures/expected-content.json',
      partner: partnerData,
    })
})

Cypress.Commands.add('editPartnerData', (partnerData, field) => {
  // Save and verify
    cy.contains('.ant-modal', 'Edit partner').contains('button', 'Save').click()
 
    cy.readFile('cypress/fixtures/expected-content.json').then((content) => {
    const partner = content.PARTNERS.find((p) => p.uuid === partnerData.uuid)
    if (partner) {
      partner[field] = partnerData[field]
      cy.writeFile('cypress/fixtures/expected-content.json', JSON.stringify(content, null, 2))
    }
    })
})