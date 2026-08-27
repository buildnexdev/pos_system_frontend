import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { FileSpreadsheet } from 'lucide-react'

export default function ImportCenter() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Center</h1>
        <p className="text-gray-600">Upload and import Excel files</p>
      </div>

      <Card>
        <EmptyState
          icon={<FileSpreadsheet />}
          title="Excel Import Center"
          description="This page is under development. File upload, validation, preview, and import functionality will be implemented here."
        />
      </Card>
    </div>
  )
}
