"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail } from "lucide-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        {/* Logo */}
              <div className="flex items-center space-x-2 mb-10">
                <Image
                  src="/images/logo.svg"
                  alt="Holistic Care Logo"
                  width={140}
                  height={140}
                />
              </div>
        {/* Success message */}
        <div className="space-y-4">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="text-gray-600">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or try again.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="w-full h-12"
          >
            Try again
          </Button>
          <Link
            href="/auth/login"
            className="flex items-center justify-center space-x-2 text-teal-400 hover:text-teal-500 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to login</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-10">
                <Image
                  src="/images/logo.svg"
                  alt="Holistic Care Logo"
                  width={140}
                  height={140}
                />
              </div>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-600">
            Email Address*
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 border-gray-300 focus:border-teal-400 focus:ring-teal-400"
            placeholder="Enter your email address"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-teal-400 hover:bg-teal-500 text-white font-medium disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center">
        <Link
          href="/auth/login"
          className="flex items-center justify-center space-x-2 text-teal-400 hover:text-teal-500 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to login</span>
        </Link>
      </div>
    </div>
  )
}