const fs = require('fs');
const path = require('path');

function copyOAuthFile() {
  const sourceDir = path.join(__dirname, '..', 'package', 'oauth');
  const buildDir = path.join(__dirname, '..', 'dist', 'package', 'oauth');

  // Buat direktori jika belum ada
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Salin file
  fs.copyFileSync(
    path.join(sourceDir, 'index.js'),
    path.join(buildDir, 'index.js')
  );

  console.log('OAuth file copied successfully');
}

try {
  copyOAuthFile();
} catch (error) {
  console.error('Error copying OAuth file:', error);
  process.exit(1);
} 