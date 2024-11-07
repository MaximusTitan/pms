"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-800 dark:text-white">
            Grow with <span className="text-rose-500">iSchool of AI</span>
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Join our affiliate program and earn competitive commissions by
            promoting high-quality AI education
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Link href="/sign-up">Become a Partner</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-rose-500 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-neutral-50 dark:bg-neutral-900">
        <h2 className="text-3xl font-bold text-center mb-12 text-neutral-800 dark:text-white">
          Why Partner With Us?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 dark:bg-neutral-800 border-none shadow-lg"
            >
              <feature.icon className="w-12 h-12 text-rose-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-neutral-800 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-rose-500 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join our affiliate program today and start earning competitive
            commissions while helping others learn AI
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-rose-500 hover:bg-rose-50"
          >
            Apply Now
          </Button>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "High Commissions",
    description: "Earn up to 30% commission on every successful referral",
    icon: (props: any) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Dedicated Support",
    description:
      "Get personalized support and resources to maximize your success",
    icon: (props: any) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>
    ),
  },
  {
    title: "Real-Time Analytics",
    description: "Track your performance with detailed analytics and insights",
    icon: (props: any) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];
