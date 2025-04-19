import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertConfig } from '../../../types/connectors';

const alertConfigSchema = z.object({
    enabled: z.boolean(),
    errorThreshold: z.number().min(1, 'Error threshold must be at least 1'),
    processingTimeThreshold: z.number().min(1000, 'Processing time threshold must be at least 1000ms'),
    notificationEmail: z.string().email('Invalid email address').optional(),
    notificationWebhook: z.string().url('Invalid webhook URL').optional(),
});

type AlertConfigFormValues = z.infer<typeof alertConfigSchema>;

interface AlertConfigDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (config: AlertConfig) => void;
    initialConfig?: AlertConfig;
}

export default function AlertConfigDialog({
    open,
    onClose,
    onSave,
    initialConfig,
}: AlertConfigDialogProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<AlertConfigFormValues>({
        resolver: zodResolver(alertConfigSchema),
        defaultValues: {
            enabled: initialConfig?.enabled ?? false,
            errorThreshold: initialConfig?.errorThreshold ?? 10,
            processingTimeThreshold: initialConfig?.processingTimeThreshold ?? 1000,
            notificationEmail: initialConfig?.notificationEmail ?? '',
            notificationWebhook: initialConfig?.notificationWebhook ?? '',
        },
    });

    const onSubmit = (values: AlertConfigFormValues) => {
        onSave(values as AlertConfig);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Alert Configuration</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Controller
                                name="enabled"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch {...field} checked={field.value} />}
                                        label="Enable Alerts"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="errorThreshold"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Error Threshold"
                                        type="number"
                                        fullWidth
                                        error={!!errors.errorThreshold}
                                        helperText={errors.errorThreshold?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="processingTimeThreshold"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Processing Time Threshold (ms)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.processingTimeThreshold}
                                        helperText={errors.processingTimeThreshold?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                                Notification Settings
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="notificationEmail"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Notification Email"
                                        type="email"
                                        fullWidth
                                        error={!!errors.notificationEmail}
                                        helperText={errors.notificationEmail?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="notificationWebhook"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Notification Webhook URL"
                                        fullWidth
                                        error={!!errors.notificationWebhook}
                                        helperText={errors.notificationWebhook?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
} 