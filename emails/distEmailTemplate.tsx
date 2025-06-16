import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Tailwind,
  Img,
  Row,
  Column,
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
}

const ForceDownDistributorApplication = (props: DistributorApplicationProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-white font-sans py-[40px]">
          <Container className="bg-gray-900 mx-auto rounded-[12px] shadow-lg max-w-[700px] overflow-hidden">
            
            {/* Header with Logo */}
            <Section className="bg-gradient-to-r from-blue-600 to-blue-800 px-[40px] py-[32px] text-center">
              <Img
                src="https://www.forcedowels.com/fdLogo.jpg"
                alt="Force Dowels Logo"
                className="w-full h-auto object-cover max-w-[600px] rounded-md mx-auto mb-[16px]"
              />
              <Heading className="text-[24px] font-bold text-white m-0 mb-[8px]">
                New Distributor Application
              </Heading>
              <Text className="text-[16px] text-blue-100 m-0">
                Application submitted successfully
              </Text>
            </Section>

            {/* Contact Information */}
            <Section className="px-[40px] py-[32px]">
              <div className="bg-blue-50 rounded-[8px] p-[4px] mb-[24px]">
                <Heading className="text-[20px] font-bold text-blue-900 m-0 px-[16px] py-[12px]">
                  📋 Contact Information
                </Heading>
              </div>
              
              <Row className="mb-[16px]">
                <Column className="w-1/2 pr-[12px]">
                  <div className="bg-gray-50 rounded-[6px] p-[16px]">
                    <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                      Full Name
                    </Text>
                    <Text className="text-[16px] font-medium text-gray-900 m-0">
                      {props.fullName || 'Not provided'}
                    </Text>
                  </div>
                </Column>
                <Column className="w-1/2 pl-[12px]">
                  <div className="bg-gray-50 rounded-[6px] p-[16px]">
                    <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                      Business Name
                    </Text>
                    <Text className="text-[16px] font-medium text-gray-900 m-0">
                      {props.businessName || 'Not provided'}
                    </Text>
                  </div>
                </Column>
              </Row>

              <Row className="mb-[16px]">
                <Column className="w-1/2 pr-[12px]">
                  <div className="bg-gray-50 rounded-[6px] p-[16px]">
                    <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                      Phone Number
                    </Text>
                    <Text className="text-[16px] font-medium text-gray-900 m-0">
                      {props.phoneNumber || 'Not provided'}
                    </Text>
                  </div>
                </Column>
                <Column className="w-1/2 pl-[12px]">
                  <div className="bg-gray-50 rounded-[6px] p-[16px]">
                    <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                      Email Address
                    </Text>
                    <Text className="text-[16px] font-medium text-gray-900 m-0">
                      {props.emailAddress || 'Not provided'}
                    </Text>
                  </div>
                </Column>
              </Row>

              <div className="bg-gray-50 rounded-[6px] p-[16px] mb-[16px]">
                <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[8px]">
                  Business Address
                </Text>
                <Text className="text-[16px] font-medium text-gray-900 m-0 mb-[4px]">
                  {props.street || 'Street not provided'}
                </Text>
                <Text className="text-[16px] font-medium text-gray-900 m-0">
                  {props.city || 'City'}, {props.state || 'State'} {props.zipCode || 'ZIP'}
                </Text>
              </div>

              {props.website && (
                <div className="bg-gray-50 rounded-[6px] p-[16px]">
                  <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                    Business Website
                  </Text>
                  <Text className="text-[16px] font-medium text-blue-600 m-0">
                    {props.website}
                  </Text>
                </div>
              )}
            </Section>

            <Hr className="border-gray-200 mx-[40px]" />

            {/* Business Details */}
            <Section className="px-[40px] py-[32px]">
              <div className="bg-green-50 rounded-[8px] p-[4px] mb-[24px]">
                <Heading className="text-[20px] font-bold text-green-900 m-0 px-[16px] py-[12px]">
                  🏢 Business Details
                </Heading>
              </div>

              <Row className="mb-[16px]">
                <Column className="w-1/2 pr-[12px]">
                  <div className="bg-gray-50 rounded-[6px] p-[16px]">
                    <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                      Business Type
                    </Text>
                    <Text className="text-[16px] font-medium text-gray-900 m-0">
                      {props.businessType || 'Not specified'}
                    </Text>
                  </div>
                </Column>
                <Column className="w-1/2 pl-[12px]">
                  <div className="bg-gray-50 rounded-[6px] p-[16px]">
                    <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                      Years in Business
                    </Text>
                    <Text className="text-[16px] font-medium text-gray-900 m-0">
                      {props.yearsInBusiness || 'Not provided'}
                    </Text>
                  </div>
                </Column>
              </Row>

              <div className="bg-gray-50 rounded-[6px] p-[16px] mb-[16px]">
                <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                  Territory / Coverage Area
                </Text>
                <Text className="text-[16px] font-medium text-gray-900 m-0">
                  {props.territory || 'Not specified'}
                </Text>
              </div>

              <div className="bg-gray-50 rounded-[6px] p-[16px]">
                <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                  Estimated Monthly Purchase Volume
                </Text>
                <Text className="text-[16px] font-medium text-gray-900 m-0">
                  {props.purchaseVolume || 'Not specified'}
                </Text>
              </div>
            </Section>

            <Hr className="border-gray-200 mx-[40px]" />

            {/* Additional Information */}
            <Section className="px-[40px] py-[32px]">
              <div className="bg-purple-50 rounded-[8px] p-[4px] mb-[24px]">
                <Heading className="text-[20px] font-bold text-purple-900 m-0 px-[16px] py-[12px]">
                  ℹ️ Additional Information
                </Heading>
              </div>

              <div className="bg-gray-50 rounded-[6px] p-[16px] mb-[16px]">
                <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                  Currently Sells Similar Products
                </Text>
                <Text className="text-[16px] font-medium text-gray-900 m-0 mb-[8px]">
                  {props.sellsSimilarProducts || 'Not specified'}
                </Text>
                {props.similarProductsDetails && (
                  <Text className="text-[14px] text-gray-600 m-0">
                    Details: {props.similarProductsDetails}
                  </Text>
                )}
              </div>

              <Row className="mb-[16px]">
                <Column className="w-1/2 pr-[12px]">
                  <div className="bg-gray-50 rounded-[6px] p-[16px]">
                    <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide m-0 mb-[4px]">
                      How They Heard About Us
                    </Text>
                    <Text className="text-[16px] font-medium text-gray-900 m-0">
                      {props.hearAboutUs || 'Not specified'}
                    </Text>
                  </div>
                </Column>

              </Row>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-800 px-[40px] py-[24px] text-center">
              
              <Text className="text-[12px] text-gray-400 m-0">
                © 2025 Force Dowels. All rights reserved.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
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
  hearAboutUs: "Trade Show"
};

export default ForceDownDistributorApplication;
