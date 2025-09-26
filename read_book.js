document.addEventListener('DOMContentLoaded', async () => {
    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }
    const bookId = getQueryParam('id');
    if (!bookId) {
        document.getElementById('bookTitle').textContent = 'Book not found.';
        return;
    }
    try {
        const res = await fetch(`http://localhost:5000/api/books/info/${bookId}`);
        const book = await res.json();
        if (!book || !book.filePath) {
            document.getElementById('bookTitle').textContent = 'Book not found.';
            return;
        }
        document.getElementById('bookTitle').textContent = book.title;
        document.getElementById('bookAuthor').textContent = 'by ' + book.author;
        document.getElementById('bookDesc').textContent = book.description;
        // Show PDF in iframe
        const viewer = document.getElementById('bookViewer');
        viewer.innerHTML = `<iframe src="${book.filePath}" width="100%" height="600px" style="border:none;"></iframe>`;
    } catch (err) {
        document.getElementById('bookTitle').textContent = 'Error loading book.';
    }
});