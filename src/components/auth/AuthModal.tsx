import React, { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { signUp, signIn } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { ToastNotification } from '../ToastNotification'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
}

interface FormData {
  name?: string
  email: string
  password: string
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  onModeChange,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  // Close modal if user becomes authenticated
  React.useEffect(() => {
    if (user && isOpen) {
      console.log('User authenticated, closing modal')
      handleClose()
    }
  }, [user, isOpen])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    console.log('Form submitted with mode:', mode, 'email:', data.email)

    try {
      if (mode === 'signup') {
        console.log('Calling signUp...')
        const { error } = await signUp(data.email, data.password, data.name!)
        console.log('SignUp completed, error:', error)
        if (error) throw error
        // Show custom toast notification instead of alert
        setShowToast(true)
        handleClose()
      } else {
        console.log('Calling signIn...')
        const { data: signInData, error } = await signIn(data.email, data.password)
        console.log('SignIn completed, error:', error)
        console.log('SignIn data:', signInData)
        if (error) throw error
        console.log('SignIn successful, closing modal')
        // Successfully signed in
        handleClose()
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'Authentication failed. Please try again.')
      setLoading(false)
    } finally {
      console.log('Setting loading to false')
      // Don't set loading to false here if successful, let the useEffect handle it
    }
  }

  const handleClose = () => {
    console.log('Closing auth modal')
    reset()
    setError(null)
    setLoading(false)
    onClose()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={handleClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-dusty-400 hover:text-dusty-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-dusty-800 mb-2">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-dusty-600">
                  {mode === 'signin'
                    ? 'Sign in to access your time capsules'
                    : 'Start preserving your precious memories'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
                  <p className="text-error-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-dusty-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dusty-400" />
                      <input
                        {...register('name', { required: 'Name is required' })}
                        type="text"
                        className="w-full pl-10 pr-4 py-3 border border-dusty-200 rounded-lg focus:ring-2 focus:ring-dusty-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        disabled={loading}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-dusty-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dusty-400" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 border border-dusty-200 rounded-lg focus:ring-2 focus:ring-dusty-500 focus:border-transparent"
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dusty-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dusty-400" />
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 border border-dusty-200 rounded-lg focus:ring-2 focus:ring-dusty-500 focus:border-transparent"
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dusty-400 hover:text-dusty-600"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    mode === 'signin' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-dusty-600">
                  {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                    className="ml-2 text-dusty-500 hover:text-dusty-700 font-medium"
                    disabled={loading}
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ToastNotification
        message="Welcome to MementoLocker! A confirmation link has been sent to your email."
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />
    </>
  )
}