"use client";

import React, { useEffect, useState } from "react";

interface Contact {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

const LeadsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch("/api/contacts");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const fetchedContacts: Contact[] = await response.json();
        setContacts(fetchedContacts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) return <p>Loading contacts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>HubSpot Contacts</h1>
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id}>
            {contact.firstname} {contact.lastname} - {contact.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeadsPage;
