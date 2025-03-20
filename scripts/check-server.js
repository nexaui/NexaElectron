const fs = require("fs");
const path = require("path");

function checkServerFiles() {
  const resourcePath = path.join(
    __dirname,
    "../dist/win-unpacked/resources/server"
  );

  console.log("Checking server files...");
  console.log("Resource path:", resourcePath);

  if (fs.existsSync(resourcePath)) {
    console.log("Server directory exists");

    // Check specific required files
    const requiredFiles = [
      "package.json",
      "main.js",
      "preload.js",
      "public",
      "assets",
      "package",
    ];

    console.log("\nChecking required files:");
    requiredFiles.forEach((file) => {
      const filePath = path.join(resourcePath, file);
      const exists = fs.existsSync(filePath);
      console.log(`${file}: ${exists ? "✓ Found" : "✗ Missing"}`);

      if (exists && fs.lstatSync(filePath).isDirectory()) {
        const contents = fs.readdirSync(filePath);
        console.log(`  Contents of ${file}/:`);
        contents.forEach((item) => console.log(`    - ${item}`));
      }
    });
  } else {
    console.error("Server directory not found!");
    console.error('Please run "npm run build" first');
  }
}

checkServerFiles();
