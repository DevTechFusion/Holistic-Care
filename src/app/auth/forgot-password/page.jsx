import Image from "next/image"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Welcome section */}
      <div className="hidden lg:flex lg:w-1/2 bg-teal-500 relative overflow-hidden">
        {/* Background medical cross icons */}
               <div className="absolute inset-0 opacity-full">
                 <div className="absolute top-[0] right-2 text-white text-6xl">
                   <Image
                     src="/images/left-bg.png"
                     alt="Medical Cross"
                     width={250}
                     height={250}
                   />
                 </div>
            </div>
       

        <div className="flex flex-col top-0 left-50 justify-center px-12 relative z-10">
          {/* Doctors image */}
                   <div className="mb-8">
                     <Image
                       src="/images/doctors_image.png"
                       alt="Healthcare professionals"
                       width={400}
                       height={300}
                       className="rounded-lg"
                     />
                   </div>
         
                   {/* Welcome text */}
                   <div className="text-white">
                     <h1 className="text-4xl font-bold mb- leading-tight">
                       Welcome to
                       <br />
                       Holistic Care CRM
                     </h1>
                   <p className="text-lg opacity-90 leading-relaxed">
              Reset your password to regain access to your healthcare management dashboard.
            </p>
            
          </div>
        </div>
      </div>

      {/* Right side - Forgot Password form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}