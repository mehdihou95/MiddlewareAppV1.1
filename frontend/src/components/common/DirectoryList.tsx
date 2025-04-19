import React from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface DirectoryListProps {
    directories: string[];
    onChange: (directories: string[]) => void;
    error?: boolean;
    helperText?: string;
}

const DirectoryList: React.FC<DirectoryListProps> = ({
    directories,
    onChange,
    error,
    helperText
}) => {
    const handleAddDirectory = () => {
        onChange([...directories, '']);
    };

    const handleRemoveDirectory = (index: number) => {
        const newDirectories = directories.filter((_, i) => i !== index);
        onChange(newDirectories);
    };

    const handleDirectoryChange = (index: number, value: string) => {
        const newDirectories = [...directories];
        newDirectories[index] = value;
        onChange(newDirectories);
    };

    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                Directories
            </Typography>
            {directories.map((directory, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                        fullWidth
                        value={directory}
                        onChange={(e) => handleDirectoryChange(index, e.target.value)}
                        placeholder="Enter directory path"
                        error={error}
                        helperText={index === directories.length - 1 ? helperText : ''}
                    />
                    <IconButton
                        onClick={() => handleRemoveDirectory(index)}
                        color="error"
                        disabled={directories.length === 1}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <IconButton onClick={handleAddDirectory} color="primary">
                    <AddIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default DirectoryList; 