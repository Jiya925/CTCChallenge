import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, ApiError } from '@/lib/errors';
import { parseId } from '@/lib/types';

type Params = { params: { id: string } };

//DELTE /api/visits/:id
export async function DELETE(_req: Request, { params }: Params) {
  try {
    // parse and check if no matching id
    const id = parseId(params.id);

    if (id === null) {
      throw new ApiError(404, 'Visit not found');
    }

    //find the visit by id and delete it
    const { rows } = await pool.query(
      'DELETE FROM visits WHERE id = $1 RETURNING *',
      [id]
    );

    //if no row matches, return 404
    if(rows.length === 0) {
      throw new ApiError(404, 'Visit not found');
    }
    
    //return the null visit with a 204 status
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}