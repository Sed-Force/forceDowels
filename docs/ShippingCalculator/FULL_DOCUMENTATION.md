
**TOTAL QUALITY LOGISTICS**

**QUOTING, TENDERING, AND TRACKING API**

**Developer's Guide**

The purpose of this document is to provide an overview of the API services offered at Total Quality Logistics (TQL).

# Contents

1. [Getting Started 3](#_bookmark0)
    1. [Introduction 3](#_bookmark1)
    2. [Get a Token 3](#_bookmark2)
    3. Token Request Error! Bookmark not defined.
    4. [Token Response 3](#_bookmark3)
        1. [Response Breakdown 4](#_bookmark4)
2. [LTL Quoting Process 4](#_bookmark5)
    1. [Description 4](#_bookmark6)
    2. [CreateQuote Requests 4](#_bookmark7)
        1. [Request Sample with Required Fields 4](#_bookmark8)
        2. [Request Breakdown 5](#_bookmark9)
    3. [CreateQuote Response 9](#_bookmark10)
        1. [Response Sample 9](#_bookmark11)
        2. [Response Breakdown 12](#_bookmark12)
    4. [GetQuote Request 13](#_bookmark13)
        1. [Request Sample 13](#_bookmark14)
        2. [Request Breakdown 14](#_bookmark15)
    5. [GetQuote Response 14](#_bookmark16)
        1. [Response Sample 14](#_bookmark17)
        2. [Response Breakdown 16](#_bookmark18)
3. [Tendering Process 21](#_bookmark19)
    1. [Description 21](#_bookmark20)
    2. [TenderShipment Request 22](#_bookmark21)
        1. [Request Sample 22](#_bookmark22)
        2. [Request Breakdown 23](#_bookmark23)
    3. [Response 25](#_bookmark24)
        1. [Response 25](#_bookmark25)
        2. [Response Sample 25](#_bookmark26)
        3. [Response Breakdown 26](#_bookmark27)
4. [Requesting Tracking Information 26](#_bookmark28)
    1. [Description 26](#_bookmark29)
    2. [Request 26](#_bookmark30)
        1. [Request Sample 26](#_bookmark31)
        2. [Response Breakdown 26](#_bookmark32)
    3. [Response 27](#_bookmark33)
        1. [Response Sample 27](#_bookmark34)
        2. [Response Breakdown 27](#_bookmark35)
5. [Tendering by SCAC 28](#_bookmark36)
    1. [Description 28](#_bookmark37)
    2. [Request 28](#_bookmark38)
        1. [Request Sample 28](#_bookmark39)
        2. [Request Breakdown 30](#_bookmark40)
    3. [Response 35](#_bookmark41)
        1. [Response Sample 35](#_bookmark42)
        2. [Response Breakdown 36](#_bookmark43)
6. [Response Codes 37](#_bookmark44)
    1. [Response Codes Description 37](#_bookmark45)
    2. [Response Codes 37](#_bookmark46)

[Appendix A 38](#_bookmark47)

[Quoting and Tendering workflow 38](#_bookmark48)

# Getting Started

## Introduction

TQL’s API offering will enable you to quote, tender, and track your TQL shipments directly with your Transportation Management System (TMS). Each request will provide you with the same information and functionality as if you were logging into the TRAX platform.:

- Create or retrieve a quote from our quoting endpoints. The quote response will return a list of carriers and their various levels of service so that you can make the right decision for your shipment.
- Select a carrier and submit shipment details from our tendering endpoint.
- Retrieve shipment status and location information within your TQL PO/ LTL BOL Number from our Tracking API.
- Specify a carrier and service level to our Tender by Scac endpoint to tender a load automatically.

## Get a Token

Before accessing TQL’s quoting, tendering, and tracking endpoints, you will first need to obtain a valid authorization token by calling the token endpoint of our Identity API with your credentials. This process uses the password credentials flow for OAuth2. For more information, please see [the technical documentation on OAuth.](https://tools.ietf.org/html/rfc6749)

## Token Request

**Verb:** POST

**Request URL:**

- Staging: <https://public.api.tql.com/test-identity/token>
- Production: <https://public.api.tql.com/identity/token>

**Request Headers:**

- Content-Type: application/x-www-form-urlencoded
- Ocp-Apim-Subscription-Key: {your APIM subscription key}

**Request Body:** client_id={your client id}&client_secret={your client secret}&scope={_see below_}&grant_type=password&username={your TRAX username}&password={your TRAX password}

### Scopes

Permission to access TQL resources is based on scopes. Depending on the services you

are accessing, you will be directed to use one or more of the following scopes for your token request:

1. <https://tqlidentitydev.onmicrosoft.com/services_combined/LTLQuotes.Read>
2. <https://tqlidentitydev.onmicrosoft.com/services_combined/LTLQuotes.Write>
3. <https://tqlidentitydev.onmicrosoft.com/services_combined/LTLQuotes.Tender>
4. <https://tqlidentitydev.onmicrosoft.com/services_combined/LoadTracking.Read>

When requesting multiple scopes, the scopes are separated by a single space.

## Token Response

{

"access_token": "{access token string, a valid JWT}", "expires_in": 3600,

"token_type": "Bearer"

}

### Response Breakdown

| **Fields** |     |     |
| --- | --- | --- |
| **Element** | **Format** | **Description** |
| access_token | Integer | The access token to be used in the Authorization header of subsequent<br><br>requests. |
| Expires_in | Integer | Number of seconds for which the token is valid. |
| Token_type | String | The industry standard token type. |

# LTL Quoting Process

## Description

By invoking our LTL API CreateQuote endpoint, you can retrieve all available carrier options and service levels for shipment. There is no need to specify whether you need a Volume LTL quote, because our system will determine your options based on the weight and dimensions submitted.

If you need to retrieve the quote details and carrier prices later on, you can call our LTL API

GetQuoute endpoint with the “Quote ID” that was returned in the CreateQuote response

## CreateQuote Requests

### Request Sample with Required Fields

**Verb:** POST

**Request URL:**

- Staging: <https://public.api.tql.com/test-ltl/quotes>
- Production: <https://public.api.tql.com/ltl/quotes>

**Request Headers:**

- Content-Type: application/json
- Ocp-Apim-Subscription-Key: {your APIM subscription key}
- Authorization: Bearer {access token}

**Request Body Sample:**

{

"accessorials":\[

\],

"quoteCommodities":\[

{

"freightClassCode":"110", "unitTypeCode":"PLT", "description":"Cauliflower", "quantity":2,

"weight":294.0,

"dimensionLength":102, "dimensionWidth":62, "dimensionHeight":41

}

\],

"pickLocationType":"Commercial", "dropLocationType":"Commercial", "shipmentDate":"2019-11-14T14:51:35.6819953-05:00",

"origin":{

"postalCode":"11741", "city":"Holbrook",

"state":"NY",

"country":"USA"

},

"destination":{ "postalCode":"45203", "city":"Cincinnati", "state":"OH",

"country":"USA"

}

}

### Request Breakdown

<table><tbody><tr><th colspan="4"><p><strong>Fields</strong></p></th></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>pickLocationType</p></td><td><p>String</p></td><td><p></p></td><td><p>The location type of the shipper. Available options:</p><ul><li>Commercial</li><li>Limited Access</li><li>Residential</li><li>Trade Show</li></ul><p>*If dropLocationType is Residential, pickLocationType cannot be Residential.</p></td></tr><tr><td><p>dropLocationType</p></td><td><p>String</p></td><td><p></p></td><td><p>The location type of the receiver. Available options:</p><ul><li>Commercial</li><li>Limited Access</li><li>Residential</li><li>Trade Show</li></ul><p>*If pickLocationType is Residential, dropLocationType cannot be Residential.</p></td></tr><tr><td><p>shipmentDate</p></td><td><p>Date</p></td><td><p></p></td><td><p>Requested pickup date.</p></td></tr><tr><td colspan="4"><p><strong>pickupDetails.location</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>City</p></td><td><p>String</p></td><td><p></p></td><td><p>Pickup city</p></td></tr><tr><td><p>State</p></td><td><p>String</p></td><td><p></p></td><td><p>Two-character pickup state. Example: FL</p></td></tr><tr><td><p>postalCode</p></td><td><p>Integer</p></td><td><p></p></td><td><p>Pickup postal code. Must be a valid US, Canadian, or Mexican zip code.</p></td></tr><tr><td><p>country</p></td><td><p>String</p></td><td><p></p></td><td><p>Pickup country code. Available options:</p><ul><li>CAN</li><li>MEX</li><li>USA</li></ul></td></tr></tbody></table>

<table><tbody><tr><th></th><th></th><th></th><th><p>*If the destination country is set to MEX, the origin cannot also be set to MEX. If not passed</p><p>in, the default country code is USA.</p></th></tr><tr><td colspan="4"><p><strong>pickupDetails</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>address1</p></td><td><p>String</p></td><td></td><td><p>Pickup address. Can be a maximum of 50</p><p>characters.</p></td></tr><tr><td><p>address2</p></td><td><p>String</p></td><td></td><td><p>Additional details (i.e. suite, apartment, etc.).</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>stopName</p></td><td><p>String</p></td><td></td><td><p>Shipper company name</p><p>Can be a maximum of 50 characters</p></td></tr><tr><td><p>contactName</p></td><td><p>String</p></td><td></td><td><p>Point of contact at the Shipper’s location.</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>contactPhone</p></td><td><p>String</p></td><td></td><td><p>Shipper’s phone number. Must be a valid 10- digit string without hyphens or spaces. Example: 1234567890</p><p>Regex for phone number: ^[+]?(1\-</p><p>|1\s|1)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-</p><p>|\s)?(\d{4})$ Valid examples:</p><ul><li>2345678901</li></ul><p> +12345678901</p><p> +1 (234) 567 8901</p><p> +1 (234) 567-8901</p><ul><li>1(234)567-8901</li></ul></td></tr><tr><td><p>contactExtension</p></td><td><p>String</p></td><td></td><td><p>Shipper’s extension for phone number.</p><p>Can be a maximum of 20 characters.</p></td></tr><tr><td><p>hoursOpen</p></td><td><p>String</p></td><td></td><td><p>The hour at which the Shipper opens for pickup in the format HH:MM AM/PM. Examples of</p><p>valid times include “12:00 PM” and “1:00 AM”.</p></td></tr><tr><td><p>hoursClosed</p></td><td><p>String</p></td><td></td><td><p>The hour at which the Shipper closes for pickup in the format HH:MM AM/PM. Examples of</p><p>valid times include “12:00 PM” and “1:00 AM”.</p></td></tr><tr><td><p>puNumber</p></td><td><p>String</p></td><td></td><td><p>Pickup number carrier should provide to the</p><p>shipper. Can be a maximum of 300 characters.</p></td></tr><tr><td colspan="4"><p><strong>deliveryDetails.location</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>city</p></td><td><p>String</p></td><td><p></p></td><td><p>Delivery city</p></td></tr><tr><td><p>state</p></td><td><p>String</p></td><td><p></p></td><td><p>Two-character delivery state. Example: FL</p></td></tr><tr><td><p>postalCode</p></td><td><p>Integer</p></td><td><p></p></td><td><p>Delivery postal code. Must be a valid US,</p><p>Canadian, or Mexican zip code.</p></td></tr><tr><td><p>country</p></td><td><p>String</p></td><td><p></p></td><td><p>Delivery country. Available options:</p><ul><li>CAN</li><li>MEX</li><li>USA</li></ul><p>*If the origin country is set to MEX, the destination cannot also be set to MEX. If not</p><p>passed in, the default country code is USA.</p></td></tr><tr><td colspan="4"><p><strong>deliveryDetails</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>address1</p></td><td><p>String</p></td><td></td><td><p>Delivery address. Can be a maximum of 50</p><p>characters.</p></td></tr><tr><td><p>address2</p></td><td><p>String</p></td><td></td><td><p>Additional details (i.e. suite, apartment, etc.).</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>stopName</p></td><td></td><td></td><td><p>Receiver company name</p></td></tr></tbody></table>

<table><tbody><tr><th></th><th></th><th></th><th><p>Can be a maximum of 50 characters</p></th></tr><tr><td><p>contactName</p></td><td><p>String</p></td><td></td><td><p>Point of contact at the Receiver’s location. Can</p><p>be a maximum of 50 characters.</p></td></tr><tr><td><p>contactPhone</p></td><td><p>String</p></td><td></td><td><p>Receiver phone number. Must be a valid 10- digit string without hyphens or spaces. Example: 1234567890</p><p>Regex for phone number: ^[+]?(1\-</p><p>|1\s|1)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-</p><p>|\s)?(\d{4})$ Valid examples:</p><ul><li>2345678901</li></ul><p> +12345678901</p><p> +1 (234) 567 8901</p><p> +1 (234) 567-8901</p><ul><li>1(234)567-8901</li></ul></td></tr><tr><td><p>contactExtension</p></td><td><p>String</p></td><td></td><td><p>Receiver’s extension for phone number. Can</p><p>be a maximum of 20 characters.</p></td></tr><tr><td><p>hoursOpen</p></td><td><p>String</p></td><td></td><td><p>The hour at which the Receiver opens for delivery in the format HH:MM AM/PM. Examples of valid times include “12:00 PM”</p><p>and “1:00 AM”. Time is in UTC-5.</p></td></tr><tr><td><p>hoursClosed</p></td><td><p>String</p></td><td></td><td><p>The hour at which the Receiver closes for delivery in the format HH:MM AM/PM. Examples of valid times include “12:00 PM”</p><p>and “1:00 AM”. Time is in UTC-5.</p></td></tr><tr><td><p>deliveryPO</p></td><td></td><td></td><td><p>Delivery number carrier should provide to the</p><p>receiver. Time is in UTC-5. Can be a maximum of 1000 characters.</p></td></tr><tr><td colspan="4"><p><strong>quoteCommodities</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>description</p></td><td><p>String</p></td><td><p></p></td><td><p>Description of commodity. Can be a maximum</p><p>of 255 characters. Currently, will error out at 251 characters, but this is temporary.</p></td></tr><tr><td><p>quantity</p></td><td><p>Integer</p></td><td><p></p></td><td><p>Number of handling units. Must be a positive integer greater than 0. Currently limited to</p><p>315. However, this limit will soon be lifted.</p></td></tr><tr><td><p>unitTypeCode</p></td><td><p>String</p></td><td><p></p></td><td><p>Type of handling unit(s). Available options:</p><p>BOX BUNDLE CARTON CRATE DRUM PLT ROLL PIECES CASE</p><p>*If a unitTypeCode is not passed, will default to</p><p>Pallet (PLT)</p></td></tr><tr><td><p>freightClassCode</p></td><td><p>String</p></td><td><p></p></td><td><p>Freight class of commodity. Options include:</p><p>50</p><p>55</p><p>60</p><p>65</p><p>70</p><p>77.5</p></td></tr></tbody></table>

|     |     |     | 85<br><br>92.5<br><br>100<br><br>110<br><br>125<br><br>150<br><br>175<br><br>200<br><br>250<br><br>300<br><br>400<br><br>500 |
| --- | --- | --- | --- |
| weight | Decimal |    | Total weight in pounds, to one decimal place. |
| dimensionLength | Integer |    | Length in inches. Must be between 1 and 636<br><br>inches. |
| dimensionWidth | Integer |    | Width in inches. Must be between 1 and 102<br><br>inches. |
| dimensionHeight | Integer |    | Height in inches. Must be between 1 and 102<br><br>inches. |
| nmfc | String |     | Item’s NMFC code.<br><br>If provided, cannot exceed 9 characters and<br><br>must contain only numbers and dashes. |
| pieceCaseCount | Integer |     | Total number of pieces on all handling units for<br><br>commodity. |
| isHazmat | Boolean |     | Hazardous flag. |
| isStackable | Boolean |     | Stackable flag. |
| **accessorials (List)** |     |     |     |
| **Element** | **Format** | **Required** | **Description** |
| accessorials | List of Strings |     | \*See Reference: Accessorial Name for the list<br><br>of available accessorials and their codes. |
| **Reference** |     |     |     |
| **Accessorial Name** |     | **Code** |     |
| Pickup – Inside |     | INPU |     |
| Pickup – Lift Gate |     | LGPU |     |
| Delivery – Inside |     | INDEL |     |
| Delivery – Lift Gate |     | LGDEL |     |
| Delivery – Appointment |     | APPTDEL |     |
| Delivery – Call Ahead |     | NOTIFY |     |
| Delivery – Sort and Segregate |     | SORTDEL |     |
| Blind Single |     | BLIND_S |     |
| Blind Double |     | BLIND_D |     |
| In Bond |     | BOND |     |
| Protect from Freezing |     | PFZ |     |

## CreateQuote Response

### Response Sample

{

"content": { "quoteId": 000000,

"quoteCommodities": \[

{

"commodityId": 000000, "description": "Cauliflower", "quantity": 2,

"weight": 294.0,

"dimensionLength": 102,

"dimensionWidth": 62,

"dimensionHeight": 41, "isHazmat": false, "freightClassCode": "110", "unitTypeCode": "PLT"

}

\],

"carrierPrices": \[

{

"id": 0000000,

"carrier": "Estes Express", "scac": "EXLA",

"customerRate": 200.00, "carrierQuoteId": " ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00,

"serviceLevelDescription": "Volume and Truckload Basic", "priceCharges": \[\],

"isPreferred": true, "isEconomy": false

},

{

"id": 0000000,

"carrier": "Estes Express", "scac": "EXLA",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00,

"serviceLevelDescription": "Guaranteed Volume and Truckload Economy", "priceCharges": \[\],

"isPreferred": true, "isEconomy": false

},

{

"id": 0000000,

"carrier": "Estes Express", "scac": "EXLA",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00,

"serviceLevelDescription": "Guaranteed Volume and Truckload Standard", "priceCharges": \[\],

"isPreferred": true, "isEconomy": false

},

{

"id": 0000000,

"carrier": "FedEx Freight", "scac": "FXFE",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "DIRECT", "transitDays": 6,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00, "serviceLevelDescription": "TLX", "priceCharges": \[\],

"isPreferred": true, "isEconomy": false

},

{

"id": 0000000,

"carrier": "FedEx Freight", "scac": "FXFE",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 3,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00,

"serviceLevelDescription": "TLS", "priceCharges": \[\],

"isPreferred": true, "isEconomy": false

},

{

"id": 0000000,

"carrier": "FedEx Freight", "scac": "FXFE",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00, "serviceLevelDescription": "EXCL", "priceCharges": \[\],

"isPreferred": true, "isEconomy": false

},

{

"id": 0000000,

"carrier": "Old Dominion Freight Lines", "scac": "ODFL",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00, "serviceLevelDescription": "Standard Rate", "priceCharges": \[\],

"isPreferred": false, "isEconomy": false

},

{

"id": 0000000,

"carrier": "UPS Freight", "scac": "UPGF",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00,

"serviceLevelDescription": "Standard Rate", "priceCharges": \[\],

"isPreferred": false, "isEconomy": false

},

{

"id": 0000000,

"carrier": "Old Dominion Freight Lines", "scac": "ODFL",

"customerRate": 200.00, "carrierQuoteId": null, "serviceLevel": "Standard", "serviceType": "Direct", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00, "serviceLevelDescription": "Direct", "priceCharges": \[

{

"description": "Extreme Length", "amount": 0.00

},

{

"description": "LineHaul", "amount": 200.00

},

{

"description": "LineHaul Fuel Surcharge", "amount": 0.00

}

\],

"isPreferred": false, "isEconomy": false

}

\],

"createdDate": "2019-12-12T16:05:41.7341628-05:00", "shipmentDate": "2019-11-14T14:51:35.6819953-05:00"

},

"statusCode": 201,

"informationalMessage": "Successfully created quote."

}

### Response Breakdown

| **Content** |     |     |
| --- |     |     | --- | --- |
| **Element** | **Format** | **Description** |
| createdDate | DateTime | Date and time that the quote was created. Time is in UTC-5. |
| shipmentDate | DateTime | Requested pickup date. Time is in UTC-5. |

<table><tbody><tr><th><p>quoteId</p></th><th><p>Integer</p></th><th><p>TQL’s internal Identifier for the quote created.</p></th></tr><tr><td><p>statusCode</p></td><td><p>Integer</p></td><td><p>The status code returned by the call (informational only).</p></td></tr><tr><td><p>informationalMessage</p></td><td><p>String</p></td><td><p>Friendly message indicating generically whether or not the request succeeded.</p></td></tr><tr><td colspan="3"><p><strong>quoteCommodities</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>commodityId</p></td><td><p>Integer</p></td><td><p>TQL’s internal identifier for the commodity associated with</p><p>quote.</p></td></tr><tr><td><p>description</p></td><td><p>String</p></td><td><p>Description of commodity provided in the request.</p><p>Can be a maximum of 255 characters. Currently, will error out</p><p>at 251 characters, but this is temporary.</p></td></tr><tr><td><p>quantity</p></td><td><p>Integer</p></td><td><p>Number of handling units provided in the request. Currently</p><p>there is a limit of 315. This limit will soon be lifted.</p></td></tr><tr><td><p>Weight</p></td><td><p>Decimal</p></td><td><p>Total weight in pounds provided in the request.</p></td></tr><tr><td><p>dimensionLength</p></td><td><p>Integer</p></td><td><p>Length in inches provided in the request.</p></td></tr><tr><td><p>dimensionWidth</p></td><td><p>Integer</p></td><td><p>Width in inches provided in the request.</p></td></tr><tr><td><p>dimensionHeight</p></td><td><p>Integer</p></td><td><p>Height in inches provided in the request.</p></td></tr><tr><td><p>isHazmat</p></td><td><p>Boolean</p></td><td><p>Hazardous flag provided in the request.</p></td></tr><tr><td><p>freightClassCode</p></td><td><p>String</p></td><td><p>Freight class of commodity provided in the request.</p></td></tr><tr><td><p>unitTypeCode</p></td><td><p>String</p></td><td><p>Type of handling unit(s) provided in the request.</p></td></tr><tr><td colspan="3"><p><strong>carrierPrices</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>Id</p></td><td><p>Integer</p></td><td><p>TQL’s internal identifier that is specific to a single carrier’s quote. Each carrier option / quote in the response will have a Price ID. This value will be passed into the tendering endpoint to</p><p>indicate the selected carrier.</p></td></tr><tr><td><p>Carrier</p></td><td><p>String</p></td><td><p>Carrier company name</p></td></tr><tr><td><p>isPreferred</p></td><td><p>Boolean</p></td><td><p>“TQL Preferred” recommended carrier.</p></td></tr><tr><td><p>isEconomy</p></td><td><p>Boolean</p></td><td><p>Flag to identify Economy Service Level for Standard LTL</p><p>shipments.</p></td></tr><tr><td><p>Scac</p></td><td><p>String</p></td><td><p>Carrier SCAC code.</p></td></tr><tr><td><p>customerRate</p></td><td><p>Integer</p></td><td><p>Carrier rate</p></td></tr><tr><td><p>serviceLevel</p></td><td><p>String</p></td><td><p>Carrier Service Level. Available options:</p><ul><li>Standard</li><li>Guaranteed</li><li>Volume</li></ul></td></tr><tr><td><p>serviceLevelDescription</p></td><td><p>String</p></td><td><p>Additional information about the Service Level.</p></td></tr><tr><td><p>serviceType</p></td><td><p>String</p></td><td><p>Indicates whether the carrier considers the shipment to be</p><p>direct or indirect.</p></td></tr><tr><td><p>transitDays</p></td><td><p>Integer</p></td><td><p>Carriers’ published estimated transit days.</p></td></tr><tr><td><p>maxLiabilityNew</p></td><td><p>Integer</p></td><td><p>Carrier’s max liability coverage amount for new goods.</p></td></tr><tr><td><p>maxLiabilityUsed</p></td><td><p>Integer</p></td><td><p>Carrier’s max liability coverage amount for used goods.</p></td></tr><tr><td><p>carrierQuoteId</p></td><td><p>String</p></td><td><p>Quote ID provided by the carrier.</p></td></tr><tr><td colspan="3"><p><strong>carrierPrice.priceCharges</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>amount</p></td><td><p>Integer</p></td><td><p>Amount of itemized charge</p></td></tr><tr><td><p>description</p></td><td><p>String</p></td><td><p>Name of itemized charged.</p></td></tr></tbody></table>

## GetQuote Request

### Request Sample

**Verb:** GET

**Request URL:**

- Staging: <https://public.api.tql.com/test-ltl/quotes/{quoteId}>
- Production: <https://public.api.tql.com/ltl/quotes/{quoteId}>

**Request Headers:**

- Content-Type: application/json
- Ocp-Apim-Subscription-Key: {your APIM subscription key}
- Authorization: Bearer {token from token endpoint}

### Request Breakdown

| **Content** |     |     |     |
| --- |     |     |     | --- | --- | --- |
| **Element** | **Format** | **Required** | **Description** |
| quoteId | Integer |    | TQL’s internal Identifier for the quote created. |

## GetQuote Response

### Response Sample

{

"content": {

"quoteId": 000000, "poNumber": null,

"pickLocationType": "Commercial” "dropLocationType": "Commercial", "createdDate": "2019-12-19T09:43:50.48",

"tenderedDate": null,

"shipmentDate": "2019-11-14T14:51:35.683",

"expirationDate": "2019-12-26T00:00:00", "pickupDetails": {

"puNumber": null, "stopName": "Testing", "contactName": "Bob Smith",

"contactPhone": "5555555555", "contactExtension": null, "address1": null,

"address2": null, "hoursOpen": "1:00 AM",

"hoursClose": "3:00 PM", "location": {

"postalCode": "10029",

"postalCode_FirstThree": "100", "city": "New York",

"state": "NY",

"country": "USA"

}

},

"deliveryDetails": { "deliveryPO": null, "stopName": "Testing2", "contactName": "Sally Jones", "contactPhone": "5555555555", "contactExtension": null, "address1": null,

"address2": null, "hoursOpen": "11:00 PM",

"hoursClose": "7:00 AM", "location": {

"postalCode": "45203",

"postalCode_FirstThree": "452", "city": "Cincinnati",

"state": "OH",

"country": "USA"

}

},

"accessorials": \[ "INPU", "INDEL"

\],

"quoteCommodities": \[

{

"commodityId": 465271, "description": "Cauliflower", "quantity": 2,

"weight": 294.00,

"dimensionLength": 102,

"dimensionWidth": 62,

"dimensionHeight": 41, "isHazmat": false, "freightClassCode": "110", "unitTypeCode": "PLT", "hazmatDetails": null

}

\],

"carrierPrices": \[

{

"id": 0000000,

"carrier": "Estes Express", "scac": "EXLA",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00,

"serviceLevelDescription": "Volume and Truckload Basic", "priceCharges": \[\],

"isPreferred": true, "isEconomy": false

},

{

"id": 0000000,

"carrier": "Estes Express", "scac": "EXLA",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00,

"serviceLevelDescription": "Guaranteed Volume and Truckload

Economy",

"priceCharges": \[\], "isPreferred": true, "isEconomy": false

},

{

"id": 0000000,

"carrier": "Estes Express", "scac": "EXLA",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00,

"serviceLevelDescription": "Guaranteed Volume and Truckload

Standard",

"priceCharges": \[\], "isPreferred": true, "isEconomy": false

},

{

"id": 0000000,

"carrier": "UPS Freight", "scac": "UPGF",

"customerRate": 200.00, "carrierQuoteId": "ABC123", "serviceLevel": "Volume", "serviceType": "UNSPECIFIED", "transitDays": 2,

"maxLiabilityNew": 200.00,

"maxLiabilityUsed": 200.00, "serviceLevelDescription": "Standard Rate", "priceCharges": \[\],

"isPreferred": false, "isEconomy": false

}

\]

},

"statusCode": 200,

"informationalMessage": "Successfully retrieved quote."

}

### Response Breakdown

<table><tbody><tr><th colspan="3"><p><strong>Fields</strong></p></th></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>quoteID</p></td><td><p>Integer</p></td><td><p>TQL’s internal Identifier for the quote created.</p></td></tr><tr><td><p>poNumber</p></td><td><p>Integer</p></td><td><p>The PO number of the tendered shipment. Only returned</p><p>if the shipment was tendered.</p></td></tr><tr><td><p>createdDate</p></td><td><p>DateTime</p></td><td><p>Date and time that the quote was created. Time is in UTC-</p><p>5.</p></td></tr><tr><td><p>tenderedDate</p></td><td><p>DateTime</p></td><td><p>Date and time that the quote was tendered. Time is in UTC-5.</p></td></tr><tr><td><p>expirationDate</p></td><td><p>DateTime</p></td><td><p>Date and time that the quote expires. Time is in UTC-5.</p></td></tr><tr><td><p>informationalMessage</p></td><td><p>String</p></td><td><p>Friendly message indicating generically whether or not the request succeeded.</p></td></tr><tr><td><p>pickLocationType</p></td><td><p>String</p></td><td><p>The location type of the shipper. Available options:</p><ul><li>Commercial</li><li>Limited Access</li><li>Residential</li><li>Trade Show</li></ul></td></tr></tbody></table>

<table><tbody><tr><th></th><th></th><th><p>*If dropLocationType is Residential, pickLocationType</p><p>cannot be Residential.</p></th></tr><tr><td><p>dropLocationType</p></td><td><p>String</p></td><td><p>The location type of the receiver. Available options:</p><ul><li>Commercial</li><li>Limited Access</li><li>Residential</li><li>Trade Show</li></ul><p>*If pickLocationType is Residential, dropLocationType cannot be Residential.</p></td></tr><tr><td><p>shipmentDate</p></td><td><p>Date</p></td><td><p>Requested pickup date.</p></td></tr><tr><td colspan="3"><p><strong>pickupDetails.location</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>city</p></td><td><p>String</p></td><td><p>Pickup city</p></td></tr><tr><td><p>state</p></td><td><p>String</p></td><td><p>Two-character pickup state. Example: FL</p></td></tr><tr><td><p>postalCode</p></td><td><p>Integer</p></td><td><p>Pickup postal code. Must be a valid US, Canadian, or</p><p>Mexican zip code.</p></td></tr><tr><td><p>postalCode_FirstThree</p></td><td><p>Integer</p></td><td><p>Postal Pod of an area.</p></td></tr><tr><td><p>country</p></td><td><p>String</p></td><td><p>Pickup country code. Available options:</p><ul><li>CAN</li><li>MEX</li><li>USA</li></ul><p>*If the destination country is set to MEX, the origin cannot also be set to MEX. If not passed in, the default country</p><p>code is USA.</p></td></tr><tr><td colspan="3"><p><strong>pickupDetails</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>address1</p></td><td><p>String</p></td><td><p>Pickup address. Can be a maximum of 50 characters.</p></td></tr><tr><td><p>address2</p></td><td><p>String</p></td><td><p>Additional details (i.e. suite, apartment, etc.) Can be a</p><p>maximum of 50 characters.</p></td></tr><tr><td><p>stopName</p></td><td><p>String</p></td><td><p>Shipper company name</p><p>Can be a maximum of 50 characters</p></td></tr><tr><td><p>contactName</p></td><td><p>String</p></td><td><p>Point of contact at the Shipper’s location.</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>contactPhone</p></td><td><p>String</p></td><td><p>Shipper’s phone number. Must be a valid 10-digit string without hyphens or spaces. Example: 1234567890</p><p>Regex for phone number: ^[+]?(1\-</p><p>|1\s|1)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$ Valid examples:</p><ul><li>2345678901</li></ul><p> +12345678901</p><p> +1 (234) 567 8901</p><p> +1 (234) 567-8901</p><ul><li>1(234)567-8901</li></ul></td></tr><tr><td><p>contactExtension</p></td><td><p>String</p></td><td><p>Shipper’s extension for phone number. Can be a</p><p>maximum of 20 characters.</p></td></tr><tr><td><p>hoursOpen</p></td><td><p>String</p></td><td><p>The hour at which the Shipper opens for pickup in the format HH:MM AM/PM. Examples of valid times include</p><p>“12:00 PM” and “1:00 AM”. Time is in UTC-5.</p></td></tr><tr><td><p>hoursClosed</p></td><td><p>String</p></td><td><p>The hour at which the Shipper closes for pickup in the format HH:MM AM/PM. Examples of valid times include</p><p>“12:00 PM” and “1:00 AM”. Time is in UTC-5.</p></td></tr><tr><td><p>puNumber</p></td><td><p>String</p></td><td><p>Pickup number carrier should provide to the shipper. Can be a maximum of 300 characters.</p></td></tr></tbody></table>

<table><tbody><tr><th colspan="3"><p><strong>deliveryDetails.location</strong></p></th></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>city</p></td><td><p>String</p></td><td><p>Delivery city</p></td></tr><tr><td><p>state</p></td><td><p>String</p></td><td><p>Two-character delivery state. Example: FL</p></td></tr><tr><td><p>postalCode</p></td><td><p>Integer</p></td><td><p>Delivery postal code. Must be a valid US, Canadian, or</p><p>Mexican zip code.</p></td></tr><tr><td><p>postalCode_FirstThree</p></td><td><p>Integer</p></td><td><p>Postal Pod of an area.</p></td></tr><tr><td><p>country</p></td><td><p>String</p></td><td><p>Delivery country. Available options:</p><ul><li>CAN</li><li>MEX</li><li>USA</li></ul><p>*If the origin country is set to MEX, the destination cannot also be set to MEX. If not passed in, the default country</p><p>code is USA.</p></td></tr><tr><td colspan="3"><p><strong>deliveryDetails</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>address1</p></td><td><p>String</p></td><td><p>Delivery address. Can be a maximum of 50 characters.</p></td></tr><tr><td><p>address2</p></td><td><p>String</p></td><td><p>Additional details (i.e. suite, apartment, etc.) Can be a</p><p>maximum of 50 characters.</p></td></tr><tr><td><p>stopName</p></td><td></td><td><p>Receiver company name</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>contactName</p></td><td><p>String</p></td><td><p>Point of contact at the Receiver’s location.</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>contactPhone</p></td><td><p>String</p></td><td><p>Receiver phone number. Must be a valid 10-digit string without hyphens or spaces. Example: 1234567890</p><p>Regex for phone number: ^[+]?(1\-</p><p>|1\s|1)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$ Valid examples:</p><ul><li>2345678901</li></ul><p> +12345678901</p><p> +1 (234) 567 8901</p><p> +1 (234) 567-8901</p><ul><li>1(234)567-8901</li></ul></td></tr><tr><td><p>contactExtension</p></td><td><p>String</p></td><td><p>Receiver’s extension for phone number. Can be a maximum of 20 characters.</p></td></tr><tr><td><p>hoursOpen</p></td><td><p>String</p></td><td><p>The hour at which the Receiver opens for delivery in the format HH:MM AM/PM. Examples of valid times include</p><p>“12:00 PM” and “1:00 AM”. Time is in UTC-5.</p></td></tr><tr><td><p>hoursClosed</p></td><td><p>String</p></td><td><p>The hour at which the Receiver closes for delivery in the format HH:MM AM/PM. Examples of valid times include</p><p>“12:00 PM” and “1:00 AM”. Time is in UTC-5.</p></td></tr><tr><td><p>deliveryPO</p></td><td></td><td><p>Delivery number carrier should provide to the receiver. Can be a maximum of 1000 characters.</p></td></tr><tr><td colspan="3"><p><strong>quoteCommodities</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>commodityId</p></td><td><p>Integer</p></td><td><p>TQL’s internal identifier of the commodity created.</p></td></tr><tr><td><p>description</p></td><td><p>String</p></td><td><p>Description of commodity. Can be a maximum of 255 characters. Currently, will error out at 251 characters, but</p><p>this is temporary.</p></td></tr><tr><td><p>quantity</p></td><td><p>Integer</p></td><td><p>Number of handling units. Must be a positive integer greater than 0. Currently limited to 315. This limit will</p><p>soon be lifted.</p></td></tr><tr><td><p>unitTypeCode</p></td><td><p>String</p></td><td><p>Type of handling unit(s). Available options:</p><p>BOX</p></td></tr></tbody></table>

<table><tbody><tr><th></th><th></th><th><p>BUNDLE CARTON CRATE DRUM PLT ROLL PIECES CASE</p><p>*If a unitTypeCode is not passed, will default to Pallet</p><p>(PLT)</p></th></tr><tr><td><p>freightClassCode</p></td><td><p>String</p></td><td><p>Freight class of commodity. Available options:</p><p>50</p><p>55</p><p>60</p><p>65</p><p>70</p><p>77.5</p><p>85</p><p>92.5</p><p>100</p><p>110</p><p>125</p><p>150</p><p>175</p><p>200</p><p>250</p><p>300</p><p>400</p><p>500</p></td></tr><tr><td><p>weight</p></td><td><p>Decimal</p></td><td><p>Total weight in pounds, to one decimal place.</p></td></tr><tr><td><p>dimensionLength</p></td><td><p>Integer</p></td><td><p>Length in inches. Must be between 1 and 636 inches.</p></td></tr><tr><td><p>dimensionWidth</p></td><td><p>Integer</p></td><td><p>Width in inches. Must be between 1 and 102 inches.</p></td></tr><tr><td><p>dimensionHeight</p></td><td><p>Integer</p></td><td><p>Height in inches. Must be between 1 and 102 inches.</p></td></tr><tr><td><p>isHazmat</p></td><td><p>Boolean</p></td><td><p>Hazardous flag.</p></td></tr><tr><td colspan="3"><p><strong>quoteCommodities.hazmatDetails</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>unNumber</p></td><td><p>String</p></td><td><p>UN number of the commodity.</p><p>*Required only if Hazardous flag is True.</p><p>Must be a maximum of 9 characters</p></td></tr><tr><td><p>packingGroup</p></td><td><p>String</p></td><td><p>Packing Group of the commodity. Options:</p><ul><li>I</li><li>II</li><li>III</li><li>None</li></ul><p>*Required only if Hazardous flag is True.</p></td></tr><tr><td><p>hazmatClassCode</p></td><td><p>List (String)</p></td><td><p>Hazardous class of the commodity. Options include:</p><ul><li>1.4</li><li>1.6</li><li>2.1</li><li>2.2</li><li>3.0</li><li>4.1</li><li>4.2</li><li>4.3</li></ul></td></tr></tbody></table>

<table><tbody><tr><th></th><th></th><th><ul><li>5.1</li><li>8.0</li><li>9.0</li><li>1.4B</li><li>1.4C</li><li>1.4D</li><li>1.4E</li><li>1.4F</li><li>1.4G</li><li>1.4S</li><li>1.5</li><li>1.5D</li><li>1.6N</li><li>5.2</li></ul><p>*Required only if Hazardous flag is True.</p></th></tr><tr><td><p>properShippingName</p></td><td><p>List (String)</p></td><td><p>Proper shipping name of the commodity.</p><p>*Required only if Hazardous flag is True.</p><p>Can be a maximum of 150 characters.</p></td></tr><tr><td><p>emergencyContractName</p></td><td><p>String</p></td><td><p>Name of company to be contacted in the event of an incident.</p><p>*Required only if Hazardous flag is True.</p><p>Can be a maximum of 50 characters</p></td></tr><tr><td><p>emergencyContactPhone</p></td><td><p>String</p></td><td><p>Phone number of company to be contacted in the event of an incident.</p><p>*Required only if Hazardous flag is True. Can be a maximum of 50 characters</p><p>Regex for phone number: ^[+]?(1\-</p><p>|1\s|1)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$ Valid examples:</p><ul><li>2345678901</li></ul><p> +12345678901</p><p> +1 (234) 567 8901</p><p> +1 (234) 567-8901</p><ul><li>1(234)567-8901</li></ul></td></tr></tbody></table>

<table><tbody><tr><th colspan="3"><p><strong>accessorials (List)</strong></p></th></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>accessorials</p></td><td><p>List of Strings</p></td><td><p>*See Reference: Accessorial Name for the list of available</p><p>accessorials and their codes.</p></td></tr><tr><td colspan="3"><p><strong>carrierPrices</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>id</p></td><td><p>Integer</p></td><td><p>TQL’s internal identifier that is specific to a single carrier’s quote. Each carrier option / quote in the response will have a Price ID. This value will be passed into the</p><p>tendering endpoint to indicate the selected carrier.</p></td></tr><tr><td><p>carrier</p></td><td><p>String</p></td><td><p>Carrier company name</p></td></tr><tr><td><p>isPreferred</p></td><td><p>Boolean</p></td><td><p>“TQL Preferred” recommended carrier.</p></td></tr><tr><td><p>isEconomy</p></td><td><p>Boolean</p></td><td><p>Flag to identify Economy Service Level for Standard LTL shipments.</p></td></tr><tr><td><p>scac</p></td><td><p>String</p></td><td><p>Carrier SCAC code.</p></td></tr><tr><td><p>customerRate</p></td><td><p>Integer</p></td><td><p>Carrier rate</p></td></tr><tr><td><p>serviceLevel</p></td><td><p>String</p></td><td><p>Carrier Service Level. Available options:</p><ul><li>Standard</li><li>Guaranteed Volume</li></ul></td></tr><tr><td><p>serviceLevelDescription</p></td><td><p>String</p></td><td><p>Additional information about the Service Level.</p></td></tr><tr><td><p>serviceType</p></td><td><p>String</p></td><td><p>Indicates whether the carrier considers the shipment to</p><p>be direct or indirect.</p></td></tr><tr><td><p>transitDays</p></td><td><p>Integer</p></td><td><p>Carriers’ published estimated transit days.</p></td></tr><tr><td><p>maxLiabilityNew</p></td><td><p>Integer</p></td><td><p>Carrier’s max liability coverage amount for new goods.</p></td></tr><tr><td><p>maxLiabilityUsed</p></td><td><p>Integer</p></td><td><p>Carrier’s max liability coverage amount for used goods.</p></td></tr><tr><td><p>carrierQuoteId</p></td><td><p>String</p></td><td><p>Quote ID provided by the carrier.</p></td></tr><tr><td colspan="3"><p><strong>carrierPrice.priceCharges</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>amount</p></td><td><p>Integer</p></td><td><p>Amount of itemized charge</p></td></tr><tr><td><p>description</p></td><td><p>String</p></td><td><p>Name of itemized charged.</p></td></tr><tr><td colspan="3"><p><strong>Reference</strong></p></td></tr><tr><td><p><strong>Accessorial Name</strong></p></td><td colspan="2"><p><strong>Code</strong></p></td></tr><tr><td><p>Pickup – Inside</p></td><td colspan="2"><p>INPU</p></td></tr><tr><td><p>Pickup – Lift Gate</p></td><td colspan="2"><p>LGPU</p></td></tr><tr><td><p>Delivery – Inside</p></td><td colspan="2"><p>INDEL</p></td></tr><tr><td><p>Delivery – Lift Gate</p></td><td colspan="2"><p>LGDEL</p></td></tr><tr><td><p>Delivery – Appointment</p></td><td colspan="2"><p>APPTDEL</p></td></tr><tr><td><p>Delivery – Call Ahead</p></td><td colspan="2"><p>NOTIFY</p></td></tr><tr><td><p>Delivery – Sort and Segregate</p></td><td colspan="2"><p>SORTDEL</p></td></tr><tr><td><p>Blind Single</p></td><td colspan="2"><p>BLIND_S</p></td></tr><tr><td><p>Blind Double</p></td><td colspan="2"><p>BLIND_D</p></td></tr><tr><td><p>In Bond</p></td><td colspan="2"><p>BOND</p></td></tr><tr><td><p>Protect from Freezing</p></td><td colspan="2"><p>PFZ</p></td></tr></tbody></table>

# Tendering Process

## Description

You can select a carrier and tender your shipment by calling our TenderShipment endpoint. To tell us which carrier you want to use, simply pass in the corresponding “Carrier Price ID” that

you received in the quote response. You also have the option to include email addresses for anyone who needs it to receive a copy of the BOL, which will be sent upon successful tender.

Please Note: If any commodities passed in during the quoting process were designated as hazmat, additional information is required. Passing any non-hazmat properties in will update them for the given commodity.

## TenderShipment Request

### Request Sample

**Verb: POST Request URL:**

- Staging: <https://public.api.tql.com/test-ltl/quotes/tender>
- Production: <https://public.api.tql.com/ltl/quotes/tender>

**Request Headers:**

- Content-Type: application/json
- Ocp-Apim-Subscription-Key: {your APIM subscription key}
- Authorization: Bearer {token from token endpoint}

**Request Body Sample:**

{

"carrierPriceId": 000000, "customerEmailAddresses": \["[abc1234@email.com](mailto:abc1234@email.com)"\],

"shipmentDate":"12-12-2019", "pickupDetails":{

"puNumber": "",

"stopName": "Test", "contactName": "Test Test", "contactPhone": "5555555555",

"contactExtension": "12345", "address1": "123 Test Street", "address2": null,

"hoursOpen": "9:00 AM",

"hoursClose": "5:00 PM"

},

"deliveryDetails":{ "deliveryPO":"", "stopName":"TestPlace", "contactName":"Test people", "contactPhone":"5555555555", "contactExtension":null, "address1":"1234 Test Street", "address2":null, "hoursOpen":"9:00 AM", "hoursClose":"5:00 PM"

}

}

### Request Breakdown

<table><tbody><tr><th colspan="4"><p><strong>Fields</strong></p></th></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>carrierPriceId</p></td><td><p>Integer</p></td><td><p></p></td><td><p>TQL’s internal identifier that is specific to a single</p><p>carrier’s quote.</p></td></tr><tr><td><p>customerEmailAddresses</p></td><td><p>List of String</p></td><td></td><td><p>A list of customer email addresses to which the BOL will be emailed. If you would like to receive the BOL, you must provide at least one email address. Ex: <a href="mailto:name@domain.com">name@domain.com</a></p><p>Can be a maximum of 100 characters.</p></td></tr><tr><td><p>shipmentDate</p></td><td><p>Date</p></td><td><p></p></td><td><p>Requested pickup date.</p><p>*If provided, this date will overwrite the one</p><p>submitted during quote creation.</p></td></tr><tr><td colspan="4"><p><strong>pickupDetails</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>address1</p></td><td><p>String</p></td><td><p></p></td><td><p>Pickup address. Can be a maximum of 50</p><p>characters.</p></td></tr><tr><td><p>address2</p></td><td><p>String</p></td><td></td><td><p>Additional details (i.e. suite, apartment, etc.). Can be a maximum of 50 characters.</p></td></tr><tr><td><p>stopName</p></td><td><p>String</p></td><td><p></p></td><td><p>Shipper company name</p><p>Can be a maximum of 50 characters</p></td></tr><tr><td><p>contactName</p></td><td><p>String</p></td><td></td><td><p>Point of contact at the Shipper’s location.</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>contactPhone</p></td><td><p>String</p></td><td><p></p></td><td><p>Shipper’s phone number. Must be a valid 10-digit string without hyphens or spaces. Example: 1234567890</p><p>Regex for phone number: ^[+]?(1\-</p><p>|1\s|1)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-</p><p>|\s)?(\d{4})$ Valid examples:</p><ul><li>2345678901</li></ul><p> +12345678901</p><p> +1 (234) 567 8901</p><p> +1 (234) 567-8901</p><ul><li>1(234)567-8901</li></ul></td></tr><tr><td><p>contactExtension</p></td><td><p>String</p></td><td></td><td><p>Shipper’s extension for phone number. Can be a</p><p>maximum of 20 characters.</p></td></tr><tr><td><p>hoursOpen</p></td><td><p>String</p></td><td><p></p></td><td><p>The hour at which the Shipper opens for pickup in the format HH:MM AM/PM. Examples of valid times include “12:00 PM” and “1:00 AM”. Time</p><p>is in UTC-5.</p></td></tr><tr><td><p>hoursClosed</p></td><td><p>String</p></td><td><p></p></td><td><p>The hour at which the Shipper closes for pickup in the format HH:MM AM/PM. Examples of valid times include “12:00 PM” and “1:00 AM”. Time</p><p>is in UTC-5.</p></td></tr><tr><td><p>puNumber</p></td><td><p>String</p></td><td></td><td><p>Pickup number carrier should provide to the</p><p>shipper. Can be a maximum of 300 characters.</p></td></tr><tr><td colspan="4"><p><strong>delivery Details</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>address1</p></td><td><p>String</p></td><td><p></p></td><td><p>Delivery address. Can be a maximum of 50 characters.</p></td></tr><tr><td><p>address2</p></td><td><p>String</p></td><td></td><td><p>Additional details (i.e. suite, apartment, etc.) Can</p><p>be a maximum of 50 characters.</p></td></tr><tr><td><p>stopName</p></td><td></td><td><p></p></td><td><p>Receiver company name</p><p>Can be a maximum of 50 characters</p></td></tr></tbody></table>

<table><tbody><tr><th><p>contactName</p></th><th><p>String</p></th><th></th><th><p>Point of contact at the Receiver’s location.</p><p>Can be a maximum of 50 characters.</p></th></tr><tr><td><p>contactPhone</p></td><td><p>String</p></td><td><p></p></td><td><p>Receiver phone number. Must be a valid 10-digit string without hyphens or spaces. Example: 1234567890</p><p>Regex for phone number: ^[+]?(1\-</p><p>|1\s|1)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-</p><p>|\s)?(\d{4})$ Valid examples:</p><ul><li>2345678901</li></ul><p> +12345678901</p><p> +1 (234) 567 8901</p><p> +1 (234) 567-8901</p><ul><li>1(234)567-8901</li></ul></td></tr><tr><td><p>contactExtension</p></td><td><p>String</p></td><td></td><td><p>Receiver’s extension for phone number. Can be</p><p>a maximum of 20 characters.</p></td></tr><tr><td><p>hoursOpen</p></td><td><p>String</p></td><td><p></p></td><td><p>The hour at which the Receiver opens for delivery in the format HH:MM AM/PM. Examples of valid times include “12:00 PM” and “1:00 AM”.</p><p>Time is in UTC-5.</p></td></tr><tr><td><p>hoursClosed</p></td><td><p>String</p></td><td><p></p></td><td><p>The hour at which the Receiver closes for delivery in the format HH:MM AM/PM. Examples of valid times include “12:00 PM” and “1:00 AM”.</p><p>Time is in UTC-5.</p></td></tr><tr><td><p>deliveryPO</p></td><td><p>String</p></td><td></td><td><p>Delivery number carrier should provide to the</p><p>receiver. Can be a maximum of 1000 characters.</p></td></tr><tr><td colspan="4"><p><strong>quoteCommodities</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>commodityId</p></td><td><p>Integer</p></td><td><p>*</p></td><td><p>The id of the commodity.</p><p>*Required only if Hazardous flag is True.</p></td></tr><tr><td><p>description</p></td><td><p>String</p></td><td><p></p></td><td><p>Description of commodity. Can be a maximum of</p><p>255 characters. Currently, will error out at 251 characters, but this is temporary.</p></td></tr><tr><td><p>nmfc</p></td><td><p>String</p></td><td></td><td><p>Item’s NMFC code.</p><p>If provided, cannot exceed 9 characters and must</p><p>contain only numbers and dashes.</p></td></tr><tr><td><p>pieceCaseCount</p></td><td><p>Integer</p></td><td></td><td><p>Total number of pieces on all handling units for commodity.</p></td></tr><tr><td><p>unNumber</p></td><td><p>String</p></td><td><p>*</p></td><td><p>UN Number of the commodity.</p><p>*Required only if Hazardous flag is True.</p><p>Must be a maximum of 9 characters</p></td></tr><tr><td><p>properShippingName</p></td><td><p>List (String)</p></td><td><p>*</p></td><td><p>Proper shipping name of the commodity.</p><p>*Required only if Hazardous flag is True.</p><p>Can be a maximum of 150 characters.</p></td></tr><tr><td><p>packingGroupCode</p></td><td><p>String</p></td><td><p>*</p></td><td><p>Packing Group of the commodity. Available Options:</p><ul><li>I</li><li>II</li><li>III</li><li>None</li></ul><p>*Required only if Hazardous flag is True.</p></td></tr><tr><td><p>hazmatClassCode</p></td><td><p>List (String)</p></td><td><p>*</p></td><td><p>Hazardous class of the commodity. Available Options:</p><ul><li>1.4</li><li>1.6</li><li>2.1</li><li>2.2</li></ul></td></tr></tbody></table>

<table><tbody><tr><th></th><th></th><th></th><th><ul><li>3.0</li><li>4.1</li><li>4.2</li><li>4.3</li><li>5.1</li><li>8.0</li><li>9.0</li><li>1.4B</li><li>1.4C</li><li>1.4D</li><li>1.4E</li><li>1.4F</li><li>1.4G</li><li>1.4S</li><li>1.5</li><li>1.5D</li><li>1.6N</li><li>5.2</li></ul><p>*Required only if Hazardous flag is True.</p></th></tr><tr><td><p>emergencyContractName</p></td><td><p>String</p></td><td><p>*</p></td><td><p>Name of company to be contacted in the event of an incident.</p><p>*Required only if Hazardous flag is True.</p><p>Can be a maximum of 50 characters</p></td></tr><tr><td><p>emergencyContactPhone</p></td><td><p>String</p></td><td><p>*</p></td><td><p>Phone number of company to be contacted in the event of an incident.</p><p>*Required only if Hazardous flag is True. Can be a maximum of 50 characters</p><p>Regex for phone number: ^[+]?(1\-</p><p>|1\s|1)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-</p><p>|\s)?(\d{4})$ Valid examples:</p><ul><li>2345678901</li></ul><p> +12345678901</p><p> +1 (234) 567 8901</p><p> +1 (234) 567-8901</p><ul><li>1(234)567-8901</li></ul></td></tr></tbody></table>

## Response

### Response

Once a shipment has successfully been tendered, you and your TQL representatives will receive a copy of the Bill of Ladings. If email addresses were provided in the tendered request, a PDF copy of the BOL will be sent to those addresses upon successful tender.

### Response Sample

{

"content": { "quoteId": 000000,

"poNumber": 12345678, "errors": \[\]

},

"statusCode": 201,

"informationalMessage": "Successfully tendered shipment.”

}

### Response Breakdown

| **Content** |     |     |
| --- |     |     | --- | --- |
| **Element** | **Format** | **Description** |
| quoteId | Integer | The id of the quote that was tendered. |
| poNumber | Integer | The PO Number of the shipment. Also called the BOL<br><br>Number. |
| Errors | List of String | A list of any errors that occurred during the tendering<br><br>process. |
| **Fields** |     |     |
| **Element** | **Format** | **Description** |
| statusCode | Integer | The HTTP status code of the request. 201 indicates that a shipment was successfully created. For information on other<br><br>status codes, please see the section on status codes. |
| informationalMessage | String | A friendly message indicating the success or failure of the call. |

# Requesting Tracking Information

## Description

You can track any of your TQL shipments (not just LTL) by passing in the TQL PO / BOL Number to our tracking endpoint. The response will include the status of your shipment (tendered, in transit, or delivered) as well as location information and details associated with events, when available. Please note that there is no test endpoint for tracking.

## Request

### Request Sample

**Verb:** GET

**Request URL:**

- Production: <https://public.api.tql.com/tracking/{poNumber}>

**Request Headers:**

- Content-Type: application/json
- Ocp-Apim-Subscription-Key: {your APIM subscription key}
- Authorization: Bearer {token from token endpoint}

### Response Breakdown

| **Track Shipment** |     |     |     |
| --- |     |     |     | --- | --- | --- |
| **Element** | **Format** | **Required** | **Description** |

| poNumber | Integer |    | TQL PO Number or TQL LTL BOL Number<br><br>provided in tendering response. |
| --- | --- | --- | --- |

## Response

### Response Sample

{

"poNumber": "1234567890", "status": "DELIVERED",

"firstPick": "Anderson Twp, OH", "lastDrop": "Fairfax, VA", "nextStop": "Shipment Completed", "trackingDetails": \[

{

"time": "6/24/2020 2:12:13 PM",

"status": "In Transit", "location": "Reston, VA",

"latitude": "38.916815",

"longitude": "-77.056474", "remarks": "Check Call"

}

\],

"stopDetails": \[

{

"stopType": "Pick", "city": "Anderson Twp", "state": "OH",

"zip": "45230",

"latitude": "39.269123",

"longitude": "-84.599293"

},

{

"stopType": "Drop",

"city": "Fairfax",

"state": "VA",

"zip": "22030",

"latitude": "38.830825",

"longitude": "-77.362938"

}

\]

}

### Response Breakdown

| **Fields** |     |     |
| --- |     |     | --- | --- |
| **Element** | **Format** | **Description** |
| poNumber | Integer | TQL PO Number or TQL LTL BOL Number provided in tendering response. |
| status | Boolean | Indicates the shipment was delivered. |
| firstPick | String | The location of the first pickup. |
| lastDrop | String | The location of the final drop. |

| nextStop | String | The location of the next stop. If the shipment has been delivered,<br><br>this will read “Shipment Completed.” |
| --- | --- | --- |
| **trackingDetails (List)** |     |     |
| **Element** | **Format** | **Description** |
| time | DateTime | Date and time associated with event. Time is in UTC-5. |
| status | String | Status of the shipment: Tendered, In Transit, or Delivered. |
| location | String | The city and state associated with the event. |
| latitude | String | The latitude of the location associated with the event. |
| longitude | Integer | The longitude of the location associated with the event. |
| remarks | String | Details about the tracking event. |
| **stopDetails (List)** |     |     |
| **Element** | **Format** | **Description** |
| stopType | String | The type of stop; can be either “Pick” for pickup or “Drop” for drop<br><br>off. |
| city | String | The city of the stop. |
| state | String | The state of the stop. |
| zip | String | The zip code of the stop. |
| longitude | Integer | The longitude of the stop. |
| latitude | String | The latitude of the stop. |

# Tendering by SCAC

## Description

The Tender by SCAC endpoint allows you to specify a known carrier and a service level, and instantly tender a load. A carrier price with a matching SCAC and service level must be available for a successful response.

## Request

### Request Sample

**Verb: POST Request URL:**

- Staging: <https://public.api.tql.com/test-ltl/loads/tender>
- Production: <https://public.api.tql.com/ltl/loads/tender>

**Request Headers:**

- Content-Type: application/json
- Ocp-Apim-Subscription-Key: {your APIM subscription key}
- Authorization: Bearer {token from token endpoint}

**Request Body Sample:**

{

"customerEmailAddresses":[\["test@tql.com](mailto:test@tql.com)"\], "scac":"BBFG",

"serviceLevel":"Standard", "customerReference":"Sample", "poNumber":"Sample", "soNumber":"Sample", "specialInstructions":"Sample", "commodities":

\[

{

"unitTypeCode":"PLT", "freightClassCode":"55", "description":"Tomatoes", "quantity":4,

"weight":1.0, "dimensionLength":3, "dimensionWidth":4, "dimensionHeight":1, "isStackable":false, "isHazmat":false

}

\],

"accessorials":\[\],

"shipmentDate":"2020-01-16T00:00:00-05:00",

"pickupDetails":

{

"puNumber":"Sample", "address1":"617 Test Street", "address2":null, "city":"Cincinnati", "state":"OH", "postalCode":"45203", "country":"USA", "stopName":"Sample", "locationType":"Commercial",

"contactName":"Sample Contact", "contactPhone":"2169582529", "contactExtension":"569", "hoursOpen":"9:30 AM", "hoursClose":"9:30 PM"

},

"deliveryDetails":

{

"deliveryPO":"Sample", "address1":"383 Test Drive", "address2":null, "city":"Fresno",

"state":"CA", "postalCode":"93714", "country":"USA", "stopName":"Sample", "locationType":"Commercial", "contactName":"Sample Contact", "contactPhone":"9995771510", "contactExtension":"195", "hoursOpen":"11:00 AM", "hoursClose":"4:00 AM"

}

}

### Request Breakdown

<table><tbody><tr><th colspan="4"><p><strong>Fields</strong></p></th></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>customerEmailAddresses</p></td><td><p>List of String</p></td><td></td><td><p>A list of customer email addresses to which the BOL will be emailed. If you would like to receive the BOL, you must provide at least one email address. Ex: <a href="mailto:name@domain.com">name@domain.com</a></p><p>Can be a maximum of 100 characters.</p></td></tr><tr><td><p>scac</p></td><td><p>String</p></td><td><p></p></td><td><p>The SCAC of the desired carrier. Must be a valid SCAC.</p></td></tr><tr><td><p>serviceLevel</p></td><td><p>String</p></td><td></td><td><p>The desired service level for the shipment. Options include:</p><ul><li>Standard</li><li>Volume</li><li>Guaranteed*</li><li>Guaranteed 12 PM</li><li>Guaranteed 3 PM</li><li>Guaranteed 3:30 PM</li><li>Guaranteed 5 PM</li></ul><p>*When the “Guaranteed” option without a time is specified, the lowest priced option with a guaranteed service level will be</p><p>chosen.</p></td></tr><tr><td><p>customerReference</p></td><td><p>String</p></td><td></td><td><p>Non-TQL identifier for customer use. 255 Character Limit</p></td></tr><tr><td><p>poNumber</p></td><td><p>String</p></td><td></td><td><p>Non-TQL identifier for customer use. 255</p><p>Character Limit</p></td></tr><tr><td><p>soNumber</p></td><td><p>String</p></td><td></td><td><p>Non-TQL identifier for customer use. 255</p><p>Character Limit</p></td></tr><tr><td><p>specialInstructions</p></td><td><p>String</p></td><td></td><td><p>Non-TQL instructions for customer use. 255 Character Limit</p></td></tr><tr><td><p>shipmentDate</p></td><td><p>Date</p></td><td><p></p></td><td><p>Requested pickup date.</p></td></tr><tr><td colspan="4"><p><strong>pickupDetails</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>puNumber</p></td><td><p>String</p></td><td></td><td><p>Pickup number carrier should provide to the shipper. Can be a maximum of 300 characters.</p></td></tr><tr><td><p>address1</p></td><td><p>String</p></td><td><p></p></td><td><p>Pickup address. Can be a maximum of 50</p><p>characters.</p></td></tr><tr><td><p>address2</p></td><td><p>String</p></td><td></td><td><p>Additional details (i.e. suite, apartment, etc.).</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>city</p></td><td><p>String</p></td><td><p></p></td><td><p>Pickup city</p></td></tr><tr><td><p>state</p></td><td><p>String</p></td><td><p></p></td><td><p>Two-character pickup state. Example: FL</p></td></tr><tr><td><p>postalCode</p></td><td><p>Integer</p></td><td><p></p></td><td><p>Pickup postal code. Must be a valid US,</p><p>Canadian, or Mexican zip code.</p></td></tr><tr><td><p>country</p></td><td><p>String</p></td><td><p></p></td><td><p>Pickup country code. Available options:</p><ul><li>CAN</li><li>MEX</li><li>USA</li></ul></td></tr></tbody></table>

<table><tbody><tr><th></th><th></th><th></th><th><p>*If the destination country is set to MEX, the origin cannot also be set to MEX. If not passed</p><p>in, the default country code is USA.</p></th></tr><tr><td><p>stopName</p></td><td><p>String</p></td><td><p></p></td><td><p>Shipper company name</p><p>Can be a maximum of 50 characters</p></td></tr><tr><td><p>locationType</p></td><td><p>String</p></td><td><p></p></td><td><p>The location type of the shipper. Available options:</p><ul><li>Commercial</li><li>Limited Access</li><li>Residential</li><li>Trade Show</li></ul><p>*If pickLocationType is Residential, dropLocationType cannot be Residential.</p></td></tr><tr><td><p>contactName</p></td><td><p>String</p></td><td></td><td><p>Point of contact at the Shipper’s location.</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>contactPhone</p></td><td><p>String</p></td><td></td><td><p>Shipper’s phone number. Must be a valid 10- digit string without hyphens or spaces. Example: 1234567890</p><p>Regex for phone number: ^[+]?(1\-</p><p>|1\s|1)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-</p><p>|\s)?(\d{4})$ Valid examples:</p><ul><li>2345678901</li></ul><p> +12345678901</p><p> +1 (234) 567 8901</p><p> +1 (234) 567-8901</p><ul><li>1(234)567-8901</li></ul></td></tr><tr><td><p>contactExtension</p></td><td><p>String</p></td><td></td><td><p>Shipper’s extension for phone number. Can be a maximum of 20 characters.</p></td></tr><tr><td><p>hoursOpen</p></td><td><p>String</p></td><td></td><td><p>The hour at which the Shipper opens for pickup in the format HH:MM AM/PM. Examples of valid times include “12:00 PM”</p><p>and “1:00 AM”.</p></td></tr><tr><td><p>hoursClosed</p></td><td><p>String</p></td><td></td><td><p>The hour at which the Shipper closes for pickup in the format HH:MM AM/PM. Examples of valid times include “12:00 PM”</p><p>and “1:00 AM”.</p></td></tr><tr><td><p><strong>deliveryDetails</strong></p></td><td></td><td></td><td></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>deliveryPO</p></td><td><p>String</p></td><td></td><td><p>Delivery number carrier should provide to the receiver. Time is in UTC-5. Can be a maximum</p><p>of 1000 characters.</p></td></tr><tr><td><p>address1</p></td><td><p>String</p></td><td><p></p></td><td><p>Delivery address. Can be a maximum of 50</p><p>characters.</p></td></tr><tr><td><p>address2</p></td><td><p>String</p></td><td></td><td><p>Additional details (i.e. suite, apartment, etc.).</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>city</p></td><td><p>String</p></td><td><p></p></td><td><p>Delivery city</p></td></tr><tr><td><p>state</p></td><td><p>String</p></td><td><p></p></td><td><p>Two-character delivery state. Example: FL</p></td></tr><tr><td><p>postalCode</p></td><td><p>String</p></td><td><p></p></td><td><p>Pickup postal code. Must be a valid US,</p><p>Canadian, or Mexican zip code.</p></td></tr><tr><td><p>country</p></td><td><p>String</p></td><td><p></p></td><td><p>Delivery country. Available options:</p><ul><li>CAN</li><li>MEX</li><li>USA</li></ul></td></tr></tbody></table>

<table><tbody><tr><th></th><th></th><th></th><th><p>*If the origin country is set to MEX, the destination cannot also be set to MEX. If not</p><p>passed in, the default country code is USA.</p></th></tr><tr><td><p>stopName</p></td><td><p>String</p></td><td><p></p></td><td><p>Shipper company name</p><p>Can be a maximum of 50 characters</p></td></tr><tr><td><p>locationType</p></td><td><p>String</p></td><td><p></p></td><td><p>The location type of the receiver. Available options:</p><ul><li>Commercial</li><li>Limited Access</li><li>Residential</li><li>Trade Show</li></ul><p>*If pickLocationType is Residential, dropLocationType cannot be Residential.</p></td></tr><tr><td><p>contactName</p></td><td><p>String</p></td><td></td><td><p>Point of contact at the Receiver’s location.</p><p>Can be a maximum of 50 characters.</p></td></tr><tr><td><p>contactPhone</p></td><td><p>String</p></td><td></td><td><p>Receiver phone number. Must be a valid 10- digit string without hyphens or spaces. Example: 1234567890</p><p>Regex for phone number: ^[+]?(1\-</p><p>|1\s|1)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-</p><p>|\s)?(\d{4})$ Valid examples:</p><ul><li>2345678901</li></ul><p> +12345678901</p><p> +1 (234) 567 8901</p><p> +1 (234) 567-8901</p><ul><li>1(234)567-8901</li></ul></td></tr><tr><td><p>contactExtension</p></td><td><p>String</p></td><td></td><td><p>Receiver’s extension for phone number. Can</p><p>be a maximum of 20 characters.</p></td></tr><tr><td><p>hoursOpen</p></td><td><p>String</p></td><td><p></p></td><td><p>The hour at which the Receiver opens for delivery in the format HH:MM AM/PM. Examples of valid times include “12:00 PM”</p><p>and “1:00 AM”. Time is in UTC-5.</p></td></tr><tr><td><p>hoursClosed</p></td><td><p>String</p></td><td><p></p></td><td><p>The hour at which the Receiver closes for delivery in the format HH:MM AM/PM. Examples of valid times include “12:00 PM”</p><p>and “1:00 AM”. Time is in UTC-5.</p></td></tr><tr><td><p><strong>commodities</strong></p></td><td></td><td></td><td></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>description</p></td><td><p>String</p></td><td><p></p></td><td><p>Description of commodity. Can be a maximum of 255 characters. Currently, will error out at 251 characters, but this is</p><p>temporary.</p></td></tr><tr><td><p>quantity</p></td><td><p>Integer</p></td><td><p></p></td><td><p>Number of handling units. Must be a positive integer greater than 0. Currently limited to</p><p>315. However, this limit will soon be lifted.</p></td></tr><tr><td><p>unitTypeCode</p></td><td><p>String</p></td><td><p></p></td><td></td></tr><tr><td><p>freightClassCode</p></td><td><p>String</p></td><td><p></p></td><td><p>Freight class of commodity. Options include:</p><p>50</p><p>55</p><p>60</p><p>65</p><p>70</p><p>77.5</p><p>85</p></td></tr></tbody></table>

<table><tbody><tr><th></th><th></th><th></th><th><p>92.5</p><p>100</p><p>110</p><p>125</p><p>150</p><p>175</p><p>200</p><p>250</p><p>300</p><p>400</p><p>500</p></th></tr><tr><td><p>weight</p></td><td><p>Decimal</p></td><td><p></p></td><td><p>Total weight in pounds, to one decimal place.</p></td></tr><tr><td><p>dimensionLength</p></td><td><p>Integer</p></td><td><p></p></td><td><p>Length in inches. Must be between 1 and 636</p><p>inches.</p></td></tr><tr><td><p>dimensionWidth</p></td><td><p>Integer</p></td><td><p></p></td><td><p>Width in inches. Must be between 1 and 102 inches.</p></td></tr><tr><td><p>dimensionHeight</p></td><td><p>Integer</p></td><td><p></p></td><td><p>Height in inches. Must be between 1 and 102</p><p>inches.</p></td></tr><tr><td><p>nmfc</p></td><td><p>String</p></td><td></td><td><p>Item’s NMFC code.</p><p>If provided, cannot exceed 9 characters and</p><p>must contain only numbers and dashes.</p></td></tr><tr><td><p>pieceCaseCount</p></td><td><p>Integer</p></td><td></td><td><p>Total number of pieces on all handling units</p><p>for commodity.</p></td></tr><tr><td><p>isHazmat</p></td><td><p>Boolean</p></td><td></td><td><p>Hazardous flag.</p></td></tr><tr><td><p>isStackable</p></td><td><p>Boolean</p></td><td></td><td><p>Stackable flag.</p></td></tr><tr><td><p>properShippingName</p></td><td><p>String</p></td><td></td><td><p>Proper shipping name of the commodity.</p><p>*Required only if Hazardous flag is True.</p></td></tr><tr><td><p>emergencyContactName</p></td><td><p>String</p></td><td></td><td><p>Name of company to be contacted in the event of an incident.</p><p>*Required only if Hazardous flag is True.</p></td></tr><tr><td><p>hazmatClassCode</p></td><td><p>String</p></td><td></td><td><p>Hazardous class of the commodity. Options include:</p><ul><li>1.4</li><li>1.6</li><li>2.1</li><li>2.2</li><li>3.0</li><li>4.1</li><li>4.2</li><li>4.3</li><li>5.1</li><li>8.0</li><li>9.0</li><li>1.4B</li><li>1.4C</li><li>1.4D</li><li>1.4E</li><li>1.4F</li><li>1.4G</li><li>1.4S</li><li>1.5</li><li>1.5D</li><li>1.6N</li><li>5.2</li></ul><p>*Required only if Hazardous flag is True.</p></td></tr><tr><td><p>packingGroupCode</p></td><td><p>String</p></td><td></td><td><p>Packing Group of the commodity.</p><p>Options:</p></td></tr></tbody></table>

<table><tbody><tr><th></th><th></th><th></th><th><ul><li>I</li><li>II</li><li>III</li><li>None</li></ul><p>*Required only if Hazardous flag is True.</p></th></tr><tr><td><p>unNumber</p></td><td><p>String</p></td><td></td><td><p>UN number of the commodity.</p><p>*Required only if Hazardous flag is True.</p></td></tr><tr><td><p><strong>accessorials (List)</strong></p></td><td></td><td></td><td></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Required</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>accessorials</p></td><td><p>List of Strings</p></td><td></td><td><p>*See Reference: Accessorial Name for the list of available accessorials and their codes.</p></td></tr><tr><td colspan="4"><p><strong>Reference</strong></p></td></tr><tr><td colspan="2"><p>Pickup – Inside</p></td><td colspan="2"><p>INPU</p></td></tr><tr><td colspan="2"><p>Pickup – Lift Gate</p></td><td colspan="2"><p>LGPU</p></td></tr><tr><td colspan="2"><p>Delivery – Inside</p></td><td colspan="2"><p>INDEL</p></td></tr><tr><td colspan="2"><p>Delivery – Lift Gate</p></td><td colspan="2"><p>LGDEL</p></td></tr><tr><td colspan="2"><p>Delivery – Appointment</p></td><td colspan="2"><p>APPTDEL</p></td></tr><tr><td colspan="2"><p>Delivery – Call Ahead</p></td><td colspan="2"><p>NOTIFY</p></td></tr><tr><td colspan="2"><p>Delivery – Sort and Segregate</p></td><td colspan="2"><p>SORTDEL</p></td></tr><tr><td colspan="2"><p>Blind Single</p></td><td colspan="2"><p>BLIND_S</p></td></tr><tr><td colspan="2"><p>Blind Double</p></td><td colspan="2"><p>BLIND_D</p></td></tr><tr><td colspan="2"><p>In Bond</p></td><td colspan="2"><p>BOND</p></td></tr><tr><td colspan="2"><p>Protect from Freezing</p></td><td colspan="2"><p>PFZ</p></td></tr></tbody></table>

## Response

### Response Sample

{

"content": { "quoteId": 000000,

"poNumber": 000000,

"shipmentDate": "2020-01-29T00:00:00-05:00",

"selectedCarrierPrice": { "id": 000000,

"carrier": "Roadrunner Freight - Tier 2", "scac": "RDFS",

"customerRate": 342.21, "carrierQuoteId": null, "serviceLevel": "Standard", "serviceType": "Direct", "transitDays": 7,

"maxLiabilityNew": 6.00,

"maxLiabilityUsed": 0.60, "serviceLevelDescription": "Direct", "priceCharges": \[

{

"description": "LineHaul", "amount": 283.01

},

{

"description": "LineHaul Fuel Surcharge", "amount": 27.08

},

{

"description": "Hazardous Materials", "amount": 10.00

},

{

"description": "California Compliance", "amount": 9.75

},

{

"description": "Line Haul Surcharge", "amount": 12.37

}

\],

"isPreferred": false, "isEconomy": true

}

},

"statusCode": 201,

"informationalMessage": "Successfully created quote and tendered shipment."

}

### Response Breakdown

<table><tbody><tr><th colspan="3"><p><strong>Content</strong></p></th></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>poNumber</p></td><td><p>Integer</p></td><td><p>TQL PO Number or TQL LTL BOL Number provided in tendering</p><p>response.</p></td></tr><tr><td><p>shipmentDate</p></td><td><p>DateTime</p></td><td><p>Requested pickup date. Time is in UTC-5.</p></td></tr><tr><td><p>quoteId</p></td><td><p>Integer</p></td><td><p>TQL’s internal Identifier for the quote created.</p></td></tr><tr><td><p>statusCode</p></td><td><p>Integer</p></td><td><p>The status code returned by the call (informational only).</p></td></tr><tr><td><p>informationalMessage</p></td><td><p>String</p></td><td><p>Friendly message indicating generically whether or not the request succeeded.</p></td></tr><tr><td colspan="3"><p><strong>selectedCarrierPrice</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>id</p></td><td><p>Integer</p></td><td><p>TQL’s internal identifier that is specific to a single carrier’s quote. Each carrier option / quote in the response will have a Price ID. This value will be passed into the tendering endpoint to</p><p>indicate the selected carrier.</p></td></tr><tr><td><p>carrier</p></td><td><p>String</p></td><td><p>Carrier company name</p></td></tr><tr><td><p>isPreferred</p></td><td><p>Boolean</p></td><td><p>“TQL Preferred” recommended carrier.</p></td></tr><tr><td><p>isEconomy</p></td><td><p>Boolean</p></td><td><p>Flag to identify Economy Service Level for Standard LTL</p><p>shipments.</p></td></tr><tr><td><p>Scac</p></td><td><p>String</p></td><td><p>Carrier SCAC code.</p></td></tr><tr><td><p>customerRate</p></td><td><p>Integer</p></td><td><p>Carrier rate</p></td></tr><tr><td><p>serviceLevel</p></td><td><p>String</p></td><td><p>Carrier Service Level. Available options:</p><ul><li>Standard</li><li>Guaranteed</li><li>Volume</li></ul></td></tr><tr><td><p>serviceLevelDescription</p></td><td><p>String</p></td><td><p>Additional information about the Service Level.</p></td></tr><tr><td><p>serviceType</p></td><td><p>String</p></td><td><p>Indicates whether the carrier considers the shipment to be</p><p>direct or indirect.</p></td></tr><tr><td><p>transitDays</p></td><td><p>Integer</p></td><td><p>Carriers’ published estimated transit days.</p></td></tr><tr><td><p>maxLiabilityNew</p></td><td><p>Integer</p></td><td><p>Carrier’s max liability coverage amount for new goods.</p></td></tr><tr><td><p>maxLiabilityUsed</p></td><td><p>Integer</p></td><td><p>Carrier’s max liability coverage amount for used goods.</p></td></tr><tr><td><p>carrierQuoteId</p></td><td><p>String</p></td><td><p>Quote ID provided by the carrier.</p></td></tr><tr><td colspan="3"><p><strong>carrierPrice.priceCharges</strong></p></td></tr><tr><td><p><strong>Element</strong></p></td><td><p><strong>Format</strong></p></td><td><p><strong>Description</strong></p></td></tr><tr><td><p>amount</p></td><td><p>Integer</p></td><td><p>Amount of itemized charge</p></td></tr><tr><td><p>description</p></td><td><p>String</p></td><td><p>Name of itemized charged.</p></td></tr></tbody></table>

# Response Codes

## Response Codes Description

TQL returns standard codes within the response to every API request. If the request results in an error, the response will also include an error object with additional information.

## Response Codes

| **Response Codes** |     |     |
| --- |     |     | --- | --- |
| **Code** | **Status** | **Description** |
| 200 | OK  | Success |
| 201 | Created | Successfully created a resource (quote, load, etc) |
| 400 | BadRequest | There was invalid or incomplete data in the request. |
| 401 | Unauthorized | The requester was not authorized to make the request. |
| 403 | Forbidden | A request was made for a resource not owned by the requester (example: a quoteId was passed in to the GetQuote endpoint by a<br><br>customer not authorized to view that quote’s information). |
| 404 | NotFound | The resource was not found (non-existent quote id, carrier price, etc.). |
| 500 | InternalServerError | An unexpected error occurred. Please report this to our IT department<br><br>if it persists. |

# Appendix A

## Quoting and Tendering workflow

![](data:image/png;base64,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)

_Section_ [_1.3_](#_bookmark3) _and_ [_1.4_](#_bookmark3)

_Section_ [_2.4_](#_bookmark13) _and_ [_2.5_](#_bookmark16)

_Section_ [_2.2_](#_bookmark7) _and_ [_2.3_](#_bookmark10)

_Section_ [_3.2_](#_bookmark21) _and_ [_3.3_](#_bookmark24)

_Section_ [_4.2_](#_bookmark30) _and_ [_4.3_](#_bookmark33)