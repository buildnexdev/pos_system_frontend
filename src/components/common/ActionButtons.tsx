import React from 'react'
import { Button } from '../ui/Button'
import { Eye, Edit, Trash2 } from 'lucide-react'

interface ActionButtonsProps {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  className?: string
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onView, onEdit, onDelete, className }) => {
  return (
    <div className={className || 'flex items-center gap-2'}>
      <Button variant="outline" size="sm" onClick={onView} title="View">
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onEdit} title="Edit">
        <Edit className="w-4 h-4" />
      </Button>
      <Button variant="danger" size="sm" onClick={onDelete} title="Delete">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default ActionButtons
