import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { User } from 'lucide-react'

export default function CustomerForm() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Form</h1>
        <p className="text-gray-600">Add or edit customer information</p>
      </div>

      <Card>
        <EmptyState
          icon={<User />}
          title="Customer Form"
          description="This form is under development. Customer creation and editing will be implemented here."
        />
      </Card>
    </div>
  )
}
