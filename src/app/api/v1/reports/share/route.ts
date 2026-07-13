import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

// In-memory store for demo (replace with database in production)
const shareStore = new Map<string, {
  id: string;
  reportId: string;
  reportTitle: string;
  reportType: string;
  reportData: string;
  token: string;
  passwordHash: string;
  createdBy: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  expiresAt: Date | null;
  accessCount: number;
  maxAccessCount: number | null;
  lastAccessedAt: Date | null;
  createdAt: Date;
}>();

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = createHash('sha256').update(password).digest('hex');
  return timingSafeEqual(Buffer.from(passwordHash), Buffer.from(hash));
}

// POST - Create a shareable link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reportId,
      reportTitle,
      reportType,
      reportData,
      password,
      expiresInHours = 72,
      maxAccessCount = 10,
      createdBy = 'Current Officer',
    } = body;

    if (!reportId || !reportTitle || !reportType || !reportData || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const token = generateToken();
    const passwordHash = hashPassword(password);
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const shareRecord = {
      id: `SHR-${Date.now()}`,
      reportId,
      reportTitle,
      reportType,
      reportData: JSON.stringify(reportData),
      token,
      passwordHash,
      createdBy,
      status: 'ACTIVE' as const,
      expiresAt,
      accessCount: 0,
      maxAccessCount,
      lastAccessedAt: null,
      createdAt: new Date(),
    };

    shareStore.set(token, shareRecord);

    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${token}`;

    return NextResponse.json({
      success: true,
      data: {
        shareId: shareRecord.id,
        shareUrl,
        token,
        expiresAt: expiresAt.toISOString(),
        maxAccessCount,
        createdBy,
        createdAt: shareRecord.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Share API] Error creating share:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}

// GET - List all shares (for management)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const password = searchParams.get('password');

    if (token && password) {
      // Verify and return report data
      const share = shareStore.get(token);
      
      if (!share) {
        return NextResponse.json(
          { success: false, error: 'Share link not found' },
          { status: 404 }
        );
      }

      if (share.status !== 'ACTIVE') {
        return NextResponse.json(
          { success: false, error: 'Share link is no longer active' },
          { status: 403 }
        );
      }

      if (share.expiresAt && new Date() > share.expiresAt) {
        share.status = 'EXPIRED';
        return NextResponse.json(
          { success: false, error: 'Share link has expired' },
          { status: 403 }
        );
      }

      if (share.maxAccessCount && share.accessCount >= share.maxAccessCount) {
        share.status = 'EXPIRED';
        return NextResponse.json(
          { success: false, error: 'Share link has reached maximum access count' },
          { status: 403 }
        );
      }

      if (!verifyPassword(password, share.passwordHash)) {
        return NextResponse.json(
          { success: false, error: 'Invalid password' },
          { status: 401 }
        );
      }

      // Update access count
      share.accessCount++;
      share.lastAccessedAt = new Date();

      return NextResponse.json({
        success: true,
        data: {
          reportId: share.reportId,
          reportTitle: share.reportTitle,
          reportType: share.reportType,
          reportData: JSON.parse(share.reportData),
          createdBy: share.createdBy,
          createdAt: share.createdAt.toISOString(),
          expiresAt: share.expiresAt?.toISOString(),
          remainingAccesses: share.maxAccessCount ? share.maxAccessCount - share.accessCount : null,
        },
      });
    }

    // List all shares (admin view)
    const shares = Array.from(shareStore.values()).map(s => ({
      id: s.id,
      reportId: s.reportId,
      reportTitle: s.reportTitle,
      status: s.status,
      accessCount: s.accessCount,
      maxAccessCount: s.maxAccessCount,
      expiresAt: s.expiresAt?.toISOString(),
      createdAt: s.createdAt.toISOString(),
      createdBy: s.createdBy,
    }));

    return NextResponse.json({
      success: true,
      data: shares,
    });
  } catch (error) {
    console.error('[Share API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shares' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke a share
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    const share = shareStore.get(token);
    if (!share) {
      return NextResponse.json(
        { success: false, error: 'Share not found' },
        { status: 404 }
      );
    }

    share.status = 'REVOKED';
    shareStore.set(token, share);

    return NextResponse.json({
      success: true,
      message: 'Share link revoked successfully',
    });
  } catch (error) {
    console.error('[Share API] Error revoking share:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revoke share' },
      { status: 500 }
    );
  }
}
