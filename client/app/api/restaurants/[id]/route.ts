import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toRestaurant } from '@/lib/types';

type Params = { params: { id: string } };

/**
 * GET /api/restaurants/:id
 * Returns a single restaurant, or 404 if it doesn't exist.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
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
    //get the new id, read from params and update row
    const restaurant = await req.json();
    const { rows } = await pool.query(
      'UPDATE restaurants SET name = $1, cuisine = $2, address = $3, rating = $4 WHERE id = $5 RETURNING *',
      [restaurant.name, restaurant.cuisine, restaurant.address, restaurant.rating, params.id]
    );

    //if no row matches, return 404
    if(rows.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
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
export async function DELETE(req: Request, {params}: Params) {
  try {
    //find the restaurant by id and delete it
    const { rows } = await pool.query(
      'DELETE FROM restaurants WHERE id = $1 RETURNING *',
      [params.id]
    );

    //if no row matches, return 404
    if(rows.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    //return the null restaurant with a 204 status
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
