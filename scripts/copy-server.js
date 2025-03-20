const fs = require('fs-extra');
const path = require('path');

async function copyServerFiles() {
  try {
    const sourceDir = path.join(__dirname, '..');
    const targetDir = path.join(__dirname, '../dist/win-unpacked/resources/server');

    // Pastikan direktori target ada
    await fs.ensureDir(targetDir);

    // Copy file-file yang diperlukan dengan logging
    const filesToCopy = [
      'package',
      'public',
      'assets',
      'main.js',        // Tambahkan main.js
      'preload.js'      // Tambahkan preload.js
    ];

    console.log('Starting copy process...');
    console.log('Source directory:', sourceDir);
    console.log('Target directory:', targetDir);

    for (const file of filesToCopy) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      console.log(`Copying ${file}...`);
      console.log(`From: ${sourcePath}`);
      console.log(`To: ${targetPath}`);

      if (fs.existsSync(sourcePath)) {
        await fs.copy(sourcePath, targetPath, {
          filter: (src) => {
            return !src.includes('node_modules');
          }
        });
        console.log(`Successfully copied ${file}`);
      } else {
        console.warn(`Warning: Source path not found: ${sourcePath}`);
      }
    }

    // Copy package.json
    const packageJson = path.join(sourceDir, 'package.json');
    const targetPackageJson = path.join(targetDir, 'package.json');
    await fs.copy(packageJson, targetPackageJson);
    console.log('Copied package.json');

    console.log('Server files copied successfully');
  } catch (err) {
    console.error('Error copying server files:', err);
    console.error('Error details:', err.stack);
    process.exit(1);
  }
}

copyServerFiles(); 