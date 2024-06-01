const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

const sourceDir = 'src-python';
const hashFile = 'src-tauri/bin/.hash';

const calculateHash = () => {
    const hash = crypto.createHash('sha256');
    const files = fs.readdirSync(sourceDir);
    files.forEach(file => {
        const content = fs.readFileSync(`${sourceDir}/${file}`);
        hash.update(content);
    });
    return hash.digest('hex');
};

if (fs.existsSync(hashFile)) {
    const previousHash = fs.readFileSync(hashFile, 'utf8').trim();
    const currentHash = calculateHash();
    
    if (previousHash === currentHash) {
        console.log('No changes in source code. Skipping PyInstaller.');
        process.exit(0);
    }
}

console.log('Building Python executable... Please wait...');
try {
    const output = execSync(`pyinstaller -F ${sourceDir}/main.py --distpath src-tauri/bin --clean -n python-x86_64-pc-windows-msvc`, { encoding: 'utf-8' });
    console.log(output);
    console.log('Python executable built successfully.');
} catch (error) {
    console.error('Error building Python executable:', error.stderr ? error.stderr.toString() : error.toString());
    process.exit(1);
}

fs.writeFileSync(hashFile, calculateHash());
