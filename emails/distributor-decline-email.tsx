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

interface DistributorDeclineEmailProps {
  applicantName: string;
  businessName: string;
}

const DistributorDeclineEmail = (props: DistributorDeclineEmailProps) => {
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
              Distributor Application Update
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={{ padding: '20px' }}>
            <Heading style={{ color: '#333', marginBottom: '20px', fontSize: '24px' }}>
              Thank you for your interest, {props.applicantName}
            </Heading>
            
            <Text style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              Thank you for submitting a distributor application for <strong>{props.businessName}</strong>. 
              We appreciate your interest in partnering with Force Dowels.
            </Text>

            {/* Status Update */}
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
              <Text style={{ margin: '0', color: '#92400e' }}>
                <strong>Application Status Update</strong><br />
                After careful review, we are unable to approve your distributor application at this time.
              </Text>
            </div>

            <Text style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              This decision is based on our current distribution network needs and territory coverage. 
              Please know that this does not reflect on the quality of your business or your capabilities as a potential partner.
            </Text>

            {/* Future Opportunities */}
            <Heading style={{ color: '#333', marginTop: '30px', marginBottom: '15px', fontSize: '18px' }}>
              Future Opportunities
            </Heading>
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <Text style={{ margin: '0 0 10px 0', color: '#333', fontWeight: 'bold' }}>We encourage you to:</Text>
              <ul style={{ color: '#666', margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Consider reapplying in the future as our distribution needs evolve</li>
                <li>Stay connected with us for potential partnership opportunities</li>
                <li>Explore other ways to work with Force Dowels products</li>
                <li>Contact us if your business circumstances change significantly</li>
              </ul>
            </div>

            {/* Alternative Options */}
            <Heading style={{ color: '#333', marginTop: '30px', marginBottom: '15px', fontSize: '18px' }}>
              Alternative Partnership Options
            </Heading>
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <Text style={{ margin: '0 0 10px 0', color: '#333', fontWeight: 'bold' }}>Consider these options:</Text>
              <ul style={{ color: '#666', margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><strong>Dealer Program:</strong> Become an authorized dealer with smaller territory requirements</li>
                <li><strong>Referral Partner:</strong> Earn commissions by referring customers to us</li>
                <li><strong>Bulk Purchasing:</strong> Access volume discounts for your own projects</li>
                <li><strong>Joint Ventures:</strong> Collaborate on specific large projects</li>
              </ul>
            </div>

            {/* Contact Information */}
            <Heading style={{ color: '#333', marginTop: '30px', marginBottom: '15px', fontSize: '18px' }}>
              Stay in Touch
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

            <Text style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              We value your interest in Force Dowels and hope to find opportunities to work together in the future. 
              Please don't hesitate to reach out if you have any questions or if your business situation changes.
            </Text>
            
            <Text style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              Thank you again for considering Force Dowels as a potential partner.
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

DistributorDeclineEmail.PreviewProps = {
  applicantName: "John Smith",
  businessName: "Smith Industrial Supply Co."
};

export default DistributorDeclineEmail;
