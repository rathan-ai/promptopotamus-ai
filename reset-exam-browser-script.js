// Run this in browser console while logged in as admin (rathan@innorag.com)
async function resetExamStatus(email) {
    try {
        const response = await fetch('/api/admin/reset-exam-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Success:', data.message);
            console.log('Deleted items:', data.deleted);
        } else {
            console.error('❌ Error:', data.error);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Reset exam status for rathan.george@gmail.com
resetExamStatus('rathan.george@gmail.com');