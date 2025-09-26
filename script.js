// Render books in the grid (for books.html)
function renderBooks(books) {
    const bookGrid = document.getElementById('bookGrid');
    if (!bookGrid) return;
    if (!books || books.length === 0) {
        bookGrid.innerHTML = '<p class="no-books">No books found.</p>';
        return;
    }
    bookGrid.innerHTML = books.map(book => {
        const priceText = book.isPaid ? `$${book.price}` : 'FREE';
        return `
            <div class="book-card">
                <img src="${book.coverImage || 'placeholder-book.jpg'}" alt="${book.title} Cover">
                <h3>${book.title}</h3>
                <p class="author">by ${book.author}</p>
                <p class="category">${book.category || ''}</p>
                <p class="price">${priceText}</p>
                <button class="read-btn" data-book-id="${book._id}">Read Online</button>
                <button class="download-btn" data-book-id="${book._id}">Download</button>
            </div>
        `;
    }).join('');
    // Add event listeners for Read and Download buttons
    bookGrid.querySelectorAll('.read-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = btn.getAttribute('data-book-id');
            window.open(`read_book.html?id=${bookId}`, '_blank');
        });
    });
    bookGrid.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const bookId = btn.getAttribute('data-book-id');
            try {
                const res = await fetch(`${BACKEND_URL}/books/info/${bookId}`);
                const book = await res.json();
                if (book.filePath) {
                    window.open(book.filePath, '_blank');
                } else {
                    alert('Download not available.');
                }
            } catch {
                alert('Download failed.');
            }
        });
    });
}
// =======================================================
// --- Configuration ---
// =======================================================
const BACKEND_URL = 'http://localhost:5000/api'; // Define your API base URL

document.addEventListener('DOMContentLoaded', () => {
    // Dynamic stats for homepage
    async function updateStats() {
        try {
            const res = await fetch(`${BACKEND_URL}/stats/homepage`);
            const stats = await res.json();
            document.getElementById('totalUsers').innerText = stats.totalRegisteredUsers || 0;
            document.getElementById('loginsToday').innerText = stats.loginsToday || 0;
            document.getElementById('booksRead').innerText = stats.booksReadThisWeek || 0;
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }
    updateStats();
    // Latest 3 books for homepage
    const latestBooksGrid = document.getElementById('latestBooksGrid');
    if (latestBooksGrid) {
        fetch(`${BACKEND_URL}/books/all`)
            .then(res => res.json())
            .then(books => {
                if (!books || books.length === 0) {
                    latestBooksGrid.innerHTML = '<p class="no-books">No books uploaded yet.</p>';
                    return;
                }
                books.sort((a, b) => {
                    if (a.uploadedAt && b.uploadedAt) {
                        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
                    }
                    return b._id.localeCompare(a._id);
                });
                const latest = books.slice(0, 3);
                latestBooksGrid.innerHTML = latest.map(book => `
                    <div class="book-card">
                        <img src="${book.coverImage || 'placeholder-book.jpg'}" alt="${book.title} Cover">
                        <h3>${book.title}</h3>
                        <p class="author">by ${book.author}</p>
                        <p class="category">${book.category || ''}</p>
                        <button class="read-btn" data-book-id="${book._id}">Read Online</button>
                        <button class="download-btn" data-book-id="${book._id}">Download</button>
                    </div>
                `).join('');
                // Add event listeners for Read and Download buttons
                latestBooksGrid.querySelectorAll('.read-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const bookId = btn.getAttribute('data-book-id');
                        window.open(`read_book.html?id=${bookId}`, '_blank');
                    });
                });
                latestBooksGrid.querySelectorAll('.download-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const bookId = btn.getAttribute('data-book-id');
                        try {
                            const res = await fetch(`${BACKEND_URL}/books/info/${bookId}`);
                            const book = await res.json();
                            if (book.filePath) {
                                window.open(book.filePath, '_blank');
                            } else {
                                alert('Download not available.');
                            }
                        } catch {
                            alert('Download failed.');
                        }
                    });
                });
            })
            .catch(() => {
                latestBooksGrid.innerHTML = '<p class="no-books">Unable to load latest books.</p>';
            });
    }
    // Search bar logic for books.html
    const bookSearchForm = document.getElementById('bookSearchForm');
    const searchInput = document.getElementById('searchInput');
    let allBooks = [];
    if (bookSearchForm && searchInput) {
        bookSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            if (!query) {
                renderBooks(allBooks);
                return;
            }
            const filtered = allBooks.filter(book =>
                (book.title && book.title.toLowerCase().includes(query)) ||
                (book.author && book.author.toLowerCase().includes(query)) ||
                (book.category && book.category.toLowerCase().includes(query))
            );
            renderBooks(filtered);
        });
        searchInput.addEventListener('input', () => {
            if (!searchInput.value.trim()) renderBooks(allBooks);
        });
    }
    
    // =======================================================
    // --- DOM ELEMENT SELECTION ---
    // =======================================================
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginBtns = document.querySelectorAll('.login-btn');
    const signupBtns = document.querySelectorAll('.signup-btn');
    const closeBtns = document.querySelectorAll('.close-btn');
    const switchToSignup = document.querySelector('.switch-to-signup');
    const switchToLogin = document.querySelector('.switch-to-login');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const counters = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.stats-section');
    const mainContent = document.querySelector('main');
    const authButtonsContainer = document.getElementById('auth-buttons');

    // Force login/signup before showing homepage content
    function requireAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            if (mainContent) mainContent.style.display = 'none';
            if (statsSection) statsSection.style.display = 'none';
            openModal(loginModal);
        } else {
            if (mainContent) mainContent.style.display = '';
            if (statsSection) statsSection.style.display = '';
        }
    }
    requireAuth();

    // Add account menu to homepage (robust)
    function updateAccountMenu() {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');
        const authMenu = document.getElementById('auth-buttons');
        if (authMenu) {
            if (token && userName) {
                authMenu.innerHTML = `
                    <li><a href="account.html" class="account-btn">${userName}</a></li>
                    <button id="logoutBtn" class="cta-btn">Logout</button>
                `;
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('userName');
                        alert('You have been logged out.');
                        window.location.reload();
                    });
                }
            } else {
                authMenu.innerHTML = `
                    <button class="login-btn">Login</button>
                    <button class="signup-btn">Signup</button>
                `;
                const loginBtn = authMenu.querySelector('.login-btn');
                const signupBtn = authMenu.querySelector('.signup-btn');
                if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
                if (signupBtn) signupBtn.addEventListener('click', () => openModal(signupModal));
            }
        } else {
            console.warn('auth-buttons element not found in DOM');
        }
    }
    updateAccountMenu();
    
    // =======================================================
    // --- MODAL LOGIC FUNCTIONS ---
    // =======================================================

    function openModal(modal) {
        if (modal) modal.style.display = 'block';
    }

    function closeModal(modal) {
        if (modal) modal.style.display = 'none';
    }

    // Event listeners to open modals
    loginBtns.forEach(btn => btn.addEventListener('click', () => openModal(loginModal)));
    signupBtns.forEach(btn => btn.addEventListener('click', () => openModal(signupModal)));

    // Event listeners to close modals
    closeBtns.forEach(btn => btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal'))));

    // Close modal if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            closeModal(loginModal);
        }
        if (event.target === signupModal) {
            closeModal(signupModal);
        }
    });

    // Switch between modals
    if (switchToSignup) switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(signupModal);
    });

    if (switchToLogin) switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signupModal);
        openModal(loginModal);
    });
    
    // =======================================================
    // --- USER AUTHENTICATION INTEGRATION ---
    // =======================================================

    // 1. CONNECT SIGNUP FORM
    if (signupForm) signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = signupForm.querySelector('input[placeholder="Full Name"]').value;
        const email = signupForm.querySelector('input[placeholder="Email"]').value;
        const password = signupForm.querySelector('input[placeholder="Password"]').value;
        const confirmPassword = signupForm.querySelector('input[placeholder="Confirm Password"]').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created successfully! Please log in.');
                closeModal(signupModal);
                // Optionally open the login modal here
                openModal(loginModal); 
            } else {
                alert(`Signup failed: ${data.msg || 'Server Error'}`);
            }
        } catch (error) {
            console.error('Signup Error:', error);
            alert('Network error during signup. Is the backend running and accessible?');
        }
    });

    // 2. CONNECT LOGIN FORM
    if (loginForm) loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[placeholder="Email"]').value;
        const password = loginForm.querySelector('input[placeholder="Password"]').value;

        try {
            const response = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // SUCCESS: Store the JWT token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.user.fullName);
                alert(`Welcome back, ${data.user.fullName}!`);
                closeModal(loginModal);
                if (mainContent) mainContent.style.display = '';
                if (statsSection) statsSection.style.display = '';
                updateAccountMenu();
                
                // Reload to update header (show Logout/Username)
                window.location.reload(); 
            } else {
                alert(`Login failed: ${data.msg || 'Invalid credentials'}`);
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Network error during login. Is the backend running and accessible?');
        }
    });

    // =======================================================
    // --- STATISTICS COUNTER ANIMATION LOGIC ---
    // =======================================================
    const speed = 200; // The lower the number, the faster the count

    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        let current = 0;

        const updateCount = () => {
            const increment = Math.ceil(target / speed);
            current += increment;

            if (current < target) {
                counter.innerText = current.toLocaleString();
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        updateCount();
    }
    
    // =======================================================
    // --- FETCH STATISTICS FOR HOMEPAGE (Integration) ---
    // =======================================================
    async function fetchStats() {
        try {
            const response = await fetch(`${BACKEND_URL}/stats/homepage`);
            const stats = await response.json();
            
            // Map the API data to the stat card titles
            const statCardsMap = {
                'Total Registered Users': stats.totalRegisteredUsers,
                'Logins Today': stats.loginsToday,
                'Books Read This Week': stats.booksReadThisWeek
            };

            document.querySelectorAll('.stat-card').forEach(card => {
                const title = card.querySelector('p').textContent.trim();
                const numberSpan = card.querySelector('.stat-number');
                const targetValue = statCardsMap[title];

                if (targetValue !== undefined) {
                    numberSpan.setAttribute('data-target', targetValue);
                }
            });

            // Re-run the counter animation logic with the real data
            const counters = document.querySelectorAll('.stat-number');
            counters.forEach(animateCounter);

        } catch (error) {
            console.error('Failed to fetch statistics:', error);
            // If the API fails, the counters will animate based on the static HTML 'data-target' 
            // values, which is an acceptable fallback.
        }
    }

    // Observer to start animation when stats section is visible
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Fetch real data and start animation only when section is visible
                fetchStats(); 
                observer.unobserve(entry.target); // Stop observing after animation runs
            }
        });
    });

    // Async function to fetch and display books (for books.html)
    async function fetchAndDisplayBooks() {
        const bookGrid = document.getElementById('bookGrid');
        const loadingMsg = document.getElementById('loading-message');
        if (!bookGrid) return;
        try {
            const response = await fetch(`${BACKEND_URL}/books/all`);
            console.log('Books fetch response:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            const books = await response.json();
            console.log('Books data:', books);
            allBooks = books;
            if (loadingMsg) loadingMsg.style.display = 'none';
            if (!books || books.length === 0) {
                bookGrid.innerHTML = '<p class="no-books">No books available yet. Check back soon!</p>';
                return;
            }
            renderBooks(books);
        } catch (error) {
            console.error('Error fetching books:', error);
            if (loadingMsg) loadingMsg.innerText = 'Failed to load books. Please check server connection.';
            bookGrid.innerHTML = `<p class="no-books">Unable to load books.<br>${error}</p>`;
        }
    }
    fetchAndDisplayBooks();
});

