/**
 * Google Drive Integration for Character Sync
 * Uses Google Drive API v3 and OAuth 2.0
 */

import { Character } from '../types';

// Configuration - Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = '29737476837-8jb5hnocs7457oabi1fcsvn28j3l4ffq.apps.googleusercontent.com';
const API_KEY = ''; // Optional - not needed for Drive API with OAuth
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata'; // AppData folder for app-specific files

export class GoogleDriveSync {
    private static tokenClient: any = null;
    private static gapiInited = false;
    private static gisInited = false;
    private static readonly TOKEN_KEY = 'pf2e-google-drive-token';
    private static readonly FOLDER_NAME = 'Pathfinder2eCharacters';

    /**
     * Initialize Google APIs client
     */
    static async initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.gapiInited && this.gisInited) {
                resolve();
                return;
            }

            // Load GAPI client
            const gapiScript = document.createElement('script');
            gapiScript.src = 'https://apis.google.com/js/api.js';
            gapiScript.onload = () => {
                (window as any).gapi.load('client', async () => {
                    try {
                        await (window as any).gapi.client.init({
                            apiKey: API_KEY,
                            discoveryDocs: [DISCOVERY_DOC],
                        });
                        this.gapiInited = true;
                        this.checkInitComplete(resolve);
                    } catch (err) {
                        reject(err);
                    }
                });
            };
            document.head.appendChild(gapiScript);

            // Load GIS client
            const gisScript = document.createElement('script');
            gisScript.src = 'https://accounts.google.com/gsi/client';
            gisScript.onload = () => {
                this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: SCOPES,
                    callback: '', // will be assigned later
                });
                this.gisInited = true;
                this.checkInitComplete(resolve);
            };
            document.head.appendChild(gisScript);
        });
    }

    private static checkInitComplete(resolve: () => void): void {
        if (this.gapiInited && this.gisInited) {
            resolve();
        }
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        const token = localStorage.getItem(this.TOKEN_KEY);
        return !!token && token !== 'placeholder-token';
    }

    /**
     * Authenticate with Google OAuth
     */
    static async authenticate(): Promise<void> {
        try {
            await this.initialize();

            return new Promise((resolve, reject) => {
                if (this.isAuthenticated()) {
                    // Set existing token
                    (window as any).gapi.client.setToken({
                        access_token: localStorage.getItem(this.TOKEN_KEY)
                    });
                    resolve();
                    return;
                }

                // Request new token
                this.tokenClient.callback = async (resp: any) => {
                    if (resp.error !== undefined) {
                        reject(new Error(resp.error || 'Authentication failed'));
                        return;
                    }

                    // Save token
                    const token = (window as any).gapi.client.getToken();
                    localStorage.setItem(this.TOKEN_KEY, token.access_token);
                    resolve();
                };

                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            });
        } catch (error) {
            console.error('Authentication error:', error);
            throw new Error('Failed to authenticate with Google Drive');
        }
    }

    /**
     * Get or create the app folder in Drive
     */
    private static async getOrCreateAppFolder(): Promise<string> {
        try {
            // Try to find existing folder
            const response = await (window as any).gapi.client.drive.files.list({
                q: `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                spaces: 'appDataFolder',
                fields: 'files(id, name)'
            });

            if (response.result.files && response.result.files.length > 0) {
                return response.result.files[0].id;
            }

            // Create new folder
            const createResponse = await (window as any).gapi.client.drive.files.create({
                resource: {
                    name: this.FOLDER_NAME,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: ['appDataFolder']
                }
            });

            return createResponse.result.id;
        } catch (error) {
            console.error('Error getting folder:', error);
            throw new Error('Failed to access Google Drive folder');
        }
    }

    /**
     * Upload/Update a character to Google Drive
     */
    static async syncCharacter(character: Character): Promise<void> {
        if (!this.isAuthenticated()) {
            await this.authenticate();
        }

        try {
            const folderId = await this.getOrCreateAppFolder();
            const fileName = `${character.name || 'character'}.json`;
            const _fileId = `character_${character.id}`;

            // Check if file exists
            const listResponse = await (window as any).gapi.client.drive.files.list({
                q: `name='${fileName}' and trashed=false`,
                spaces: 'appDataFolder',
                fields: 'files(id, name)'
            });

            const fileData = JSON.stringify(character, null, 2);
            const boundary = '-------314159265358979323846';
            const delimiter = '\r\n--' + boundary;
            const closeDelimiter = '\r\n--' + boundary + '--';

            const multipartBody =
                delimiter +
                '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify({
                    name: fileName,
                    parents: [folderId]
                }) +
                delimiter +
                '\r\nContent-Type: application/json\r\n\r\n' +
                fileData +
                closeDelimiter;

            if (listResponse.result.files && listResponse.result.files.length > 0) {
                // Update existing file
                const existingFile = listResponse.result.files[0];
                await (window as any).gapi.client.request({
                    path: `/upload/drive/v3/files/${existingFile.id}`,
                    method: 'PATCH',
                    params: { uploadType: 'multipart' },
                    headers: {
                        'Content-Type': 'multipart/related; boundary=' + boundary
                    },
                    body: multipartBody
                });
            } else {
                // Create new file
                await (window as any).gapi.client.request({
                    path: '/upload/drive/v3/files',
                    method: 'POST',
                    params: { uploadType: 'multipart' },
                    headers: {
                        'Content-Type': 'multipart/related; boundary=' + boundary
                    },
                    body: multipartBody
                });
            }

            console.log('Character synced to Google Drive:', character.name);
        } catch (error) {
            console.error('Sync error:', error);
            throw new Error('Failed to sync character to Google Drive');
        }
    }

    /**
     * Load all characters from Google Drive
     */
    static async loadCharacters(): Promise<Character[]> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await (window as any).gapi.client.drive.files.list({
                q: "name contains '.json' and trashed=false",
                spaces: 'appDataFolder',
                fields: 'files(id, name)'
            });

            const characters: Character[] = [];

            if (response.result.files) {
                for (const file of response.result.files) {
                    try {
                        const downloadResponse = await (window as any).gapi.client.drive.files.get({
                            fileId: file.id,
                            alt: 'media'
                        });

                        const character = JSON.parse(downloadResponse.body) as Character;
                        characters.push(character);
                    } catch (err) {
                        console.error('Error loading file:', file.name, err);
                    }
                }
            }

            return characters;
        } catch (error) {
            console.error('Load error:', error);
            throw new Error('Failed to load characters from Google Drive');
        }
    }

    /**
     * Delete a character from Google Drive
     */
    static async deleteCharacter(characterId: string): Promise<void> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            const fileName = `character_${characterId}.json`;
            const response = await (window as any).gapi.client.drive.files.list({
                q: `name='${fileName}' and trashed=false`,
                spaces: 'appDataFolder',
                fields: 'files(id, name)'
            });

            if (response.result.files && response.result.files.length > 0) {
                await (window as any).gapi.client.drive.files.delete({
                    fileId: response.result.files[0].id
                });
            }
        } catch (error) {
            console.error('Delete error:', error);
            throw new Error('Failed to delete character from Google Drive');
        }
    }

    /**
     * Logout and clear token
     */
    static logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        if (this.gapiInited) {
            (window as any).gapi.client.setToken('');
        }
    }
}
