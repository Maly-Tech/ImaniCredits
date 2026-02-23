
        // Sample data - in production, this would come from a database
        let applications = [];
        let currentPage = 1;
        const itemsPerPage = 10;
        let filteredApplications = [];
        let currentUser = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // initializeApp();
            loadSampleData();
        });

        function initializeApp() {
            // Check if user is logged in
            const userSession = localStorage.getItem('adminSession');
            if (userSession) {
                currentUser = JSON.parse(userSession);
                showDashboard();
            }

            // Event listeners
            document.getElementById('loginForm').addEventListener('submit', handleLogin);
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);
            document.getElementById('statusFilter').addEventListener('change', applyFilters);
            document.getElementById('purposeFilter').addEventListener('change', applyFilters);
            document.getElementById('searchInput').addEventListener('input', applyFilters);
        }

        function loadSampleData() {
            // Check if data exists in localStorage
            const savedApps = localStorage.getItem('loanApplications');
            if (savedApps) {
                applications = JSON.parse(savedApps);
            } else {
                // Sample data for demonstration
                applications = [
                    {
                        id: 1,
                        firstName: 'John',
                        lastName: 'Kimani',
                        email: 'john.kimani@email.com',
                        phone: '+254712345678',
                        idNumber: '12345678',
                        dateOfBirth: '1985-05-15',
                        loanAmount: '$50,000',
                        loanPurpose: 'Home Purchase',
                        loanTerm: '10 Years',
                        annualSalary: '$45,000',
                        incomeSource: 'Salary',
                        employmentStatus: 'Employed - Full Time',
                        occupation: 'Software Engineer',
                        companyName: 'Tech Solutions Ltd',
                        industry: 'Technology',
                        yearsInJob: 3,
                        monthlyExpenses: '$2,500',
                        existingDebt: '$5,000',
                        streetAddress: '123 Nairobi Road',
                        city: 'Nairobi',
                        state: 'Nairobi County',
                        postalCode: '00100',
                        maritalStatus: 'Married',
                        bankAccountType: 'Savings Account',
                        status: 'Pending',
                        submittedDate: '2024-02-20',
                        notes: ''
                    },
                    {
                        id: 2,
                        firstName: 'Jane',
                        lastName: 'Ochieng',
                        email: 'jane.ochieng@email.com',
                        phone: '+254798765432',
                        idNumber: '87654321',
                        dateOfBirth: '1990-08-22',
                        loanAmount: '$75,000',
                        loanPurpose: 'Business',
                        loanTerm: '5 Years',
                        annualSalary: '$60,000',
                        incomeSource: 'Business Income',
                        employmentStatus: 'Self-Employed',
                        occupation: 'Business Owner',
                        companyName: 'Fashion Boutique',
                        industry: 'Retail',
                        yearsInJob: 5,
                        monthlyExpenses: '$3,000',
                        existingDebt: '$0',
                        streetAddress: '456 Mombasa Street',
                        city: 'Mombasa',
                        state: 'Mombasa County',
                        postalCode: '80100',
                        maritalStatus: 'Single',
                        bankAccountType: 'Checking Account',
                        status: 'Pending',
                        submittedDate: '2024-02-19',
                        notes: ''
                    },
                    {
                        id: 3,
                        firstName: 'Peter',
                        lastName: 'Kipchoge',
                        email: 'peter.kipchoge@email.com',
                        phone: '+254701234567',
                        idNumber: '11223344',
                        dateOfBirth: '1982-03-10',
                        loanAmount: '$100,000',
                        loanPurpose: 'Home Renovation',
                        loanTerm: '15 Years',
                        annualSalary: '$75,000',
                        incomeSource: 'Salary',
                        employmentStatus: 'Employed - Full Time',
                        occupation: 'Senior Manager',
                        companyName: 'Finance Corp',
                        industry: 'Finance',
                        yearsInJob: 8,
                        monthlyExpenses: '$4,000',
                        existingDebt: '$10,000',
                        streetAddress: '789 Karen Road',
                        city: 'Nairobi',
                        state: 'Nairobi County',
                        postalCode: '00621',
                        maritalStatus: 'Married',
                        bankAccountType: 'Money Market',
                        status: 'Approved',
                        submittedDate: '2024-02-15',
                        approvedDate: '2024-02-18',
                        notes: 'Good credit profile, approved for full amount'
                    }
                ];
                localStorage.setItem('loanApplications', JSON.stringify(applications));
            }

            filteredApplications = [...applications];
            updateStatistics();
            displayApplications();
        }

        function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;

            // Simple demo authentication
            if (email === 'admin@imani.com' && password === 'Admin123') {
                currentUser = {
                    id: 1,
                    name: 'Admin User',
                    email: email
                };
                localStorage.setItem('adminSession', JSON.stringify(currentUser));
                showDashboard();
                showToast('Login successful!', 'success');
            } else {
                showToast('Invalid email or password', 'error');
            }
        }

        function handleLogout() {
            localStorage.removeItem('adminSession');
            currentUser = null;
            document.getElementById('loginContainer').classList.add('active');
            document.getElementById('dashboard').classList.remove('active');
            document.getElementById('loginForm').reset();
            showToast('Logged out successfully', 'success');
        }

        function showDashboard() {
            document.getElementById('loginContainer').classList.remove('active');
            document.getElementById('dashboard').classList.add('active');
            document.getElementById('adminNameDisplay').textContent = currentUser.name;
        }

        function updateStatistics() {
            const total = applications.length;
            const pending = applications.filter(a => a.status === 'Pending').length;
            const approved = applications.filter(a => a.status === 'Approved').length;
            const rejected = applications.filter(a => a.status === 'Rejected').length;

            document.getElementById('totalApps').textContent = total;
            document.getElementById('pendingApps').textContent = pending;
            document.getElementById('approvedApps').textContent = approved;
            document.getElementById('rejectedApps').textContent = rejected;
        }

        function applyFilters() {
            const statusValue = document.getElementById('statusFilter').value;
            const purposeValue = document.getElementById('purposeFilter').value;
            const searchValue = document.getElementById('searchInput').value.toLowerCase();

            filteredApplications = applications.filter(app => {
                const statusMatch = !statusValue || app.status === statusValue;
                const purposeMatch = !purposeValue || app.loanPurpose === purposeValue;
                const searchMatch = !searchValue || 
                    app.firstName.toLowerCase().includes(searchValue) ||
                    app.lastName.toLowerCase().includes(searchValue) ||
                    app.email.toLowerCase().includes(searchValue);

                return statusMatch && purposeMatch && searchMatch;
            });

            currentPage = 1;
            displayApplications();
        }

        function displayApplications() {
            const tableBody = document.getElementById('applicationsTable');
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedApps = filteredApplications.slice(startIndex, endIndex);

            if (paginatedApps.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            <div class="empty-state">
                                <div class="empty-icon">📋</div>
                                <div class="empty-text">No applications found</div>
                            </div>
                        </td>
                    </tr>
                `;
                document.getElementById('pagination').innerHTML = '';
                return;
            }

            tableBody.innerHTML = paginatedApps.map(app => `
                <tr>
                    <td>${app.firstName} ${app.lastName}</td>
                    <td>${app.email}</td>
                    <td>${app.loanAmount}</td>
                    <td>${app.loanPurpose}</td>
                    <td>
                        <span class="status-badge status-${app.status.toLowerCase()}">
                            ${app.status}
                        </span>
                    </td>
                    <td>${formatDate(app.submittedDate)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-sm btn-view" onclick="viewDetails(${app.id})">View</button>
                            ${app.status === 'Pending' ? `
                                <button class="btn-sm btn-approve" onclick="openApprovalModal(${app.id})">Approve</button>
                                <button class="btn-sm btn-reject" onclick="openRejectionModal(${app.id})">Reject</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');

            displayPagination();
        }

        function displayPagination() {
            const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
            const paginationDiv = document.getElementById('pagination');

            if (totalPages <= 1) {
                paginationDiv.innerHTML = '';
                return;
            }

            let paginationHTML = '';

            // Previous button
            paginationHTML += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">← Previous</button>`;

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage) {
                    paginationHTML += `<button class="active" onclick="changePage(${i})">${i}</button>`;
                } else if (i <= 3 || i >= totalPages - 2 || Math.abs(i - currentPage) <= 1) {
                    paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
                } else if (i === 4 || i === totalPages - 3) {
                    paginationHTML += `<span>...</span>`;
                }
            }

            // Next button
            paginationHTML += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next →</button>`;

            paginationDiv.innerHTML = paginationHTML;
        }

        function changePage(page) {
            currentPage = page;
            displayApplications();
        }

        function viewDetails(appId) {
            const app = applications.find(a => a.id === appId);
            if (!app) return;

            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <div class="detail-section">
                    <div class="detail-section-title">Personal Information</div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">First Name</span>
                            <span class="detail-value">${app.firstName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Last Name</span>
                            <span class="detail-value">${app.lastName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${app.email}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Phone Number</span>
                            <span class="detail-value">${app.phone}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">ID Type</span>
                            <span class="detail-value">National ID</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">ID Number</span>
                            <span class="detail-value">${app.idNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date of Birth</span>
                            <span class="detail-value">${formatDate(app.dateOfBirth)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Marital Status</span>
                            <span class="detail-value">${app.maritalStatus}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Address Information</div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Street Address</span>
                            <span class="detail-value">${app.streetAddress}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">City</span>
                            <span class="detail-value">${app.city}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">County</span>
                            <span class="detail-value">${app.state}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Postal Code</span>
                            <span class="detail-value">${app.postalCode}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Employment Information</div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Employment Status</span>
                            <span class="detail-value">${app.employmentStatus}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Occupation</span>
                            <span class="detail-value">${app.occupation}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Company Name</span>
                            <span class="detail-value">${app.companyName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Industry</span>
                            <span class="detail-value">${app.industry}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Years in Current Job</span>
                            <span class="detail-value">${app.yearsInJob}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Financial Information</div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Annual Salary</span>
                            <span class="detail-value">${app.annualSalary}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Income Source</span>
                            <span class="detail-value">${app.incomeSource}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Monthly Expenses</span>
                            <span class="detail-value">${app.monthlyExpenses}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Existing Debt</span>
                            <span class="detail-value">${app.existingDebt}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Bank Account Type</span>
                            <span class="detail-value">${app.bankAccountType}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Loan Details</div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Requested Amount</span>
                            <span class="detail-value">${app.loanAmount}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Loan Purpose</span>
                            <span class="detail-value">${app.loanPurpose}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Preferred Term</span>
                            <span class="detail-value">${app.loanTerm}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Application Status</span>
                            <span class="detail-value">
                                <span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Application Timeline</div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Submitted Date</span>
                            <span class="detail-value">${formatDate(app.submittedDate)}</span>
                        </div>
                        ${app.approvedDate ? `
                        <div class="detail-item">
                            <span class="detail-label">Approved Date</span>
                            <span class="detail-value">${formatDate(app.approvedDate)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;

            // Setup action buttons
            const actionButtons = document.getElementById('actionButtons');
            if (app.status === 'Pending') {
                actionButtons.innerHTML = `
                    <button class="btn-modal btn-modal-success" onclick="approveApplication(${app.id})">Approve Application</button>
                    <button class="btn-modal btn-modal-danger" onclick="rejectApplication(${app.id})">Reject Application</button>
                `;
            } else {
                actionButtons.innerHTML = '';
            }

            document.getElementById('detailModal').classList.add('active');
        }

        function closeDetailModal() {
            document.getElementById('detailModal').classList.remove('active');
        }

        function openApprovalModal(appId) {
            const app = applications.find(a => a.id === appId);
            if (!app) return;

            const approval = confirm(`Are you sure you want to approve the application from ${app.firstName} ${app.lastName}?\n\nAn approval email will be sent to ${app.email}`);
            if (approval) {
                approveApplication(appId);
            }
        }

        function openRejectionModal(appId) {
            const app = applications.find(a => a.id === appId);
            if (!app) return;

            const rejection = confirm(`Are you sure you want to reject the application from ${app.firstName} ${app.lastName}?\n\nA rejection email will be sent to ${app.email}`);
            if (rejection) {
                rejectApplication(appId);
            }
        }

        function approveApplication(appId) {
            const app = applications.find(a => a.id === appId);
            if (!app) return;

            app.status = 'Approved';
            app.approvedDate = new Date().toISOString().split('T')[0];
            
            // Save to localStorage
            localStorage.setItem('loanApplications', JSON.stringify(applications));

            // Send approval email (in production, this would call a backend API)
            sendApprovalEmail(app);

            updateStatistics();
            displayApplications();
            closeDetailModal();
            showToast(`Application approved! Email sent to ${app.email}`, 'success');
        }

        function rejectApplication(appId) {
            const app = applications.find(a => a.id === appId);
            if (!app) return;

            app.status = 'Rejected';
            
            // Save to localStorage
            localStorage.setItem('loanApplications', JSON.stringify(applications));

            // Send rejection email (in production, this would call a backend API)
            sendRejectionEmail(app);

            updateStatistics();
            displayApplications();
            closeDetailModal();
            showToast(`Application rejected! Email sent to ${app.email}`, 'success');
        }

        function sendApprovalEmail(app) {
            // In production, this would call a backend API endpoint
            console.log(`[v0] Sending approval email to ${app.email}`);
            const emailContent = `
Dear ${app.firstName} ${app.lastName},

Congratulations! We are pleased to inform you that your loan application has been APPROVED.

Application Details:
- Loan Amount: ${app.loanAmount}
- Loan Purpose: ${app.loanPurpose}
- Loan Term: ${app.loanTerm}

Your application reference: APP-${app.id.toString().padStart(6, '0')}

We will contact you shortly with the next steps for fund disbursement.

Thank you for choosing ImaniCredit!

Best regards,
ImaniCredit Admin Team
            `;
            console.log('[v0] Email content:', emailContent);
        }

        function sendRejectionEmail(app) {
            // In production, this would call a backend API endpoint
            console.log(`[v0] Sending rejection email to ${app.email}`);
            const emailContent = `
Dear ${app.firstName} ${app.lastName},

Thank you for applying for a loan with ImaniCredit. Unfortunately, after careful review of your application, we are unable to approve your request at this time.

Application Details:
- Loan Amount Requested: ${app.loanAmount}
- Loan Purpose: ${app.loanPurpose}

Your application reference: APP-${app.id.toString().padStart(6, '0')}

If you believe this decision was made in error, please contact our customer support team for further assistance.

Thank you for considering ImaniCredit.

Best regards,
ImaniCredit Admin Team
            `;
            console.log('[v0] Email content:', emailContent);
        }

        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        function formatDate(dateString) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        }