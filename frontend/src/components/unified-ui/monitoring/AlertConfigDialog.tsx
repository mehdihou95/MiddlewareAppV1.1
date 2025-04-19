import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Grid,
    Typography,
} from '@mui/material';

interface AlertConfigDialogProps {
    open: boolean;
    onClose: () => void;
}

interface AlertConfig {
    enabled: boolean;
    errorThreshold: number;
    messageRateThreshold: number;
    processingTimeThreshold: number;
    notificationEmail: string;
}

const AlertConfigDialog: React.FC<AlertConfigDialogProps> = ({ open, onClose }) => {
    const [config, setConfig] = useState<AlertConfig>({
        enabled: true,
        errorThreshold: 5,
        messageRateThreshold: 100,
        processingTimeThreshold: 1000,
        notificationEmail: '',
    });

    const handleChange = (field: keyof AlertConfig) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.type === 'checkbox' 
            ? event.target.checked 
            : event.target.value;
        
        setConfig(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        try {
            // TODO: Implement API call to save alert configuration
            console.log('Saving alert config:', config);
            onClose();
        } catch (error) {
            console.error('Error saving alert configuration:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Configure Monitoring Alerts</DialogTitle>
            <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={config.enabled}
                                    onChange={handleChange('enabled')}
                                />
                            }
                            label="Enable Alerts"
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                            Alert Thresholds
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Error Threshold"
                            type="number"
                            value={config.errorThreshold}
                            onChange={handleChange('errorThreshold')}
                            helperText="Number of errors before alert"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Message Rate Threshold"
                            type="number"
                            value={config.messageRateThreshold}
                            onChange={handleChange('messageRateThreshold')}
                            helperText="Messages per second"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Processing Time Threshold"
                            type="number"
                            value={config.processingTimeThreshold}
                            onChange={handleChange('processingTimeThreshold')}
                            helperText="Milliseconds"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notification Email"
                            type="email"
                            value={config.notificationEmail}
                            onChange={handleChange('notificationEmail')}
                            helperText="Email address for alerts"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AlertConfigDialog; 