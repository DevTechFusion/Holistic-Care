import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Welcome section */}
      <div className="hidden md:flex md:w-full lg:w-1/2 bg-teal-500 relative overflow-hidden min-h-[300px] lg:min-h-screen">
        {/* Background */}
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
              Lorem Ipsum is simply dummy text of the printing
              <br/>and typesetting industry. Lorem Ipsum has been
              <br/>the industry's standard dummy text ever since
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen lg:min-h-auto">
        <div className="w-full max-w-md mx-auto">
          <LoginForm/>
        </div>
      </div>
    </div>
  )
}
