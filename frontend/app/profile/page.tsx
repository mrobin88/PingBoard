'use client'

import { useState } from 'react'
import { useQuery } from 'react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, Edit, LogOut, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { PingFeed } from '@/components/PingFeed'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showPingForm, setShowPingForm] = useState(false)

  const { data: userPings, isLoading, error, refetch } = useQuery(
    ['user-pings'],
    () => api.getUserPings(),
    { enabled: !!user }
  )

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  const handlePingCreated = () => {
    setShowPingForm(false)
    refetch()
    toast.success('Ping posted successfully!')
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-primary-600 hover:text-primary-500">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPingForm(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Ping</span>
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-outline flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="card mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-primary-600" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <button className="btn btn-outline flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
              
              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  <span>{userPings?.data?.length || 0} pings</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User's Pings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Pings</h3>
            <button
              onClick={() => setShowPingForm(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Ping</span>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your pings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading your pings. Please try again.</p>
            </div>
          ) : userPings?.data?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pings yet</h3>
              <p className="text-gray-600 mb-4">Start sharing your thoughts with your community!</p>
              <button
                onClick={() => setShowPingForm(true)}
                className="btn btn-primary"
              >
                Create your first ping
              </button>
            </div>
          ) : (
            <PingFeed pings={userPings?.data || []} onPingUpdated={refetch} />
          )}
        </div>
      </main>

      {/* Ping Form Modal */}
      {showPingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Import PingForm component here */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Ping</h2>
                <button
                  onClick={() => setShowPingForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600">Ping form component would go here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
