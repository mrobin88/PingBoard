'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { X, MapPin, Tag, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface PingFormData {
  text: string
  category: string
  location: string
  is_anonymous: boolean
}

interface PingFormProps {
  onPingCreated: () => void
  onCancel: () => void
}

const CATEGORIES = [
  { value: '', label: 'No Category' },
  { value: 'event', label: 'Event' },
  { value: 'sale', label: 'Sale' },
  { value: 'help', label: 'Help' },
  { value: 'misc', label: 'Misc' },
]

export function PingForm({ onPingCreated, onCancel }: PingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<PingFormData>({
    defaultValues: {
      text: '',
      category: '',
      location: '',
      is_anonymous: false,
    },
    mode: 'onChange',
  })

  const text = watch('text')
  const remainingChars = 280 - text.length

  const createPingMutation = useMutation(
    (data: PingFormData) => api.createPing(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pings'])
        reset()
        onPingCreated()
        toast.success('Ping posted successfully!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create ping')
      },
    }
  )

  const onSubmit = async (data: PingFormData) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await createPingMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create New Ping</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Text Input */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
            What's on your mind?
          </label>
          <textarea
            id="text"
            {...register('text', {
              required: 'Text is required',
              maxLength: {
                value: 280,
                message: 'Text cannot exceed 280 characters',
              },
            })}
            rows={4}
            className={`input resize-none ${errors.text ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Share your thoughts, events, or questions..."
          />
          <div className="flex justify-between items-center mt-2">
            {errors.text && (
              <span className="text-sm text-red-600">{errors.text.message}</span>
            )}
            <span className={`text-sm ${remainingChars < 20 ? 'text-red-600' : 'text-gray-500'}`}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-2" />
            Category (optional)
          </label>
          <select
            id="category"
            {...register('category')}
            className="input"
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Input */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Location (optional)
          </label>
          <input
            type="text"
            id="location"
            {...register('location')}
            className="input"
            placeholder="City, zip code, or neighborhood..."
          />
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="is_anonymous"
            {...register('is_anonymous')}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="is_anonymous" className="flex items-center text-sm text-gray-700">
            <EyeOff className="w-4 h-4 mr-2" />
            Post anonymously (your account will still be linked in our system)
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting || remainingChars < 0}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Ping'}
          </button>
        </div>
      </form>
    </div>
  )
}
