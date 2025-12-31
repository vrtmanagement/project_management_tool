"use client"

import { useEffect, useState } from 'react'
import axios from 'axios'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import Input from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthHeaders } from '@/lib/auth'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { format, parseISO, addDays, subDays } from 'date-fns'
import { Save, ChevronLeft, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM',
]

export default function ReflectionPage() {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [topPriorities, setTopPriorities] = useState(['', '', ''])
  const [goalsOfTheDay, setGoalsOfTheDay] = useState(Array(10).fill(''))
  const [schedule, setSchedule] = useState(
    TIME_SLOTS.map(time => ({ time, activity: '' }))
  )
  const [reflection, setReflection] = useState(Array(5).fill(''))
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (date && user) {
      fetchReflection()
    }
  }, [date, user])

  const fetchReflection = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await axios.get(
        `/api/reflections?date=${date}`,
        getAuthHeaders()
      )

      if (response.data.success && response.data.reflection) {
        const data = response.data.reflection
        setTopPriorities(data.topPriorities || ['', '', ''])
        setGoalsOfTheDay(data.goalsOfTheDay || Array(10).fill(''))
        setSchedule(data.schedule || TIME_SLOTS.map(time => ({ time, activity: '' })))
        setReflection(data.reflection || Array(5).fill(''))
        setLastSaved(data.updatedAt ? new Date(data.updatedAt) : null)
      } else {
        setTopPriorities(['', '', ''])
        setGoalsOfTheDay(Array(10).fill(''))
        setSchedule(TIME_SLOTS.map(time => ({ time, activity: '' })))
        setReflection(Array(5).fill(''))
        setLastSaved(null)
      }
      setHasChanges(false)
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.error || 'Failed to load reflection')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error('Please login to save reflection')
      return
    }

    try {
      setSaving(true)
      const response = await axios.post(
        '/api/reflections',
        {
          date,
          topPriorities,
          goalsOfTheDay,
          schedule,
          reflection,
        },
        getAuthHeaders()
      )

      if (response.data.success) {
        setLastSaved(new Date())
        setHasChanges(false)
        toast.success('Reflection saved successfully')
      } else {
        toast.error(response.data.error || 'Failed to save reflection')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save reflection')
    } finally {
      setSaving(false)
    }
  }

  const handleTopPriorityChange = (index, value) => {
    const newPriorities = [...topPriorities]
    newPriorities[index] = value
    setTopPriorities(newPriorities)
    setHasChanges(true)
  }

  const handleGoalChange = (index, value) => {
    const newGoals = [...goalsOfTheDay]
    newGoals[index] = value
    setGoalsOfTheDay(newGoals)
    setHasChanges(true)
  }

  const handleScheduleChange = (index, value) => {
    const newSchedule = [...schedule]
    newSchedule[index].activity = value
    setSchedule(newSchedule)
    setHasChanges(true)
  }

  const handleReflectionChange = (index, value) => {
    const newReflection = [...reflection]
    newReflection[index] = value
    setReflection(newReflection)
    setHasChanges(true)
  }

  const handleDateChange = (newDate) => {
    setDate(newDate)
    setHasChanges(false)
  }

  const navigateDate = (direction) => {
    const currentDate = parseISO(date)
    const newDate = direction === 'next'
      ? addDays(currentDate, 1)
      : subDays(currentDate, 1)
    handleDateChange(format(newDate, 'yyyy-MM-dd'))
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section - Matching Image */}
          <div className="mb-8">

            {/* Date Navigation and Save Button */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate('prev')}
                  disabled={loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-auto"
                  disabled={loading}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate('next')}
                  disabled={loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                {lastSaved && (
                  <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Last saved: {format(lastSaved, 'h:mm a')}</span>
                  </div>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saving || loading || !user || !hasChanges}
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Reflection'}
                </Button>
              </div>
            </div>
          </div>

          {!user && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Please login to create reflections.
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-neutral-600 dark:text-neutral-400">Loading reflection...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Date Section */}
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <CardHeader className="border border-red-600 rounded-lg text-red-600 py-3 px-4">
                    <CardTitle className="text-center text-lg font-bold">Date</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 pb-4 px-4">
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                    />
                  </CardContent>
                </Card>

                {/* Top Priorities Section */}
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <CardHeader className="border border-red-600 rounded-lg text-red-600 py-3 px-4">
                    <CardTitle className="text-center text-lg font-bold">Top Priorities</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 pb-4 px-4 space-y-3">
                    {topPriorities.map((priority, index) => (
                      <Input
                        key={index}
                        placeholder={`Priority ${index + 1}`}
                        value={priority}
                        onChange={(e) => handleTopPriorityChange(index, e.target.value)}
                        className="w-full bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    ))}
                  </CardContent>
                </Card>

                {/* Goals of the Day Section */}
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <CardHeader className="border border-red-600 rounded-lg text-red-600 py-3 px-4">
                    <CardTitle className="text-center text-lg font-bold">Goals of the Day</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 pb-4 px-4 space-y-3">
                    {goalsOfTheDay.map((goal, index) => (
                      <Input
                        key={index}
                        placeholder={`Goal ${index + 1}`}
                        value={goal}
                        onChange={(e) => handleGoalChange(index, e.target.value)}
                        className="w-full bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Schedule Section */}
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <CardHeader className="border border-red-600 rounded-lg text-red-600 py-3 px-4">
                    <CardTitle className="text-center text-lg font-bold">Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 pb-4 px-4">
                    <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2">
                      {schedule.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3"
                        >
                          <div className="w-28 text-sm font-medium text-black dark:text-neutral-300 shrink-0">
                            {item.time}
                          </div>
                          <Input
                            placeholder="Activity"
                            value={item.activity}
                            onChange={(e) => handleScheduleChange(index, e.target.value)}
                            className="flex-1 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Reflection Section */}
                <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <CardHeader className="border border-red-600 rounded-lg text-red-600 py-3 px-4">
                    <CardTitle className="text-center text-lg font-bold">Reflection</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 pb-4 px-4 space-y-3">
                    {reflection.map((item, index) => (
                      <Input
                        key={index}
                        placeholder={`Reflection ${index + 1}`}
                        value={item}
                        onChange={(e) => handleReflectionChange(index, e.target.value)}
                        className="w-full bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
// import React from 'react'

// const page = () => {
//   return (
//     <div>page</div>
//   )
// }

// export default page