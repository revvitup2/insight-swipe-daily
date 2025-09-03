import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> September 3, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to ByteMe ("we," "us," "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website/application/service (the "Service").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may collect information about you in a variety of ways. The information we may collect via the Service includes:
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">A. Personal Data You Provide to Us</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information you voluntarily provide to us when you register for an account, express an interest in obtaining information about us or our products, participate in activities on the Service, or otherwise contact us. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Account Information:</strong> Your name, email address, password, username, and other details you provide during registration.</li>
              <li><strong>Profile Information:</strong> Your profile picture, biography, location, or other information you choose to add to your profile.</li>
              <li><strong>User Content:</strong> Photos, comments, videos, and other content you post or share through the Service.</li>
              <li><strong>Communications:</strong> Information you provide when you contact us for support or provide feedback.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">B. Information We Collect Automatically</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you access and use our Service, we may automatically collect certain information about your device and usage, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Log and Usage Data:</strong> IP address, browser type, operating system, pages visited, time spent on pages, links clicked, and the dates and times of access.</li>
              <li><strong>Device Data:</strong> Information about your computer or mobile device, such as your device model, operating system, unique device identifiers, and mobile network information.</li>
              <li><strong>Location Data:</strong> We may collect information about your device's location, which can be either precise or imprecise. You can change your location settings on your device.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">C. Information from Cookies and Tracking Technologies</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies, web beacons, and similar tracking technologies to collect information to help us improve our Service and your experience. For more information, please see our "Cookies and Tracking Technologies" section below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect for various business purposes, including to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide, operate, and maintain our Service.</li>
              <li>Create and manage your account.</li>
              <li>Personalize and improve your experience.</li>
              <li>Communicate with you, including responding to your comments and questions and providing customer service.</li>
              <li>Send you technical notices, updates, security alerts, and administrative messages.</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our Service.</li>
              <li>Detect and prevent fraudulent transactions and other illegal activities.</li>
              <li>Comply with legal and regulatory obligations.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We may share information we have collected about you in certain situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, consultants, and other service providers who perform services on our behalf, such as hosting, data analysis, payment processing, and customer service.</li>
              <li><strong>By Law or to Protect Rights:</strong> We may disclose your information if required to do so by law or in the good faith belief that such action is necessary to (i) comply with a legal obligation, (ii) protect and defend our rights or property, or (iii) act in urgent circumstances to protect the personal safety of users of the Service or the public.</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company, your information may be transferred.</li>
              <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies to help customize the Service and improve your experience. When you access the Service, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can choose to set your browser to remove or reject cookies, but be aware that such action could affect the availability and functionality of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We will retain your information only for as long as is necessary for the purposes set out in this Privacy Policy, or as needed to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights and Choices</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Right to Access:</strong> You have the right to request copies of your personal information.</li>
              <li><strong>Right to Rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong>Right to Erasure:</strong> You have the right to request that we erase your personal information, under certain conditions.</li>
              <li><strong>Right to Opt-Out:</strong> You may opt out of future marketing communications from us at any time by following the unsubscribe link in our emails.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us using the contact information provided below. You can typically review and change your personal information by logging into your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under the relevant age without parental consent, we will take steps to delete that information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions or comments about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:byteme.website@gmail.com" className="text-primary hover:underline">
                byteme.website@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;