const inquirer = require('inquirer').default;
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/admin';

const verifyLicense = async () => {
  try {
    const { data: salons } = await axios.get(`${API_BASE_URL}/pending-licenses`, {
      headers: { 'admin-key': 'admin-secret' },
    });

    if (salons.length === 0) {
      console.log('No pending licenses to verify.');
      return;
    }

    const choices = salons.map(salon => ({
      name: `${salon.email} (License: ${salon.businessLicense})`,
      value: salon.id,
    }));

    const { salonId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'salonId',
        message: 'Select a salon to verify:',
        choices,
      },
    ]);

    const { status, note } = await inquirer.prompt([
      {
        type: 'list',
        name: 'status',
        message: 'Verification result:',
        choices: ['verified', 'rejected'],
      },
      {
        type: 'input',
        name: 'note',
        message: 'Enter note (e.g., reason for rejection or verification):',
      },
    ]);

    await axios.post(
      `${API_BASE_URL}/verify-license/${salonId}`,
      { status, note },
      { headers: { 'admin-key': 'admin-secret' } }
    );

    console.log(`License ${status} for salon ${salonId}.`);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

verifyLicense();