
import * as React from 'react';
import {Grid, Paper, TextField, Button, Switch, FormControlLabel} from '@mui/material';

export default function SystemSettings() {
  const [allowRegistration, setAllowRegistration] = React.useState(true);
  const [autoApproveUsers, setAutoApproveUsers] = React.useState(true);

  const handleAllowRegistrationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllowRegistration(event.target.checked);
  };

  const handleAutoApproveUsersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoApproveUsers(event.target.checked);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //TODO: implement the settings update
  };

  return (
    <Paper>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch checked={allowRegistration} onChange={handleAllowRegistrationChange} />
              }
              label="Allow new user registration"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch checked={autoApproveUsers} onChange={handleAutoApproveUsersChange} />
              }
              label="Auto approve new users"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="System name" />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" fullWidth variant="contained" color="primary">
              Save
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
