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
  Row,
  Column,
  Link,
} from '@react-email/components';


interface DistributorApplicationProps {
  fullName?: string;
  businessName?: string;
  phoneNumber?: string;
  emailAddress?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  businessType?: string;
  businessTypeOther?: string;
  yearsInBusiness?: string;
  territory?: string;
  purchaseVolume?: string;
  sellsSimilarProducts?: string;
  similarProductsDetails?: string;
  hearAboutUs?: string;
  hearAboutUsOther?: string;
  acceptUrl?: string;
  declineUrl?: string;
}

const ForceDownDistributorApplication = (props: DistributorApplicationProps) => {
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
              New Distributor Application
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={{ padding: '20px' }}>
            <Heading style={{ color: '#333', marginBottom: '20px', fontSize: '24px' }}>
              New Distributor Application
            </Heading>

            <Text style={{ color: '#666', marginBottom: '20px' }}>
              A new distributor application has been submitted for your review. Please find the details below:
            </Text>

            {/* Application Summary */}
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <Heading style={{ color: '#333', marginTop: '0', fontSize: '18px' }}>Application Summary</Heading>
              <Text style={{ color: '#666', margin: '0' }}>Business: {props.businessName || 'Not provided'}</Text>
              <Text style={{ color: '#666', margin: '5px 0 0 0' }}>Contact: {props.fullName || 'Not provided'}</Text>
              <Text style={{ color: '#666', margin: '5px 0 0 0' }}>Submitted: {new Date().toLocaleDateString()}</Text>
            </div>

            {/* Contact Information */}
            <Heading style={{ color: '#333', marginTop: '30px', marginBottom: '15px', fontSize: '18px' }}>
              Contact Information
            </Heading>

            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <Row>
                <Column style={{ width: '50%', paddingRight: '10px' }}>
                  <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Full Name:</Text>
                  <Text style={{ margin: '5px 0', color: '#666' }}>{props.fullName || 'Not provided'}</Text>
                </Column>
                <Column style={{ width: '50%', paddingLeft: '10px' }}>
                  <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Business Name:</Text>
                  <Text style={{ margin: '5px 0', color: '#666' }}>{props.businessName || 'Not provided'}</Text>
                </Column>
              </Row>

              <Row style={{ marginTop: '15px' }}>
                <Column style={{ width: '50%', paddingRight: '10px' }}>
                  <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Phone:</Text>
                  <Text style={{ margin: '5px 0', color: '#666' }}>{props.phoneNumber || 'Not provided'}</Text>
                </Column>
                <Column style={{ width: '50%', paddingLeft: '10px' }}>
                  <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Email:</Text>
                  <Text style={{ margin: '5px 0', color: '#666' }}>{props.emailAddress || 'Not provided'}</Text>
                </Column>
              </Row>

              <div style={{ marginTop: '15px' }}>
                <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Business Address:</Text>
                <Text style={{ margin: '5px 0', color: '#666' }}>{props.street || 'Street not provided'}</Text>
                <Text style={{ margin: '5px 0', color: '#666' }}>
                  {props.city || 'City'}, {props.state || 'State'} {props.zipCode || 'ZIP'}
                </Text>
                {props.website && (
                  <>
                    <Text style={{ margin: '10px 0 0 0', color: '#333', fontWeight: 'bold' }}>Website:</Text>
                    <Text style={{ margin: '5px 0', color: '#d97706' }}>{props.website}</Text>
                  </>
                )}
              </div>
            </div>

            {/* Business Details */}
            <Heading style={{ color: '#333', marginTop: '30px', marginBottom: '15px', fontSize: '18px' }}>
              Business Details
            </Heading>

            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <Row>
                <Column style={{ width: '50%', paddingRight: '10px' }}>
                  <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Business Type:</Text>
                  <Text style={{ margin: '5px 0', color: '#666' }}>{props.businessType || 'Not specified'}</Text>
                </Column>
                <Column style={{ width: '50%', paddingLeft: '10px' }}>
                  <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Years in Business:</Text>
                  <Text style={{ margin: '5px 0', color: '#666' }}>{props.yearsInBusiness || 'Not provided'}</Text>
                </Column>
              </Row>

              <div style={{ marginTop: '15px' }}>
                <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Territory / Coverage Area:</Text>
                <Text style={{ margin: '5px 0', color: '#666' }}>{props.territory || 'Not specified'}</Text>
              </div>

              <div style={{ marginTop: '15px' }}>
                <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Estimated Monthly Purchase Volume:</Text>
                <Text style={{ margin: '5px 0', color: '#666' }}>{props.purchaseVolume || 'Not specified'}</Text>
              </div>
            </div>

            {/* Additional Information */}
            <Heading style={{ color: '#333', marginTop: '30px', marginBottom: '15px', fontSize: '18px' }}>
              Additional Information
            </Heading>

            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <div>
                <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>Currently Sells Similar Products:</Text>
                <Text style={{ margin: '5px 0', color: '#666' }}>{props.sellsSimilarProducts || 'Not specified'}</Text>
                {props.similarProductsDetails && (
                  <Text style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                    Details: {props.similarProductsDetails}
                  </Text>
                )}
              </div>

              <div style={{ marginTop: '15px' }}>
                <Text style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>How They Heard About Us:</Text>
                <Text style={{ margin: '5px 0', color: '#666' }}>{props.hearAboutUs || 'Not specified'}</Text>
              </div>
            </div>

            {/* Action Buttons */}
            {(props.acceptUrl || props.declineUrl) && (
              <div style={{ marginTop: '30px' }}>
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '15px', borderRadius: '8px', margin: '20px 0', textAlign: 'center' }}>
                  <Heading style={{ color: '#065f46', marginTop: '0', marginBottom: '15px', fontSize: '18px' }}>
                    Action Required
                  </Heading>

                  <Text style={{ color: '#065f46', marginBottom: '20px' }}>
                    Please review this distributor application and choose your response:
                  </Text>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {props.acceptUrl && (
                      <Link
                        href={props.acceptUrl}
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          fontWeight: 'bold',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '16px',
                          margin: '5px'
                        }}
                      >
                        ✅ Accept Application
                      </Link>
                    )}
                    {props.declineUrl && (
                      <Link
                        href={props.declineUrl}
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          fontWeight: 'bold',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '16px',
                          margin: '5px'
                        }}
                      >
                        ❌ Decline Application
                      </Link>
                    )}
                  </div>

                  <Text style={{ color: '#065f46', fontSize: '14px', marginTop: '15px', marginBottom: '0' }}>
                    These links are secure and can only be used once. If you have any questions,
                    please contact the applicant directly using the information provided above.
                  </Text>
                </div>
              </div>
            )}

          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#f8f4e3', padding: '20px', textAlign: 'center' }}>
            <Text style={{ color: '#666', margin: '0', fontSize: '14px' }}>
              © {new Date().getFullYear()} Force Dowels. All rights reserved.
            </Text>
          </Section>

          </Container>
        </Body>
    </Html>
  );
};

ForceDownDistributorApplication.PreviewProps = {
  fullName: "John Smith",
  businessName: "Smith Industrial Supply Co.",
  phoneNumber: "(555) 123-4567",
  emailAddress: "john.smith@smithindustrial.com",
  street: "456 Commerce Drive",
  city: "Phoenix",
  state: "Arizona",
  zipCode: "85001",
  website: "www.smithindustrial.com",
  businessType: "Wholesaler",
  yearsInBusiness: "15",
  territory: "Arizona, New Mexico, Nevada",
  purchaseVolume: "1,000–5,000 units",
  sellsSimilarProducts: "Yes",
  similarProductsDetails: "Construction fasteners and hardware",
  hearAboutUs: "Trade Show",
  acceptUrl: "http://localhost:3000/distribution/accept/123e4567-e89b-12d3-a456-426614174000",
  declineUrl: "http://localhost:3000/distribution/decline/123e4567-e89b-12d3-a456-426614174000"
};

export default ForceDownDistributorApplication;
