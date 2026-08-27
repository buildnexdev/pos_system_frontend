import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Building2,
  FileSpreadsheet,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Loader } from '../../components/ui/Loader'
import { dashboardService } from '../../services/dashboardService.tsx'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function Dashboard() {
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: () => dashboardService.getStatistics(),
  })

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-chart-data'],
    queryFn: () => dashboardService.getChartData(),
  })

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: () => dashboardService.getRecentActivities(10),
  })

  if (statsLoading || chartLoading || activitiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    )
  }

  const stats = (statistics?.data || {}) as Record<string, any>
  const charts = (chartData?.data || {
    monthly: [],
    branch_distribution: { active: 0, inactive: 0 },
    agent_distribution: { active: 0, inactive: 0 },
  }) as Record<string, any>
  const recentActivities = (activities?.data || []) as any[]

  const statCards = [
    {
      title: 'Total Records',
      value: stats.total_records || 0,
      icon: FileSpreadsheet,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Branches',
      value: stats.total_branches || 0,
      icon: Building2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Agents',
      value: stats.total_agents || 0,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: "Today's Upload",
      value: stats.today_upload || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Monthly Upload',
      value: stats.monthly_upload || 0,
      icon: Clock,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Import Success',
      value: stats.import_success || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Import Failed',
      value: stats.import_failed || 0,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Data Overview" className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="branches" fill="#0ea5e9" name="Branches" />
              <Bar dataKey="agents" fill="#8b5cf6" name="Agents" />
              <Bar dataKey="customers" fill="#10b981" name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Branch & Agent Distribution" className="p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Active Branches</span>
                <span className="text-sm font-bold text-gray-900">
                  {charts.branch_distribution.active || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(charts.branch_distribution.active / (charts.branch_distribution.active + charts.branch_distribution.inactive || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Inactive Branches</span>
                <span className="text-sm font-bold text-gray-900">
                  {charts.branch_distribution.inactive || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${(charts.branch_distribution.inactive / (charts.branch_distribution.active + charts.branch_distribution.inactive || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Active Agents</span>
                <span className="text-sm font-bold text-gray-900">
                  {charts.agent_distribution.active || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(charts.agent_distribution.active / (charts.agent_distribution.active + charts.agent_distribution.inactive || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Inactive Agents</span>
                <span className="text-sm font-bold text-gray-900">
                  {charts.agent_distribution.inactive || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${(charts.agent_distribution.inactive / (charts.agent_distribution.active + charts.agent_distribution.inactive || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card title="Recent Activities" className="p-6">
        <div className="space-y-4">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent activities
            </div>
          ) : (
            recentActivities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary-100">
                    <FileSpreadsheet className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.import_type} Import
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.file_name} • {activity.total_records} records
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      activity.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
