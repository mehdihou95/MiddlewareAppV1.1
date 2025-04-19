import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Storage as DatabaseIcon,
  TableChart as TableIcon,
  ViewColumn as ColumnIcon,
} from '@mui/icons-material';
import { DatabaseField } from '../../types';

interface DatabaseFieldTreeProps {
  fields: DatabaseField[];
  onFieldClick: (field: string) => void;
  selectedField: string;
}

interface TableFields {
  [key: string]: DatabaseField[];
}

const DatabaseFieldNode: React.FC<{
  field: DatabaseField;
  onFieldClick: (field: string) => void;
  selected: boolean;
}> = ({ field, onFieldClick, selected }) => (
  <ListItem
    button
    onClick={() => onFieldClick(field.field)}
    selected={selected}
    sx={{
      pl: 4,
      '&.Mui-selected': {
        backgroundColor: 'primary.light',
        '&:hover': {
          backgroundColor: 'primary.light',
        },
      },
    }}
  >
    <ListItemIcon>
      <ColumnIcon fontSize="small" />
    </ListItemIcon>
    <ListItemText
      primary={field.field.split('.')[1]}
      secondary={`Type: ${field.type}`}
    />
  </ListItem>
);

const DatabaseFieldTree: React.FC<DatabaseFieldTreeProps> = ({
  fields,
  onFieldClick,
  selectedField,
}) => {
  const [expandedTables, setExpandedTables] = useState<{ [key: string]: boolean }>({});

  // Group fields by table
  const groupedFields = fields.reduce<TableFields>((acc, field) => {
    const tableName = field.field.split('.')[0];
    if (!acc[tableName]) {
      acc[tableName] = [];
    }
    acc[tableName].push(field);
    return acc;
  }, {});

  const handleTableClick = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  return (
    <List
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      {Object.entries(groupedFields).map(([tableName, tableFields]) => (
        <React.Fragment key={tableName}>
          <ListItem
            button
            onClick={() => handleTableClick(tableName)}
            sx={{
              bgcolor: 'background.default',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ListItemIcon>
              <TableIcon />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" component="div">
                  {tableName}
                </Typography>
              }
            />
            <IconButton
              edge="end"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleTableClick(tableName);
              }}
            >
              {expandedTables[tableName] ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </IconButton>
          </ListItem>
          <Collapse in={expandedTables[tableName]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {tableFields.map((field: DatabaseField, index: number) => (
                <DatabaseFieldNode
                  key={`${field.field}-${index}`}
                  field={field}
                  onFieldClick={onFieldClick}
                  selected={selectedField === field.field}
                />
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      ))}
    </List>
  );
};

export default DatabaseFieldTree; 