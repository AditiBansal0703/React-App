import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

export default function Kanban({ 
  columns, 
  renderItem, 
  onDragEnd,
  className = ''
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={`flex gap-4 min-h-[600px] p-4 overflow-x-auto ${className}`}>
        {columns.map((column) => (
          <div
            key={column.id}
            className={`flex-1 min-w-[300px] rounded-lg p-4 ${column.className || 'bg-gray-50'}`}
          >
            <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
              <span>{column.title}</span>
              <span className="text-sm text-gray-500 bg-white bg-opacity-50 px-2 py-1 rounded-full">
                {column.items.length}
              </span>
            </h3>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[200px] transition-colors duration-200 rounded-lg p-2 ${
                    snapshot.isDraggingOver ? 'bg-gray-100 bg-opacity-50' : ''
                  }`}
                >
                  <AnimatePresence>
                    {column.items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              ...provided.draggableProps.style,
                              transform: snapshot.isDragging
                                ? provided.draggableProps.style?.transform
                                : 'none',
                            }}
                          >
                            {renderItem(item)}
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}