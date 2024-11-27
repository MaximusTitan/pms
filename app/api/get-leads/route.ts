import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';
import axios from 'axios';

console.log('Initializing webhook handler...');

const supabase = createClient();
console.log('Supabase client initialized');

// HubSpot API client
const hubspotClient = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});
console.log('HubSpot client initialized');

export async function POST(request: NextRequest) {
  console.log('Received webhook request');
  
  try {
    const payload = await request.json();
    
    console.log('Webhook payload:', JSON.stringify(payload));
    
    if (!payload || !payload.length) {
      console.warn('Invalid payload received');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { objectTypeId, objectId, occurredAt } = payload[0];
    console.log(`Processing webhook for ${objectTypeId} ${objectId} at ${occurredAt}`);

    console.log('Fetching contact data from HubSpot...');
    const contactResponse = await hubspotClient.get(`/crm/v3/objects/${objectTypeId}/${objectId}`, {
      params: {
        properties: [
          'email',
          'firstname', 
          'lastname', 
          'phone', 
          'city', 
          'school_district', 
          'partner_id', 
          'kid_s_name', 
          'kid_s_grade', 
          'lead_source', 
          'hs_lead_status',
          'createdate',
          'lastmodifieddate'
        ]
      }
    });    
    console.log('HubSpot response:', JSON.stringify(contactResponse.data));
    
    const contactData = contactResponse.data;

    const leadData = {
      id: contactData.id,
      email: contactData.properties.email || null,
      first_name: contactData.properties.firstname || null,
      last_name: contactData.properties.lastname || null,
      phone: contactData.properties.phone || null,
      city: contactData.properties.city || null,
      school_district: contactData.properties.school_district || null,
      partner_id: contactData.properties.partner_id || null,
      kid_s_name: contactData.properties.kid_s_name || null,
      kid_s_grade: contactData.properties.kid_s_grade || null,
      lead_source: contactData.properties.lead_source || null,
      hs_lead_status: contactData.properties.hs_lead_status || null,
      create_date: new Date(contactData.createdAt).toISOString(),
      last_modified_date: new Date(contactData.updatedAt).toISOString(),
      raw_data: contactData
    };
    console.log('Prepared lead data:', JSON.stringify(leadData));

    console.log('Upserting lead data to Supabase...');
    const { data, error } = await supabase.from('leads').upsert(leadData, {
      onConflict: 'id'
    }).select();

    if (error) {
      console.error('Supabase upsert error:', error);
      throw error;
    }

    console.log('Lead data successfully upserted');
    return NextResponse.json({ 
      message: 'Webhook processed successfully', 
      contactId: contactData.id 
    }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ 
      error: 'Failed to process webhook', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}