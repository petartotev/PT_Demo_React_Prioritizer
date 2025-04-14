import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, ButtonGroup } from 'react-bootstrap';
import { Droppable, Draggable, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { Priority } from '../types/Priority';

interface PriorityItemProps {
  priority: Priority;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onAddSub: (parentId: string) => void;
}

const PriorityItem: React.FC<PriorityItemProps> = ({ 
  priority, 
  dragHandleProps, 
  onEdit,
  onDelete,
  onAddSub
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(priority.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (editContent.trim()) {
      onEdit(priority.id, editContent);
    } else {
      setEditContent(priority.content); // Reset to original if empty
    }
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditContent(priority.content);
    setIsEditing(true);
  };

  // Add click outside handler
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleEditSubmit();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, editContent]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <Card className="priority-item">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          {isEditing ? (
            <Form ref={formRef} onSubmit={handleEditSubmit} className="w-100">
              <div className="d-flex">
                <Form.Control
                  ref={inputRef}
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <Button type="submit" variant="success" size="sm" className="ms-2">
                  Save
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="ms-2"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(priority.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          ) : (
            <>
              <div className="d-flex align-items-center">
                <div {...dragHandleProps} className="drag-handle me-2">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                </div>
                <span 
                  className="priority-content" 
                  onClick={startEditing}
                  title="Click to edit"
                >
                  {priority.content}
                </span>
              </div>
              <div>
                {showDeleteConfirm ? (
                  <ButtonGroup size="sm">
                    <Button 
                      variant="danger"
                      onClick={() => onDelete(priority.id)}
                    >
                      Confirm
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </ButtonGroup>
                ) : (
                  <ButtonGroup size="sm">
                    <Button 
                      variant="outline-primary"
                      onClick={startEditing}
                      title="Edit this priority"
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </Button>
                    <Button 
                      variant="outline-success"
                      onClick={() => onAddSub(priority.id)}
                      title="Add a sub-priority"
                    >
                      <i className="bi bi-plus"></i> Add Sub
                    </Button>
                    <Button 
                      variant="outline-danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      title="Delete this priority"
                    >
                      <i className="bi bi-trash"></i> Delete
                    </Button>
                  </ButtonGroup>
                )}
              </div>
            </>
          )}
        </div>
        
        <Droppable
          droppableId={`children-${priority.id}`}
          type="PRIORITY"
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`children-container mt-3 ${
                snapshot.isDraggingOver ? 'dragging-over' : ''
              } ${priority.children.length === 0 ? 'empty-container' : ''}`}
            >
              {priority.children.map((child, index) => (
                <Draggable key={child.id} draggableId={child.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-3 ms-4"
                    >
                      <PriorityItem 
                        priority={child} 
                        dragHandleProps={provided.dragHandleProps}
                        onEdit={onEdit}
                        onDelete={onDelete} 
                        onAddSub={onAddSub}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {priority.children.length === 0 && (
                <div className="drop-hint">Drop items here or use Add Sub button</div>
              )}
            </div>
          )}
        </Droppable>
      </Card.Body>
    </Card>
  );
};

export default PriorityItem;