document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const uploadMsg = document.getElementById('uploadMsg');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        try {
            const res = await fetch('http://localhost:5000/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                uploadMsg.textContent = 'Book uploaded successfully!';
                setTimeout(() => {
                    window.location.href = 'books.html';
                }, 1200);
            } else {
                uploadMsg.textContent = data.msg || 'Upload failed.';
            }
        } catch (err) {
            uploadMsg.textContent = 'Network error.';
        }
    });
});