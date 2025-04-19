import React, { useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography,
    FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface DirectoryListProps {
    directories: string[];
    onChange: (directories: string[]) => void;
    error?: boolean;
    helperText?: string;
}

export default function DirectoryList({ directories, onChange, error, helperText }: DirectoryListProps) {
    const [newDirectory, setNewDirectory] = useState('');

    const handleAdd = () => {
        if (newDirectory && !directories.includes(newDirectory)) {
            onChange([...directories, newDirectory]);
            setNewDirectory('');
        }
    };

    const handleRemove = (index: number) => {
        const newDirectories = directories.filter((_, i) => i !== index);
        onChange(newDirectories);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAdd();
        }
    };

    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                Monitored Directories
            </Typography>
            <Box display="flex" gap={2} mb={2}>
                <TextField
                    fullWidth
                    value={newDirectory}
                    onChange={(e) => setNewDirectory(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter directory path"
                    error={error}
                    size="small"
                />
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    disabled={!newDirectory}
                >
                    Add
                </Button>
            </Box>
            <List>
                {directories.map((directory, index) => (
                    <ListItem
                        key={index}
                        secondaryAction={
                            <IconButton edge="end" onClick={() => handleRemove(index)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText primary={directory} />
                    </ListItem>
                ))}
            </List>
            {error && helperText && (
                <FormHelperText error>{helperText}</FormHelperText>
            )}
        </Box>
    );
} 