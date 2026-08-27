import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Users } from 'lucide-react'

export default function AgentList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-600">Manage your agents</p>
        </div>
      </div>

      <Card>
        <EmptyState
          icon={<Users />}
          title="Agent Management"
          description="This page is under development. Full CRUD operations for agents will be implemented here."
        />
      </Card>
    </div>
  )
}
