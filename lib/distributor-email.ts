import { Resend } from 'resend';
import ForceDownDistributorApplication from '@/emails/distEmailTemplate';
import DistributorAcceptanceEmail from '@/emails/distributor-acceptance-email';
import DistributorDeclineEmail from '@/emails/distributor-decline-email';
import { DistributorApplicationFormData } from './distributor-validation';
import { generateDistributionActionUrls, getBaseUrl } from './distribution-utils';
import type { DistributionRequest } from './distribution';

// Initialize Resend with the API key from environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

interface SendDistributorApplicationEmailParams {
  formData: DistributorApplicationFormData;
  submissionDate?: string;
  uniqueId?: string;
}

export async function sendDistributorApplicationEmail({
  formData,
  submissionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  uniqueId,
}: SendDistributorApplicationEmailParams): Promise<{ success: boolean; error?: any }> {
  try {
    // Format business type display
    const getBusinessTypeDisplay = (type: string, other?: string) => {
      const typeMap: Record<string, string> = {
        'retailer': 'Retailer',
        'wholesaler': 'Wholesaler',
        'installer': 'Installer',
        'contractor': 'Contractor',
        'online-store': 'Online Store',
        'other': other || 'Other',
      };
      return typeMap[type] || type;
    };

    // Format purchase volume display
    const getPurchaseVolumeDisplay = (volume: string) => {
      const volumeMap: Record<string, string> = {
        'less-than-500': 'Less than 500 units',
        '500-1000': '500–1,000 units',
        '1000-5000': '1,000–5,000 units',
        '5000-plus': '5,000+ units',
      };
      return volumeMap[volume] || volume;
    };

    // Format hear about us display
    const getHearAboutUsDisplay = (source: string, other?: string) => {
      const sourceMap: Record<string, string> = {
        'trade-show': 'Trade Show',
        'referral': 'Referral',
        'online-search': 'Online Search',
        'social-media': 'Social Media',
        'other': other || 'Other',
      };
      return sourceMap[source] || source;
    };

    // Generate action URLs if uniqueId is provided
    let acceptUrl: string | undefined;
    let declineUrl: string | undefined;

    if (uniqueId) {
      const baseUrl = getBaseUrl();
      const actionUrls = generateDistributionActionUrls(baseUrl, uniqueId);
      acceptUrl = actionUrls.acceptUrl;
      declineUrl = actionUrls.declineUrl;
      console.log('Generated action URLs:', { acceptUrl, declineUrl });
    }

    // Prepare email props for the template
    const emailProps = {
      fullName: formData.fullName,
      businessName: formData.businessName,
      phoneNumber: formData.phoneNumber,
      emailAddress: formData.emailAddress,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      website: formData.website || undefined,
      businessType: getBusinessTypeDisplay(formData.businessType, formData.businessTypeOther),
      yearsInBusiness: formData.yearsInBusiness.toString(),
      territory: formData.territory,
      purchaseVolume: getPurchaseVolumeDisplay(formData.purchaseVolume),
      sellsSimilarProducts: formData.sellsSimilarProducts === 'yes' ? 'Yes' : 'No',
      similarProductsDetails: formData.similarProductsDetails || undefined,
      hearAboutUs: getHearAboutUsDisplay(formData.hearAboutUs, formData.hearAboutUsOther),
      acceptUrl,
      declineUrl,
    };

    // Send the email to the business
    const { data, error } = await resend.emails.send({
      from: 'Force Dowels <dist@forcedowels.com>', // Use verified domain
      to: ['info@forcedowels.com', 'gunner.sparks@simpliancesafe.com', 'sales@forcedowels.com', 'cjmccann00@gmail.com'], // Business email
      subject: `New Distributor Application - ${formData.businessName}`,
      react: ForceDownDistributorApplication(emailProps),
    });

    if (error) {
      console.error('Error sending distributor application email:', error);
      return { success: false, error };
    }

    console.log('Distributor application email sent successfully:', data);
    return { success: true };

  } catch (error) {
    console.error('Unexpected error sending distributor application email:', error);
    return { success: false, error };
  }
}

// Optional: Send confirmation email to the applicant
export async function sendDistributorApplicationConfirmation({
  applicantEmail,
  applicantName,
  businessName,
}: {
  applicantEmail: string;
  applicantName: string;
  businessName: string;
}): Promise<{ success: boolean; error?: any }> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Force Dowels <info@forcedowels.com>', // Use verified domain
      to: [applicantEmail], // Send to actual applicant email
      subject: 'Thank you for your Force Dowels Distributor Application',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Force Dowels</h1>
            <p style="color: #bfdbfe; margin: 10px 0 0 0;">Distributor Application Received</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Thank you, ${applicantName}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              We have received your distributor application for <strong>${businessName}</strong> and appreciate your interest in partnering with Force Dowels.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">What happens next?</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li>Our distribution team will review your application</li>
                <li>We'll contact you within 3-5 business days</li>
                <li>If approved, we'll discuss partnership terms and territory details</li>
              </ul>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              If you have any questions in the meantime, please don't hesitate to contact our distribution department at 
              <a href="mailto:distributors@forcedowels.com" style="color: #2563eb;">distributors@forcedowels.com</a>.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for your interest in Force Dowels!
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Force Dowels Distribution Department</strong><br>
                Patent Pending Technology<br>
                Email: distributors@forcedowels.com
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending confirmation email:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error sending confirmation email:', error);
    return { success: false, error };
  }
}

// Send acceptance notification email to applicant
export async function sendDistributorAcceptanceNotification({
  applicantEmail,
  applicantName,
  businessName,
  territory,
}: {
  applicantEmail: string;
  applicantName: string;
  businessName: string;
  territory: string;
}): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('Sending acceptance notification to:', applicantEmail);

    const { data, error } = await resend.emails.send({
      from: 'Force Dowels <distributors@forcedowels.com>', // Use verified domain
      to: [applicantEmail],
      subject: 'Congratulations! Your Force Dowels Distributor Application Approved',
      react: DistributorAcceptanceEmail({
        applicantName,
        businessName,
        territory,
      }),
    });

    if (error) {
      console.error('Error sending acceptance notification email:', error);
      return { success: false, error };
    }

    console.log('Acceptance notification email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('Unexpected error sending acceptance notification email:', error);
    return { success: false, error };
  }
}

// Send decline notification email to applicant
export async function sendDistributorDeclineNotification({
  applicantEmail,
  applicantName,
  businessName,
}: {
  applicantEmail: string;
  applicantName: string;
  businessName: string;
}): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('Sending decline notification to:', applicantEmail);

    const { data, error } = await resend.emails.send({
      from: 'Force Dowels <distributors@forcedowels.com>', // Use verified domain
      to: [applicantEmail],
      subject: 'Thank you for your Force Dowels Distributor Application',
      react: DistributorDeclineEmail({
        applicantName,
        businessName,
      }),
    });

    if (error) {
      console.error('Error sending decline notification email:', error);
      return { success: false, error };
    }

    console.log('Decline notification email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('Unexpected error sending decline notification email:', error);
    return { success: false, error };
  }
}
