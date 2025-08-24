'use client'

import { useState } from 'react'
import { useQuery } from 'react-query'
import { Plus, Search, Filter, LogIn, UserPlus } from 'lucide-react'
import { PingFeed } from '@/components/PingFeed'
import { PingForm } from '@/components/PingForm'
import { SearchAndFilter } from '@/components/SearchAndFilter'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const [showPingForm, setShowPingForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  const { data: pings, isLoading, error, refetch } = useQuery(
    ['pings', searchQuery, selectedCategory, selectedLocation],
    () => api.getPings({ search: searchQuery, category: selectedCategory, location: selectedLocation }),
    { refetchInterval: 30000 } // Refresh every 30 seconds
  )

  const handlePingCreated = () => {
    setShowPingForm(false)
    refetch()
    toast.success('Ping posted successfully!')
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
  }

  const handleLocationFilter = (location: string) => {
    setSelectedLocation(location)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">PingBoard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowPingForm(true)}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Ping</span>
                  </button>
                  <a href="/profile" className="btn btn-outline">
                    Profile
                  </a>
                </>
              ) : (
                <>
                  <a href="/login" className="btn btn-outline flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </a>
                  <a href="/register" className="btn btn-primary flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <SearchAndFilter
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          onLocationFilter={handleLocationFilter}
          selectedCategory={selectedCategory}
          selectedLocation={selectedLocation}
        />

        {/* Ping Form Modal */}
        {showPingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <PingForm onPingCreated={handlePingCreated} onCancel={() => setShowPingForm(false)} />
            </div>
          </div>
        )}

        {/* Ping Feed */}
        <div className="mt-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading pings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading pings. Please try again.</p>
            </div>
          ) : (
            <PingFeed pings={pings?.data || []} onPingUpdated={refetch} />
          )}
        </div>
      </main>
    </div>
  )
}
