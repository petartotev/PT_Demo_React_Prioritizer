import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Container, Row, Col, Button, Card, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Priority } from './types/Priority';
import PriorityItem from './components/PriorityItem';
import './App.css';

const App: React.FC = () => {
  const [priorities, setPriorities] = useState<Priority[]>([
    {
      id: '1',
      content: 'Wake up',
      children: []
    },
    {
      id: '2',
      content: 'Go to work',
      children: [
        { id: '2-1', content: 'Take the bus', children: [] },
        { id: '2-2', content: 'Get some work done!', children: [] }
      ]
    },
    {
      id: '3',
      content: 'Sleep',
      children: []
    }
  ]);
  
  // Added state for tracking dragging
  const [isDragging, setIsDragging] = useState(false);
  // State for exported text
  const [exportedText, setExportedText] = useState<string>('');
  // State to control if export is shown
  const [showExport, setShowExport] = useState(false);
  // State for import modal
  const [showImportModal, setShowImportModal] = useState(false);
  // State for import text
  const [importText, setImportText] = useState<string>('');
  // State for import error message
  const [importError, setImportError] = useState<string>('');

  // Recursive function to find and remove a priority item by ID
  const removePriorityById = (items: Priority[], id: string): { newItems: Priority[], removedItem: Priority | null } => {
    let removedItem: Priority | null = null;
    
    // Create a new array excluding the item with the matching ID (at this level)
    const newItems = items.filter(item => {
      if (item.id === id) {
        removedItem = item;
        return false;
      }
      return true;
    });
    
    // If item wasn't found at this level, search in children
    if (!removedItem) {
      for (let i = 0; i < newItems.length; i++) {
        const result = removePriorityById(newItems[i].children, id);
        
        if (result.removedItem) {
          // Update the children of this item with the new filtered children
          newItems[i] = {
            ...newItems[i],
            children: result.newItems
          };
          removedItem = result.removedItem;
          break;
        }
      }
    }
    
    return { newItems, removedItem };
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);
    
    const { source, destination, draggableId } = result;
    
    // Return if dropped outside a droppable area
    if (!destination) {
      return;
    }
    
    // No change if dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // First, remove the dragged item from its original location
    const { newItems: updatedPriorities, removedItem } = removePriorityById(priorities, draggableId);
    
    if (!removedItem) {
      return; // Item not found
    }
    
    // Determine where to insert the item
    let finalPriorities = [...updatedPriorities];
    
    // Handle drops in the main list - moving to top level
    if (destination.droppableId === 'main') {
      finalPriorities.splice(destination.index, 0, removedItem);
    } 
    // Handle drops in a nested list - making it a child of another item
    else {
      const parentId = destination.droppableId.replace('children-', '');
      
      // Make sure we're not trying to drop an item into itself or its descendants
      if (isDescendant(removedItem, parentId)) {
        return;
      }
      
      const insertIntoChildren = (items: Priority[]): Priority[] => {
        return items.map(item => {
          if (item.id === parentId) {
            // Insert the removed item into this parent's children
            const newChildren = [...item.children];
            newChildren.splice(destination.index, 0, removedItem);
            return { ...item, children: newChildren };
          } else if (item.children.length > 0) {
            // Search deeper in the hierarchy
            return { ...item, children: insertIntoChildren(item.children) };
          }
          return item;
        });
      };
      
      finalPriorities = insertIntoChildren(finalPriorities);
    }
    
    setPriorities(finalPriorities);
  };

  // Check if an item contains a descendant with the given ID
  const isDescendant = (item: Priority, id: string): boolean => {
    if (item.id === id) {
      return true;
    }
    
    for (const child of item.children) {
      if (isDescendant(child, id)) {
        return true;
      }
    }
    
    return false;
  };

  // Add a new top-level priority item
  const addPriority = () => {
    const newPriority: Priority = {
      id: `new-${Date.now()}`,
      content: 'New Priority',
      children: []
    };
    
    setPriorities([...priorities, newPriority]);
  };

  // Add a sub-priority to a specific parent
  const addSubPriority = (parentId: string) => {
    const newSubPriority: Priority = {
      id: `sub-${Date.now()}`,
      content: 'New Sub-Priority',
      children: []
    };
    
    const addToParent = (items: Priority[]): Priority[] => {
      return items.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...item.children, newSubPriority]
          };
        } else if (item.children.length > 0) {
          return {
            ...item,
            children: addToParent(item.children)
          };
        }
        return item;
      });
    };
    
    setPriorities(addToParent(priorities));
  };

  // Edit a priority's content
  const editPriority = (id: string, newContent: string) => {
    const updateContent = (items: Priority[]): Priority[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, content: newContent };
        } else if (item.children.length > 0) {
          return { ...item, children: updateContent(item.children) };
        }
        return item;
      });
    };
    
    setPriorities(updateContent(priorities));
  };

  // Delete a priority by ID
  const deletePriority = (id: string) => {
    const { newItems } = removePriorityById(priorities, id);
    setPriorities(newItems);
  };

  // Export priorities as a tree-like text structure
  const exportPriorities = () => {
    let result = '';
    
    const buildTreeText = (items: Priority[], level: number = 0) => {
      items.forEach(item => {
        // Add dashes based on the level
        const prefix = '-'.repeat(level + 1);
        result += `${prefix} ${item.content}\n`;
        
        // Process children recursively if they exist
        if (item.children.length > 0) {
          buildTreeText(item.children, level + 1);
        }
      });
    };
    
    buildTreeText(priorities);
    setExportedText(result);
    setShowExport(true);
  };

  // Copy exported text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportedText)
      .then(() => {
        alert('Priorities copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Parse the imported text and convert to priority structure
  const importPriorities = () => {
    setImportError('');
    
    if (!importText.trim()) {
      setImportError('Please paste some priority text to import');
      return;
    }
    
    try {
      const lines = importText.split('\n').filter(line => line.trim());
      
      // Check if the format is valid
      if (!lines.every(line => /^-+\s+.+/.test(line))) {
        setImportError('Invalid format. Each line should start with one or more dashes followed by text.');
        return;
      }
      
      const newPriorities: Priority[] = [];
      const stack: { item: Priority, level: number }[] = [];
      
      lines.forEach(line => {
        // Count the number of dashes to determine the level
        const match = line.match(/^(-+)\s+(.+)$/);
        
        if (!match) {
          return; // Skip invalid lines
        }
        
        const level = match[1].length;
        const content = match[2].trim();
        const newItem: Priority = {
          id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          content,
          children: []
        };
        
        if (level === 1) {
          // This is a top-level item
          newPriorities.push(newItem);
          stack.splice(0); // Clear the stack
          stack.push({ item: newItem, level });
        } else {
          // Find the parent at the appropriate level
          while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
          }
          
          if (stack.length === 0) {
            // No parent found at appropriate level, add as top-level
            newPriorities.push(newItem);
          } else {
            // Add as child to the parent at the top of the stack
            stack[stack.length - 1].item.children.push(newItem);
          }
          
          stack.push({ item: newItem, level });
        }
      });
      
      // Update priorities with the new structure
      setPriorities(newPriorities);
      setShowImportModal(false);
      setImportText('');
      
    } catch (error) {
      console.error('Import error:', error);
      setImportError('Failed to process the imported text. Please check the format.');
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <h1 className="text-center mb-4">Priority Manager</h1>
      
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable droppableId="main" type="PRIORITY" direction="vertical">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`priority-list ${isDragging ? 'dragging' : ''}`}
            >
              {priorities.map((priority, index) => (
                <Draggable key={priority.id} draggableId={priority.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-3"
                    >
                      <PriorityItem 
                        priority={priority} 
                        dragHandleProps={provided.dragHandleProps}
                        onEdit={editPriority}
                        onDelete={deletePriority}
                        onAddSub={addSubPriority}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <Row className="mt-4">
        <Col className="text-center">
          <Button variant="primary" onClick={addPriority} className="me-2">
            Add New Priority
          </Button>
          <Button variant="outline-secondary" onClick={exportPriorities} className="me-2">
            <i className="bi bi-download"></i> Export
          </Button>
          <Button variant="outline-secondary" onClick={() => setShowImportModal(true)}>
            <i className="bi bi-upload"></i> Import
          </Button>
        </Col>
      </Row>
      
      {showExport && (
        <Card className="mt-4 export-card">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Exported Priorities</span>
            <div>
              <Button variant="outline-secondary" size="sm" onClick={copyToClipboard} className="me-2">
                <i className="bi bi-clipboard"></i> Copy
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => setShowExport(false)}>
                <i className="bi bi-x"></i> Close
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <pre className="priority-export">{exportedText}</pre>
          </Card.Body>
        </Card>
      )}
      
      {/* Import Modal */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Import Priorities</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Paste your priority text below. Format should be:<br/>
            <code>-Priority 1<br/>--Sub-Priority 1<br/>---Sub-Sub-Priority 1</code>
          </p>
          <Form>
            <Form.Group>
              <Form.Control 
                as="textarea" 
                rows={10} 
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste your priority text here..."
              />
            </Form.Group>
            {importError && (
              <div className="text-danger mt-2">
                <i className="bi bi-exclamation-triangle"></i> {importError}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={importPriorities}>
            Import
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default App;