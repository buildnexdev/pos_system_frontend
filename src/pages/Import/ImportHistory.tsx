import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { History } from 'lucide-react'

export default function ImportHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import History</h1>
        <p className="text-gray-600">View past import operations</p>
      </div>

      <Card>
        <EmptyState
          icon={<History />}
          title="Import History"
          description="This page is under development. Import history with detailed reports will be displayed here."
        />
      </Card>
    </div>
  )
}
