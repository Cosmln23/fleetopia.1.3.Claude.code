// Gmail API Adapter - FREE Implementation
import { UniversalCommunicationAPI, APIResponse, EmailParams, EmailMessage, EmailFilters, APICredentials } from '../universal-api-bridge';

export class GmailAdapter implements UniversalCommunicationAPI {
  private credentials: APICredentials;
  private accessToken?: string;

  constructor(credentials: APICredentials) {
    this.credentials = credentials;
  }

  async sendEmail(params: EmailParams): Promise<APIResponse<void>> {
    const startTime = Date.now();
    
    try {
      const accessToken = await this.getAccessToken();
      
      const email = this.formatEmailForGmail(params);
      
      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        })
      });

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
      }

      return {
        success: true,
        responseTime: Date.now() - startTime,
        provider: 'gmail'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Gmail error',
        responseTime: Date.now() - startTime,
        provider: 'gmail'
      };
    }
  }

  async getEmails(filters: EmailFilters): Promise<APIResponse<EmailMessage[]>> {
    const startTime = Date.now();
    
    try {
      const accessToken = await this.getAccessToken();
      
      // Build Gmail query from filters
      const query = this.buildGmailQuery(filters);
      
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${filters.limit || 10}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status}`);
      }

      const data = await response.json();
      const messages: EmailMessage[] = [];

      // Fetch details for each message
      if (data.messages) {
        for (const message of data.messages.slice(0, 10)) { // Limit to 10 for performance
          const messageDetails = await this.getMessageDetails(message.id, accessToken);
          if (messageDetails) {
            messages.push(messageDetails);
          }
        }
      }

      return {
        success: true,
        data: messages,
        responseTime: Date.now() - startTime,
        provider: 'gmail'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Gmail error',
        responseTime: Date.now() - startTime,
        provider: 'gmail'
      };
    }
  }

  async createEmailTemplate(): Promise<APIResponse<string>> {
    // Gmail doesn't have native templates, but we can simulate this
    return {
      success: true,
      data: 'template_' + Date.now(),
      responseTime: 50,
      provider: 'gmail'
    };
  }

  async sendSMS(): Promise<APIResponse<void>> {
    throw new Error('SMS not supported by Gmail adapter');
  }

  async sendWhatsApp(): Promise<APIResponse<void>> {
    throw new Error('WhatsApp not supported by Gmail adapter');
  }

  async sendPushNotification(): Promise<APIResponse<void>> {
    throw new Error('Push notifications not supported by Gmail adapter');
  }

  async createNotificationTemplate(): Promise<APIResponse<string>> {
    throw new Error('Notification templates not supported by Gmail adapter');
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    // Refresh access token using refresh token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.credentials.clientId!,
        client_secret: this.credentials.clientSecret!,
        refresh_token: this.credentials.refreshToken!,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Gmail access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    
    // Set expiration timer
    setTimeout(() => {
      this.accessToken = undefined;
    }, (data.expires_in - 60) * 1000); // Refresh 1 minute before expiry

    return this.accessToken!;
  }

  private formatEmailForGmail(params: EmailParams): string {
    const headers = [
      `To: ${params.to.join(', ')}`,
      `Subject: ${params.subject}`,
      'MIME-Version: 1.0',
    ];

    if (params.cc && params.cc.length > 0) {
      headers.push(`Cc: ${params.cc.join(', ')}`);
    }

    if (params.bcc && params.bcc.length > 0) {
      headers.push(`Bcc: ${params.bcc.join(', ')}`);
    }

    if (params.isHTML) {
      headers.push('Content-Type: text/html; charset=utf-8');
    } else {
      headers.push('Content-Type: text/plain; charset=utf-8');
    }

    return headers.join('\r\n') + '\r\n\r\n' + params.body;
  }

  private buildGmailQuery(filters: EmailFilters): string {
    const queryParts: string[] = [];

    if (filters.from) queryParts.push(`from:${filters.from}`);
    if (filters.to) queryParts.push(`to:${filters.to}`);
    if (filters.subject) queryParts.push(`subject:"${filters.subject}"`);
    if (filters.hasAttachments) queryParts.push('has:attachment');
    if (filters.isRead === false) queryParts.push('is:unread');
    
    if (filters.dateFrom) {
      queryParts.push(`after:${filters.dateFrom.toISOString().split('T')[0]}`);
    }
    if (filters.dateTo) {
      queryParts.push(`before:${filters.dateTo.toISOString().split('T')[0]}`);
    }

    return queryParts.join(' ');
  }

  private async getMessageDetails(messageId: string, accessToken: string): Promise<EmailMessage | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      if (!response.ok) return null;

      const message = await response.json();
      
      return {
        id: message.id,
        threadId: message.threadId,
        subject: this.getHeader(message.payload.headers, 'Subject') || '',
        from: this.getHeader(message.payload.headers, 'From') || '',
        to: [this.getHeader(message.payload.headers, 'To') || ''],
        body: this.extractEmailBody(message.payload),
        isHTML: false, // Gmail API payload processing would determine this more accurately
        attachments: message.payload.parts?.filter((part: any) => part.filename).map((part: any) => ({
          filename: part.filename,
          contentType: part.mimeType || 'application/octet-stream',
          size: part.body?.size || 0
        })) || [],
        date: new Date(parseInt(message.internalDate)),
        isRead: !message.labelIds?.includes('UNREAD')
      };

    } catch (error) {
      console.error('Error fetching message details:', error);
      return null;
    }
  }

  private getHeader(headers: any[], name: string): string | undefined {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header?.value;
  }

  private extractEmailBody(payload: any): string {
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString();
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString();
        }
      }
    }

    return '';
  }
}

// Local interfaces removed - now imported from '../universal-api-bridge'
