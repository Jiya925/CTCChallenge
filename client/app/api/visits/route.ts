import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, ApiError } from '@/lib/errors';
import { toVisit } from '@/lib/types';


/**
 * GET /api/visits
 * Returns all visits.
 */
export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM visits ORDER BY date DESC'
    );
    // Map every row - raw rows don't match the contract (NUMERIC comes back
    // as a string, timestamps as Date objects). See lib/types.ts.
    return NextResponse.json(rows.map(toVisit));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/visits
 * Create a new visit.
 *
 * TODO (A2): implement. Read the visit fields from the request body,
 * insert a row, and return the created visit with a 201 status.
 *
 * TODO (A3): validate before you insert. Nothing validates anything today, so
 * `rating` happily accepts 6. Decide what valid means for each field and reject
 * bad bodies with a 400 rather than letting them reach the database.
 */
export async function POST(req: Request) {
  try {
    //read visit fields from request
    const visit = await req.json();

    //validate the visit fields
    //restaurantId must be a number
    if (typeof visit.restaurantId !== 'number') {
      throw new ApiError(400, 'restaurantId is required and must be a number');
    }
    //date must be a non empty string in YYYY-MM-DD format
    if (typeof visit.date !== 'string' || visit.date.trim() === '' || !/^\d{4}-\d{2}-\d{2}$/.test(visit.date)) {  
      throw new ApiError(400, 'date is required and must be a non-empty string in YYYY-MM-DD format');
    }

    //amountSpent must be a number >0 if it exists
    if (visit.amountSpent !== undefined && (typeof visit.amountSpent !== 'number' || visit.amountSpent <0)) {
        throw new ApiError(400, 'amountSpent must be a number greater than or equal to 0');
    }

    //insert a row
    const { rows } = await pool.query(
      'INSERT INTO visits ("restaurantId", date, "amountSpent", notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [visit.restaurantId, visit.date, visit.amountSpent, visit.notes]
    );
    
    //return the created visit with a 201 status
    return NextResponse.json(toVisit(rows[0]) , { status: 201 });
  } catch (err) {
    return handleError(err);
  }
  
}
