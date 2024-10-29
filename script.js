document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeDropdownNavigation();
    setupScrollToTop();
    setupIntersectionObserver();
    setupTeamMemberInteractions();
    setupImageErrorHandling();
    setupMobileNavigation();
    setupPublicationCards();
    updateFooterSites();  
});

function initializeNavigation() {
    const defaultSection = window.location.hash.slice(1) || 'home';
    showSection(defaultSection);

    window.addEventListener('popstate', function(e) {
        const section = window.location.hash.slice(1) || 'home';
        showSection(section, false);
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').slice(1);
            showSection(sectionId);
            window.history.pushState(null, '', `#${sectionId}`);
        });
    });
}
// Add these functions to your existing script.js
function initializeDropdownNavigation() {
    // Create section data structure
    const sections = {
        about: {
            title: 'About Us',
            items: ['Research Objectives', 'Current Focus']
        },
        sites: {
            title: 'Our Team',
            items: [
                'Principal Investigators',
                'Clinical Research Fellows',
                'Post-doctoral Researchers',
                'PhD Researchers',
                'Masters Researchers',
                'Undergraduate Researchers',
                'Clinical Contributors',
                'Admin Staff',
                'Participating Institutions'
            ]
        },
        publications: {
            title: 'Recent Works',
            items: ['Publications', 'Presentations']
        },
        portal: {
            title: 'Collaborator Portal',
            items: ['Study REDCap', 'Data Upload', 'Study Documents', 'Becoming a Collaborator']
        }
    };

    // Create dropdowns
    const navLinks = document.querySelector('.nav-links');
    Object.entries(sections).forEach(([sectionId, section]) => {
        const dropdown = createDropdown(sectionId, section);
        navLinks.appendChild(dropdown);
    });
}

function createDropdown(sectionId, section) {
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    
    const button = document.createElement('a');
    button.className = 'dropdown-button';
    button.href = `#${sectionId}`;
    button.textContent = section.title; // Removed the dropdown indicator
    
    const content = document.createElement('div');
    content.className = 'dropdown-content';
    
    section.items.forEach(item => {
        const link = document.createElement('a');
        link.href = `#${sectionId}`;
        link.textContent = item;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(sectionId);
            if (window.innerWidth <= 768) {
                document.querySelector('.nav-links').classList.remove('active');
            }
        });
        content.appendChild(link);
    });
    
    dropdown.appendChild(button);
    dropdown.appendChild(content);
    return dropdown;
}

function showSection(sectionId, scroll = true) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        setTimeout(() => targetSection.classList.add('active'), 10);
    }

    // Update active nav link - modified to exclude home button
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') !== '#home') {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        }
    });

    // Handle scroll
    if (scroll) {
        if (sectionId === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    }
}


function handleScroll(sectionId) {
    if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    }
}

function toggleContent(contentId) {
    closeAllContentSections(contentId);
    const content = document.getElementById(`${contentId}-content`);
    
    if (content) {
        const isExpanding = !content.classList.contains('active');
        content.classList.toggle('active');
        
        if (isExpanding) {
            expandSection(content);
        } else {
            content.style.maxHeight = null;
        }
    }
}

function closeAllContentSections(exceptId) {
    document.querySelectorAll('.section-content').forEach(section => {
        if (section.id !== `${exceptId}-content`) {
            section.classList.remove('active');
            section.style.maxHeight = null;
        }
    });
}

function expandSection(content) {
    content.style.maxHeight = content.scrollHeight + "px";
    const navHeight = document.querySelector('.navbar').offsetHeight;
    const targetPosition = content.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

function setupScrollToTop() {
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-top';
    scrollButton.innerHTML = '↑';
    document.body.appendChild(scrollButton);

    window.addEventListener('scroll', () => {
        scrollButton.classList.toggle('visible', window.pageYOffset > 300);
    });

    scrollButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function setupIntersectionObserver() {
    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        },
        { root: null, rootMargin: '0px', threshold: 0.1 }
    );

    document.querySelectorAll('.section-button, .team-member, .site-logo').forEach(element => {
        observer.observe(element);
    });
}

function setupTeamMemberInteractions() {
    const teamMembers = document.querySelectorAll('.team-member');
    let activeCard = null;
    
    teamMembers.forEach((member, index) => {
        const card = member.querySelector('.card');
        
        member.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // If clicking the same card, just toggle it
            if (activeCard === member) {
                toggleCard(member);
                activeCard = null;
                return;
            }
            
            // Reset previous active card if exists
            if (activeCard) {
                resetRow(activeCard, teamMembers);
                activeCard = null;
            }
            
            // Find cards in the same row
            const rowMembers = findRowMembers(member, teamMembers);
            
            // Expand clicked card and adjust row members
            member.classList.add('expanded');
            card.classList.add('flipped');
            
            // Move other cards in the same row
            rowMembers.forEach(rowMember => {
                if (rowMember !== member) {
                    rowMember.classList.add('move-to-next-row');
                }
            });
            
            activeCard = member;
            
            // Scroll expanded card into view
            setTimeout(() => {
                member.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        });
    });
    
    // Close active card when clicking outside
    document.addEventListener('click', (e) => {
        if (activeCard && !e.target.closest('.team-member')) {
            resetRow(activeCard, teamMembers);
            activeCard = null;
        }
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (activeCard) {
                resetRow(activeCard, teamMembers);
                activeCard = null;
            }
        }, 250);
    });
}

function findRowMembers(member, teamMembers) {
    const memberRect = member.getBoundingClientRect();
    const rowMembers = [];
    
    // Find all cards that share the same row (similar y-position)
    teamMembers.forEach(otherMember => {
        const otherRect = otherMember.getBoundingClientRect();
        if (Math.abs(otherRect.top - memberRect.top) < 5) { // 5px tolerance
            rowMembers.push(otherMember);
        }
    });
    
    return rowMembers;
}

function resetRow(activeCard, teamMembers) {
    // Remove expanded state from active card
    activeCard.classList.remove('expanded');
    activeCard.querySelector('.card').classList.remove('flipped');
    
    // Reset all moved cards
    teamMembers.forEach(member => {
        member.classList.remove('move-to-next-row');
    });
}

function toggleCard(member) {
    const card = member.querySelector('.card');
    member.classList.toggle('expanded');
    card.classList.toggle('flipped');
    
    if (!member.classList.contains('expanded')) {
        const teamMembers = document.querySelectorAll('.team-member');
        teamMembers.forEach(m => {
            m.classList.remove('move-to-next-row');
        });
    }
}


function setupImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = '/api/placeholder/150/150';
            this.alt = 'Image placeholder';
        });
    });
}

function setupPublicationCards() {
    const publicationCards = document.querySelectorAll('.publication-card');
    let activeCard = null;
    
    publicationCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // If clicking the same card, just toggle it
            if (activeCard === card) {
                card.querySelector('.card').classList.toggle('flipped');
                return;
            }
            
            // Reset previous active card if exists
            if (activeCard) {
                activeCard.querySelector('.card').classList.remove('flipped');
            }
            
            // Flip the clicked card
            card.querySelector('.card').classList.add('flipped');
            activeCard = card;
        });
    });
    
    // Close active card when clicking outside
    document.addEventListener('click', (e) => {
        if (activeCard && !e.target.closest('.publication-card')) {
            activeCard.querySelector('.card').classList.remove('flipped');
            activeCard = null;
        }
    });
}

function setupMobileNavigation() {
    const navLinks = document.querySelector('.nav-links');
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
        }
    });
}

function updateFooterSites() {
    const footerSites = document.querySelector('.footer-section:nth-child(2)');
    const sites = {
        Europe: [
            'Imperial College London',
            'Medical University of Vienna'
        ],
        'North America': [
            'Johns Hopkins Hospital',
            'Mount Sinai Hospital'
        ],
        Asia: [
            'National Taiwan University'
        ]
    };

    footerSites.innerHTML = `
        <h3>Participating Sites</h3>
        <div class="footer-sites">
            ${Object.entries(sites).map(([region, institutions]) => `
                <div class="footer-region">
                    <h4>${region}</h4>
                    <ul>
                        ${institutions.map(site => `
                            <li><a href="#sites">${site}</a></li>
                        `).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    `;
}