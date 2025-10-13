import { Company } from '@/types';

export function exportToCSV(companies: Company[], fairName: string): void {
  const headers = [
    'Company Name',
    'Booth Number',
    'Positions',
    'Priority',
    'Contact Names',
    'Emails',
    'Phones',
    'Website',
    'Careers Page',
    'Application Deadline',
    'Requirements',
    'Notes',
    'Thank You Sent',
    'Application Submitted',
    'LinkedIn Connected',
    'Interview Scheduled'
  ];

  const rows = companies.map(company => [
    company.companyName,
    company.boothNumber || '',
    company.positions.join('; '),
    company.priority,
    company.contactInfo.names.join('; '),
    company.contactInfo.emails.join('; '),
    company.contactInfo.phones.join('; '),
    company.websiteUrl || '',
    company.careersPageUrl || '',
    company.applicationDeadline ? new Date(company.applicationDeadline).toLocaleDateString() : '',
    company.requirements.join('; '),
    company.userNotes,
    company.followUpStatus.thankYouSent ? 'Yes' : 'No',
    company.followUpStatus.applicationSubmitted ? 'Yes' : 'No',
    company.followUpStatus.linkedInConnected ? 'Yes' : 'No',
    company.followUpStatus.interviewScheduled ? 'Yes' : 'No'
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(cell).replace(/"/g, '""');
        return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csv, `${fairName}-companies.csv`, 'text/csv');
}

export function exportToJSON(companies: Company[], fairName: string): void {
  const json = JSON.stringify(companies, null, 2);
  downloadFile(json, `${fairName}-companies.json`, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
