import { NextResponse } from 'next/server';
import { Client } from '@hubspot/api-client';

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

export async function GET() {
  try {
    const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage();
    const contacts = apiResponse.results.map((contact: any) => ({
      id: contact.id,
      firstname: contact.properties.firstname,
      lastname: contact.properties.lastname,
      email: contact.properties.email,
    }));
    return NextResponse.json(contacts);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
