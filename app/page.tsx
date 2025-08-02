import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Shield,
  Clock,
  Calculator,
  Download,
  Eye,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create professional paystubs in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: <FileText className="w-8 h-8" />,
                title: "Fill Out Form",
                description:
                  "Enter your personal and employment information in our guided form",
              },
              {
                step: "2",
                icon: <Eye className="w-8 h-8" />,
                title: "Preview Paystub",
                description:
                  "See a watermarked preview of your paystub as you fill out the form",
              },
              {
                step: "3",
                icon: <CheckCircle2 className="w-8 h-8" />,
                title: "Secure Payment",
                description:
                  "Pay securely with Stripe - only $19.99 for your professional paystub",
              },
              {
                step: "4",
                icon: <Download className="w-8 h-8" />,
                title: "Download PDF",
                description:
                  "Get your professional, unwatermarked paystub as a downloadable PDF",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600">{item.icon}</div>
                </div>
                <div className="text-sm font-semibold text-blue-600 mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Our Paystub Generator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional, accurate, and secure paystub generation for all your
              needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Quick & Easy",
                description:
                  "Generate paystubs in minutes with our intuitive form",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure & Private",
                description:
                  "Your data is encrypted and never stored on our servers",
              },
              {
                icon: <Calculator className="w-6 h-6" />,
                title: "Accurate Calculations",
                description: "Automatic tax and deduction calculations",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Professional Format",
                description: "Clean, business-appropriate paystub templates",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Paystubs Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Simple, One-Time Payment
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get your professional paystub for just $19.99 - no subscriptions,
              no hidden fees
            </p>
          </div>
          <div className="flex justify-center">
            <div className="max-w-md">
              <div className="bg-white border-2 border-blue-500 rounded-xl p-8 shadow-xl">
                <div className="text-center mb-6">
                  <div className="text-sm font-semibold text-blue-600 mb-2">
                    One-Time Payment
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    $19.99
                  </div>
                  <div className="text-gray-600">per paystub</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Professional paystub template</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Automatic calculations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Instant PDF download</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Secure payment processing</span>
                  </li>
                </ul>
                <a
                  href="/dashboard"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
                >
                  Create Your Paystub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your Paystub?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust our paystub generator for
            their documentation needs.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started Now
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
