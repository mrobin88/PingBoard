'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, Calendar, User, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface Ping {
  id: number
  text: string
  category: string
  timestamp: string
  user: {
    id: number
    username: string
    avatar?: string
  }
  location: string
  is_anonymous: boolean
  display_name: string
  vote_count: number
  user_has_upvoted: boolean
  user_has_downvoted: boolean
}

interface PingFeedProps {
  pings: Ping[]
  onPingUpdated: () => void
}

export function PingFeed({ pings, onPingUpdated }: PingFeedProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [votingPings, setVotingPings] = useState<Set<number>>(new Set())

  const voteMutation = useMutation(
    ({ pingId, voteType }: { pingId: number; voteType: string }) =>
      api.votePing(pingId, voteType),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pings'])
        onPingUpdated()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to vote')
      },
    }
  )

  const handleVote = async (pingId: number, voteType: string) => {
    if (!user) {
      toast.error('Please login to vote')
      return
    }

    setVotingPings(prev => new Set(prev).add(pingId))
    
    try {
      await voteMutation.mutateAsync({ pingId, voteType })
    } finally {
      setVotingPings(prev => {
        const newSet = new Set(prev)
        newSet.delete(pingId)
        return newSet
      })
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      event: 'bg-blue-100 text-blue-800',
      sale: 'bg-green-100 text-green-800',
      help: 'bg-yellow-100 text-yellow-800',
      misc: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.misc
  }

  if (pings.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pings yet</h3>
        <p className="text-gray-600">Be the first to share something with your community!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pings.map((ping) => (
        <div key={ping.id} className="card hover:shadow-md transition-shadow duration-200">
          {/* Ping Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                {ping.user.avatar ? (
                  <img
                    src={ping.user.avatar}
                    alt={ping.display_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary-600" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {ping.is_anonymous ? (
                      <span className="flex items-center space-x-1">
                        <EyeOff className="w-4 h-4" />
                        <span>Anonymous</span>
                      </span>
                    ) : (
                      ping.display_name
                    )}
                  </span>
                  {ping.category && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(ping.category)}`}>
                      {ping.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTimestamp(ping.timestamp)}</span>
                  </span>
                  {ping.location && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{ping.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ping Content */}
          <div className="mb-4">
            <p className="text-gray-900 leading-relaxed">{ping.text}</p>
          </div>

          {/* Ping Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              {/* Upvote */}
              <button
                onClick={() => handleVote(ping.id, ping.user_has_upvoted ? 'remove' : 'upvote')}
                disabled={votingPings.has(ping.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  ping.user_has_upvoted
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">{ping.vote_count}</span>
              </button>

              {/* Downvote */}
              <button
                onClick={() => handleVote(ping.id, ping.user_has_downvoted ? 'remove' : 'downvote')}
                disabled={votingPings.has(ping.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  ping.user_has_downvoted
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>

            {/* Edit/Delete for own pings */}
            {user && ping.user.id === user.id && (
              <div className="flex items-center space-x-2">
                <button className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-200">
                  Edit
                </button>
                <button className="text-sm text-red-500 hover:text-red-600 transition-colors duration-200">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
