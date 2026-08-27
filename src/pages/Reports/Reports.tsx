import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { BarChart3 } from 'lucide-react'

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and view reports</p>
      </div>

      <Card>
        <EmptyState
          icon={<BarChart3 />}
          title="Reports Center"
          description="This page is under development. Branch, agent, customer, and import reports will be available here."
        />
      </Card>
    </div>
  )
}
