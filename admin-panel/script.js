// API Configuration
const API_BASE_URL = 'https://spl-main.onrender.com/api';
const UPLOAD_ENDPOINT = `${API_BASE_URL}/upload/admin/upload`;
const ADMIN_UPLOADS_ENDPOINT = `${API_BASE_URL}/admin/uploads`;
const ADMIN_STEPS_ENDPOINT = `${API_BASE_URL}/admin/steps`;
const ADMIN_LEADERBOARD_ENDPOINT = `${API_BASE_URL}/admin/leaderboard`;
const ADMIN_PUBLISH_ENDPOINT = `${API_BASE_URL}/admin/publish`;

// DOM Elements - Upload Section
const uploadForm = document.getElementById('uploadForm');
const excelFileInput = document.getElementById('excelFile');
const fileLabelText = document.getElementById('fileLabelText');
const fileName = document.getElementById('fileName');
const uploadBtn = document.getElementById('uploadBtn');
const btnLoader = document.getElementById('btnLoader');
const btnText = uploadBtn.querySelector('.btn-text');
const statusMessage = document.getElementById('statusMessage');

// DOM Elements - Upload History Section
const uploadsTableBody = document.getElementById('uploadsTableBody');
const refreshUploadsBtn = document.getElementById('refreshUploadsBtn');

// DOM Elements - Daily Steps Section
const stepsDateSelect = document.getElementById('stepsDateSelect');
const loadStepsBtn = document.getElementById('loadStepsBtn');
const stepsTableBody = document.getElementById('stepsTableBody');

// DOM Elements - Leaderboard Section
const leaderboardDateSelect = document.getElementById('leaderboardDateSelect');
const loadLeaderboardBtn = document.getElementById('loadLeaderboardBtn');
const leaderboardPreview = document.getElementById('leaderboardPreview');
const teamLeaderboardBody = document.getElementById('teamLeaderboardBody');
const individualLeaderboardBody = document.getElementById('individualLeaderboardBody');
const publishBtn = document.getElementById('publishBtn');
const publishStatus = document.getElementById('publishStatus');

// Store current leaderboard data for publishing
let currentLeaderboardData = null;
let currentLeaderboardDate = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // NO DATE RESTRICTIONS - Allow selecting any date for testing
    // Default to first challenge day (2025-12-01) but allow any date selection
    const defaultDate = '2025-12-01'; // First challenge day
    stepsDateSelect.value = defaultDate;
    leaderboardDateSelect.value = defaultDate;
    
    // Remove min/max date restrictions from date inputs to allow any date selection
    stepsDateSelect.removeAttribute('min');
    stepsDateSelect.removeAttribute('max');
    leaderboardDateSelect.removeAttribute('min');
    leaderboardDateSelect.removeAttribute('max');
    
    // Check database connection
    checkDatabaseConnection();
    
    // Load initial data
    loadUploadHistory();
    
    // Upload section handlers
    excelFileInput.addEventListener('change', handleFileSelect);
    uploadForm.addEventListener('submit', handleUpload);
    
    // Upload history handlers
    refreshUploadsBtn.addEventListener('click', loadUploadHistory);
    
    // Daily steps handlers
    loadStepsBtn.addEventListener('click', loadDailySteps);
    
    // Leaderboard handlers
    loadLeaderboardBtn.addEventListener('click', loadLeaderboardPreview);
    publishBtn.addEventListener('click', handlePublish);
});

// ==================== DATABASE CONNECTION CHECK ====================

async function checkDatabaseConnection() {
    const dbStatus = document.getElementById('dbStatus');
    const dbStatusText = dbStatus.querySelector('.db-status-text');
    
    dbStatus.style.display = 'flex';
    dbStatus.className = 'db-status';
    dbStatusText.textContent = 'Checking database connection...';
    
    try {
        const response = await fetch('https://spl-main.onrender.com/health');
        const data = await response.json();
        
        if (data.database === 'connected') {
            dbStatus.className = 'db-status connected';
            dbStatusText.textContent = '✓ Database connected';
        } else {
            dbStatus.className = 'db-status disconnected';
            dbStatusText.textContent = '✗ Database disconnected - ' + (data.error || 'Please start PostgreSQL');
        }
    } catch (error) {
        dbStatus.className = 'db-status disconnected';
            dbStatusText.textContent = '✗ Cannot reach server - Make sure backend is running';
    }
}

// ==================== UPLOAD SECTION ====================

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        if (!file.name.endsWith('.xlsx')) {
            showStatus('Please select a .xlsx file', 'error');
            excelFileInput.value = '';
            resetFileDisplay();
            return;
        }
        fileName.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
        fileName.classList.add('has-file');
        fileLabelText.textContent = file.name;
        hideStatus();
    } else {
        resetFileDisplay();
    }
}

function resetFileDisplay() {
    fileName.textContent = '';
    fileName.classList.remove('has-file');
    fileLabelText.textContent = 'Choose Excel file (.xlsx)';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function handleUpload(e) {
    e.preventDefault();
    const file = excelFileInput.files[0];
    if (!file) {
        showStatus('Please select a file to upload', 'error');
        return;
    }
    if (!file.name.endsWith('.xlsx')) {
        showStatus('Only .xlsx files are allowed', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    setUploadingState(true);
    hideStatus();
    
    try {
        const response = await fetch(UPLOAD_ENDPOINT, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            if (data.rowsProcessed === 0) {
                let errorMsg = 'Upload completed but 0 rows were processed. ';
                if (data.totalRowsParsed) {
                    errorMsg += `${data.totalRowsParsed} rows were parsed from Excel but none were saved. `;
                }
                if (data.errorsEncountered) {
                    errorMsg += `${data.errorsEncountered} errors encountered. `;
                }
                if (data.warning) {
                    errorMsg += data.warning;
                }
                errorMsg += 'Check server console for detailed error logs.';
                showStatus(errorMsg, 'error');
            } else {
                showSuccessStatus(data);
            }
            uploadForm.reset();
            resetFileDisplay();
            loadUploadHistory();
        } else {
            const errorMsg = data.message || data.error || 'Upload failed. Please try again.';
            console.error('Upload error response:', data);
            showStatus(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showStatus('Network error. Please check if the server is running.', 'error');
    } finally {
        setUploadingState(false);
    }
}

function setUploadingState(isUploading) {
    uploadBtn.disabled = isUploading;
    if (isUploading) {
        btnText.textContent = 'Uploading...';
        btnLoader.style.display = 'block';
    } else {
        btnText.textContent = 'Upload & Process';
        btnLoader.style.display = 'none';
    }
}

function showSuccessStatus(data) {
    const rowsProcessed = data.rowsProcessed || 0;
    const datesAffected = data.datesAffected || [];
    const datesCount = datesAffected.length;
    let message = `✓ Upload successful! Processed ${rowsProcessed} row${rowsProcessed !== 1 ? 's' : ''}`;
    if (datesCount > 0) {
        message += ` across ${datesCount} date${datesCount !== 1 ? 's' : ''}`;
        if (datesCount <= 3) {
            message += ` (${datesAffected.join(', ')})`;
        }
    }
    showStatus(message, 'success');
}

function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message show ${type}`;
    statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideStatus() {
    statusMessage.className = 'status-message';
    statusMessage.textContent = '';
}

// ==================== UPLOAD HISTORY SECTION ====================

async function loadUploadHistory() {
    uploadsTableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="4" class="loading-cell">Loading upload history...</td>
        </tr>
    `;
    
    try {
        const response = await fetch(ADMIN_UPLOADS_ENDPOINT);
        const result = await response.json();
        
        if (response.ok && result.success) {
            renderUploadsTable(result.data || []);
        } else {
            showUploadsError('Failed to load upload history');
        }
    } catch (error) {
        console.error('History load error:', error);
        showUploadsError('Network error loading history');
    }
}

function renderUploadsTable(uploads) {
    if (uploads.length === 0) {
        uploadsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-cell">No uploads yet.</td>
            </tr>
        `;
        return;
    }
    
    uploadsTableBody.innerHTML = uploads.map(upload => {
        const uploadDate = new Date(upload.uploadedAt);
        const formattedDate = formatDate(uploadDate);
        const status = upload.status || 'processed';
        
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${escapeHtml(upload.filename)}</td>
                <td>
                    <span class="status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </td>
                <td>${upload.records || 0}</td>
            </tr>
        `;
    }).join('');
}

function showUploadsError(message) {
    uploadsTableBody.innerHTML = `
        <tr>
            <td colspan="4" class="empty-cell" style="color: var(--error-color);">
                ${escapeHtml(message)}
            </td>
        </tr>
    `;
}

// ==================== DAILY STEPS SECTION ====================

async function loadDailySteps() {
    const date = stepsDateSelect.value;
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    stepsTableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="4" class="loading-cell">Loading daily steps...</td>
        </tr>
    `;
    
    try {
        const response = await fetch(`${ADMIN_STEPS_ENDPOINT}?date=${date}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            renderStepsTable(result.data || []);
        } else {
            const errorMsg = result.message || result.error || 'Failed to load daily steps';
            console.error('Steps load error:', errorMsg, result);
            showStepsError(errorMsg);
        }
    } catch (error) {
        console.error('Steps load error:', error);
        showStepsError(`Network error: ${error.message}. Make sure the server is running.`);
    }
}

function renderStepsTable(steps) {
    if (steps.length === 0) {
        stepsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-cell">No data found for this date.</td>
            </tr>
        `;
        return;
    }
    
    stepsTableBody.innerHTML = steps.map(step => `
        <tr>
            <td>${escapeHtml(step.userName || step.userId || 'Unknown')}</td>
            <td>${step.steps.toLocaleString()}</td>
            <td>${step.run || 0}</td>
            <td>${escapeHtml(step.team || 'Unknown')}</td>
        </tr>
    `).join('');
}

function showStepsError(message) {
    stepsTableBody.innerHTML = `
        <tr>
            <td colspan="4" class="empty-cell" style="color: var(--error-color);">
                ${escapeHtml(message)}
            </td>
        </tr>
    `;
}

// ==================== LEADERBOARD SECTION ====================

async function loadLeaderboardPreview() {
    const date = leaderboardDateSelect.value;
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    currentLeaderboardDate = date;
    leaderboardPreview.style.display = 'none';
    teamLeaderboardBody.innerHTML = '<tr><td colspan="4" class="loading-cell">Loading...</td></tr>';
    individualLeaderboardBody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading...</td></tr>';
    
    try {
        const response = await fetch(`${ADMIN_LEADERBOARD_ENDPOINT}?date=${date}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            // The response structure is: { success: true, individual: [...], team: [...] }
            const data = {
                individual: result.individual || [],
                team: result.team || []
            };
            console.log('[Frontend] Parsed leaderboard data:', data);
            currentLeaderboardData = result;
            renderLeaderboards(data);
            leaderboardPreview.style.display = 'block';
        } else {
            alert(result.message || 'Failed to load leaderboard');
        }
    } catch (error) {
        console.error('Leaderboard load error:', error);
        alert('Network error loading leaderboard');
    }
}

function renderLeaderboards(data) {
    // Render team leaderboard
    if (data.team && data.team.length > 0) {
        teamLeaderboardBody.innerHTML = data.team.map(team => `
            <tr>
                <td>${team.rank}</td>
                <td>${escapeHtml(team.team_name || team.team_id || 'Unknown')}</td>
                <td>${(team.total_steps || 0).toLocaleString()}</td>
                <td>${team.total_runs || 0}</td>
            </tr>
        `).join('');
    } else {
        teamLeaderboardBody.innerHTML = '<tr><td colspan="4" class="empty-cell">No team data found for this date.</td></tr>';
    }
    
    // Render individual leaderboard
    if (data.individual && data.individual.length > 0) {
        individualLeaderboardBody.innerHTML = data.individual.map(individual => `
            <tr>
                <td>${individual.rank}</td>
                <td>${escapeHtml(individual.user_name || individual.user_id || 'Unknown')}</td>
                <td>${(individual.steps || 0).toLocaleString()}</td>
                <td>${individual.runs || 0}</td>
                <td>${escapeHtml(individual.team_id || '-')}</td>
            </tr>
        `).join('');
    } else {
        individualLeaderboardBody.innerHTML = '<tr><td colspan="5" class="empty-cell">No individual data found for this date. Make sure data has been uploaded and processed.</td></tr>';
    }
}

async function handlePublish() {
    if (!currentLeaderboardData || !currentLeaderboardDate) {
        alert('Please load a leaderboard first');
        return;
    }
    
    if (!confirm('Are you sure you want to publish this leaderboard? This will make it visible to all users.')) {
        return;
    }
    
    publishBtn.disabled = true;
    publishBtn.textContent = 'Publishing...';
    publishStatus.className = 'status-message';
    publishStatus.textContent = '';
    
    try {
        const response = await fetch(ADMIN_PUBLISH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: currentLeaderboardDate,
                leaderboardData: currentLeaderboardData
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            publishStatus.className = 'status-message show success';
            publishStatus.textContent = '✓ Leaderboard published successfully!';
        } else {
            publishStatus.className = 'status-message show error';
            publishStatus.textContent = result.message || 'Failed to publish leaderboard';
        }
    } catch (error) {
        console.error('Publish error:', error);
        publishStatus.className = 'status-message show error';
        publishStatus.textContent = 'Network error publishing leaderboard';
    } finally {
        publishBtn.disabled = false;
        publishBtn.textContent = 'Publish Leaderboard';
    }
}

// ==================== UTILITY FUNCTIONS ====================

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
