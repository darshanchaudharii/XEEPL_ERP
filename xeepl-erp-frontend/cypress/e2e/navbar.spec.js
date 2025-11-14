describe('Navbar Responsive Navigation', () => {
  beforeEach(() => {
    // Assuming there's a login flow - adjust based on your auth setup
    cy.visit('/login');
    // Add login steps here if needed
    // For now, we'll test the navbar structure
  });

  it('should show hamburger menu on mobile viewport', () => {
    cy.viewport(375, 667); // iPhone SE size
    cy.visit('/');
    
    // Hamburger button should be visible
    cy.get('.navbar-hamburger').should('be.visible');
    cy.get('.navbar-hamburger').should('have.attr', 'aria-label', 'Toggle navigation menu');
  });

  it('should toggle off-canvas menu when hamburger is clicked', () => {
    cy.viewport(375, 667);
    cy.visit('/');
    
    // Menu should be closed initially
    cy.get('.navbar-menu').should('not.have.class', 'navbar-menu-open');
    
    // Click hamburger
    cy.get('.navbar-hamburger').click();
    
    // Menu should be open
    cy.get('.navbar-menu').should('have.class', 'navbar-menu-open');
    cy.get('.navbar-overlay').should('be.visible');
    
    // Click hamburger again to close
    cy.get('.navbar-hamburger').click();
    cy.get('.navbar-menu').should('not.have.class', 'navbar-menu-open');
  });

  it('should close menu when overlay is clicked', () => {
    cy.viewport(375, 667);
    cy.visit('/');
    
    // Open menu
    cy.get('.navbar-hamburger').click();
    cy.get('.navbar-menu').should('have.class', 'navbar-menu-open');
    
    // Click overlay
    cy.get('.navbar-overlay').click({ force: true });
    
    // Menu should be closed
    cy.get('.navbar-menu').should('not.have.class', 'navbar-menu-open');
  });

  it('should close menu when navigation link is clicked', () => {
    cy.viewport(375, 667);
    cy.visit('/');
    
    // Open menu
    cy.get('.navbar-hamburger').click();
    cy.get('.navbar-menu').should('have.class', 'navbar-menu-open');
    
    // Click a navigation link (if available)
    cy.get('.navbar-menu a').first().click();
    
    // Menu should be closed after navigation
    cy.get('.navbar-menu').should('not.have.class', 'navbar-menu-open');
  });

  it('should show horizontal menu on desktop viewport', () => {
    cy.viewport(1920, 1080);
    cy.visit('/');
    
    // Hamburger should not be visible
    cy.get('.navbar-hamburger').should('not.be.visible');
    
    // Menu should be visible and horizontal
    cy.get('.navbar-menu').should('be.visible');
    cy.get('.navbar-menu').should('have.css', 'flex-direction', 'row');
  });

  it('should be keyboard accessible', () => {
    cy.viewport(375, 667);
    cy.visit('/');
    
    // Tab to hamburger
    cy.get('body').tab();
    cy.focused().should('have.class', 'navbar-hamburger');
    
    // Press Enter to open
    cy.focused().type('{enter}');
    cy.get('.navbar-menu').should('have.class', 'navbar-menu-open');
    
    // Press Escape to close
    cy.get('body').type('{esc}');
    cy.get('.navbar-menu').should('not.have.class', 'navbar-menu-open');
  });
});

