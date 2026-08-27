import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { authService } from '../../services/authService.tsx'

const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(6, 'Password must be at least 6 characters'),
    new_password_confirmation: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Passwords don't match",
    path: ['new_password_confirmation'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await authService.changePassword(data)
      toast.success('Password changed successfully')
      reset()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-lg bg-primary-100">
            <Lock className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Change Password
            </h1>
            <p className="text-gray-600">
              Update your password to keep your account secure
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            error={errors.old_password?.message}
            {...register('old_password')}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.new_password?.message}
            {...register('new_password')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.new_password_confirmation?.message}
            {...register('new_password_confirmation')}
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
