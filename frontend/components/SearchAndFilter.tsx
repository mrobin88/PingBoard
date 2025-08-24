'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

interface SearchAndFilterProps {
  onSearch: (query: string) => void
  onCategoryFilter: (category: string) => void
  onLocationFilter: (location: string) => void
  selectedCategory: string
  selectedLocation: string
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'event', label: 'Events' },
  { value: 'sale', label: 'Sales' },
  { value: 'help', label: 'Help' },
  { value: 'misc', label: 'Misc' },
]

export function SearchAndFilter({
  onSearch,
  onCategoryFilter,
  onLocationFilter,
  selectedCategory,
  selectedLocation,
}: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleCategoryChange = (category: string) => {
    onCategoryFilter(category)
  }

  const handleLocationChange = (location: string) => {
    onLocationFilter(location)
  }

  const clearFilters = () => {
    setSearchQuery('')
    onSearch('')
    onCategoryFilter('')
    onLocationFilter('')
  }

  const hasActiveFilters = selectedCategory || selectedLocation || searchQuery

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pings..."
            className="input pl-10 pr-4"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          {/* Category Filter */}
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input"
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location-filter"
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="Filter by location..."
              className="input"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Search: "{searchQuery}"
              <button
                onClick={() => {
                  setSearchQuery('')
                  onSearch('')
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {selectedCategory && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Category: {CATEGORIES.find(c => c.value === selectedCategory)?.label}
              <button
                onClick={() => onCategoryFilter('')}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {selectedLocation && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Location: {selectedLocation}
              <button
                onClick={() => onLocationFilter('')}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
