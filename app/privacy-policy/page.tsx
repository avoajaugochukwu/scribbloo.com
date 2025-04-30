import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Scribbloo',
  description: 'Read the Privacy Policy for Scribbloo.',
  // Prevent search engines from indexing placeholder pages (remove later)
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-stone dark:prose-invert max-w-none space-y-4">
        <p>
          <em>Last Updated: 27th April 2025</em>
        </p>
        <p>
          Welcome to Scribbloo! This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you visit our
          website Scribbloo.com and use our services. Please read this
          privacy policy carefully. If you do not agree with the terms of this
          privacy policy, please do not access the site.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-3">
          Collection of Your Information
        </h2>
        <p>
          We may collect information about you in a variety of ways. The
          information we may collect on the Site includes... [Add details about
          data collected, e.g., personal data, derivative data, financial data,
          etc.]
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-3">
          Use of Your Information
        </h2>
        <p>
          Having accurate information about you permits us to provide you with a
          smooth, efficient, and customized experience. Specifically, we may use
          information collected about you via the Site to... [Add details about
          how data is used, e.g., create account, process payments, email you,
          etc.]
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-3">
          Disclosure of Your Information
        </h2>
        <p>
          We may share information we have collected about you in certain
          situations... [Add details about data sharing, e.g., by law, third-party
          service providers, business transfers, etc.]
        </p>
        {/* Add more sections as needed: Security, Cookies, Policy for Children, Contact Us, etc. */}
        <p>
          [Placeholder for more detailed privacy policy content. You should
          consult with a legal professional to draft a comprehensive policy.]
        </p>
      </div>
    </div>
  );
} 