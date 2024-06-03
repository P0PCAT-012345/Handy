const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const sourceDir = 'src-python'; 
const hashFile = 'src-tauri/bin/.hash';

function calculateHash(directory) {
    let hash = crypto.createHash('sha256');

    function hashFile(filePath) {
        const fileBuffer = fs.readFileSync(filePath);
        hash.update(fileBuffer);
    }

    function walkDir(dir) {
        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                walkDir(filePath);
            } else if (filePath.endsWith('.py')) {
                hashFile(filePath);
            }
        });
    }

    walkDir(directory);

    return hash.digest('hex');
}

function readLastHash(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
    }
    return null;
}

function writeCurrentHash(filePath, hash) {
    fs.writeFileSync(filePath, hash, 'utf8');
}

try {
    const currentHash = calculateHash(sourceDir);
    const lastHash = readLastHash(hashFile);

    if (currentHash !== lastHash) {
        console.log('Source files changed. Rebuilding... Please wait...');
        const { execSync } = require('child_process');
        execSync(`pyinstaller -F ${path.join(sourceDir, 'main.py')} --distpath src-tauri/bin --clean -n python-x86_64-pc-windows-msvc`, { stdio: 'inherit' });
        writeCurrentHash(hashFile, currentHash);
    } else {
        console.log('Source files unchanged. Skipping build...');
    }
} catch (error) {
    console.error('An error occurred:', error);
}
