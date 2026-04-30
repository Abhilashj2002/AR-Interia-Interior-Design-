#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const root = process.cwd();

const loadEnvFile = (name) => {
  const filePath = path.join(root, name);
  if (!fs.existsSync(filePath)) return;
  dotenv.config({ path: filePath, override: false });
};

loadEnvFile('.env');
loadEnvFile('.env.local');

const errors = [];
const warnings = [];

const isPlaceholder = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return true;
  const upper = raw.toUpperCase();
  return (
    upper.includes('YOUR_')
    || upper.includes('REPLACE')
    || upper.includes('CHANGEME')
    || upper.includes('EXAMPLE')
    || raw === 'MERCHANTUAT'
  );
};

const required = [
  'JWT_SECRET'
];

required.forEach((name) => {
  const value = process.env[name];
  if (!value || isPlaceholder(value)) {
    errors.push(`${name} is missing or placeholder.`);
  }
});

const jwt = String(process.env.JWT_SECRET || '');
if (jwt && jwt.length < 32) {
  errors.push('JWT_SECRET must be at least 32 characters long.');
}

const emailEnabled = String(process.env.EMAIL_ENABLED || 'false').toLowerCase() === 'true';
if (emailEnabled) {
  ['EMAIL_USER', 'EMAIL_PASSWORD'].forEach((name) => {
    const value = process.env[name];
    if (!value || isPlaceholder(value)) {
      errors.push(`${name} is required when EMAIL_ENABLED=true.`);
    }
  });
}

const razorpayConfigured = Boolean(
  String(process.env.RAZORPAY_KEY_ID || '').trim()
  || String(process.env.RAZORPAY_KEY_SECRET || '').trim()
);
if (razorpayConfigured) {
  ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'].forEach((name) => {
    const value = process.env[name];
    if (!value || isPlaceholder(value)) {
      errors.push(`${name} is incomplete/placeholder while Razorpay is configured.`);
    }
  });
} else {
  warnings.push('Razorpay keys are not configured (ok if Razorpay is not used in production).');
}

const phonepeConfigured = Boolean(String(process.env.PHONEPE_MERCHANT_ID || '').trim());
if (phonepeConfigured) {
  ['PHONEPE_MERCHANT_ID', 'PHONEPE_SALT_KEY', 'PHONEPE_SALT_INDEX'].forEach((name) => {
    const value = process.env[name];
    if (!value || isPlaceholder(value)) {
      errors.push(`${name} is incomplete/placeholder while PhonePe is configured.`);
    }
  });
} else {
  warnings.push('PhonePe credentials are not configured (ok if PhonePe is not used in production).');
}

const redirectBase = String(process.env.PAYMENT_REDIRECT_BASE || '').trim();
const callbackBase = String(process.env.PAYMENT_CALLBACK_BASE || '').trim();
if (redirectBase && redirectBase.includes('localhost')) {
  warnings.push('PAYMENT_REDIRECT_BASE points to localhost; set production domain before deploy.');
}
if (callbackBase && callbackBase.includes('localhost')) {
  warnings.push('PAYMENT_CALLBACK_BASE points to localhost; set production backend URL before deploy.');
}

console.log('\n=== Predeploy Readiness Check ===\n');

if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach((w) => console.log(`- ${w}`));
  console.log('');
}

if (errors.length) {
  console.log('Errors:');
  errors.forEach((e) => console.log(`- ${e}`));
  console.log('\nResult: NOT READY for production deploy.');
  process.exit(1);
}

console.log('Result: READY for production deploy checks.');
process.exit(0);
