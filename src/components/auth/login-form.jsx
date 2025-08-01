"use client"
import Image from "next/image";

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { authApi } from "@/lib/api"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [loginError, setLoginError] = useState("")

  const validateForm = () => {
    const newErrors = {}
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoginError("")
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const data = await authApi.login(email, password)

      // Store token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token)
      }

      // Store user data if provided
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user))
      }

      // Redirect based on user role
      if (data.user && data.user.role) {
        switch (data.user.role.toLowerCase()) {
          case 'admin':
            window.location.href = "/dashboard/admin"
            break
          case 'manager':
            window.location.href = "/dashboard/manager"
            break
          case 'agent':
            window.location.href = "/dashboard/agent"
            break
          default:
            window.location.href = "/dashboard"
            break
        }
      } else {
        // Fallback redirect if no role specified
        window.location.href = "/dashboard"
      }
    } catch (error) {
      setLoginError(error.message || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
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

      {/* Login header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">LOGIN</h2>
        <p className="text-gray-600">Enter your details to access the dashboard.</p>
      </div>

      {/* Login Error */}
      {loginError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{loginError}</p>
        </div>
      )}
    {/* Login form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-600">
            Email*
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: "" }))
              }
            }}
            className={`h-12 border-gray-300 focus:border-teal-400 focus:ring-teal-400 ${
              errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
            }`}
            required
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-600">
            Password*
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: "" }))
                }
              }}
              className={`h-12 border-gray-300 focus:border-teal-400 focus:ring-teal-400 pr-10 ${
                errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 rounded"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={setRememberMe}
              aria-describedby="remember-description"
            />
            <Label htmlFor="remember" className="text-sm text-gray-600">
              Remember me
            </Label>
            <span id="remember-description" className="sr-only">
              Keep me signed in on this device
            </span>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-teal-400 hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 rounded"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-teal-400 hover:bg-teal-500 text-white font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
          aria-describedby={loginError ? "login-error" : undefined}
        >
          {isLoading ? "Signing in..." : "Login"}
        </Button>
      </form>
    </div>
  )
}
