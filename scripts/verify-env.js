const fs = require("fs");
const path = require("path");

function verifyEnv() {
  console.log("=== FlexSell Wholesale Environment Pre-Flight Checker ===\n");

  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) {
    console.error("❌ ERROR: .env file is missing in the project root!");
    console.error("👉 TIP: Copy .env.example to .env and configure the environment variables.");
    process.exit(1);
  }

  console.log("✅ .env file exists.");

  // Read .env
  const envContent = fs.readFileSync(envPath, "utf8");
  const envVars = {};
  envContent.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    const key = parts[0].trim();
    const value = parts.slice(1).join("=").trim();
    envVars[key] = value;
  });

  const requiredVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "NEXT_PUBLIC_SITE_URL"
  ];

  let hasError = false;
  requiredVars.forEach(v => {
    if (!envVars[v]) {
      console.error(`❌ MISSING REQUIRED VAR: ${v}`);
      hasError = true;
    } else {
      console.log(`✅ ${v} is configured.`);
    }
  });

  console.log("\n--- Checking optional mail settings ---");
  const smtpVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
  smtpVars.forEach(v => {
    if (!envVars[v]) {
      console.warn(`⚠️ WARNING: ${v} is missing. Nodemailer checkout notifications will be disabled.`);
    } else {
      console.log(`✅ ${v} is configured.`);
    }
  });

  if (hasError) {
    console.error("\n❌ Environment pre-flight check failed! Please fix the errors above.");
    process.exit(1);
  } else {
    console.log("\n🎉 Environment pre-flight check completed successfully! You are ready to start the server.");
  }
}

verifyEnv();
