'use client'

import { signOut } from 'next-auth/react'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ArrowRightOnRectangleIcon className="h-4 w-4" />
      <span>Ondoka</span>
    </button>
  )
}
