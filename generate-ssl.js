const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Tạo key pair
const keys = forge.pki.rsa.generateKeyPair(2048);

// Tạo certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

// Set certificate attributes
const attrs = [{
  name: 'countryName',
  value: 'VN'
}, {
  name: 'stateOrProvinceName',
  value: 'HCM'
}, {
  name: 'localityName',
  value: 'HCM'
}, {
  name: 'organizationName',
  value: 'BeautyNow'
}, {
  name: 'organizationalUnitName',
  value: 'IT'
}, {
  name: 'commonName',
  value: 'localhost'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Self-sign certificate
cert.sign(keys.privateKey);

// Convert to PEM format
const certPem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

// Save to files
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir);
}

fs.writeFileSync(path.join(sslDir, 'cert.pem'), certPem);
fs.writeFileSync(path.join(sslDir, 'key.pem'), keyPem);

console.log('SSL certificates generated successfully!');
console.log('cert.pem and key.pem created in ssl/ directory');
