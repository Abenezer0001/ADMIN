import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function Integration() {
  const [config, setConfig] = useState({});
  const [paymentConfig, setPaymentConfig] = useState({});

  const handleConfigChange = (event) => {
    setConfig({
      ...config,
      [event.target.name]: event.target.value,
    });
  };

  const handlePaymentConfigChange = (event) => {
    setPaymentConfig({
      ...paymentConfig,
      [event.target.name]: event.target.value,
    });
  };

  const handleSave = () => {
    // TODO: Implement saving the config
    console.log('Config:', config);
    console.log('Payment Config:', paymentConfig);
  };

  return (
    <Box>
      <Typography variant="h6">Integration</Typography>
      <Box>
        <Typography variant="subtitle1">Payment Integration</Typography>
        <TextField
          label="Payment API Key"
          name="paymentApiKey"
          value={paymentConfig.paymentApiKey || ''}
          onChange={handlePaymentConfigChange}
          fullWidth
        />
        <TextField
          label="Payment Secret Key"
          name="paymentSecretKey"
          value={paymentConfig.paymentSecretKey || ''}
          onChange={handlePaymentConfigChange}
          fullWidth
        />
      </Box>
      <Box>
        <Typography variant="subtitle1">Other Integrations</Typography>
        <TextField
          label="Config Payload"
          name="configPayload"
          value={config.configPayload || ''}
          onChange={handleConfigChange}
          fullWidth
          multiline
          rows={4}
        />
      </Box>
      <Button variant="contained" onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
}
