import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Settings } from 'lucide-react'

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600">View system activity logs</p>
      </div>

      <Card>
        <EmptyState
          icon={<Settings />}
          title="Audit Logs"
          description="This page is under development. System activity and user action logs will be displayed here."
        />
      </Card>
    </div>
  )
}
