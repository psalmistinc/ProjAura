import { NextResponse } from 'next/server';

export function handleError(error: Error) {
  console.error('[API Error]', error);

  return NextResponse.json(
    {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message,
      },
    },
    { status: 500 }
  );
}
