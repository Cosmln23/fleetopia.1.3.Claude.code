import { clerkClient } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { GmailAdapter } from '@/lib/adapters/gmail-adapter';

// Interface for stored Gmail tokens
export interface GmailTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: 'Bearer';
  expiry_date: number;
}

// Interface for the connection status
export interface GmailConnectionStatus {
  connected: boolean;
  email?: string;
  needs_refresh: boolean;
  last_error?: string;
}

class ClerkGmailIntegration {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generates the authorization URL the user will be redirected to.
   * @param userId - The Clerk user ID.
   * @returns The authorization URL.
   */
  public getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: userId, // Using userId as 'state' for security
    });
  }

  /**
   * Exchanges the authorization code for a set of tokens.
   * @param code - The authorization code received from Google.
   * @returns A tokens object.
   */
  public async exchangeCodeForTokens(code: string): Promise<GmailTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
        throw new Error('Missing refresh token. Ensure `prompt: consent` is set in getAuthUrl.');
    }
    return tokens as GmailTokens;
  }

  /**
   * Saves the tokens and user information in Clerk's metadata.
   * @param userId - The Clerk user ID.
   * @param tokens - The tokens to save.
   */
  public async saveGmailTokens(userId: string, tokens: GmailTokens): Promise<void> {
    this.oauth2Client.setCredentials(tokens);
    const userInfo = await google.oauth2({ version: 'v2', auth: this.oauth2Client }).userinfo.get();
    const email = userInfo.data.email;

    if (!email) {
        throw new Error('Could not retrieve email address from Google.');
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        gmail_tokens: tokens,
        gmail_last_error: null,
      },
      publicMetadata: {
        gmail_connected: true,
        gmail_email: email,
      },
    });
  }

  /**
   * Checks the connection status for a user.
   * @param userId - The Clerk user ID.
   * @returns A connection status object.
   */
  public async getConnectionStatus(userId: string): Promise<GmailConnectionStatus> {
    const user = await clerkClient.users.getUser(userId);
    const tokens = user.privateMetadata?.gmail_tokens as GmailTokens | undefined;

    if (!tokens || !user.publicMetadata?.gmail_connected) {
      return { connected: false, needs_refresh: false };
    }

    // Check if the token will expire in the next 5 minutes
    const needsRefresh = tokens.expiry_date <= Date.now() + 300000;

    return {
      connected: true,
      email: user.publicMetadata?.gmail_email as string,
      needs_refresh: needsRefresh,
      last_error: user.privateMetadata?.gmail_last_error as string | undefined,
    };
  }

    /**
   * Deletes the Gmail connection data from Clerk's metadata.
   * @param userId - The Clerk user ID.
   */
  public async disconnectGmail(userId: string): Promise<void> {
    await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          gmail_tokens: null,
          gmail_last_error: null,
        },
        publicMetadata: {
          gmail_connected: false,
          gmail_email: null,
        },
      });
  }
  
  /**
   * Gets a functional Gmail adapter with valid tokens.
   * @param userId - The Clerk user ID.
   * @returns An instance of GmailAdapter.
   */
  public async getGmailAdapter(userId: string): Promise<GmailAdapter> {
    const user = await clerkClient.users.getUser(userId);
    let tokens = user.privateMetadata?.gmail_tokens as GmailTokens | undefined;

    if (!tokens) {
      throw new Error('User does not have a Gmail account connected.');
    }

    // Refresh the token if necessary
    if (tokens.expiry_date <= Date.now()) {
      this.oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      const newTokens = { ...tokens, ...credentials } as GmailTokens;
      await this.saveGmailTokens(userId, newTokens);
      tokens = newTokens;
    }
    
    return new GmailAdapter({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      refreshToken: tokens.refresh_token,
    });
  }
}

// Export a single instance (Singleton Pattern)
export const clerkGmailIntegration = new ClerkGmailIntegration(); 