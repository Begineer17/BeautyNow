const inquirer = require('inquirer').default;
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/admin';

const verifyLicense = async () => {
  try {
    // Lấy danh sách tài khoản pending
    const { data: users } = await axios.get(`${API_BASE_URL}/pending-licenses`, {
      headers: { 'admin-key': 'admin-secret' },
    });

    if (users.length === 0) {
      console.log('No pending licenses to verify.');
      return;
    }

    const choices = users.map(user => ({
      name: `${user.email} (License: ${user.businessLicense})`,
      value: user._id,
    }));

    const { userId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'userId',
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
      `${API_BASE_URL}/verify-license/${userId}`,
      { status, note },
      { headers: { 'admin-key': 'admin-secret' } }
    );

    console.log(`License ${status} for user ${userId}.`);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

verifyLicense();
