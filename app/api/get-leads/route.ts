import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';
import axios from 'axios';

// Initialize logger (optional, but recommended for production)
const log = (message: string, ...args: any[]) => {
  console.log(`[HubSpot Webhook] ${message}`, ...args);
};

// Create Supabase and HubSpot clients
const supabase = createClient();
const hubspotClient = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Define types for better type safety
interface HubSpotWebhookEvent {
  appId: number;
  eventId: number;
  subscriptionId: number;
  portalId: number;
  occurredAt: number;
  subscriptionType: 'object.propertyChange' | 'object.creation';
  attemptNumber: number;
  objectId: number;
  objectTypeId: string;
  propertyName?: string;
  propertyValue?: string;
  changeFlag?: string;
  changeSource: string;
  isSensitive?: boolean;
  sourceId?: string;
}

export async function POST(request: NextRequest) {
  log('Webhook request received');
  
  try {
    const payload: HubSpotWebhookEvent[] = await request.json();
    
    if (!payload || !payload.length) {
      log('Invalid payload received');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Find the primary event (creation or first property change)
    const primaryEvent = payload.find(
      event => 
        event.subscriptionType === 'object.creation' || 
        event.subscriptionType === 'object.propertyChange'
    );

    if (!primaryEvent) {
      log('No valid event found in payload');
      return NextResponse.json({ error: 'No valid event' }, { status: 400 });
    }

    const { objectTypeId, objectId } = primaryEvent;
    log(`Processing webhook for object type ${objectTypeId}, ID ${objectId}`);

    // Fetch complete contact data from HubSpot
    const contactResponse = await hubspotClient.get(`/crm/v3/objects/${objectTypeId}/${objectId}`, {
      params: {
        properties: [
          'email', 'firstname', 'lastname', 'phone', 'city', 
          'school_district', 'partner_id', 'kid_s_name', 'kid_s_grade', 
          'lead_source', 'hs_lead_status', 'createdate', 'lastmodifieddate', 
          'orientation_schedule', 'demo_time'
        ].join(',')
      }
    });
    
    const contactData = contactResponse.data;
    const properties = contactData.properties;

    // Prepare lead data for Supabase
    const leadData = {
      id: contactData.id,
      email: properties.email || null,
      first_name: properties.firstname || null,
      last_name: properties.lastname || null,
      phone: properties.phone || null,
      city: properties.city || null,
      school_district: properties.school_district || null,
      partner_id: properties.partner_id || null,
      kid_s_name: properties.kid_s_name || null,
      kid_s_grade: properties.kid_s_grade || null,
      lead_source: properties.lead_source || null,
      hs_lead_status: properties.hs_lead_status || null,
      create_date: properties.createdate ? new Date(properties.createdate).toISOString() : null,
      last_modified_date: properties.lastmodifieddate ? new Date(properties.lastmodifieddate).toISOString() : null,
      orientation_schedule: properties.orientation_schedule || null,
      demo_time: properties.demo_time || null,
      raw_data: contactData,
      // Include webhook event details for auditing
      last_webhook_event_type: primaryEvent.subscriptionType,
      last_webhook_event_id: primaryEvent.eventId,
      last_webhook_occurred_at: new Date(primaryEvent.occurredAt).toISOString()
    };

    log('Prepared lead data for upsert');

    // Upsert data to Supabase
    const { data, error } = await supabase.from('leads').upsert(leadData, {
      onConflict: 'id'
    }).select();

    if (error) {
      log('Supabase upsert error', error);
      throw error;
    }

    log(`Successfully processed webhook for contact ${contactData.id}`);
    return NextResponse.json({ 
      message: 'Webhook processed successfully', 
      contactId: contactData.id,
      eventType: primaryEvent.subscriptionType
    }, { status: 200 });

  } catch (error) {
    log('Webhook processing error', error);
    return NextResponse.json({ 
      error: 'Failed to process webhook', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}