import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { User } from 'lucide-react'

export default function CustomerList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customers</p>
        </div>
      </div>

      <Card>
        <EmptyState
          icon={<User />}
          title="Customer Management"
          description="This page is under development. Full CRUD operations for customers will be implemented here."
        />
      </Card>
    </div>
  )
}
