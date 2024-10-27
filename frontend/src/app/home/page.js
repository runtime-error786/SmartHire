// pages/index.js
'use client';// pages/index.js
import Navbar from "../Users/Navbar/navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faRobot, faChartLine, faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-[#F4F2EE] min-h-screen text-gray-800 font-sans">
      <Navbar />

      {/* Hero Section */}
      <header className="pt-20 bg-[#F4F2EE] border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center md:text-left flex flex-col md:flex-row items-center md:space-x-12">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-5xl font-extrabold text-[#0073b1] leading-snug mb-4">
              Welcome to SmartHire
            </h1>
            <p className="text-lg text-gray-700 max-w-md">
              Join the AI-driven recruitment platform that simplifies hiring and empowers candidates with personalized AI practice interviews.
            </p>
            <button
              onClick={() => router.push("/Users/SignIn")}
              className="mt-8 px-8 py-3 bg-[#0073b1] text-white font-semibold rounded-lg hover:bg-[#005582] transition duration-300 shadow-md"
            >
              Get Started
            </button>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <Image src="/path/to/hero-image.png" alt="AI Recruitment" width={500} height={400} className="rounded-lg shadow-lg" />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-[#0073b1] mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <FeatureCard
              icon={faBriefcase}
              title="Job Posting"
              description="Effortlessly post jobs and reach a diverse pool of talent faster than ever before."
            />
            <FeatureCard
              icon={faUserGraduate}
              title="Candidate Applications"
              description="Candidates can browse job listings, apply with ease, and track their applications."
            />
            <FeatureCard
              icon={faRobot}
              title="AI Practice Interviews"
              description="Candidates can practice their interview skills with AI-powered mock interviews."
            />
            <FeatureCard
              icon={faChartLine}
              title="Analytics"
              description="Recruiters gain insights on candidate performance and application trends to make smarter hiring decisions."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-[#F4F2EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-[#0073b1] mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              name="John Doe"
              position="Recruiter at TechCorp"
              text="SmartHire has streamlined our hiring process and improved candidate quality."
            />
            <TestimonialCard
              name="Jane Smith"
              position="HR Manager at InnovateX"
              text="The AI interview feature is a game-changer for finding top talent quickly."
            />
            <TestimonialCard
              name="Carlos Martinez"
              position="Recruiter at GlobalHire"
              text="I love the analytics! It gives us insights we never had before."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-[#0073b1] mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="Create Job Post"
              description="Recruiters can quickly create job listings with all the necessary details."
            />
            <StepCard
              step="2"
              title="Automated AI Interviews"
              description="Candidates can take AI interviews that simulate real interview questions."
            />
            <StepCard
              step="3"
              title="Apply, Review, and Hire"
              description="Candidates apply for jobs, and recruiters review applications to make the best hire."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#F4F2EE] text-center border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-[#0073b1] mb-6">Ready to Transform Your Career or Hiring Process?</h2>
          <p className="text-lg text-gray-700 mb-8">
            Join SmartHire today and experience AI-driven recruitment that benefits both candidates and recruiters.
          </p>
          <button
            onClick={() => router.push("/Users/SignUp")}
            className="px-8 py-4 bg-[#0073b1] text-white font-semibold rounded-lg hover:bg-[#005582] transition duration-300 shadow-md"
          >
            Sign Up Now
          </button>
        </div>
      </section>
    </div>
  );
}

// Reusable Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-center border border-gray-200 hover:shadow-lg transition-transform transform hover:scale-105">
      <FontAwesomeIcon icon={icon} className="text-[#0073b1] text-3xl mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Reusable Testimonial Card Component
function TestimonialCard({ name, position, text }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-left border border-gray-200 hover:shadow-lg transition-transform transform hover:scale-105">
      <p className="text-gray-600 mb-4">"{text}"</p>
      <h4 className="font-semibold">{name}</h4>
      <p className="text-gray-500 text-sm">{position}</p>
    </div>
  );
}

// Reusable Step Card Component
function StepCard({ step, title, description }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-center border border-gray-200 hover:shadow-lg transition-transform transform hover:scale-105">
      <div className="text-[#0073b1] text-2xl font-bold mb-2">{step}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
