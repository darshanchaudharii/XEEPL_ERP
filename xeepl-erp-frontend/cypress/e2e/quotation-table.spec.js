describe('Quotation Table Responsive Display', () => {
  beforeEach(() => {
    // Assuming login and navigation to make-quotation page
    cy.visit('/login');
    // Add login steps here
    // Then navigate to make-quotation
    // cy.visit('/make-quotation');
  });

  it('should display stacked cards on mobile viewport', () => {
    cy.viewport(375, 667); // Mobile size
    cy.visit('/make-quotation');
    
    // Wait for content to load
    cy.wait(1000);
    
    // Mobile card layout should be visible
    cy.get('.quotation-lines-mobile').should('be.visible');
    
    // Table wrapper should be hidden
    cy.get('.table-wrapper').should('not.be.visible');
    
    // Check for card structure
    cy.get('.quotation-line-card').should('exist');
    cy.get('.card-header-row').should('exist');
    cy.get('.card-row').should('exist');
  });

  it('should display table view on desktop viewport', () => {
    cy.viewport(1920, 1080); // Desktop size
    cy.visit('/make-quotation');
    
    // Wait for content to load
    cy.wait(1000);
    
    // Table should be visible
    cy.get('.table-wrapper').should('be.visible');
    cy.get('.quotation-table').should('be.visible');
    
    // Mobile cards should be hidden
    cy.get('.quotation-lines-mobile').should('not.be.visible');
    
    // Check for table structure
    cy.get('.quotation-table thead').should('be.visible');
    cy.get('.quotation-table tbody').should('exist');
  });

  it('should preserve raw-material nesting in mobile cards', () => {
    cy.viewport(375, 667);
    cy.visit('/make-quotation');
    
    cy.wait(1000);
    
    // Check for raw materials container
    cy.get('.raw-materials-container').should('exist');
    cy.get('.raw-material-card').should('exist');
    
    // Check for alphabetical labeling (a), b), etc.)
    cy.get('.raw-label').should('contain.text', 'a)');
  });

  it('should preserve raw-material nesting in desktop table', () => {
    cy.viewport(1920, 1080);
    cy.visit('/make-quotation');
    
    cy.wait(1000);
    
    // Raw materials should be indented in table
    cy.get('.quotation-table tbody tr').should('exist');
    
    // Check for raw material rows with indentation
    cy.get('.quotation-table tbody tr').contains('a)').should('exist');
  });

  it('should switch between card and table view on resize', () => {
    // Start with mobile
    cy.viewport(375, 667);
    cy.visit('/make-quotation');
    cy.wait(1000);
    
    cy.get('.quotation-lines-mobile').should('be.visible');
    cy.get('.table-wrapper').should('not.be.visible');
    
    // Resize to desktop
    cy.viewport(1920, 1080);
    cy.wait(500); // Wait for resize handler
    
    cy.get('.table-wrapper').should('be.visible');
    cy.get('.quotation-lines-mobile').should('not.be.visible');
  });
});

