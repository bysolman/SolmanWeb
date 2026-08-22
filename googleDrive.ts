import { getAccessToken } from './googleAuth';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  shared?: boolean;
  starred?: boolean;
  owners?: Array<{ displayName: string; emailAddress: string; photoLink?: string }>;
  parents?: string[];
}

export interface DriveStorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

export interface DriveAboutInfo {
  user?: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
  storageQuota?: DriveStorageQuota;
}

export const googleDriveService = {
  // Get About info (user, storage quota)
  async getAboutInfo(): Promise<DriveAboutInfo> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');

    const res = await fetch(
      'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to fetch Google Drive info');
    }

    return await res.json();
  },

  // List files & folders
  async listFiles(options: {
    folderId?: string;
    searchQuery?: string;
    mimeTypeFilter?: string;
    pageSize?: number;
    orderBy?: string;
  } = {}): Promise<DriveFile[]> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');

    const {
      folderId,
      searchQuery,
      mimeTypeFilter,
      pageSize = 50,
      orderBy = 'folder,modifiedTime desc'
    } = options;

    let queryParts = ['trashed = false'];

    if (folderId) {
      queryParts.push(`'${folderId}' in parents`);
    }

    if (searchQuery && searchQuery.trim()) {
      const sanitized = searchQuery.replace(/'/g, "\\'");
      queryParts.push(`(name contains '${sanitized}' or fullText contains '${sanitized}')`);
    }

    if (mimeTypeFilter && mimeTypeFilter !== 'all') {
      if (mimeTypeFilter === 'folder') {
        queryParts.push(`mimeType = 'application/vnd.google-apps.folder'`);
      } else if (mimeTypeFilter === 'document') {
        queryParts.push(`(mimeType contains 'document' or mimeType contains 'pdf' or mimeType contains 'text')`);
      } else if (mimeTypeFilter === 'spreadsheet') {
        queryParts.push(`(mimeType contains 'spreadsheet' or mimeType contains 'sheet' or mimeType contains 'csv')`);
      } else if (mimeTypeFilter === 'image') {
        queryParts.push(`mimeType contains 'image/'`);
      }
    }

    const q = encodeURIComponent(queryParts.join(' and '));
    const fields = encodeURIComponent(
      'files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,thumbnailLink,iconLink,shared,starred,owners,parents)'
    );

    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=${pageSize}&orderBy=${encodeURIComponent(orderBy)}&fields=${fields}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to list Google Drive files');
    }

    const data = await res.json();
    return data.files || [];
  },

  // Create a new folder
  async createFolder(name: string, parentFolderId?: string): Promise<DriveFile> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');

    const metadata: any = {
      name: name.trim() || 'New Folder',
      mimeType: 'application/vnd.google-apps.folder'
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,modifiedTime,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to create folder in Google Drive');
    }

    return await res.json();
  },

  // Upload file (Supports text, pdf, images, docs)
  async uploadFile(file: File, parentFolderId?: string): Promise<DriveFile> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');

    const metadata: any = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream'
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
      fileReader.onload = async () => {
        try {
          const base64Data = (fileReader.result as string).split(',')[1];
          const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            `Content-Type: ${metadata.mimeType}\r\n` +
            'Content-Transfer-Encoding: base64\r\n\r\n' +
            base64Data +
            closeDelimiter;

          const res = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary=${boundary}`
              },
              body: multipartRequestBody
            }
          );

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message || 'Upload failed');
          }

          resolve(await res.json());
        } catch (e) {
          reject(e);
        }
      };

      fileReader.onerror = () => reject(new Error('Failed reading local file'));
      fileReader.readAsDataURL(file);
    });
  },

  // Create a text/doc note directly in Drive
  async createDocument(name: string, content: string, parentFolderId?: string): Promise<DriveFile> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');

    const metadata: any = {
      name: name.endsWith('.txt') ? name : `${name}.txt`,
      mimeType: 'text/plain'
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
      content +
      closeDelimiter;

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Document creation failed');
    }

    return await res.json();
  },

  // Delete file (Mandatory: confirmation handled by UI before calling this)
  async deleteFile(fileId: string): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to delete file from Google Drive');
    }
  }
};
