'use client';
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faRobot, faChartLine, faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import smarthire from "../../Photos/smarthire1.mp4"; // Import video
import { useDispatch, useSelector } from 'react-redux';
import { show_search, search_bar_action } from "@/Redux/Action";
export default function Home() {
  const router = useRouter();
  const role = useSelector((state) => state.Role_Reducer);
  const dispatch = useDispatch();
  dispatch(show_search(false));
  dispatch(search_bar_action(""));

  return (
    <div className="bg-[#F4F2EE] min-h-screen text-gray-800 font-sans">

      <header className="relative h-screen overflow-hidden">
        {/* Video Background with Blur Effect */}
        <video
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
          src={smarthire}
          autoPlay
          muted
          loop
          playsInline
        ></video>

        {/* Overlay with reduced opacity for text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-50"></div>

        {/* Content with background behind text */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center space-y-6">
          <div className="bg-black bg-opacity-20 p-8 rounded-lg shadow-xl">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-snug drop-shadow-xl">
              Welcome to <span className="text-[#0073b1]">SmartHire</span>
            </h1>
            <p className="text-lg sm:text-2xl text-gray-200 max-w-2xl mx-auto mt-4">
              Join the AI-driven recruitment platform that simplifies hiring and empowers candidates with personalized AI practice interviews.
            </p>
            {
              role === 'Guest' &&
              <button
                onClick={() => router.push("/Users/SignIn")}
                className="mt-6 px-8 py-4 bg-[#0073b1] text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-[#005582] hover:scale-105 transition duration-300 ease-in-out"
              >
                Get Started
              </button>
            }

            {
              role === "Candidate" &&

              <button
                onClick={() => router.push("/Users/Jobs")}
                className="mt-6 px-8 py-4 bg-[#0073b1] text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-[#005582] hover:scale-105 transition duration-300 ease-in-out"
              >
                Explore Jobs
              </button>
            }

            {
              role === "Recruiter" &&
              <button
                onClick={() => router.push("/Users/Posts/CreateJob")}
                className="mt-6 px-8 py-4 bg-[#0073b1] text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-[#005582] hover:scale-105 transition duration-300 ease-in-out"
              >
                Post Jobs
              </button>
            }
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-semibold text-[#0073b1] mb-12">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
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
      <section className="py-20 bg-gradient-to-b from-[#F4F2EE] to-[#E2DFDA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-semibold text-[#0073b1] mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <TestimonialCard
              name="John Doe"
              position="Recruiter at Pluginfy Technologies"
              text="SmartHire has streamlined our hiring process and improved candidate quality."
              avatar="https://randomuser.me/api/portraits/men/32.jpg"
            />
            <TestimonialCard
              name="Jane Smith"
              position="HR Manager at InnovateX"
              text="The AI interview feature is a game-changer for finding top talent quickly."
              avatar="https://randomuser.me/api/portraits/women/44.jpg"
            />
            <TestimonialCard
              name="Carlos Martinez"
              position="Recruiter at GlobalHire"
              text="I love the analytics! It gives us insights we never had before."
              avatar="https://randomuser.me/api/portraits/men/65.jpg"
            />
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-semibold text-[#0073b1] mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
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
      <section className="py-20 bg-[#F4F2EE] text-center border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-semibold text-[#0073b1] mb-6">
            Ready to Transform Your Career or Hiring Process?
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-8">
            Join SmartHire today and experience AI-driven recruitment that benefits both candidates and recruiters.
          </p>
          {
            role === "Guest" &&
            <button
              onClick={() => router.push("/Users/SignUp")}
              className="px-8 py-4 bg-[#0073b1] text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-[#005582] hover:scale-105 transition duration-300 ease-in-out transform"
            >
              Sign Up Now
            </button>
          }

          {
            role === "Candidate" &&
            <button
              onClick={() => router.push("/Users/Practice")}
              className="px-8 py-4 bg-[#0073b1] text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-[#005582] hover:scale-105 transition duration-300 ease-in-out transform"
            >
              Pratice Interview
            </button>
          }

          {
            role === "Recruiter" &&
            <button
              onClick={() => router.push("/Users/Posts")}
              className="px-8 py-4 bg-[#0073b1] text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-[#005582] hover:scale-105 transition duration-300 ease-in-out transform"
            >
              Check Jobs
            </button>
          }
        </div>
      </section>
    </div>
  );
}

// Reusable Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg text-center border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all ease-in-out duration-300">
      <FontAwesomeIcon icon={icon} className="text-[#0073b1] text-4xl mb-6" />
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Reusable Testimonial Card Component
function TestimonialCard({ name, position, text, avatar }) {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg text-left border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all ease-in-out duration-300">
      {/* Avatar */}
      <div className="flex items-center mb-4">
        <img
          src={avatar}
          alt={`${name}'s avatar`}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-gray-500 text-sm">{position}</p>
        </div>
      </div>
      {/* Testimonial Text */}
      <p className="text-gray-600">"{text}"</p>
    </div>
  );
}


// Reusable Step Card Component
function StepCard({ step, title, description }) {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg text-center border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all ease-in-out duration-300">
      <div className="text-[#0073b1] text-3xl font-bold mb-4">{step}</div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
