const fs = require('fs').promises;
const path = require('path');

/**
 * Storage service for managing uploaded files
 */

const UPLOAD_DIR = '/tmp/uploads';
const MAX_FILE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
        console.error('Failed to create upload directory:', error);
    }
}

/**
 * Save a file buffer to disk
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Desired filename
 * @returns {Promise<string>} Full path to saved file
 */
async function saveFile(buffer, filename) {
    await ensureUploadDir();
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filepath, buffer);
    return filepath;
}

/**
 * Read a file from disk
 * @param {string} filename - Filename to read
 * @returns {Promise<Buffer>} File buffer
 */
async function readFile(filename) {
    const filepath = path.join(UPLOAD_DIR, filename);
    return await fs.readFile(filepath);
}

/**
 * Delete a file from disk
 * @param {string} filepath - Full path or filename
 * @returns {Promise<void>}
 */
async function deleteFile(filepath) {
    try {
        // If only filename provided, construct full path
        const fullPath = filepath.startsWith('/') ? filepath : path.join(UPLOAD_DIR, filepath);
        await fs.unlink(fullPath);
        console.log(`Deleted file: ${fullPath}`);
    } catch (error) {
        console.error(`Failed to delete file ${filepath}:`, error);
    }
}

/**
 * Clean up old files (older than MAX_FILE_AGE_MS)
 * @returns {Promise<number>} Number of files deleted
 */
async function cleanupOldFiles() {
    try {
        await ensureUploadDir();
        const files = await fs.readdir(UPLOAD_DIR);
        const now = Date.now();
        let deletedCount = 0;

        for (const file of files) {
            const filepath = path.join(UPLOAD_DIR, file);
            const stats = await fs.stat(filepath);
            const age = now - stats.mtimeMs;

            if (age > MAX_FILE_AGE_MS) {
                await deleteFile(filepath);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`Cleaned up ${deletedCount} old files`);
        }

        return deletedCount;
    } catch (error) {
        console.error('Cleanup error:', error);
        return 0;
    }
}

/**
 * Get file info
 * @param {string} filepath - Full path to file
 * @returns {Promise<object>} File stats
 */
async function getFileInfo(filepath) {
    const stats = await fs.stat(filepath);
    return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        path: filepath
    };
}

module.exports = {
    saveFile,
    readFile,
    deleteFile,
    cleanupOldFiles,
    getFileInfo,
    ensureUploadDir
};
