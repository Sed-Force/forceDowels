import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Img,
  Link,
} from '@react-email/components';

interface DistributorAcceptanceEmailProps {
  applicantName: string;
  businessName: string;
  territory: string;
}

const DistributorAcceptanceEmail = (props: DistributorAcceptanceEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          {/* Header with Logo - matching order confirmation style */}
          <Section style={{ backgroundColor: '#f8f4e3', padding: '20px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Img
                src="https://www.forcedowels.com/fdLogo.jpg"
                alt="Force Dowels Logo"
                style={{
                  height: '60px',
                  width: 'auto',
                  display: 'block'
                }}
              />
            </div>
            <Text style={{ color: '#666', fontSize: '16px', margin: '0' }}>
              Distributor Application Approved
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={{ padding: '20px' }}>
            <Heading style={{ color: '#333', marginBottom: '20px', fontSize: '24px' }}>
              Congratulations, {props.applicantName}!
            </Heading>
            
            <Text style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              We are excited to inform you that your distributor application for <strong>{props.businessName}</strong> has been approved! 
              Welcome to the Force Dowels distributor network.
            </Text>

            {/* Success Banner */}
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
              <Text style={{ margin: '0', color: '#065f46' }}>
                <strong>🎉 Application Approved</strong><br />
                You are now an authorized Force Dowels distributor for your territory: <strong>{props.territory}</strong>
              </Text>
            </div>

            {/* Next Steps */}
            <Heading style={{ color: '#333', marginTop: '30px', marginBottom: '15px', fontSize: '18px' }}>
              Next Steps
            </Heading>
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <Text style={{ margin: '0 0 10px 0', color: '#333', fontWeight: 'bold' }}>What happens next:</Text>
              <ul style={{ color: '#666', margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Our distribution team will contact you within 2 business days</li>
                <li>We'll set up your distributor account and pricing structure</li>
                <li>You'll receive access to our distributor portal and resources</li>
                <li>We'll discuss territory details and marketing support</li>
                <li>Initial product training and onboarding will be scheduled</li>
              </ul>
            </div>

            {/* Contact Information */}
            <Heading style={{ color: '#333', marginTop: '30px', marginBottom: '15px', fontSize: '18px' }}>
              Your Distribution Team Contacts
            </Heading>
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Distribution Department</Text>
              <Text style={{ margin: '5px 0', color: '#666' }}>
                Email: <Link href="mailto:distributors@forcedowels.com" style={{ color: '#d97706', textDecoration: 'none' }}>distributors@forcedowels.com</Link>
              </Text>
              <Text style={{ margin: '5px 0', color: '#666' }}>
                Phone: <Link href="tel:+1-480-555-0123" style={{ color: '#d97706', textDecoration: 'none' }}>(480) 555-0123</Link>
              </Text>
              <Text style={{ margin: '5px 0', color: '#666' }}>
                Business Hours: Monday - Friday, 7:30 AM - 4:30 PM MST
              </Text>
            </div>

            {/* Partnership Benefits */}
            <Heading style={{ color: '#333', marginTop: '30px', marginBottom: '15px', fontSize: '18px' }}>
              Partnership Benefits
            </Heading>
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <ul style={{ color: '#666', margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><strong>Competitive Pricing:</strong> Attractive distributor margins</li>
                <li><strong>Marketing Support:</strong> Co-op advertising and promotional materials</li>
                <li><strong>Technical Training:</strong> Product knowledge and installation support</li>
                <li><strong>Territory Protection:</strong> Exclusive distribution rights in your area</li>
                <li><strong>Direct Support:</strong> Dedicated account management</li>
              </ul>
            </div>

            <Text style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              We look forward to building a successful partnership with {props.businessName} and supporting your growth 
              in the cabinetry fastening market.
            </Text>
            
            <Text style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              Thank you for choosing to partner with Force Dowels!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#f8f4e3', padding: '20px', textAlign: 'center' }}>
            <Text style={{ color: '#666', margin: '0', fontSize: '14px' }}>
              © {new Date().getFullYear()} Force Dowels. All rights reserved.<br />
              Patent Pending Technology
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

DistributorAcceptanceEmail.PreviewProps = {
  applicantName: "John Smith",
  businessName: "Smith Industrial Supply Co.",
  territory: "Arizona, New Mexico, Nevada"
};

export default DistributorAcceptanceEmail;
