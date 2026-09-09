import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, ApiError } from '@/lib/errors';
import { toRestaurant, parseId } from '@/lib/types';

type Params = { params: { id: string } };

/**
 * GET /api/restaurants/:id
 * Returns a single restaurant, or 404 if it doesn't exist.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      throw new ApiError(404, 'Restaurant not found');
    }

    const { rows } = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      throw new ApiError(404, 'Restaurant not found');
    }

    return NextResponse.json(toRestaurant(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/restaurants/:id
 * Update an existing restaurant.
 *
 * TODO (A2): implement. Update the row matching :id and return the updated
 * record (or 404 if it doesn't exist). Validate the body the same way POST does.
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      throw new ApiError(404, 'Restaurant not found');
    }
    
    //get the new id, read from params and update row
    const restaurant = await req.json();

    if (typeof restaurant.name !== 'string' || restaurant.name.trim() === '') {
      throw new ApiError(400, 'name is required and must be a non-empty string');
    }
    if ((typeof restaurant.rating === 'number' && (restaurant.rating < 0 || restaurant.rating > 5)) || (restaurant.rating !== undefined && typeof restaurant.rating !== 'number')) {
      throw new ApiError(400, 'rating must be a number between 0 and 5');
    }

    const { rows } = await pool.query(
      'UPDATE restaurants SET name = $1, cuisine = $2, address = $3, rating = $4 WHERE id = $5 RETURNING *',
      [restaurant.name, restaurant.cuisine, restaurant.address, restaurant.rating, params.id]
    );

    //if no row matches, return 404
    if(rows.length === 0) {
      throw new ApiError(404, 'Restaurant not found');
    }

    //return the updated restaurant with a 200 status
    return NextResponse.json(toRestaurant(rows[0]) , { status: 200 });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/restaurants/:id
 * Delete a restaurant.
 *
 * TODO (A2): implement. Delete the row matching :id and return 204 (or 404
 * if it doesn't exist).
 *
 * Worth noticing: the migration already made a call about what happens to that
 * restaurant's visits. Go read it. If you disagree with it, say so in your
 * write-up.
 */
export async function DELETE(_req: Request, {params}: Params) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      throw new ApiError(404, 'Restaurant not found');
    }

    //find the restaurant by id and delete it
    const { rows } = await pool.query(
      'DELETE FROM restaurants WHERE id = $1 RETURNING *',
      [id]
    );

    //if no row matches, return 404
    if(rows.length === 0) {
      throw new ApiError(404, 'Restaurant not found');
    }

    //return the null restaurant with a 204 status
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
