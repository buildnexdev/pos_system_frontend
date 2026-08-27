import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Users } from 'lucide-react'

export default function AgentForm() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Form</h1>
        <p className="text-gray-600">Add or edit agent information</p>
      </div>

      <Card>
        <EmptyState
          icon={<Users />}
          title="Agent Form"
          description="This form is under development. Agent creation and editing will be implemented here."
        />
      </Card>
    </div>
  )
}
