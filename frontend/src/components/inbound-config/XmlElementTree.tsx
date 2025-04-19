import React, { useState, useCallback } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton, 
  Collapse,
  TextField,
  Box,
  IconButton,
  Tooltip,
  ListItemIcon
} from '@mui/material';
import { 
  ExpandLess, 
  ExpandMore, 
  Search as SearchIcon,
  UnfoldLess as CollapseAllIcon,
  UnfoldMore as ExpandAllIcon
} from '@mui/icons-material';
import { XsdElement } from '../../types';

interface XmlElementTreeProps {
  elements: XsdElement[];
  onElementClick: (element: XsdElement, path: string) => void;
  selectedElement: XsdElement | null;
}

interface XmlElementNodeProps {
  element: XsdElement;
  onElementClick: (element: XsdElement, fullPath: string) => void;
  selectedElement: XsdElement | null;
  parentPath?: string;
}

const XmlElementNode: React.FC<XmlElementNodeProps> = ({
  element,
  onElementClick,
  selectedElement,
  parentPath = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  const fullPath = parentPath ? `${parentPath}/${element.name}` : element.name;
  const isSelected = selectedElement?.name === fullPath;

  return (
    <>
      <ListItem
        button
        onClick={() => onElementClick(element, fullPath)}
        selected={isSelected}
        sx={{
          pl: parentPath ? parentPath.split('/').length * 2 : 1,
          '&.Mui-selected': {
            backgroundColor: 'primary.light',
            '&:hover': {
              backgroundColor: 'primary.light',
            },
          },
        }}
      >
        {element.elements && element.elements.length > 0 && (
          <ListItemIcon onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemIcon>
        )}
        <ListItemText
          primary={element.name}
          secondary={element.type || 'complex'}
        />
      </ListItem>
      {element.elements && element.elements.length > 0 && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List disablePadding>
            {element.elements.map((child: XsdElement, index: number) => (
              <XmlElementNode
                key={`${child.name}-${index}`}
                element={child}
                onElementClick={onElementClick}
                selectedElement={selectedElement}
                parentPath={fullPath}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const XmlElementTree: React.FC<XmlElementTreeProps> = ({ 
  elements, 
  onElementClick,
  selectedElement 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = useCallback((nodePath: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodePath)) {
        next.delete(nodePath);
      } else {
        next.add(nodePath);
      }
      return next;
    });
  }, []);

  const expandAll = () => {
    const allNodes = new Set<string>();
    const addAllNodes = (els: XsdElement[], level: number) => {
      els.forEach(el => {
        allNodes.add(`${level}-${el.name}`);
        if (el.elements) {
          addAllNodes(el.elements, level + 1);
        }
      });
    };
    addAllNodes(elements, 0);
    setExpandedNodes(allNodes);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  return (
    <Box>
      <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search XML elements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
          sx={{ flex: 1 }}
        />
        <Tooltip title="Expand All">
          <IconButton onClick={expandAll} size="small">
            <ExpandAllIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Collapse All">
          <IconButton onClick={collapseAll} size="small">
            <CollapseAllIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <List sx={{ 
        maxHeight: 'calc(60vh - 56px)', // Account for search bar height
        overflow: 'auto',
        '& .MuiListItem-root': {
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
        '& .MuiListItem-root:last-child': {
          borderBottom: 'none',
        },
      }}>
        {elements.map((element, index) => (
          <XmlElementNode
            key={`${element.name}-${index}`}
            element={element}
            onElementClick={onElementClick}
            selectedElement={selectedElement}
          />
        ))}
      </List>
    </Box>
  );
};

export default XmlElementTree; 