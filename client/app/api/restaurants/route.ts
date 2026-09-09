import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, ApiError } from '@/lib/errors';
import { toRestaurant } from '@/lib/types';

/**
 * GET /api/restaurants
 * Returns all restaurants.
 */
export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM restaurants ORDER BY created_at DESC'
    );
    // Map every row - raw rows don't match the contract (NUMERIC comes back
    // as a string, timestamps as Date objects). See lib/types.ts.
    return NextResponse.json(rows.map(toRestaurant));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/restaurants
 * Create a new restaurant.
 *
 * TODO (A2): implement. Read the restaurant fields from the request body,
 * insert a row, and return the created restaurant with a 201 status.
 *
 * TODO (A3): validate before you insert. Nothing validates anything today, so
 * `rating` happily accepts 6. Decide what valid means for each field and reject
 * bad bodies with a 400 rather than letting them reach the database.
 */
export async function POST(req: Request) {
  try {
    //read restaurant fields from request
    const restaurant = await req.json();

    //validate the restaurant fields
    if (typeof restaurant.name !== 'string' || restaurant.name.trim() === '') {
      throw new ApiError(400, 'name is required and must be a non-empty string');
    }
    //if rating exists, it must be a number between 0 and 5
    if((typeof restaurant.rating === 'number' && (restaurant.rating < 0 || restaurant.rating > 5)) || (restaurant.rating !== undefined && typeof restaurant.rating !== 'number')) {
      throw new ApiError(400, 'Rating must be a number between 0 and 5');
    }

    //insert a row
    const { rows } = await pool.query(
      'INSERT INTO restaurants (name, cuisine, address, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [restaurant.name, restaurant.cuisine, restaurant.address, restaurant.rating]
    );
    //return the created restaurant with a 201 status
    return NextResponse.json(toRestaurant(rows[0]) , { status: 201 });
  } catch (err) {
    return handleError(err);
  }
  
}
