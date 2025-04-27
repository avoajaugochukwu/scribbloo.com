import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Scribbloo',
  description: 'Read the Terms of Service for Scribbloo.',
  // Prevent search engines from indexing placeholder pages (remove later)
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-stone dark:prose-invert max-w-none space-y-4">
        <p>
          <em>Last Updated: 27th April 2025</em>
        </p>
        <p>
          Please read these Terms of Service (&quot;Terms&quot;, &quot;Terms of Service&quot;)
          carefully before using the Scribbloo website (the &quot;Service&quot;)
          operated by Scribbloo (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
        </p>
        <p>
          Your access to and use of the Service is conditioned upon your
          acceptance of and compliance with these Terms. These Terms apply to
          all visitors, users, and others who wish to access or use the Service.
          By accessing or using the Service you agree to be bound by these
          Terms. If you disagree with any part of the terms then you do not have
          permission to access the Service.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-3">Accounts</h2>
        <p>
          When you create an account with us, you guarantee that you are above
          the age of 18, and that the information you provide us is accurate,
          complete, and current at all times... [Add details about account
          responsibilities, termination, etc.]
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-3">
          Intellectual Property
        </h2>
        <p>
          The Service and its original content, features, and functionality are
          and will remain the exclusive property of Scribbloo and its
          licensors... [Add details about IP rights.]
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-3">Links To Other Web Sites</h2>
        <p>
          Our Service may contain links to third-party web sites or services
          that are not owned or controlled by Scribbloo... [Add disclaimer about
          third-party links.]
        </p>
        {/* Add more sections as needed: Termination, Governing Law, Changes, Contact Us, etc. */}
        <p>
          [Placeholder for more detailed terms of service content. You should
          consult with a legal professional to draft comprehensive terms.]
        </p>
      </div>
    </div>
  );
} 